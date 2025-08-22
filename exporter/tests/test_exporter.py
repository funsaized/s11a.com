#!/usr/bin/env python3
"""
Test Suite for Apple Notes MDX Exporter

This module provides comprehensive testing for all components of the Apple Notes
MDX Exporter system, including unit tests, integration tests, and system tests.
"""

import os
import sys
import unittest
import tempfile
import json
import shutil
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add parent directory to path for module imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules to test
from src.applescript_bridge import AppleScriptBridge
from src.image_processor import ImageProcessor
from src.mdx_converter import MDXConverter
from src.notes_exporter import NotesExporter


class TestAppleScriptBridge(unittest.TestCase):
    """Test cases for AppleScript Bridge functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_bridge = Mock(spec=AppleScriptBridge)
        
    @patch('subprocess.run')
    def test_applescript_execution(self, mock_run):
        """Test basic AppleScript execution."""
        # Mock successful execution
        mock_run.return_value = Mock(
            returncode=0,
            stdout='test output',
            stderr=''
        )
        
        bridge = AppleScriptBridge()
        result = bridge._run_applescript('tell application "Notes" to return "test"')
        
        self.assertEqual(result, 'test output')
        mock_run.assert_called_once()
    
    @patch('subprocess.run')
    def test_applescript_error_handling(self, mock_run):
        """Test AppleScript error handling."""
        # Mock failed execution
        mock_run.return_value = Mock(
            returncode=1,
            stdout='',
            stderr='AppleScript Error: Notes not accessible'
        )
        
        bridge = AppleScriptBridge()
        
        with self.assertRaises(RuntimeError):
            bridge._run_applescript('invalid script')
    
    def test_note_data_parsing(self):
        """Test parsing of note data from AppleScript."""
        sample_json = '''[
            {
                "noteID": "x-coredata://12345",
                "noteName": "Test Note",
                "noteBody": "<html><body>Test content</body></html>",
                "creationDate": "2023-01-01T12:00:00Z",
                "modificationDate": "2023-01-02T12:00:00Z",
                "noteFolder": "Test Folder"
            }
        ]'''
        
        # Test JSON parsing
        notes_data = json.loads(sample_json)
        self.assertEqual(len(notes_data), 1)
        self.assertEqual(notes_data[0]['noteName'], 'Test Note')
    
    @patch.object(AppleScriptBridge, '_run_applescript')
    def test_get_folders(self, mock_run):
        """Test folder retrieval."""
        mock_run.return_value = "Work|Personal|Notes"
        
        bridge = AppleScriptBridge()
        folders = bridge.get_folders()
        
        self.assertEqual(len(folders), 3)
        self.assertIn('Work', folders)
        self.assertIn('Personal', folders)


class TestImageProcessor(unittest.TestCase):
    """Test cases for Image Processor functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = Path(tempfile.mkdtemp())
        self.config = {
            "image_format": "jpg",
            "image_quality": 95,
            "max_filename_length": 50
        }
        self.processor = ImageProcessor(self.temp_dir, self.config)
    
    def tearDown(self):
        """Clean up test fixtures."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_base64_pattern_matching(self):
        """Test base64 image pattern recognition."""
        html_with_image = '''
        <p>Some text</p>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" alt="test">
        <p>More text</p>
        '''
        
        matches = self.processor.base64_pattern.findall(html_with_image)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0][1], 'png')
    
    def test_filename_sanitization(self):
        """Test filename sanitization."""
        unsafe_name = "Test/Note<>:*?.txt"
        safe_name = self.processor._generate_filename(unsafe_name, 1, "jpg")
        
        # Should not contain unsafe characters
        unsafe_chars = '<>:"/\\|?*'
        for char in unsafe_chars:
            self.assertNotIn(char, safe_name)
        
        # Should have proper extension
        self.assertTrue(safe_name.endswith('.jpg'))
    
    def test_image_stats(self):
        """Test image statistics calculation."""
        # Create a test file
        test_file = self.temp_dir / "test.jpg"
        test_file.write_bytes(b"fake image data")
        
        stats = self.processor.get_image_stats()
        
        self.assertEqual(stats['total_images'], 1)
        self.assertGreater(stats['total_size'], 0)
    
    def test_empty_html_processing(self):
        """Test processing of empty or invalid HTML."""
        html, images = self.processor.process_html_images("", "test_note")
        
        self.assertEqual(html, "")
        self.assertEqual(len(images), 0)


class TestMDXConverter(unittest.TestCase):
    """Test cases for MDX Converter functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.config = {
            "date_format": "%Y-%m-%d",
            "tags_in_frontmatter": True,
            "mdx_components": False
        }
        self.converter = MDXConverter(self.config)
    
    def test_frontmatter_generation(self):
        """Test YAML frontmatter generation."""
        metadata = {
            "title": "Test Note",
            "created": "2023-01-01T12:00:00Z",
            "modified": "2023-01-02T12:00:00Z",
            "folder": "Test Folder"
        }
        
        frontmatter = self.converter._generate_frontmatter(metadata)
        
        self.assertIn("title: \"Test Note\"", frontmatter)
        self.assertIn("folder: \"Test Folder\"", frontmatter)
        self.assertIn("---", frontmatter)
    
    def test_html_to_markdown_conversion(self):
        """Test HTML to Markdown conversion."""
        html = """
        <h1>Title</h1>
        <p>This is a <strong>test</strong> with <em>formatting</em></p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
        """
        
        markdown = self.converter._convert_html_to_markdown(html)
        
        self.assertIn("# Title", markdown)
        self.assertIn("**test**", markdown)
        self.assertIn("*formatting*", markdown)
        self.assertIn("- Item 1", markdown)
    
    def test_yaml_string_escaping(self):
        """Test YAML string escaping."""
        test_cases = [
            ('Simple Title', 'Simple Title'),
            ('Title with "quotes"', '"Title with \\"quotes\\""'),
            ('Title: with colon', '"Title: with colon"'),
            ('Title [with] brackets', '"Title [with] brackets"')
        ]
        
        for input_str, expected in test_cases:
            result = self.converter._escape_yaml_string(input_str)
            self.assertEqual(result, expected)
    
    def test_mdx_validation(self):
        """Test MDX output validation."""
        valid_mdx = """---
title: "Test Note"
date: 2023-01-01
---

# Test Content

This is valid MDX content.
"""
        
        validation = self.converter.validate_mdx_output(valid_mdx)
        
        self.assertTrue(validation['valid'])
        self.assertEqual(len(validation['errors']), 0)
    
    def test_invalid_mdx_validation(self):
        """Test validation of invalid MDX."""
        invalid_mdx = "No frontmatter here"
        
        validation = self.converter.validate_mdx_output(invalid_mdx)
        
        self.assertFalse(validation['valid'])
        self.assertGreater(len(validation['errors']), 0)


class TestNotesExporter(unittest.TestCase):
    """Test cases for main Notes Exporter functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = Path(tempfile.mkdtemp())
        self.config = {
            "export_path": str(self.temp_dir),
            "output_format": "mdx",
            "include_empty_notes": False,
            "max_filename_length": 50
        }
    
    def tearDown(self):
        """Clean up test fixtures."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_filename_sanitization(self):
        """Test filename sanitization in exporter."""
        with patch.object(AppleScriptBridge, '__init__', return_value=None):
            with patch.object(ImageProcessor, '__init__', return_value=None):
                with patch.object(MDXConverter, '__init__', return_value=None):
                    exporter = NotesExporter(self.config)
                    
                    unsafe_filename = "Test/Note<>:*?.md"
                    safe_filename = exporter._sanitize_filename(unsafe_filename)
                    
                    unsafe_chars = '<>:"/\\|?*'
                    for char in unsafe_chars:
                        self.assertNotIn(char, safe_filename)
    
    def test_empty_note_filtering(self):
        """Test filtering of empty notes."""
        with patch.object(AppleScriptBridge, '__init__', return_value=None):
            with patch.object(ImageProcessor, '__init__', return_value=None):
                with patch.object(MDXConverter, '__init__', return_value=None):
                    exporter = NotesExporter(self.config)
                    
                    # Test empty note
                    empty_note = {"noteBody": "", "noteName": "Empty"}
                    self.assertFalse(exporter._should_include_note(empty_note))
                    
                    # Test note with content
                    content_note = {"noteBody": "Some content", "noteName": "Content"}
                    self.assertTrue(exporter._should_include_note(content_note))
    
    def test_export_path_setup(self):
        """Test export path setup and directory creation."""
        with patch.object(AppleScriptBridge, '__init__', return_value=None):
            with patch.object(ImageProcessor, '__init__', return_value=None):
                with patch.object(MDXConverter, '__init__', return_value=None):
                    exporter = NotesExporter(self.config)
                    exporter._setup_directories()
                    
                    # Check if directories were created
                    self.assertTrue(exporter.notes_dir.exists())
                    self.assertTrue(exporter.attachments_dir.exists())


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete system."""
    
    def setUp(self):
        """Set up integration test fixtures."""
        self.temp_dir = Path(tempfile.mkdtemp())
        self.config = {
            "export_path": str(self.temp_dir),
            "output_format": "mdx",
            "image_format": "jpg",
            "include_empty_notes": False
        }
    
    def tearDown(self):
        """Clean up integration test fixtures."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    @patch.object(AppleScriptBridge, 'get_all_notes')
    @patch.object(AppleScriptBridge, 'test_connection')
    def test_full_export_workflow(self, mock_test, mock_get_notes):
        """Test complete export workflow with mocked data."""
        # Mock successful connection test
        mock_test.return_value = {"success": True, "notes_count": 1}
        
        # Mock note data
        mock_get_notes.return_value = [{
            "noteID": "test-123",
            "noteName": "Test Note",
            "noteBody": "<html><body><h1>Test</h1><p>Content</p></body></html>",
            "creationDate": "2023-01-01T12:00:00Z",
            "modificationDate": "2023-01-02T12:00:00Z",
            "noteFolder": "Test Folder"
        }]
        
        # Run export
        exporter = NotesExporter(self.config)
        result = exporter.export()
        
        # Verify results
        self.assertTrue(result['success'])
        self.assertEqual(result['exported_notes'], 1)
        
        # Check if files were created
        self.assertTrue(exporter.export_path.exists())
        self.assertTrue(exporter.log_file.exists())


class TestErrorHandling(unittest.TestCase):
    """Test error handling scenarios."""
    
    def test_applescript_permission_error(self):
        """Test handling of AppleScript permission errors."""
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(
                returncode=1,
                stderr="AppleScript Error: Not authorized"
            )
            
            with self.assertRaises(RuntimeError) as context:
                bridge = AppleScriptBridge()
            
            self.assertIn("automation permissions", str(context.exception))
    
    def test_missing_dependencies(self):
        """Test handling of missing Python dependencies."""
        # This would require more complex mocking to test import failures
        pass
    
    def test_disk_space_error(self):
        """Test handling of insufficient disk space."""
        # This would require mocking filesystem operations
        pass


class TestPerformance(unittest.TestCase):
    """Performance and stress tests."""
    
    def test_large_note_processing(self):
        """Test processing of large notes."""
        # Create a large HTML content
        large_html = "<p>" + "Test content. " * 1000 + "</p>"
        
        config = {"date_format": "%Y-%m-%d"}
        converter = MDXConverter(config)
        
        # Measure conversion time
        start_time = datetime.now()
        result = converter._convert_html_to_markdown(large_html)
        end_time = datetime.now()
        
        conversion_time = (end_time - start_time).total_seconds()
        
        # Should complete within reasonable time (5 seconds for large content)
        self.assertLess(conversion_time, 5.0)
        self.assertIsInstance(result, str)
    
    def test_many_small_notes(self):
        """Test processing many small notes efficiently."""
        # This would test batch processing performance
        pass


def run_comprehensive_tests():
    """Run all test suites and generate a report."""
    print("=" * 60)
    print("Apple Notes MDX Exporter - Comprehensive Test Suite")
    print("=" * 60)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_classes = [
        TestAppleScriptBridge,
        TestImageProcessor,
        TestMDXConverter,
        TestNotesExporter,
        TestIntegration,
        TestErrorHandling,
        TestPerformance
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests with detailed output
    runner = unittest.TextTestRunner(
        verbosity=2,
        stream=sys.stdout,
        descriptions=True
    )
    
    result = runner.run(test_suite)
    
    # Print summary
    print("\\n" + "=" * 60)
    print("Test Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\\nFailures:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print("\\nErrors:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    print("=" * 60)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    # Run comprehensive test suite
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)
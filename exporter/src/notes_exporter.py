#!/usr/bin/env python3
"""
Main Notes Exporter Module

This is the main orchestrator for the Apple Notes to MDX Exporter.
It coordinates all modules to extract notes, process images, and generate MDX files.
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import argparse

# Add parent directory to path for module imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Local imports
from src.applescript_bridge import AppleScriptBridge
from src.image_processor import ImageProcessor
from src.mdx_converter import MDXConverter

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class NotesExporter:
    """Main class for orchestrating Apple Notes export to MDX format."""
    
    def __init__(self, config: Dict):
        """
        Initialize the Notes Exporter.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.start_time = datetime.now()
        
        # Setup paths
        self._setup_paths()
        
        # Initialize counters and state
        self.exported_count = 0
        self.image_count = 0
        self.errors = []
        self.warnings = []
        self.processing_stats = {
            "notes_processed": 0,
            "notes_skipped": 0,
            "images_extracted": 0,
            "images_failed": 0,
            "total_size_bytes": 0
        }
        
        # Initialize processors
        try:
            self.applescript = AppleScriptBridge()
            self.image_processor = ImageProcessor(self.attachments_dir, self.config)
            self.mdx_converter = MDXConverter(self.config)
            logger.info("All processors initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize processors: {e}")
            raise RuntimeError(f"Initialization failed: {e}")
    
    def _setup_paths(self):
        """Setup export directory paths."""
        # Use relative path from project root
        project_root = Path(__file__).parent.parent
        
        # Create timestamped export directory
        timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
        export_name = f"Notes_Export_{timestamp}"
        
        # Allow custom export path from config
        base_export_path = self.config.get("export_path", "./output")
        if os.path.isabs(base_export_path):
            self.export_path = Path(base_export_path) / export_name
        else:
            self.export_path = project_root / base_export_path / export_name
        
        self.notes_dir = self.export_path / "notes"
        self.attachments_dir = self.export_path / "attachments"
        self.log_file = self.export_path / "export_log.json"
        
        logger.info(f"Export paths configured: {self.export_path}")
    
    def export(self) -> Dict[str, Any]:
        """
        Main export function.
        
        Returns:
            Dictionary with export results and statistics
        """
        try:
            logger.info("Starting Apple Notes export process")
            
            # Create directory structure
            self._setup_directories()
            
            # Test AppleScript connection
            self._test_applescript_connection()
            
            # Extract notes from Apple Notes
            notes = self._extract_notes()
            
            if not notes:
                logger.warning("No notes found to export")
                return self._generate_result(success=True, message="No notes found")
            
            # Process each note
            self._process_notes(notes)
            
            # Generate export log
            self._write_export_log()
            
            # Generate summary report
            result = self._generate_result(success=True)
            
            logger.info(f"Export completed successfully: {self.exported_count} notes, {self.image_count} images")
            return result
            
        except KeyboardInterrupt:
            logger.warning("Export interrupted by user")
            self._write_export_log()
            return self._generate_result(success=False, message="Export interrupted by user")
        
        except Exception as e:
            logger.error(f"Export failed: {e}")
            self.errors.append({
                "type": "export_failure",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            self._write_export_log()
            return self._generate_result(success=False, message=str(e))
    
    def _setup_directories(self):
        """Create export directory structure."""
        try:
            self.export_path.mkdir(parents=True, exist_ok=True)
            self.notes_dir.mkdir(exist_ok=True)
            self.attachments_dir.mkdir(exist_ok=True)
            
            # Create .gitkeep files
            (self.notes_dir / ".gitkeep").touch()
            (self.attachments_dir / ".gitkeep").touch()
            
            logger.info(f"Created export directory structure at: {self.export_path}")
            
        except Exception as e:
            logger.error(f"Failed to create directories: {e}")
            raise RuntimeError(f"Could not create export directories: {e}")
    
    def _test_applescript_connection(self):
        """Test connection to Apple Notes."""
        try:
            test_result = self.applescript.test_connection()
            if not test_result["success"]:
                raise RuntimeError(test_result["message"])
            
            logger.info(f"AppleScript connection successful: {test_result['notes_count']} notes available")
            
        except Exception as e:
            logger.error(f"AppleScript connection failed: {e}")
            raise RuntimeError(f"Cannot connect to Apple Notes: {e}")
    
    def _extract_notes(self) -> List[Dict]:
        """Extract notes from Apple Notes using AppleScript."""
        try:
            folder_filter = self.config.get("folder_filter")
            incremental = self.config.get("incremental_export", False)
            
            logger.info(f"Extracting notes (folder: {folder_filter or 'All'}, incremental: {incremental})")
            
            notes = self.applescript.get_all_notes(folder_filter=folder_filter)
            
            # Handle incremental export
            if incremental:
                notes = self._filter_incremental_notes(notes)
            
            logger.info(f"Found {len(notes)} notes to process")
            return notes
            
        except Exception as e:
            logger.error(f"Failed to extract notes: {e}")
            raise RuntimeError(f"Note extraction failed: {e}")
    
    def _filter_incremental_notes(self, notes: List[Dict]) -> List[Dict]:
        """Filter notes for incremental export based on modification date."""
        # This is a placeholder for incremental export logic
        # In a full implementation, this would check against a previous export log
        # to only export notes that have been modified since the last export
        
        logger.info("Incremental export requested (not yet implemented - exporting all notes)")
        return notes
    
    def _process_notes(self, notes: List[Dict]):
        """Process all notes."""
        total_notes = len(notes)
        
        for idx, note in enumerate(notes, 1):
            try:
                logger.info(f"Processing note {idx}/{total_notes}: {note.get('noteName', 'Unknown')}")
                
                # Check if note should be included
                if not self._should_include_note(note):
                    self.processing_stats["notes_skipped"] += 1
                    continue
                
                # Process individual note
                self._process_single_note(note)
                
                self.processing_stats["notes_processed"] += 1
                self.exported_count += 1
                
            except Exception as e:
                error_info = {
                    "note_id": note.get("noteID", "unknown"),
                    "note_name": note.get("noteName", "Unknown"),
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                self.errors.append(error_info)
                logger.error(f"Failed to process note '{note.get('noteName', 'Unknown')}': {e}")
    
    def _should_include_note(self, note: Dict) -> bool:
        """Determine if a note should be included in the export."""
        # Check if empty notes should be included
        include_empty = self.config.get("include_empty_notes", False)
        note_body = note.get("noteBody", "")
        
        if not include_empty and (not note_body or not note_body.strip()):
            logger.debug(f"Skipping empty note: {note.get('noteName', 'Unknown')}")
            return False
        
        return True
    
    def _process_single_note(self, note: Dict):
        """Process a single note."""
        note_name = note.get("noteName", "Untitled")
        note_body = note.get("noteBody", "")
        
        try:
            # Extract and process images
            processed_html, image_paths = self.image_processor.process_html_images(
                note_body, note_name
            )
            
            # Update image count
            self.image_count += len(image_paths)
            self.processing_stats["images_extracted"] += len(image_paths)
            
            # Convert to MDX
            mdx_content = self.mdx_converter.convert(processed_html, {
                "title": note_name,
                "created": note.get("creationDate", ""),
                "modified": note.get("modificationDate", ""),
                "folder": note.get("noteFolder", "Notes")
            })
            
            # Validate MDX content
            validation = self.mdx_converter.validate_mdx_output(mdx_content)
            if not validation["valid"]:
                self.warnings.append({
                    "note_name": note_name,
                    "validation_errors": validation["errors"],
                    "timestamp": datetime.now().isoformat()
                })
            
            # Save MDX file
            file_path = self._save_note(mdx_content, note)
            
            # Update size statistics
            if file_path and file_path.exists():
                self.processing_stats["total_size_bytes"] += file_path.stat().st_size
            
            logger.debug(f"Successfully processed note: {note_name}")
            
        except Exception as e:
            logger.error(f"Error processing note '{note_name}': {e}")
            raise
    
    def _save_note(self, content: str, note: Dict) -> Path:
        """Save note as MDX file in appropriate folder."""
        try:
            # Create folder structure
            folder_name = note.get("noteFolder", "Uncategorized")
            safe_folder_name = self._sanitize_filename(folder_name)
            folder_path = self.notes_dir / safe_folder_name
            folder_path.mkdir(parents=True, exist_ok=True)
            
            # Save with .mdx extension
            note_name = note.get("noteName", "Untitled")
            safe_filename = self._sanitize_filename(note_name)
            filename = f"{safe_filename}.mdx"
            file_path = folder_path / filename
            
            # Handle filename conflicts
            counter = 1
            original_filename = filename
            while file_path.exists():
                name_part = original_filename.rsplit('.', 1)[0]
                filename = f"{name_part}-{counter}.mdx"
                file_path = folder_path / filename
                counter += 1
            
            # Write file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.debug(f"Saved note to: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save note: {e}")
            raise RuntimeError(f"Could not save note: {e}")
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem compatibility."""
        if not filename:
            return "Untitled"
        
        # Remove invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '-', filename)
        
        # Remove leading/trailing whitespace and dots
        sanitized = sanitized.strip('. ')
        
        # Limit length
        max_length = self.config.get("max_filename_length", 50)
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length].strip()
        
        # Ensure we have a valid filename
        if not sanitized:
            sanitized = "Untitled"
        
        return sanitized
    
    def _write_export_log(self):
        """Write comprehensive export log."""
        try:
            end_time = datetime.now()
            duration = (end_time - self.start_time).total_seconds()
            
            # Get image statistics
            image_stats = self.image_processor.get_image_stats()
            
            log_data = {
                "export_metadata": {
                    "timestamp": self.start_time.isoformat(),
                    "duration_seconds": round(duration, 2),
                    "export_path": str(self.export_path),
                    "configuration": self.config
                },
                "summary": {
                    "exported_notes": self.exported_count,
                    "extracted_images": self.image_count,
                    "total_errors": len(self.errors),
                    "total_warnings": len(self.warnings),
                    **self.processing_stats
                },
                "image_statistics": image_stats,
                "errors": self.errors,
                "warnings": self.warnings,
                "performance_metrics": {
                    "notes_per_second": round(self.exported_count / duration, 2) if duration > 0 else 0,
                    "average_note_size_bytes": round(
                        self.processing_stats["total_size_bytes"] / max(self.exported_count, 1)
                    )
                }
            }
            
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2)
            
            logger.info(f"Export log written to: {self.log_file}")
            
        except Exception as e:
            logger.error(f"Failed to write export log: {e}")
    
    def _generate_result(self, success: bool, message: str = "") -> Dict[str, Any]:
        """Generate final export result."""
        return {
            "success": success,
            "exported_notes": self.exported_count,
            "extracted_images": self.image_count,
            "errors": len(self.errors),
            "warnings": len(self.warnings),
            "export_path": str(self.export_path),
            "message": message,
            "processing_stats": self.processing_stats
        }


def load_config(config_path: Optional[str] = None) -> Dict:
    """Load configuration from file or use defaults."""
    # Default configuration
    default_config = {
        "export_path": "./output",
        "output_format": "mdx",
        "image_format": "jpg",
        "image_quality": 95,
        "markdown_extensions": ["tables", "strikethrough", "task_lists"],
        "incremental_export": False,
        "include_empty_notes": False,
        "date_format": "%Y-%m-%d",
        "max_filename_length": 50,
        "folder_filter": None,
        "tags_in_frontmatter": True,
        "mdx_components": False
    }
    
    if config_path and os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
            
            # Merge with defaults
            default_config.update(user_config)
            logger.info(f"Loaded configuration from: {config_path}")
            
        except Exception as e:
            logger.warning(f"Failed to load config file {config_path}: {e}")
            logger.info("Using default configuration")
    
    return default_config


def main():
    """Main entry point for command line usage."""
    parser = argparse.ArgumentParser(description="Export Apple Notes to MDX format")
    parser.add_argument("config", nargs='?', help="Path to configuration file")
    parser.add_argument("--folder", help="Filter by folder name")
    parser.add_argument("--incremental", action="store_true", help="Incremental export")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Load configuration
        config = load_config(args.config)
        
        # Override with command line arguments
        if args.folder:
            config["folder_filter"] = args.folder
        if args.incremental:
            config["incremental_export"] = True
        
        # Run export
        exporter = NotesExporter(config)
        result = exporter.export()
        
        # Output result as JSON for Shortcuts integration
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result["success"] else 1)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "message": "Export failed with critical error"
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()


# Add missing import
import re
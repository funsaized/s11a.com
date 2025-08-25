#!/usr/bin/env python3
"""
Simplified Apple Notes to MDX Exporter
Direct Python execution without Shortcuts integration
"""

import os
import json
import argparse
import logging
import time
import re
import shutil
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

# Import modules from same directory
from applescript_bridge import AppleScriptBridge
from image_processor import ImageProcessor  
from mdx_converter import MDXConverter
from filename_utils import generate_markdown_filename, to_kebab_case

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class ExportStats:
    """Simple export statistics."""
    exported_count: int = 0
    image_count: int = 0
    errors: List[str] = None
    start_time: float = 0
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
    
    def add_note(self, image_count: int = 0):
        self.exported_count += 1
        self.image_count += image_count
    
    def add_error(self, error: str):
        self.errors.append(error)
    
    def get_stats(self) -> Tuple[int, int, List[str]]:
        return self.exported_count, self.image_count, self.errors.copy()


class SimpleNotesExporter:
    """Simple sequential Apple Notes exporter with smart frontmatter generation."""
    
    def __init__(self, export_folder=None, folder_filter=None):
        """Initialize exporter with filtering configuration."""
        self.folder_filter = folder_filter
        self.stats = ExportStats()
        
        # Simple export path setup
        timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
        export_name = f"Notes_Export_{timestamp}"
        
        if export_folder:
            self.export_path = Path(export_folder) / export_name
        else:
            self.export_path = Path.cwd() / "output" / export_name
            
        self.notes_dir = self.export_path / "notes"
        self.attachments_dir = self.export_path / "attachments"
        
        # Progress tracking
        self.last_progress_update = time.time()
        
        # Initialize processors
        self.applescript = AppleScriptBridge(batch_size=50)
        self.image_processor = ImageProcessor(
            self.attachments_dir,
            {"image_format": "jpg", "image_quality": 95}
        )
        self.mdx_converter = MDXConverter({
            "markdown_extensions": ["tables", "strikethrough", "task_lists"],
            "tags_in_frontmatter": True,
            "mdx_components": False,
            "use_smart_frontmatter": True  # Enable smart frontmatter generation
        })
        
    def export(self):
        """Run the sequential export process."""
        print(f"\n🚀 Starting Apple Notes Export")
        print(f"📁 Export path: {self.export_path}")
        
        try:
            self.stats.start_time = time.time()
            
            # Create directories
            self.export_path.mkdir(parents=True, exist_ok=True)
            self.notes_dir.mkdir(exist_ok=True)
            self.attachments_dir.mkdir(exist_ok=True)
            
            # Get notes from Apple Notes
            print(f"\n📋 Fetching notes from Apple Notes...")
            print(f"ℹ️ Excluding Archive folders automatically")
            notes = self.applescript.get_all_notes(folder_filter=self.folder_filter)
            
            if not notes:
                print("❌ No notes found to export")
                return False
                
            print(f"✅ Found {len(notes)} notes (Archive folders excluded)")
            
            # Process notes sequentially
            success = self._process_notes_sequential(notes)
            
            if success:
                # Reorganize notes by category
                print(f"\n📂 Organizing notes by category...")
                self._organize_by_category()
                
                # Write summary
                self._write_summary()
                self._print_results()
                return True
            else:
                print(f"\n❌ Export failed during processing")
                return False
            
        except Exception as e:
            print(f"\n❌ Export failed: {e}")
            logger.error(f"Export failed: {e}")
            return False
    
    def _process_notes_sequential(self, notes: List[dict]) -> bool:
        """Process notes sequentially with rate limiting."""
        total_notes = len(notes)
        print(f"\n⚙️ Processing {total_notes} notes sequentially...")
        
        try:
            for i, note in enumerate(notes):
                try:
                    # Process the note
                    image_count = self._process_note(note)
                    self.stats.add_note(image_count)
                    
                    # Update progress
                    completed = i + 1
                    self._update_progress(completed, total_notes)
                    
                    # Rate limiting: small delay between API calls to avoid 429 errors
                    if completed < total_notes:  # Don't delay after the last note
                        time.sleep(1.5)  # 1.5 second delay = max 40 requests per minute
                    
                except Exception as e:
                    error_msg = f"{note.get('noteName', 'Untitled')}: {str(e)}"
                    self.stats.add_error(error_msg)
                    logger.error(f"Failed to process note: {error_msg}")
                    
                    # Still add delay even on error to maintain rate limiting
                    if i + 1 < total_notes:
                        time.sleep(1.5)
            
            print("\n✅ All notes processed")
            return True
                
        except Exception as e:
            logger.error(f"Sequential processing error: {e}")
            return False
    
    def _update_progress(self, completed: int, total: int):
        """Simple progress updates with throttling."""
        now = time.time()
        if now - self.last_progress_update >= 2.0:  # Update every 2 seconds to reduce spam
            percentage = (completed / total) * 100
            elapsed = now - self.stats.start_time
            rate = completed / elapsed if elapsed > 0 else 0
            eta = (total - completed) / rate if rate > 0 else 0
            
            print(f"\r  📊 Progress: {completed}/{total} ({percentage:.1f}%) | "
                  f"{rate:.1f} notes/sec | ETA: {eta:.0f}s", end="", flush=True)
            
            self.last_progress_update = now
    
    def _process_note(self, note: dict) -> int:
        """Process a single note and return number of images extracted."""
        note_name = note.get("noteName", "Untitled")
        note_body = note.get("noteBody", "")
        
        # Process images
        processed_html, image_paths = self.image_processor.process_html_images(
            note_body, note_name
        )
        
        # Convert to MDX
        mdx_content = self.mdx_converter.convert(processed_html, {
            "title": note_name,
            "created": note.get("creationDate", ""),
            "modified": note.get("modificationDate", ""),
            "folder": note.get("noteFolder", "Notes")
        })
        
        # Add fallback mechanism for orphaned images
        mdx_content = self._add_orphaned_images_fallback(mdx_content, note_name, image_paths)
        
        # Normal folder-based organization
        folder_name = self._sanitize_filename(note.get("noteFolder", "Notes"))
        folder_path = self.notes_dir / folder_name
        
        # Create directory if it doesn't exist
        folder_path.mkdir(parents=True, exist_ok=True)
        
        filename = generate_markdown_filename(note_name)
        file_path = folder_path / filename
        
        # Handle filename conflicts
        counter = 1
        original_path = file_path
        while file_path.exists():
            stem = original_path.stem
            suffix = original_path.suffix
            file_path = folder_path / f"{stem}-{counter}{suffix}"
            counter += 1
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(mdx_content)
        
        return len(image_paths)
    
    def _sanitize_filename(self, filename):
        """Clean filename for filesystem."""
        import re
        if not filename:
            return "Untitled"
        sanitized = re.sub(r'[<>:"/\\|?*]', '-', filename)
        return sanitized[:50].strip('. ')
    
    def _write_summary(self):
        """Write a comprehensive summary file."""
        exported_count, image_count, errors = self.stats.get_stats()
        elapsed = time.time() - self.stats.start_time
        rate = exported_count / elapsed if elapsed > 0 else 0
        
        summary_path = self.export_path / "export_summary.txt"
        with open(summary_path, 'w') as f:
            f.write(f"Apple Notes Export Summary\n")
            f.write(f"{'='*40}\n")
            f.write(f"Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Processing Time: {elapsed:.1f} seconds\n")
            f.write(f"Processing Rate: {rate:.2f} notes/second\n")
            f.write(f"Processing Mode: Sequential (with rate limiting)\n")
            f.write(f"Notes Exported: {exported_count}\n")
            f.write(f"Images Extracted: {image_count}\n")
            if errors:
                f.write(f"\nErrors ({len(errors)}):\n")
                for err in errors:
                    f.write(f"  - {err}\n")
    
    def _print_results(self):
        """Print final export results."""
        exported_count, image_count, errors = self.stats.get_stats()
        elapsed = time.time() - self.stats.start_time
        rate = exported_count / elapsed if elapsed > 0 else 0
        
        print(f"\n✨ Export Complete!")
        print(f"⏱️ Processing time: {elapsed:.1f} seconds")
        print(f"🚀 Processing rate: {rate:.2f} notes/second")
        print(f"📝 Exported notes: {exported_count}")
        print(f"🖼️ Extracted images: {image_count}")
        if errors:
            print(f"⚠️ Errors: {len(errors)}")
            for err in errors[:5]:  # Show first 5 errors
                print(f"   - {err}")
            if len(errors) > 5:
                print(f"   ... and {len(errors) - 5} more (see export_summary.txt)")
        print(f"\n📂 Files saved to: {self.export_path}")

    def _organize_by_category(self):
        """Organize exported notes into subfolders by category."""
        try:
            # Dictionary to track categories and files
            category_files = {}
            files_processed = 0
            files_moved = 0
            
            # Scan all MDX files in the notes directory
            for mdx_file in self.notes_dir.rglob("*.mdx"):
                files_processed += 1
                
                # Extract category from frontmatter
                category = self._extract_category_from_file(mdx_file)
                
                if category:
                    # Normalize category name for folder
                    folder_name = self._normalize_category_name(category)
                    
                    # Track files by category
                    if folder_name not in category_files:
                        category_files[folder_name] = []
                    category_files[folder_name].append((mdx_file, category))
            
            # Create category folders and move files
            for folder_name, files in category_files.items():
                if len(files) > 0:
                    # Create category folder
                    category_folder = self.notes_dir / folder_name
                    category_folder.mkdir(exist_ok=True)
                    
                    # Move files to category folder
                    for mdx_file, original_category in files:
                        try:
                            new_path = category_folder / mdx_file.name
                            
                            # Handle filename conflicts
                            if new_path.exists():
                                counter = 1
                                stem = new_path.stem
                                suffix = new_path.suffix
                                while new_path.exists():
                                    new_path = category_folder / f"{stem}-{counter}{suffix}"
                                    counter += 1
                            
                            # Move the file
                            shutil.move(str(mdx_file), str(new_path))
                            files_moved += 1
                            
                            logger.debug(f"Moved '{mdx_file.name}' to '{folder_name}/' folder")
                            
                        except Exception as e:
                            error_msg = f"Failed to move {mdx_file.name} to {folder_name}: {e}"
                            self.stats.add_error(error_msg)
                            logger.error(error_msg)
            
            # Clean up empty original folders
            self._clean_empty_folders(self.notes_dir)
            
            # Report results
            if files_moved > 0:
                print(f"✅ Organized {files_moved}/{files_processed} notes into {len(category_files)} categories")
                for folder_name, files in category_files.items():
                    print(f"   📁 {folder_name}: {len(files)} notes")
            else:
                print("ℹ️ No notes were organized (no categories found or extraction failed)")
                
        except Exception as e:
            error_msg = f"Error organizing by category: {e}"
            self.stats.add_error(error_msg)
            logger.error(error_msg)

    def _extract_category_from_file(self, file_path: Path) -> Optional[str]:
        """Extract category from MDX file frontmatter."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Look for frontmatter
            if content.startswith('---'):
                # Find the end of frontmatter
                parts = content.split('---', 2)
                if len(parts) >= 2:
                    frontmatter = parts[1]
                    
                    # Extract category using regex
                    category_match = re.search(r'^category:\s*["\']?([^"\'\n\r]+)["\']?', frontmatter, re.MULTILINE | re.IGNORECASE)
                    if category_match:
                        return category_match.group(1).strip()
            
            return None
            
        except Exception as e:
            logger.warning(f"Could not extract category from {file_path.name}: {e}")
            return None

    def _normalize_category_name(self, category: str) -> str:
        """Normalize category name for use as folder name using kebab-case."""
        if not category:
            return "uncategorized"
        
        # Use our kebab-case utility for consistent formatting
        normalized = to_kebab_case(category, 50)
        
        # Fallback to uncategorized if empty after processing
        if not normalized:
            normalized = "uncategorized"
        
        return normalized

    def _clean_empty_folders(self, directory: Path):
        """Remove empty folders after reorganization."""
        try:
            for folder in directory.iterdir():
                if folder.is_dir():
                    # Recursively clean subdirectories first
                    self._clean_empty_folders(folder)
                    
                    # Check if folder is empty and remove it
                    try:
                        if not any(folder.iterdir()):
                            folder.rmdir()
                            logger.debug(f"Removed empty folder: {folder.name}")
                    except OSError:
                        # Folder not empty or permission issues
                        pass
        except Exception as e:
            logger.warning(f"Error cleaning empty folders: {e}")

    def _add_orphaned_images_fallback(self, mdx_content: str, note_name: str, image_paths: List[str]) -> str:
        """Add fallback image references for extracted images not linked in MDX."""
        try:
            if not image_paths:
                return mdx_content
            
            # Check if MDX already contains image references
            import re
            existing_images = re.findall(r'!\[[^\]]*\]\([^\)]+\)', mdx_content)
            
            if existing_images:
                # Images already properly linked, no fallback needed
                logger.debug(f"Note '{note_name}' already has {len(existing_images)} image links, no fallback needed")
                return mdx_content
            
            # No existing images but we have extracted images - add fallback references
            logger.info(f"Adding fallback image references for note '{note_name}' ({len(image_paths)} images)")
            
            # Find appropriate insertion point (after frontmatter, before main content)
            lines = mdx_content.split('\n')
            insertion_point = 0
            
            # Skip frontmatter
            if lines and lines[0].strip() == '---':
                in_frontmatter = True
                for i, line in enumerate(lines[1:], 1):
                    if line.strip() == '---':
                        insertion_point = i + 1
                        break
            
            # Skip title if present
            if insertion_point < len(lines):
                for i in range(insertion_point, len(lines)):
                    if lines[i].strip().startswith('#'):
                        insertion_point = i + 1
                        break
            
            # Create image references
            image_refs = []
            for image_path in image_paths:
                image_filename = Path(image_path).name
                # Create descriptive alt text from filename
                alt_text = Path(image_path).stem.replace('-', ' ').title()
                # Remove index numbers for cleaner alt text
                alt_text = re.sub(r'-\d{3}$', '', alt_text).replace('-', ' ').title()
                
                image_ref = f"![{alt_text}](/images/articles/{image_filename})"
                image_refs.append(image_ref)
            
            # Insert images after title/frontmatter
            if image_refs:
                # Add some spacing
                image_section = ["", "{/* Images from Apple Notes */}"] + image_refs + [""]
                lines[insertion_point:insertion_point] = image_section
                
                logger.info(f"✅ Added {len(image_refs)} fallback image references to '{note_name}'")
            
            return '\n'.join(lines)
            
        except Exception as e:
            logger.error(f"Error adding fallback images for note '{note_name}': {e}")
            return mdx_content


def main():
    """Main entry point for simplified export."""
    parser = argparse.ArgumentParser(
        description="Export Apple Notes to MDX format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Export all notes to current directory
  python export.py
  
  # Export notes from specific folder
  python export.py --folder "Work Notes"
  
  # Export notes with specific hashtag
  python export.py --tags food
  
  # Export tagged notes to custom location
  python export.py --tags work --output ~/Documents/TaggedNotes
  
  # Export specific folder
  python export.py --folder "Personal" --output ~/Desktop
        """
    )
    
    parser.add_argument(
        "--folder",
        help="Export only notes from this folder (default: all folders)"
    )
    parser.add_argument(
        "--output",
        help="Output directory for export (default: ./output)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    # Removed threads argument since we're now using sequential processing
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Run export
    try:
        exporter = SimpleNotesExporter(
            export_folder=args.output,
            folder_filter=args.folder
        )
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return 1
    
    success = exporter.export()
    return 0 if success else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
#!/usr/bin/env python3
"""
Simplified Apple Notes to MDX Exporter
Direct Python execution without Shortcuts integration
"""

import os
import json
import argparse
import logging
import threading
import time
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from typing import List, Tuple, Optional

# Import modules from same directory
from applescript_bridge import AppleScriptBridge
from image_processor import ImageProcessor  
from mdx_converter import MDXConverter

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class ExportStats:
    """Thread-safe export statistics."""
    exported_count: int = 0
    image_count: int = 0
    errors: List[str] = None
    start_time: float = 0
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        self._lock = threading.Lock()
    
    def add_note(self, image_count: int = 0):
        with self._lock:
            self.exported_count += 1
            self.image_count += image_count
    
    def add_error(self, error: str):
        with self._lock:
            self.errors.append(error)
    
    def get_stats(self) -> Tuple[int, int, List[str]]:
        with self._lock:
            return self.exported_count, self.image_count, self.errors.copy()


class SimpleNotesExporter:
    """Multithreaded Apple Notes exporter with progress tracking."""
    
    def __init__(self, export_folder=None, folder_filter=None, max_workers=4):
        """Initialize exporter with threading and filtering configuration."""
        self.folder_filter = folder_filter
        self.max_workers = max_workers
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
        self.progress_lock = threading.Lock()
        self.last_progress_update = time.time()
        
        # Initialize processors with optimized config
        self.applescript = AppleScriptBridge(batch_size=min(50, max_workers * 10))
        self.image_processor = ImageProcessor(
            self.attachments_dir,
            {"image_format": "jpg", "image_quality": 95}
        )
        self.mdx_converter = MDXConverter({
            "markdown_extensions": ["tables", "strikethrough", "task_lists"],
            "tags_in_frontmatter": True,
            "mdx_components": False
        })
        
    def export(self):
        """Run the multithreaded export process."""
        print(f"\n🚀 Starting Multithreaded Apple Notes Export")
        print(f"📁 Export path: {self.export_path}")
        print(f"🧵 Using {self.max_workers} worker threads")
        
        try:
            self.stats.start_time = time.time()
            
            # Create directories
            self.export_path.mkdir(parents=True, exist_ok=True)
            self.notes_dir.mkdir(exist_ok=True)
            self.attachments_dir.mkdir(exist_ok=True)
            
            # Get notes from Apple Notes (sequential - AppleScript limitation)
            print(f"\n📋 Fetching notes from Apple Notes...")
            notes = self.applescript.get_all_notes(folder_filter=self.folder_filter)
            
            if not notes:
                print("❌ No notes found to export")
                return False
                
            print(f"✅ Found {len(notes)} notes")
            
            # Process notes with multithreading
            success = self._process_notes_threaded(notes)
            
            if success:
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
    
    def _process_notes_threaded(self, notes: List[dict]) -> bool:
        """Process notes using multithreading with progress tracking."""
        total_notes = len(notes)
        print(f"\n⚙️ Processing {total_notes} notes with {self.max_workers} threads...")
        
        try:
            with ThreadPoolExecutor(max_workers=self.max_workers, thread_name_prefix="NoteProcessor") as executor:
                # Submit all note processing tasks
                future_to_note = {
                    executor.submit(self._process_note_safe, note): note 
                    for note in notes
                }
                
                # Process completed tasks with progress updates
                completed = 0
                for future in as_completed(future_to_note):
                    note = future_to_note[future]
                    completed += 1
                    
                    try:
                        image_count = future.result()
                        self.stats.add_note(image_count)
                    except Exception as e:
                        error_msg = f"{note.get('noteName', 'Untitled')}: {str(e)}"
                        self.stats.add_error(error_msg)
                        logger.error(f"Failed to process note: {error_msg}")
                    
                    # Update progress (throttled)
                    self._update_progress(completed, total_notes)
                
                print("\n✅ All notes processed")
                return True
                
        except Exception as e:
            logger.error(f"Threading error: {e}")
            return False
    
    def _process_note_safe(self, note: dict) -> int:
        """Thread-safe wrapper for note processing."""
        try:
            return self._process_note(note)
        except Exception as e:
            # Re-raise to be caught by future.result()
            raise e
    
    def _update_progress(self, completed: int, total: int):
        """Thread-safe progress updates with throttling."""
        with self.progress_lock:
            now = time.time()
            if now - self.last_progress_update >= 1.0:  # Update every second
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
        
        # Normal folder-based organization
        folder_name = self._sanitize_filename(note.get("noteFolder", "Notes"))
        folder_path = self.notes_dir / folder_name
        
        # Thread-safe directory creation
        try:
            folder_path.mkdir(parents=True, exist_ok=True)
        except FileExistsError:
            pass  # Another thread created it
        
        filename = f"{self._sanitize_filename(note_name)}.mdx"
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
            f.write(f"Processing Rate: {rate:.1f} notes/second\n")
            f.write(f"Worker Threads: {self.max_workers}\n")
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
        print(f"🚀 Processing rate: {rate:.1f} notes/second")
        print(f"📝 Exported notes: {exported_count}")
        print(f"🖼️ Extracted images: {image_count}")
        if errors:
            print(f"⚠️ Errors: {len(errors)}")
            for err in errors[:5]:  # Show first 5 errors
                print(f"   - {err}")
            if len(errors) > 5:
                print(f"   ... and {len(errors) - 5} more (see export_summary.txt)")
        print(f"\n📂 Files saved to: {self.export_path}")


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
  
  # Export tagged notes to custom location with threading
  python export.py --tags work --output ~/Documents/TaggedNotes --threads 6
  
  # Export specific folder with custom threading
  python export.py --folder "Personal" --output ~/Desktop --threads 6
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
    parser.add_argument(
        "--threads", "-t",
        type=int,
        default=4,
        help="Number of worker threads for processing (default: 4)"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate thread count
    if args.threads < 1:
        args.threads = 1
    elif args.threads > 16:
        print("⚠️ Warning: Using more than 16 threads may cause performance issues")
    
    
    # Run export
    try:
        exporter = SimpleNotesExporter(
            export_folder=args.output,
            folder_filter=args.folder,
            max_workers=args.threads
        )
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return 1
    
    success = exporter.export()
    return 0 if success else 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
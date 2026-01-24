#!/usr/bin/env python3
"""
Simplified Apple Notes to MDX Exporter
Direct Python execution without Shortcuts integration
"""

import argparse
import json
import logging
import os
import re
import shutil
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Import modules from same directory
from applescript_bridge import AppleScriptBridge
from filename_utils import generate_markdown_filename, to_kebab_case
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
                # File organization is now done in a single pass within _process_note

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

                except Exception as e:
                    error_msg = f"{note.get('noteName', 'Untitled')}: {str(e)}"
                    self.stats.add_error(error_msg)
                    logger.error(f"Failed to process note: {error_msg}")

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
        """Process a single note and save it to a category-based folder."""
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

        # --- Start Single-Pass Organization ---

        # 1. Extract category from the generated MDX content string
        category = "uncategorized"
        if mdx_content.startswith('---'):
            parts = mdx_content.split('---', 2)
            if len(parts) >= 2:
                frontmatter = parts[1]
                category_match = re.search(r'^category:\s*["\\]?([^"\'\n\r]+)["\\]?', frontmatter, re.MULTILINE | re.IGNORECASE)
                if category_match:
                    category = category_match.group(1).strip()

        # 2. Normalize category name into a URL-friendly slug
        category_slug = to_kebab_case(category, 50)
        if not category_slug:
            category_slug = "uncategorized"

        # 3. Create the category-based directory
        folder_path = self.notes_dir / category_slug
        folder_path.mkdir(parents=True, exist_ok=True)

        # 4. Generate filename and final path
        filename = generate_markdown_filename(note_name)
        file_path = folder_path / filename

        # 5. Handle filename conflicts
        counter = 1
        original_path = file_path
        while file_path.exists():
            stem = original_path.stem
            suffix = original_path.suffix
            file_path = folder_path / f"{stem}-{counter}{suffix}"
            counter += 1

        # 6. Write the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(mdx_content)

        # --- End Single-Pass Organization ---

        return len(image_paths)


    def _write_summary(self):
        """Write a comprehensive summary file."""
        exported_count, image_count, errors = self.stats.get_stats()
        elapsed = time.time() - self.stats.start_time
        rate = exported_count / elapsed if elapsed > 0 else 0

        summary_path = self.export_path / "export_summary.txt"
        with open(summary_path, 'w') as f:
            f.write(f"Apple Notes Export Summary\n")
            f.write(f"{ '='*40}\n")
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









    def _add_orphaned_images_fallback(self, mdx_content: str, note_name: str, image_paths: List[str]) -> str:
        """Add fallback image references for extracted images not linked in MDX."""
        try:
            if not image_paths:
                return mdx_content

            # Check if MDX already contains image references
            import re
            existing_images = re.findall(r'!\\[^\\]*\]\([^)]+\)', mdx_content)

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
                image_section = ["", "{/* Images from Apple Notes */} "] + image_refs + [""]
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

# Product Requirements Document
## Apple Notes to MDX Exporter with Image Extraction

**Version:** 1.0  
**Date:** August 2025  
**Status:** Ready for Implementation

---

## 1. Executive Summary

### 1.1 Objective
Develop a Python-based solution that extracts Apple Notes (including embedded images) to MDX format, triggered via Apple Shortcuts for seamless iOS/macOS integration. The solution will exist as a subfolder (`exporter`) within an existing project.

### 1.2 Problem Statement
Apple Shortcuts cannot directly access images embedded in Notes due to iOS/macOS sandboxing. Users need an automated way to export their notes with images preserved for use in modern applications that support MDX (Markdown + JSX).

### 1.3 Solution Overview
A Python script that uses AppleScript to extract note content, processes embedded images from base64/HTML, and outputs clean MDX files with properly linked image files, all orchestrated through Apple Shortcuts. The entire solution lives in a dedicated `exporter` subfolder for clean project organization.

---

## 2. Project Structure

### 2.1 Directory Layout

```
your-existing-project/
├── exporter/                    # Apple Notes Exporter module
│   ├── src/
│   │   ├── __init__.py
│   │   ├── notes_exporter.py   # Main Python script
│   │   ├── applescript_bridge.py
│   │   ├── image_processor.py
│   │   └── mdx_converter.py
│   ├── scripts/
│   │   ├── shortcuts_export.sh # Bash wrapper for Shortcuts
│   │   └── install.sh          # Installation script
│   ├── config/
│   │   └── default_config.json
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_exporter.py
│   ├── output/                  # Default export location
│   │   └── .gitkeep
│   ├── requirements.txt
│   ├── README.md
│   └── Export_Notes.shortcut   # Shortcut file
├── your-other-folders/
└── ...
```

### 2.2 System Components

```
┌─────────────────┐
│  Apple Shortcut │ (User Interface)
└────────┬────────┘
         │ Triggers
         ▼
┌─────────────────────────────┐
│   Bash Wrapper              │ 
│  (exporter/scripts/         │
│   shortcuts_export.sh)      │
└────────┬────────────────────┘
         │ Calls
         ▼
┌─────────────────────────────┐
│  Python Script              │
│  (exporter/src/             │
│   notes_exporter.py)        │
└────────┬────────────────────┘
         │ Uses
         ▼
┌─────────────────────────────┐
│     AppleScript Engine      │
│  (via osascript subprocess) │
└─────────────────────────────┘
```

### 2.3 Data Flow
1. User triggers Shortcut with parameters
2. Shortcut executes bash wrapper script in `exporter/scripts/`
3. Bash script calls Python module with proper environment
4. Python extracts notes via AppleScript
5. Python processes HTML to extract images
6. Python generates MDX files with image references
7. Shortcut receives completion status

---

## 3. Functional Requirements

### 3.1 Core Features

#### F1: Note Extraction
- **F1.1:** Extract all notes from specified folder (default: all folders)
- **F1.2:** Preserve note metadata (creation date, modification date, folder)
- **F1.3:** Handle notes with special characters in titles
- **F1.4:** Support incremental exports (only modified notes)

#### F2: Image Processing
- **F2.1:** Extract base64 encoded images from HTML content
- **F2.2:** Extract linked image files from Notes database
- **F2.3:** Convert HEIC images to JPG for compatibility
- **F2.4:** Preserve image quality (no recompression)
- **F2.5:** Generate unique filenames to prevent collisions

#### F3: MDX Generation
- **F3.1:** Convert HTML to clean MDX using markdownify with MDX extensions
- **F3.2:** Preserve formatting (bold, italic, lists, tables)
- **F3.3:** Convert Apple Notes checklists to MDX task lists
- **F3.4:** Generate relative image links in format: `![alt text](./attachments/image.jpg)`
- **F3.5:** Handle notes without any content gracefully
- **F3.6:** Save all files with `.mdx` extension
- **F3.7:** Support MDX-specific components if needed (optional JSX components)

#### F4: File Organization
- **F4.1:** Create directory structure:
```
exporter/output/Notes_Export_YYYY-MM-DD_HHMMSS/
├── notes/
│   ├── folder1/
│   │   └── note-title.mdx
│   └── folder2/
│       └── another-note.mdx
├── attachments/
│   ├── note-title-001.jpg
│   └── another-note-001.png
└── export_log.json
```
- **F4.2:** Sanitize filenames (remove invalid characters)
- **F4.3:** Maintain folder hierarchy from Apple Notes
- **F4.4:** All exported notes use `.mdx` extension

#### F5: Shortcuts Integration
- **F5.1:** Accept parameters: folder name, export path, incremental flag
- **F5.2:** Return JSON status with counts (notes exported, images extracted)
- **F5.3:** Support both iOS and macOS Shortcuts
- **F5.4:** Handle errors gracefully with user-friendly messages

### 3.2 Configuration Options

```python
CONFIG = {
    "export_path": "./exporter/output",  # Relative to project root
    "output_format": "mdx",              # File extension for notes
    "image_format": "jpg",               # jpg, png, original
    "image_quality": 95,                 # 1-100 for jpg
    "markdown_extensions": ["tables", "strikethrough", "task_lists"],
    "incremental_export": False,
    "include_empty_notes": False,
    "date_format": "%Y-%m-%d",
    "max_filename_length": 50,
    "folder_filter": None,               # None for all, or specific folder name
    "tags_in_frontmatter": True,
    "mdx_components": False              # Enable JSX component support
}
```

---

## 4. Implementation Specifications

### 4.1 Python Script Structure

```python
# exporter/src/notes_exporter.py

import os
import sys
import json
import base64
import subprocess
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import hashlib

# Add parent directory to path for module imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Third-party imports
from bs4 import BeautifulSoup
import markdownify
from PIL import Image

# Local imports
from src.applescript_bridge import AppleScriptBridge
from src.image_processor import ImageProcessor
from src.mdx_converter import MDXConverter

class NotesExporter:
    def __init__(self, config: Dict):
        self.config = config
        # Use relative path from project root
        project_root = Path(__file__).parent.parent
        self.export_path = project_root / "output" / f"Notes_Export_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}"
        self.notes_dir = self.export_path / "notes"
        self.attachments_dir = self.export_path / "attachments"
        self.log_file = self.export_path / "export_log.json"
        self.exported_count = 0
        self.image_count = 0
        self.errors = []
        
        # Initialize processors
        self.applescript = AppleScriptBridge()
        self.image_processor = ImageProcessor(self.attachments_dir)
        self.mdx_converter = MDXConverter(self.config)
        
    def extract_notes_via_applescript(self) -> List[Dict]:
        """Extract notes using AppleScript Bridge"""
        return self.applescript.get_all_notes(
            folder_filter=self.config.get("folder_filter")
        )
        
    def extract_images_from_html(self, html: str, note_name: str) -> Tuple[str, List[str]]:
        """Extract base64 images and return modified HTML with image paths"""
        return self.image_processor.process_html_images(html, note_name)
        
    def convert_to_mdx(self, html: str, note_metadata: Dict) -> str:
        """Convert HTML to MDX with frontmatter"""
        return self.mdx_converter.convert(html, note_metadata)
        
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem compatibility"""
        # Remove invalid characters
        filename = re.sub(r'[<>:"/\\|?*]', '-', filename)
        # Limit length
        if len(filename) > self.config["max_filename_length"]:
            filename = filename[:self.config["max_filename_length"]]
        return filename.strip()
        
    def save_note(self, content: str, note: Dict) -> Path:
        """Save note as MDX file in appropriate folder"""
        # Create folder structure
        folder_name = self.sanitize_filename(note.get("noteFolder", "Uncategorized"))
        folder_path = self.notes_dir / folder_name
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Save with .mdx extension
        filename = self.sanitize_filename(note["noteName"]) + ".mdx"
        file_path = folder_path / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        return file_path
        
    def process_note(self, note: Dict):
        """Process a single note"""
        # Extract images
        html_content, image_paths = self.extract_images_from_html(
            note["noteBody"], 
            note["noteName"]
        )
        self.image_count += len(image_paths)
        
        # Convert to MDX
        mdx_content = self.convert_to_mdx(html_content, {
            "title": note["noteName"],
            "created": note["creationDate"],
            "modified": note["modificationDate"],
            "folder": note["noteFolder"]
        })
        
        # Save MDX file
        self.save_note(mdx_content, note)
        
    def setup_directories(self):
        """Create export directory structure"""
        self.export_path.mkdir(parents=True, exist_ok=True)
        self.notes_dir.mkdir(exist_ok=True)
        self.attachments_dir.mkdir(exist_ok=True)
        
    def write_log(self):
        """Write export log"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "export_path": str(self.export_path),
            "summary": {
                "exported_notes": self.exported_count,
                "extracted_images": self.image_count,
                "errors": len(self.errors)
            },
            "errors": self.errors,
            "configuration": self.config
        }
        
        with open(self.log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
    def export(self) -> Dict:
        """Main export function"""
        # Create directory structure
        self.setup_directories()
        
        # Extract notes
        notes = self.extract_notes_via_applescript()
        
        # Process each note
        for note in notes:
            try:
                self.process_note(note)
                self.exported_count += 1
            except Exception as e:
                self.errors.append({
                    "note": note.get("noteName", "Unknown"),
                    "error": str(e)
                })
                
        # Write log
        self.write_log()
        
        return {
            "success": True,
            "exported_notes": self.exported_count,
            "extracted_images": self.image_count,
            "errors": len(self.errors),
            "export_path": str(self.export_path)
        }

if __name__ == "__main__":
    # Load config
    config_path = Path(__file__).parent.parent / "config" / "default_config.json"
    with open(config_path) as f:
        config = json.load(f)
    
    # Override with command line args if provided
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1]) as f:
            config.update(json.load(f))
    
    # Run export
    exporter = NotesExporter(config)
    result = exporter.export()
    
    # Output result as JSON for Shortcuts
    print(json.dumps(result))
```

### 4.2 MDX Converter Module

```python
# exporter/src/mdx_converter.py

import markdownify
from typing import Dict

class MDXConverter:
    def __init__(self, config: Dict):
        self.config = config
        
    def convert(self, html: str, metadata: Dict) -> str:
        """Convert HTML to MDX with frontmatter"""
        # Add frontmatter
        frontmatter = f"""---
title: "{metadata['title']}"
created: {metadata['created']}
modified: {metadata['modified']}
folder: "{metadata['folder']}"
---

"""
        # Convert HTML to Markdown/MDX
        mdx_content = markdownify.markdownify(
            html, 
            heading_style="ATX",
            bullets="-",
            strong_em_symbol="**"
        )
        
        # Add MDX-specific processing if enabled
        if self.config.get("mdx_components"):
            mdx_content = self.add_mdx_components(mdx_content)
        
        return frontmatter + mdx_content
    
    def add_mdx_components(self, content: str) -> str:
        """Add MDX-specific components if needed"""
        # Placeholder for MDX component processing
        # Could convert specific patterns to JSX components
        return content
```

### 4.3 Bash Wrapper Script

```bash
#!/bin/bash
# exporter/scripts/shortcuts_export.sh

# Get the script's directory (exporter/scripts)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Set up Python environment
export PATH="/usr/local/bin:/usr/bin:/bin"
export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH}"

# Parse arguments from Shortcuts
FOLDER_FILTER="${1:-}"
EXPORT_PATH="${2:-${PROJECT_ROOT}/output}"
INCREMENTAL="${3:-false}"

# Create config file
cat > /tmp/notes_export_config.json <<EOF
{
    "export_path": "${EXPORT_PATH}",
    "output_format": "mdx",
    "folder_filter": "${FOLDER_FILTER}",
    "incremental_export": ${INCREMENTAL}
}
EOF

# Change to project root
cd "${PROJECT_ROOT}"

# Run Python script
python3 "${PROJECT_ROOT}/src/notes_exporter.py" \
    /tmp/notes_export_config.json

# Clean up
rm /tmp/notes_export_config.json
```

### 4.4 Apple Shortcut Configuration

```yaml
Shortcut Name: "Export Notes to MDX"

Actions:
  1. Text:
     Content: "[Folder Name - optional]"
     Variable: folder_filter
     
  2. Get My Shortcuts:
     Variable: shortcuts_folder
     
  3. Run Shell Script:
     Script: ~/[your-project]/exporter/scripts/shortcuts_export.sh
     Input: folder_filter
     Shell: /bin/bash
     Variable: export_result
     
  4. Get Dictionary from Input:
     Input: export_result
     Variable: result_dict
     
  5. If (result_dict.success == true):
     Show Notification:
       Title: "MDX Export Complete"
       Body: "Exported {result_dict.exported_notes} notes with {result_dict.extracted_images} images"
  Else:
     Show Alert:
       Title: "Export Failed"
       Message: "Check logs at {result_dict.export_path}/export_log.json"
```

---

## 5. Installation Requirements

### 5.1 System Requirements
- macOS 10.15 (Catalina) or later
- Python 3.8 or later
- 500MB free disk space for dependencies
- Existing project directory where `exporter` will be added

### 5.2 Python Dependencies

```txt
# exporter/requirements.txt
beautifulsoup4==4.12.3
markdownify==0.11.6
Pillow==10.2.0
python-dateutil==2.8.2
```

### 5.3 Installation Script

```bash
#!/bin/bash
# exporter/scripts/install.sh

echo "Installing Apple Notes MDX Exporter..."

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Create necessary directories
echo "Creating project structure..."
mkdir -p "${PROJECT_ROOT}/src"
mkdir -p "${PROJECT_ROOT}/config"
mkdir -p "${PROJECT_ROOT}/tests"
mkdir -p "${PROJECT_ROOT}/output"

# Install Python dependencies
echo "Installing Python dependencies..."
cd "${PROJECT_ROOT}"
pip3 install --user -r requirements.txt

# Make scripts executable
chmod +x "${PROJECT_ROOT}/scripts/shortcuts_export.sh"

# Create default config
echo "Creating default configuration..."
cat > "${PROJECT_ROOT}/config/default_config.json" <<EOF
{
    "export_path": "./exporter/output",
    "output_format": "mdx",
    "image_format": "jpg",
    "image_quality": 95,
    "markdown_extensions": ["tables", "strikethrough", "task_lists"],
    "incremental_export": false,
    "include_empty_notes": false,
    "date_format": "%Y-%m-%d",
    "max_filename_length": 50,
    "folder_filter": null,
    "tags_in_frontmatter": true,
    "mdx_components": false
}
EOF

# Update Shortcut path
echo "Configuring Apple Shortcut..."
PARENT_PROJECT_PATH=$(dirname "${PROJECT_ROOT}")
echo "Update the Shortcut to use path: ${PROJECT_ROOT}/scripts/shortcuts_export.sh"

# Install Shortcut (if file exists)
if [ -f "${PROJECT_ROOT}/Export_Notes.shortcut" ]; then
    open "${PROJECT_ROOT}/Export_Notes.shortcut"
fi

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Open Shortcuts app"
echo "2. Update the 'Run Shell Script' action path to:"
echo "   ${PROJECT_ROOT}/scripts/shortcuts_export.sh"
echo "3. Grant necessary permissions when prompted"
echo ""
echo "Project structure created at: ${PROJECT_ROOT}"
```

---

## 6. Error Handling

### 6.1 Error Categories

| Error Code | Description | User Message | Resolution |
|------------|-------------|--------------|------------|
| E001 | Notes app not accessible | "Please grant Notes access in System Preferences" | Enable automation permissions |
| E002 | Invalid export path | "Cannot write to specified location" | Check folder permissions |
| E003 | Image extraction failed | "Some images could not be extracted" | Continue with text export |
| E004 | AppleScript timeout | "Notes app not responding" | Retry with smaller batches |
| E005 | Insufficient disk space | "Not enough space for export" | Free up disk space |

### 6.2 Logging Format

```json
{
  "timestamp": "2025-08-22T10:30:00Z",
  "export_id": "export_20250822_103000",
  "summary": {
    "total_notes": 150,
    "exported_notes": 148,
    "total_images": 45,
    "extracted_images": 43,
    "failed_notes": 2,
    "failed_images": 2
  },
  "errors": [
    {
      "note_id": "x-coredata://12345",
      "note_title": "Meeting Notes",
      "error_code": "E003",
      "error_message": "Failed to decode base64 image",
      "timestamp": "2025-08-22T10:30:15Z"
    }
  ],
  "configuration": {
    "folder_filter": null,
    "incremental": false,
    "export_path": "~/Notes_Export"
  }
}
```

---

## 7. Testing Requirements

### 7.1 Test Cases

| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| T001 | Export single note with image | Note with 1 embedded image | 1 .mdx file, 1 image file in exporter/output/ |
| T002 | Export folder with 10 notes | Folder selection | 10 .mdx files in subfolder |
| T003 | Handle note with no content | Empty note | .mdx with frontmatter only |
| T004 | Process HEIC image | Note with HEIC attachment | Converted to JPG |
| T005 | Special characters in title | Note titled "Test/Note<>*.mdx" | Sanitized filename |
| T006 | Large export (100+ notes) | All notes | Progress updates, no timeout |
| T007 | Incremental export | Second run with incremental=true | Only modified notes exported |
| T008 | Network image links | Note with web images | Images downloaded and stored |
| T009 | MDX file format | Any note | All files have .mdx extension |
| T010 | Relative paths in project | Run from any directory | Files saved to exporter/output/ |

### 7.2 Performance Benchmarks

- Single note export: < 1 second
- 100 notes with 50 images: < 30 seconds
- Memory usage: < 200MB for typical export
- Maximum supported notes: 10,000

---

## 8. Security Considerations

### 8.1 Permissions Required
- Full Disk Access (for accessing Notes database)
- Automation permission for Notes.app
- Read/write access to export directory

### 8.2 Data Handling
- No network requests except for downloading web-linked images
- No data stored outside specified export path
- Sensitive data remains local to device
- No analytics or telemetry collected

### 8.3 Privacy
- Export logs contain no note content
- Image filenames use sanitized note titles only
- No personal information in error messages

---

## 9. Future Enhancements

### Phase 2 (Version 1.1)
- Support for tables and drawings
- Export to Notion API directly
- Progress bar in Shortcuts
- Selective note export by date range

### Phase 3 (Version 1.2)
- Two-way sync capability
- Support for shared notes
- Export scheduling via cron
- Integration with cloud storage (iCloud Drive, Dropbox)

### Phase 4 (Version 2.0)
- GUI application wrapper
- Batch processing optimizations
- Support for encrypted notes
- Export templates and themes

---

## 10. Success Metrics

### 10.1 Functional Success
- ✓ 100% of text content preserved
- ✓ 95%+ of images successfully extracted
- ✓ All note metadata maintained
- ✓ MDX files render correctly in Next.js/Gatsby/Docusaurus
- ✓ All exported files use .mdx extension

### 10.2 Performance Success
- ✓ Export completes without user intervention
- ✓ No data loss during export
- ✓ Shortcut runs successfully on first attempt
- ✓ Export time scales linearly with note count
- ✓ Files organized within exporter subfolder

### 10.3 User Success
- ✓ Single-tap export from Shortcuts
- ✓ Clear error messages when issues occur
- ✓ Organized, portable output structure in exporter/output/
- ✓ No technical knowledge required for basic use
- ✓ Clean integration with existing project structure

---

## 11. Delivery Package

### 11.1 Deliverables (all within exporter/ subfolder)
1. `exporter/src/notes_exporter.py` - Main Python script
2. `exporter/src/applescript_bridge.py` - AppleScript interface
3. `exporter/src/image_processor.py` - Image extraction module
4. `exporter/src/mdx_converter.py` - MDX conversion module
5. `exporter/scripts/shortcuts_export.sh` - Bash wrapper
6. `exporter/scripts/install.sh` - Installation script
7. `exporter/requirements.txt` - Python dependencies
8. `exporter/config/default_config.json` - Default configuration
9. `exporter/Export_Notes.shortcut` - Pre-configured Shortcut
10. `exporter/README.md` - User documentation
11. `exporter/tests/test_exporter.py` - Automated tests

### 11.2 Documentation
- Installation guide with screenshots
- Troubleshooting guide for common issues
- MDX format compatibility notes
- Integration guide for existing projects
- FAQ document

### 11.3 Support
- GitHub repository for issue tracking
- Example MDX exports for reference
- Migration guide from other solutions
- Instructions for customizing MDX output
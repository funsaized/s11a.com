# Apple Notes MDX Exporter

Simple Python tool to export Apple Notes to MDX format with image extraction.

## Quick Start

```bash
# Run with default settings (exports all notes)
./run_export.sh

# Export specific folder
./run_export.sh --folder "Work Notes"

# Export to custom location
./run_export.sh --output ~/Documents/MyNotes
```

## Direct Python Usage

```bash
# Using the Python entry point
python3 export.py

# With options
python3 export.py --folder "Personal" --output ~/Desktop
```

## Project Structure

```
exporter/
├── export.py           # Main entry point
├── run_export.sh       # Shell wrapper with dependency checks
├── requirements.txt    # Python dependencies
├── config/            # Configuration reference (for future use)
│   └── default_config.json
├── src/               # Source code
│   ├── main.py        # Main exporter logic
│   ├── applescript_bridge.py  # Apple Notes interface
│   ├── image_processor.py     # Image extraction
│   └── mdx_converter.py       # MDX conversion
└── output/            # Export output directory (created on run)
```

## Dependencies

- Python 3.x
- beautifulsoup4
- markdownify
- Pillow

Dependencies are automatically installed when using `run_export.sh`.

## Features

- Export all notes or filter by folder
- Automatic image extraction and conversion
- MDX format with frontmatter metadata
- Preserves folder structure
- Handles special characters in filenames
- Simple command-line interface

## Output

Exports are saved to timestamped directories:
```
output/Notes_Export_YYYY-MM-DD_HHMMSS/
├── notes/          # MDX files organized by folder
├── attachments/    # Extracted images
└── export_summary.txt
```
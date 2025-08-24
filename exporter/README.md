# Apple Notes MDX Exporter

Simple Python tool to export Apple Notes to MDX format with image extraction and smart AI-powered frontmatter generation.

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
- **NEW: Smart AI-powered frontmatter generation using Anthropic's Claude**
  - Automatically generates slug, category, tags, and excerpt
  - Falls back to basic generation if API is unavailable
  - **Sequential processing with rate limiting** to prevent API errors
- **NEW: Automatic category-based organization**
  - Notes are organized into subfolders by their frontmatter category
  - Categories like "Food" become folders like "food/"
  - Empty original folders are automatically cleaned up
- Preserves folder structure
- Handles special characters in filenames
- Simple command-line interface

## Smart Frontmatter Generation

The exporter now includes intelligent frontmatter generation using Anthropic's Claude API (Haiku model). When enabled, it analyzes your note content and generates:

- **slug**: URL-friendly version of the title
- **category**: Appropriate category based on content (e.g., "Food", "Technology", "Personal")
- **tags**: 3-8 relevant tags extracted from the content
- **excerpt**: 1-2 sentence summary of the note
- **author**: "Sai Nimmagadda" (hardcoded)

### Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Configure your API key using a `.env` file:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key
# ANTHROPIC_API_KEY=your-api-key-here
```

Alternatively, you can set it as an environment variable:
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

3. Run the exporter as usual - smart frontmatter will be automatically enabled!

### Configuration Options

The `.env` file supports the following settings:

```bash
# Required for smart frontmatter
ANTHROPIC_API_KEY=your-api-key-here

# Optional: Customize the author name (default: "Sai Nimmagadda")
AUTHOR_NAME=Your Name

# Optional: Disable smart frontmatter (default: enabled)
USE_SMART_FRONTMATTER=false
```

### Example Frontmatter Output

```yaml
---
title: "Coffee Reviews"
slug: "coffee-reviews"
date: "2024-01-20"
category: "Food"
tags: ["coffee", "reviews", "beverages", "brewing", "colombian", "light-roast", "dark-roast", "espresso"]
excerpt: "Personal coffee tasting notes and reviews, featuring various roasters and brewing methods with grind settings."
author: "Sai Nimmagadda"
---
```

### Testing

Test the sequential processing with rate limiting:
```bash
python3 test_sequential.py
```

This will demonstrate the rate-limited processing that prevents 429 errors when using the Anthropic API. If no API key is set, the system will automatically fall back to basic frontmatter generation based on the note's title and folder.

### Category-based Organization

Test the automatic category organization:
```bash
python3 test_category_organization.py
```

This feature automatically organizes your exported notes into category subfolders based on the frontmatter `category` field. For example:
- Notes with `category: "Food"` → `notes/food/` folder
- Notes with `category: "Technology"` → `notes/technology/` folder  
- Notes with `category: "Health & Fitness"` → `notes/health-fitness/` folder

The organization happens automatically after all notes are processed and includes:
- **Category extraction** from frontmatter
- **Folder name normalization** (lowercase, special characters removed)
- **Duplicate handling** for filename conflicts
- **Empty folder cleanup** after reorganization

## Output

Exports are saved to timestamped directories:
```
output/Notes_Export_YYYY-MM-DD_HHMMSS/
├── notes/                    # MDX files organized by category
│   ├── food/                 # Notes with category: "Food"
│   │   ├── coffee-reviews.mdx
│   │   └── recipe-notes.mdx
│   ├── technology/           # Notes with category: "Technology"
│   │   ├── react-patterns.mdx
│   │   └── coding-tips.mdx
│   └── personal/             # Notes with category: "Personal"
│       └── journal-entry.mdx
├── attachments/              # Extracted images
└── export_summary.txt        # Export statistics
```
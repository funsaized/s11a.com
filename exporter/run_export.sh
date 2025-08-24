#!/bin/bash
# Simple runner script for Apple Notes Export
# No Shortcuts required - just run this script!

echo "🍎 Apple Notes MDX Exporter"
echo "=========================="
echo ""

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    echo "   Install from: https://www.python.org/downloads/"
    exit 1
fi

# Check dependencies
echo "📦 Checking dependencies..."
missing_deps=()

python3 -c "import bs4" 2>/dev/null || missing_deps+=("beautifulsoup4")
python3 -c "import markdownify" 2>/dev/null || missing_deps+=("markdownify")
python3 -c "import PIL" 2>/dev/null || missing_deps+=("Pillow")

if [ ${#missing_deps[@]} -gt 0 ]; then
    echo "⚠️  Missing dependencies: ${missing_deps[*]}"
    echo ""
    echo "Installing missing dependencies..."
    pip3 install --user beautifulsoup4 markdownify Pillow
    echo ""
fi

# Run the export
echo "🚀 Starting export..."
echo ""

# Pass all arguments to the Python script
python3 "$(dirname "$0")/export.py" "$@"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Export completed successfully!"
else
    echo ""
    echo "❌ Export failed. Check the errors above."
fi

exit $exit_code
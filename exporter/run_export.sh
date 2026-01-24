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

# Check and install dependencies from requirements.txt
echo "📦 Checking and installing Python dependencies..."
if [ -f "$(dirname "$0")/requirements.txt" ]; then
    pip3 install --user -r "$(dirname "$0")/requirements.txt"
else
    echo "⚠️ requirements.txt not found. Skipping Python dependency installation."
fi

# Check and install Node.js dependencies for the validator
echo "📦 Checking and installing Node.js dependencies..."
if [ -f "$(dirname "$0")/package.json" ]; then
    (cd "$(dirname "$0")" && npm install)
else
    echo "⚠️ package.json not found. Skipping Node.js dependency installation."
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
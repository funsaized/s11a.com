#!/bin/bash
# Apple Notes MDX Exporter Installation Script
#
# This script sets up the Apple Notes MDX Exporter within an existing project.
# It handles dependencies, permissions, and initial configuration.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script metadata
SCRIPT_VERSION="1.0.0"
INSTALLER_NAME="Apple Notes MDX Exporter Installer"

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
PARENT_PROJECT="$( cd "$PROJECT_ROOT/.." && pwd )"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════╗
║              Apple Notes MDX Exporter                   ║
║                    Installation                          ║
╚══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo "Version: $SCRIPT_VERSION"
    echo "Project Path: $PROJECT_ROOT"
    echo ""
}

# Check system requirements
check_system() {
    log_info "Checking system requirements..."
    
    # Check macOS
    if [[ "$(uname)" != "Darwin" ]]; then
        log_error "This installer requires macOS"
        exit 1
    fi
    
    # Check macOS version
    macos_version=$(sw_vers -productVersion)
    log_info "macOS version: $macos_version"
    
    # Check if running on supported macOS version (10.15+)
    if ! sw_vers -productVersion | grep -E "^1[1-9]\.|^[2-9][0-9]\.|^10\.1[5-9]" > /dev/null; then
        log_warning "macOS 10.15 (Catalina) or later is recommended"
    fi
    
    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        log_info "Install Python 3 from https://python.org or using Homebrew: brew install python"
        exit 1
    fi
    
    # Check Python version
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    log_info "Python version: $python_version"
    
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
        log_error "Python 3.8 or later is required, found $python_version"
        exit 1
    fi
    
    # Check pip
    if ! python3 -m pip --version &> /dev/null; then
        log_error "pip is required but not available"
        log_info "Install pip: python3 -m ensurepip --upgrade"
        exit 1
    fi
    
    # Check Notes app
    if [[ ! -d "/Applications/Notes.app" ]]; then
        log_error "Apple Notes app not found"
        exit 1
    fi
    
    log_success "System requirements check passed"
}

# Create project structure
create_structure() {
    log_info "Creating project structure..."
    
    # Create directories
    mkdir -p "$PROJECT_ROOT"/{src,scripts,config,tests,output}
    
    # Create .gitkeep files
    touch "$PROJECT_ROOT/output/.gitkeep"
    
    # Make scripts executable
    chmod +x "$PROJECT_ROOT/scripts"/*.sh 2>/dev/null || true
    
    log_success "Project structure created"
}

# Install Python dependencies
install_dependencies() {
    log_info "Installing Python dependencies..."
    
    if [[ ! -f "$PROJECT_ROOT/requirements.txt" ]]; then
        log_error "requirements.txt not found"
        exit 1
    fi
    
    # Check if we should use --user flag
    local pip_args=()
    if [[ ! -w $(python3 -c "import site; print(site.getsitepackages()[0])") ]]; then
        log_info "Installing to user directory (system packages not writable)"
        pip_args+=("--user")
    fi
    
    # Install dependencies
    if python3 -m pip install "${pip_args[@]}" -r "$PROJECT_ROOT/requirements.txt"; then
        log_success "Python dependencies installed"
    else
        log_error "Failed to install Python dependencies"
        log_info "Try: python3 -m pip install --user -r $PROJECT_ROOT/requirements.txt"
        exit 1
    fi
}

# Test installation
test_installation() {
    log_info "Testing installation..."
    
    # Test Python imports
    local test_script="
import sys
sys.path.insert(0, '$PROJECT_ROOT')

try:
    from src.applescript_bridge import AppleScriptBridge
    from src.image_processor import ImageProcessor  
    from src.mdx_converter import MDXConverter
    from src.notes_exporter import NotesExporter
    print('SUCCESS: All modules imported successfully')
except ImportError as e:
    print(f'ERROR: Import failed - {e}')
    sys.exit(1)
"
    
    if python3 -c "$test_script"; then
        log_success "Python modules test passed"
    else
        log_error "Python modules test failed"
        return 1
    fi
    
    # Test AppleScript access (basic test)
    if osascript -e 'tell application "Notes" to return "test"' &>/dev/null; then
        log_success "AppleScript access test passed"
    else
        log_warning "AppleScript access test failed - may need permissions setup"
        return 1
    fi
    
    return 0
}

# Setup permissions
setup_permissions() {
    log_info "Setting up permissions..."
    
    cat << EOF

${YELLOW}IMPORTANT: Manual Permission Setup Required${NC}

To use the Apple Notes MDX Exporter, you need to grant the following permissions:

1. ${BLUE}Automation Permissions:${NC}
   • Open System Preferences → Security & Privacy → Privacy → Automation
   • Find 'Terminal' or your terminal app in the list
   • Enable access to 'Notes'

2. ${BLUE}Full Disk Access (if needed):${NC}
   • Open System Preferences → Security & Privacy → Privacy → Full Disk Access
   • Add Terminal or your terminal app if AppleScript access fails

3. ${BLUE}Script Permissions:${NC}
   • When running for the first time, macOS may ask for permissions
   • Click 'Allow' when prompted

${YELLOW}Test permissions after setup by running:${NC}
cd $PROJECT_ROOT && ./scripts/shortcuts_export.sh --help

EOF
    
    read -p "Press Enter after setting up permissions..." -r
}

# Configure Shortcuts integration
setup_shortcuts() {
    log_info "Setting up Apple Shortcuts integration..."
    
    local shortcut_path="$PROJECT_ROOT/Export_Notes.shortcut"
    
    # Create shortcut configuration (this would be a .shortcut file in real implementation)
    cat > "$shortcut_path" << 'EOF'
# Apple Shortcut Configuration
# Import this into Shortcuts app and update the script path

Shortcut Name: "Export Notes to MDX"

Actions:
1. Text Input (Ask for Folder Name)
2. Run Shell Script: 
   Script: [UPDATE THIS PATH]/exporter/scripts/shortcuts_export.sh
   Input: Text from step 1
3. Get Dictionary from Input
4. Show Notification: "Export completed: X notes exported"
EOF
    
    cat << EOF

${BLUE}Apple Shortcuts Setup:${NC}

1. ${YELLOW}Manual Setup Required:${NC}
   • Open the Shortcuts app
   • Create a new shortcut named "Export Notes to MDX"
   • Add action: "Run Shell Script"
   • Set script path to: ${PROJECT_ROOT}/scripts/shortcuts_export.sh
   • Configure input/output handling

2. ${YELLOW}Script Path for Shortcuts:${NC}
   ${PROJECT_ROOT}/scripts/shortcuts_export.sh

3. ${YELLOW}Example Shortcut Actions:${NC}
   • Text Input (optional folder name)
   • Run Shell Script (with the path above)
   • Show Result/Notification

A template configuration has been saved to:
${shortcut_path}

EOF
}

# Generate documentation
generate_docs() {
    log_info "Generating documentation..."
    
    cat > "$PROJECT_ROOT/README.md" << EOF
# Apple Notes MDX Exporter

A Python-based solution for extracting Apple Notes (including embedded images) to MDX format, with Apple Shortcuts integration.

## Features

- Extract notes from Apple Notes app to MDX format
- Process embedded images (base64 extraction, HEIC conversion)
- Organize exports with proper folder structure
- Apple Shortcuts integration for one-tap export
- Comprehensive error handling and logging
- Configurable export options

## Installation

The exporter has been installed to this project. To complete setup:

1. **Install Python dependencies** (already done):
   \`\`\`bash
   pip3 install -r requirements.txt
   \`\`\`

2. **Set up permissions**:
   - System Preferences → Security & Privacy → Privacy → Automation
   - Enable Terminal access to Notes

3. **Test the installation**:
   \`\`\`bash
   cd exporter
   ./scripts/shortcuts_export.sh --help
   \`\`\`

## Usage

### Command Line

\`\`\`bash
# Export all notes
./scripts/shortcuts_export.sh

# Export specific folder
./scripts/shortcuts_export.sh "Work Notes"

# Export to custom location
./scripts/shortcuts_export.sh "" "/path/to/export"

# Incremental export
./scripts/shortcuts_export.sh --incremental
\`\`\`

### Apple Shortcuts

1. Open Shortcuts app
2. Create new shortcut
3. Add "Run Shell Script" action
4. Set script path: \`$(pwd)/scripts/shortcuts_export.sh\`
5. Configure input/output as needed

## Configuration

Edit \`config/default_config.json\` to customize:

- Export paths and formats
- Image processing options
- Markdown conversion settings
- Error handling behavior

## Project Structure

\`\`\`
exporter/
├── src/                    # Python modules
│   ├── notes_exporter.py   # Main orchestrator
│   ├── applescript_bridge.py
│   ├── image_processor.py
│   └── mdx_converter.py
├── scripts/                # Shell scripts
│   ├── shortcuts_export.sh # Shortcuts integration
│   └── install.sh          # This installer
├── config/                 # Configuration files
├── tests/                  # Test suite
├── output/                 # Export destination
└── requirements.txt        # Python dependencies
\`\`\`

## Output Format

Exported notes are organized as:

\`\`\`
Notes_Export_YYYY-MM-DD_HHMMSS/
├── notes/
│   ├── folder1/
│   │   └── note-title.mdx
│   └── folder2/
│       └── another-note.mdx
├── attachments/
│   ├── note-title-001.jpg
│   └── another-note-001.png
└── export_log.json
\`\`\`

## Troubleshooting

### Permission Issues
- Ensure automation permissions are granted
- Try running with \`sudo\` if needed
- Check Console.app for detailed error messages

### Python Issues
- Verify Python 3.8+ is installed
- Check all dependencies are installed
- Run with \`--verbose\` flag for detailed logging

### Export Issues
- Check export_log.json for detailed information
- Verify Notes app is not running during export
- Ensure sufficient disk space

## Support

For issues and feature requests, check the project documentation or create an issue in the project repository.

---

Generated by Apple Notes MDX Exporter v$SCRIPT_VERSION
Installation completed: $(date)
EOF
    
    log_success "Documentation generated at $PROJECT_ROOT/README.md"
}

# Main installation flow
main() {
    print_banner
    
    log_info "Starting installation in: $PROJECT_ROOT"
    
    # Run installation steps
    check_system
    create_structure
    install_dependencies
    
    # Test installation
    if test_installation; then
        log_success "Installation test passed"
    else
        log_warning "Installation test had issues - manual setup may be required"
    fi
    
    # Setup additional components
    setup_permissions
    setup_shortcuts
    generate_docs
    
    # Final summary
    echo ""
    log_success "Installation completed successfully!"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Set up automation permissions in System Preferences"
    echo "2. Test the installation: cd $PROJECT_ROOT && ./scripts/shortcuts_export.sh --help"
    echo "3. Create Apple Shortcut with script path: $PROJECT_ROOT/scripts/shortcuts_export.sh"
    echo "4. Read the documentation: $PROJECT_ROOT/README.md"
    echo ""
    echo -e "${BLUE}Project installed at:${NC} $PROJECT_ROOT"
    echo -e "${BLUE}Script path for Shortcuts:${NC} $PROJECT_ROOT/scripts/shortcuts_export.sh"
    echo ""
}

# Run main installation
main "$@"
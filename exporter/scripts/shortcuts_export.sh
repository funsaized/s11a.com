#!/bin/bash
# Apple Notes MDX Exporter - Shortcuts Integration Script
# 
# This script provides the interface between Apple Shortcuts and the Python exporter.
# It handles environment setup, parameter parsing, and error handling.

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Script metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_NAME="Apple Notes MDX Exporter"

# Get the script's directory (exporter/scripts)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Logging function
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
}

# Error handling
error_exit() {
    local error_code="${2:-1}"
    log "ERROR" "$1"
    
    # Return JSON error for Shortcuts compatibility
    cat << EOF
{
    "success": false,
    "error": "$1",
    "error_code": $error_code,
    "message": "Export failed - check logs for details",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    exit $error_code
}

# Success handler
success_exit() {
    local message="$1"
    local result_file="$2"
    
    if [[ -f "$result_file" ]]; then
        cat "$result_file"
    else
        cat << EOF
{
    "success": true,
    "message": "$message",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    fi
    exit 0
}

# Environment setup
setup_environment() {
    log "INFO" "Setting up environment for $SCRIPT_NAME v$SCRIPT_VERSION"
    
    # Set Python path
    export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH:-}"
    
    # Ensure we can find Python 3
    if ! command -v python3 &> /dev/null; then
        error_exit "Python 3 is not installed or not in PATH" 2
    fi
    
    # Check Python version (require 3.8+)
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    required_version="3.8"
    
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
        error_exit "Python $python_version found, but $required_version+ is required" 3
    fi
    
    log "INFO" "Using Python $python_version"
    
    # Check if required packages are installed
    check_dependencies
    
    # Change to project root
    cd "$PROJECT_ROOT" || error_exit "Cannot change to project root: $PROJECT_ROOT" 4
}

# Check Python dependencies
check_dependencies() {
    log "INFO" "Checking Python dependencies"
    
    local missing_deps=()
    
    # Check each required package
    while IFS= read -r package; do
        if [[ -n "$package" && ! "$package" =~ ^# ]]; then
            package_name=$(echo "$package" | cut -d'=' -f1)
            if ! python3 -c "import $package_name" 2>/dev/null; then
                missing_deps+=("$package")
            fi
        fi
    done < "$PROJECT_ROOT/requirements.txt"
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log "ERROR" "Missing dependencies: ${missing_deps[*]}"
        log "INFO" "Run: pip3 install -r $PROJECT_ROOT/requirements.txt"
        error_exit "Missing Python dependencies" 5
    fi
    
    log "INFO" "All dependencies are available"
}

# Parse command line arguments
parse_arguments() {
    # Default values
    FOLDER_FILTER=""
    EXPORT_PATH=""
    INCREMENTAL="false"
    CONFIG_FILE=""
    VERBOSE="false"
    
    # Parse arguments from Shortcuts (positional)
    if [[ $# -ge 1 ]]; then
        FOLDER_FILTER="$1"
    fi
    
    if [[ $# -ge 2 ]]; then
        EXPORT_PATH="$2"
    fi
    
    if [[ $# -ge 3 ]]; then
        INCREMENTAL="$3"
    fi
    
    # Parse named arguments (for advanced usage)
    while [[ $# -gt 0 ]]; do
        case $1 in
            --folder)
                FOLDER_FILTER="$2"
                shift 2
                ;;
            --export-path)
                EXPORT_PATH="$2"
                shift 2
                ;;
            --incremental)
                INCREMENTAL="true"
                shift
                ;;
            --config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --verbose)
                VERBOSE="true"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                # Skip unknown arguments (for Shortcuts compatibility)
                shift
                ;;
        esac
    done
    
    # Set defaults
    if [[ -z "$EXPORT_PATH" ]]; then
        EXPORT_PATH="$PROJECT_ROOT/output"
    fi
    
    log "INFO" "Parsed arguments: folder='$FOLDER_FILTER', path='$EXPORT_PATH', incremental='$INCREMENTAL'"
}

# Show help information
show_help() {
    cat << EOF
$SCRIPT_NAME v$SCRIPT_VERSION

USAGE:
    $0 [folder] [export_path] [incremental]
    $0 --folder FOLDER --export-path PATH [--incremental] [--verbose]

ARGUMENTS:
    folder          Optional folder name to filter notes (empty for all)
    export_path     Directory for export output (default: ./output)
    incremental     Set to 'true' for incremental export

OPTIONS:
    --folder FOLDER     Filter by specific Notes folder
    --export-path PATH  Custom export directory
    --incremental       Enable incremental export mode
    --config FILE       Use custom configuration file
    --verbose           Enable verbose logging
    --help             Show this help message

EXAMPLES:
    # Export all notes
    $0

    # Export from specific folder
    $0 "Work Notes"

    # Export to custom location
    $0 "" "/Users/username/Documents/Notes_Export"

    # Incremental export with verbose logging
    $0 --incremental --verbose

EOF
}

# Create temporary configuration
create_temp_config() {
    local temp_config
    temp_config=$(mktemp /tmp/notes_export_config.XXXXXX.json)
    
    # Build configuration JSON
    cat > "$temp_config" << EOF
{
    "export_path": "$EXPORT_PATH",
    "output_format": "mdx",
    "folder_filter": $(if [[ -n "$FOLDER_FILTER" ]]; then echo "\"$FOLDER_FILTER\""; else echo "null"; fi),
    "incremental_export": $INCREMENTAL,
    "image_format": "jpg",
    "image_quality": 95,
    "markdown_extensions": ["tables", "strikethrough", "task_lists"],
    "include_empty_notes": false,
    "date_format": "%Y-%m-%d",
    "max_filename_length": 50,
    "tags_in_frontmatter": true,
    "mdx_components": false,
    "verbose_logging": $VERBOSE
}
EOF
    
    echo "$temp_config"
}

# Run the Python exporter
run_exporter() {
    local temp_config
    temp_config=$(create_temp_config)
    local temp_result
    temp_result=$(mktemp /tmp/notes_export_result.XXXXXX.json)
    
    log "INFO" "Starting Notes export with configuration: $temp_config"
    
    # Set up logging for Python script
    local python_args=("$PROJECT_ROOT/src/notes_exporter.py" "$temp_config")
    
    if [[ "$VERBOSE" == "true" ]]; then
        python_args+=("--verbose")
    fi
    
    # Run Python script and capture output
    if python3 "${python_args[@]}" > "$temp_result" 2>&1; then
        log "INFO" "Python export completed successfully"
        success_exit "Export completed" "$temp_result"
    else
        local exit_code=$?
        log "ERROR" "Python export failed with exit code: $exit_code"
        
        # Try to parse error from result file
        if [[ -f "$temp_result" ]]; then
            local error_msg
            error_msg=$(cat "$temp_result" 2>/dev/null || echo "Unknown error")
            error_exit "Python export failed: $error_msg" $exit_code
        else
            error_exit "Python export failed with no output" $exit_code
        fi
    fi
    
    # Cleanup (though we exit before this)
    rm -f "$temp_config" "$temp_result" 2>/dev/null || true
}

# Cleanup function
cleanup() {
    local exit_code=$?
    
    # Remove any temporary files
    rm -f /tmp/notes_export_config.*.json 2>/dev/null || true
    rm -f /tmp/notes_export_result.*.json 2>/dev/null || true
    
    if [[ $exit_code -ne 0 ]]; then
        log "ERROR" "Script exited with code: $exit_code"
    fi
}

# Validate system requirements
validate_system() {
    log "INFO" "Validating system requirements"
    
    # Check macOS version (Notes app required)
    if [[ "$(uname)" != "Darwin" ]]; then
        error_exit "This script requires macOS to access Apple Notes" 10
    fi
    
    # Check if Notes app is installed
    if [[ ! -d "/Applications/Notes.app" ]]; then
        error_exit "Apple Notes app not found" 11
    fi
    
    # Check automation permissions (basic check)
    if ! osascript -e 'tell application "Notes" to return "test"' &>/dev/null; then
        log "WARN" "Notes app may not be accessible - check automation permissions"
        log "INFO" "Go to System Preferences > Security & Privacy > Privacy > Automation"
    fi
    
    log "INFO" "System validation completed"
}

# Main execution
main() {
    # Set up signal handlers
    trap cleanup EXIT
    trap 'error_exit "Script interrupted by signal" 130' INT TERM
    
    log "INFO" "Starting $SCRIPT_NAME v$SCRIPT_VERSION"
    
    # Parse arguments first (in case --help is specified)
    parse_arguments "$@"
    
    # Validate system
    validate_system
    
    # Setup environment
    setup_environment
    
    # Run the export
    run_exporter
}

# Execute main function with all arguments
main "$@"
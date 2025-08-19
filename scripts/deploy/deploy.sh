#!/bin/bash

# Deployment script for s11a.com
# This script performs pre-deployment checks and builds the site

set -e  # Exit on any error

echo "🚀 Starting deployment process for s11a.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

print_status "Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run TypeScript checks
print_status "Running TypeScript checks..."
if npm run typecheck; then
    print_success "TypeScript checks passed"
else
    print_error "TypeScript checks failed"
    exit 1
fi

# Clean previous build
print_status "Cleaning previous build..."
npm run clean

# Build the site
print_status "Building the site..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check build output
if [ ! -d "public" ]; then
    print_error "Build directory 'public' not found"
    exit 1
fi

# Count generated files
FILE_COUNT=$(find public -type f | wc -l)
print_status "Generated $FILE_COUNT files in public directory"

# Check for critical files
CRITICAL_FILES=("public/index.html" "public/404.html" "public/articles/index.html" "public/about/index.html")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_warning "⚠ $file is missing"
    fi
done

# Generate build report
print_status "Generating build report..."
BUILD_SIZE=$(du -sh public | cut -f1)
print_status "Total build size: $BUILD_SIZE"

# Check for large files (> 1MB)
print_status "Checking for large files..."
find public -type f -size +1M -exec ls -lh {} \; | awk '{print $9 ": " $5}' || print_status "No files larger than 1MB found"

# Security check - ensure no sensitive files are included
print_status "Running security checks..."
SENSITIVE_PATTERNS=("*.env" "*.key" "*.pem" "*secret*" "*password*")
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if find public -name "$pattern" -type f | grep -q .; then
        print_error "Found sensitive files matching pattern: $pattern"
        find public -name "$pattern" -type f
        exit 1
    fi
done
print_success "No sensitive files found in build output"

# Optional: Run performance tests if lighthouse is available
if command -v lighthouse &> /dev/null; then
    print_status "Lighthouse is available. Consider running 'npm run lighthouse:ci' for performance testing."
else
    print_warning "Lighthouse not available. Install it globally for performance testing: npm install -g lighthouse"
fi

print_success "🎉 Deployment preparation completed successfully!"
print_status "The site is ready to deploy from the 'public' directory"

# Instructions for manual deployment
echo ""
echo "Next steps:"
echo "1. The site has been built in the 'public' directory"
echo "2. For Netlify: Push to your connected Git repository"
echo "3. For manual deployment: Upload the contents of 'public' to your server"
echo "4. For Netlify CLI: Run 'netlify deploy --prod --dir=public'"
echo ""
print_status "Build completed at $(date)"
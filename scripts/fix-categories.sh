#!/bin/bash

# Quick script to fix remaining "test3" categories
# Run this to bulk update remaining placeholder categories

echo "🔧 Fixing placeholder categories in content files..."

# Replace test3 with appropriate categories based on content type
find content/ -name "index.md" -exec grep -l 'category: "test3"' {} \; | while read file; do
    echo "Processing: $file"
    
    # Check content to determine appropriate category
    if grep -qi "spring\|java\|batch" "$file"; then
        sed -i.bak 's/category: "test3"/category: "Development"/' "$file"
        echo "  → Set to Development (Java/Spring)"
    elif grep -qi "aws\|lambda\|cloud\|azure" "$file"; then
        sed -i.bak 's/category: "test3"/category: "Cloud"/' "$file"
        echo "  → Set to Cloud (AWS/Azure)"
    elif grep -qi "css\|javascript\|react\|vue" "$file"; then
        sed -i.bak 's/category: "test3"/category: "Frontend"/' "$file"
        echo "  → Set to Frontend (UI/JS)"
    elif grep -qi "docker\|kubernetes\|openshift" "$file"; then
        sed -i.bak 's/category: "test3"/category: "DevOps"/' "$file"
        echo "  → Set to DevOps (Containers)"
    elif grep -qi "postman\|api\|testing" "$file"; then
        sed -i.bak 's/category: "test3"/category: "Testing"/' "$file"
        echo "  → Set to Testing (API/Tools)"
    else
        sed -i.bak 's/category: "test3"/category: "Development"/' "$file"
        echo "  → Set to Development (default)"
    fi
    
    # Clean up backup files
    rm -f "${file}.bak"
done

echo "✅ Category fixing complete! Run 'npm run audit:content' to see improvements."
#!/usr/bin/env python3
"""
Filename Utilities for Apple Notes MDX Exporter

Provides consistent kebab-case filename generation for both markdown files and images.
Ensures URLs and links work correctly without space-related issues.
"""

import re
import unicodedata
from typing import Optional


def to_kebab_case(text: str, max_length: int = 50) -> str:
    """
    Convert text to kebab-case for filesystem-safe filenames.
    
    Args:
        text: Input text to convert
        max_length: Maximum length of resulting filename
        
    Returns:
        Kebab-case string safe for filenames and URLs
        
    Examples:
        "My Amazing Note!" -> "my-amazing-note"
        "Coffee & Tea Reviews" -> "coffee-tea-reviews"  
        "React.js Tips 2024" -> "reactjs-tips-2024"
    """
    if not text or not text.strip():
        return "untitled"
    
    # Normalize unicode characters (convert accented chars to base chars)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace common separators and punctuation with hyphens
    # This handles: spaces, underscores, dots, slashes, colons, semicolons, etc.
    text = re.sub(r'[_\s\./\\:;,&+()[\]{}!@#$%^*=|"\'`~<>?]+', '-', text)
    
    # Remove any remaining non-alphanumeric characters except hyphens
    text = re.sub(r'[^a-z0-9-]+', '', text)
    
    # Remove multiple consecutive hyphens
    text = re.sub(r'-{2,}', '-', text)
    
    # Remove leading and trailing hyphens
    text = text.strip('-')
    
    # Ensure we have something left
    if not text:
        text = "untitled"
    
    # Truncate to max length while preserving word boundaries when possible
    if len(text) > max_length:
        # Try to cut at a hyphen near the end
        truncated = text[:max_length]
        last_hyphen = truncated.rfind('-')
        
        # If we find a hyphen in the last third, cut there
        if last_hyphen > max_length * 2 // 3:
            text = truncated[:last_hyphen]
        else:
            text = truncated
        
        # Ensure we don't end with a hyphen after truncation
        text = text.rstrip('-')
    
    return text


def generate_markdown_filename(title: str, max_length: int = 50) -> str:
    """
    Generate a kebab-case filename for markdown files.
    
    Args:
        title: Note title
        max_length: Maximum filename length (excluding extension)
        
    Returns:
        Kebab-case filename with .mdx extension
    """
    base_name = to_kebab_case(title, max_length)
    return f"{base_name}.mdx"


def generate_image_filename(note_name: str, index: int, extension: str, max_length: int = 50) -> str:
    """
    Generate a kebab-case filename for image files.
    
    Args:
        note_name: Original note name
        index: Image index in note
        extension: File extension (without dot)
        max_length: Maximum base filename length
        
    Returns:
        Kebab-case image filename
    """
    # Reserve space for index and extension
    index_part = f"-{index:03d}"
    extension_part = f".{extension}"
    available_length = max_length - len(index_part) - len(extension_part)
    
    # Ensure we have at least some space for the name
    if available_length < 5:
        available_length = 5
        max_length = available_length + len(index_part) + len(extension_part)
    
    base_name = to_kebab_case(note_name, available_length)
    return f"{base_name}{index_part}{extension_part}"


def validate_filename(filename: str) -> bool:
    """
    Validate that a filename follows kebab-case conventions.
    
    Args:
        filename: Filename to validate (with or without extension)
        
    Returns:
        True if filename follows kebab-case conventions
    """
    # Split off extension if present
    if '.' in filename:
        name_part = filename.rsplit('.', 1)[0]
    else:
        name_part = filename
    
    # Check if it matches kebab-case pattern
    kebab_pattern = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
    return bool(re.match(kebab_pattern, name_part))


# For backward compatibility
def sanitize_filename(filename: str, max_length: int = 50) -> str:
    """
    Legacy function - use to_kebab_case() instead.
    Provided for backward compatibility.
    """
    return to_kebab_case(filename, max_length)
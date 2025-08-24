#!/usr/bin/env python3
"""
MDX Converter for Apple Notes MDX Exporter

This module handles conversion of HTML content to MDX format with proper frontmatter.
It ensures compatibility with Gatsby and other MDX-based static site generators.
"""

import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

try:
    import markdownify
except ImportError:
    raise ImportError("markdownify is required. Install with: pip install markdownify")

try:
    from bs4 import BeautifulSoup
except ImportError:
    raise ImportError("BeautifulSoup4 is required. Install with: pip install beautifulsoup4")

from frontmatter_generator import SmartFrontmatterGenerator

logger = logging.getLogger(__name__)


class MDXConverter:
    """Converts HTML content to MDX format with frontmatter."""
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize the MDX converter.
        
        Args:
            config: Configuration dictionary with conversion options
        """
        self.config = config or {}
        
        # Configuration options
        self.markdown_extensions = self.config.get("markdown_extensions", [
            "tables", "strikethrough", "task_lists"
        ])
        self.mdx_components = self.config.get("mdx_components", False)
        self.tags_in_frontmatter = self.config.get("tags_in_frontmatter", True)
        self.date_format = self.config.get("date_format", "%Y-%m-%d")
        self.use_smart_frontmatter = self.config.get("use_smart_frontmatter", True)
        
        # Initialize smart frontmatter generator
        if self.use_smart_frontmatter:
            self.frontmatter_generator = SmartFrontmatterGenerator()
        else:
            self.frontmatter_generator = None
        
        # Configure markdownify
        # Note: In markdownify 1.2.0+, use either 'strip' or 'convert', not both
        self.markdownify_options = {
            'heading_style': 'ATX',  # Use # for headings
            'bullets': '-',  # Use - for unordered lists
            'strong_em_symbol': '**',  # Use ** for bold
            'strip': ['script', 'style'],  # Remove script and style tags
            # Tags to strip are automatically excluded from conversion
        }
        
        logger.info("MDXConverter initialized")
    
    def convert(self, html_content: str, metadata: Dict) -> str:
        """
        Convert HTML content to MDX with frontmatter.
        
        Args:
            html_content: HTML content from Apple Notes
            metadata: Note metadata dictionary
            
        Returns:
            MDX content with frontmatter
        """
        try:
            # Clean and convert HTML to Markdown first
            markdown_content = self._convert_html_to_markdown(html_content)
            
            # Post-process markdown for MDX compatibility
            mdx_content = self._post_process_markdown(markdown_content)
            
            # Generate frontmatter (smart or basic)
            frontmatter = self._generate_frontmatter(metadata, mdx_content)
            
            # Combine frontmatter and content
            full_content = frontmatter + mdx_content
            
            logger.debug(f"Converted note '{metadata.get('title', 'Unknown')}' to MDX")
            return full_content
            
        except Exception as e:
            logger.error(f"Error converting to MDX: {e}")
            # Return basic fallback content
            return self._generate_fallback_content(html_content, metadata)
    
    def _generate_frontmatter(self, metadata: Dict, content: str) -> str:
        """Generate YAML frontmatter for the MDX file."""
        # Use smart frontmatter generation if available
        if self.frontmatter_generator and self.use_smart_frontmatter:
            try:
                # Generate smart frontmatter
                frontmatter_dict = self.frontmatter_generator.generate_frontmatter(
                    content=content,
                    existing_metadata=metadata,
                    fallback_only=False
                )
                
                # Convert to YAML format
                return self._dict_to_yaml_frontmatter(frontmatter_dict)
                
            except Exception as e:
                logger.warning(f"Smart frontmatter generation failed: {e}. Using basic frontmatter.")
                # Fall through to basic generation
        
        # Basic frontmatter generation (fallback)
        title = metadata.get('title', 'Untitled Note')
        created = metadata.get('created', '')
        modified = metadata.get('modified', '')
        folder = metadata.get('folder', 'Notes')
        
        # Format dates
        created_date = self._format_date(created)
        modified_date = self._format_date(modified)
        
        # Escape title for YAML
        safe_title = self._escape_yaml_string(title)
        safe_folder = self._escape_yaml_string(folder)
        
        # Build frontmatter
        frontmatter_lines = [
            "---",
            f"title: {safe_title}",
            f"date: {created_date}",
            f"modified: {modified_date}",
            f"folder: {safe_folder}",
            f"type: note",
            f"source: apple-notes"
        ]
        
        # Add tags if enabled and folder is meaningful
        if self.tags_in_frontmatter and folder and folder != "Notes":
            frontmatter_lines.append(f"tags: [\"{safe_folder.strip('\"')}\"]")
        
        # Add custom fields from config
        custom_fields = self.config.get("custom_frontmatter", {})
        for key, value in custom_fields.items():
            frontmatter_lines.append(f"{key}: {value}")
        
        frontmatter_lines.extend(["---", ""])
        
        return "\n".join(frontmatter_lines)
    
    def _dict_to_yaml_frontmatter(self, frontmatter_dict: Dict[str, Any]) -> str:
        """
        Convert a dictionary to YAML frontmatter format.
        
        Args:
            frontmatter_dict: Dictionary containing frontmatter fields
            
        Returns:
            YAML frontmatter string
        """
        lines = ["---"]
        
        # Define the order of fields for better readability
        field_order = ["title", "slug", "date", "category", "tags", "excerpt", "author", "modified", "folder", "type", "source"]
        
        # Add fields in order
        for field in field_order:
            if field in frontmatter_dict:
                value = frontmatter_dict[field]
                
                if field == "tags" and isinstance(value, list):
                    # Format tags as YAML array
                    if value:
                        tags_str = ", ".join([f'"{tag}"' for tag in value])
                        lines.append(f"tags: [{tags_str}]")
                    else:
                        lines.append("tags: []")
                elif isinstance(value, str):
                    # Escape string values if needed
                    safe_value = self._escape_yaml_string(value)
                    lines.append(f"{field}: {safe_value}")
                else:
                    lines.append(f"{field}: {value}")
        
        # Add any remaining fields not in the order list
        for field, value in frontmatter_dict.items():
            if field not in field_order:
                if isinstance(value, str):
                    safe_value = self._escape_yaml_string(value)
                    lines.append(f"{field}: {safe_value}")
                else:
                    lines.append(f"{field}: {value}")
        
        lines.extend(["---", ""])
        
        return "\n".join(lines)
    
    def _convert_html_to_markdown(self, html_content: str) -> str:
        """Convert HTML content to Markdown."""
        if not html_content or html_content.strip() == "":
            return ""
        
        try:
            # Pre-process HTML to handle Apple Notes specific elements
            processed_html = self._preprocess_html(html_content)
            
            # Convert to Markdown using markdownify
            markdown = markdownify.markdownify(
                processed_html,
                **self.markdownify_options
            )
            
            # Log image conversion for debugging
            image_count = markdown.count('![')
            if image_count > 0:
                logger.debug(f"Converted {image_count} images to markdown format")
            
            return markdown.strip()
            
        except Exception as e:
            logger.error(f"Error in HTML to Markdown conversion: {e}")
            # Fallback: return cleaned HTML
            return self._clean_html_fallback(html_content)
    
    def _preprocess_html(self, html_content: str) -> str:
        """Preprocess HTML to handle Apple Notes specific elements."""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Ensure image tags have proper alt attributes for better markdown conversion
            for img in soup.find_all('img'):
                if not img.get('alt'):
                    # Use filename as alt text if no alt attribute
                    src = img.get('src', '')
                    if '/images/articles/' in src:
                        filename = src.split('/')[-1]
                        # Remove extension and clean up filename for alt text
                        alt_text = filename.rsplit('.', 1)[0].replace('-', ' ').title()
                        img['alt'] = alt_text
                    else:
                        img['alt'] = 'Image'
            
            # Handle Apple Notes checklists
            self._convert_checklists(soup)
            
            # Handle line breaks in paragraphs
            self._normalize_line_breaks(soup)
            
            # Clean up empty elements
            self._remove_empty_elements(soup)
            
            # Handle Apple Notes specific styling
            self._clean_apple_notes_styling(soup)
            
            return str(soup)
            
        except Exception as e:
            logger.warning(f"Error preprocessing HTML: {e}")
            return html_content
    
    def _convert_checklists(self, soup: BeautifulSoup) -> None:
        """Convert Apple Notes checklists to Markdown task lists."""
        # Look for checkbox patterns in Apple Notes
        # Apple Notes often uses specific div structures for checkboxes
        checkbox_pattern = re.compile(r'☐|☑|✓|✗|□|■', re.UNICODE)
        
        for element in soup.find_all(text=checkbox_pattern):
            parent = element.parent
            if parent and parent.name in ['p', 'div', 'li']:
                # Convert to Markdown task list format
                text = str(element)
                if '☑' in text or '✓' in text or '■' in text:
                    # Checked item
                    new_text = re.sub(r'[☑✓■]\s*', '- [x] ', text)
                else:
                    # Unchecked item
                    new_text = re.sub(r'[☐□]\s*', '- [ ] ', text)
                
                element.replace_with(new_text)
    
    def _normalize_line_breaks(self, soup: BeautifulSoup) -> None:
        """Normalize line breaks in HTML content."""
        # Replace <br> tags with actual line breaks where appropriate
        for br in soup.find_all('br'):
            br.replace_with('\n')
        
        # Handle <div> tags used for line breaks in Apple Notes
        for div in soup.find_all('div'):
            if not div.get_text().strip():
                div.replace_with('\n')
    
    def _remove_empty_elements(self, soup: BeautifulSoup) -> None:
        """Remove empty HTML elements."""
        for element in soup.find_all():
            if (not element.get_text().strip() and 
                not element.find('img') and 
                element.name not in ['br', 'hr', 'img']):
                element.decompose()
    
    def _clean_apple_notes_styling(self, soup: BeautifulSoup) -> None:
        """Clean Apple Notes specific styling attributes."""
        # Remove Apple Notes specific attributes
        for element in soup.find_all():
            # Remove style attributes that don't translate well
            if element.get('style'):
                del element['style']
            
            # Remove Apple Notes specific classes
            if element.get('class'):
                classes = element.get('class')
                cleaned_classes = [c for c in classes if not c.startswith('Apple-')]
                if cleaned_classes:
                    element['class'] = cleaned_classes
                else:
                    del element['class']
    
    def _post_process_markdown(self, markdown_content: str) -> str:
        """Post-process Markdown content for MDX compatibility."""
        if not markdown_content:
            return ""
        
        # Fix excessive line breaks
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        
        # Ensure proper markdown image syntax for article images
        # Look for HTML img tags that weren't converted to markdown and convert them
        img_pattern = re.compile(
            r'<img[^>]*src=["\']?(\/images\/articles\/[^"\'>\s]+)["\']?[^>]*(?:\/?>|>[^<]*<\/img>)',
            re.IGNORECASE
        )
        
        def convert_img_to_markdown(match):
            src = match.group(1)
            # Extract alt text if present
            alt_match = re.search(r'alt=["\']?([^"\'>\s]*)["\']?', match.group(0))
            alt = alt_match.group(1) if alt_match else "Image"
            return f"![{alt}]({src})"
        
        markdown_content = img_pattern.sub(convert_img_to_markdown, markdown_content)
        
        # Fix any malformed image syntax for article image paths
        markdown_content = re.sub(
            r'!\[([^\]]*)\]\(\/images\/articles\/([^\)]+)\)',
            r'![\1](/images/articles/\2)',
            markdown_content
        )
        
        # Fix link syntax
        markdown_content = re.sub(
            r'\[([^\]]+)\]\(([^\)]+)\)',
            r'[\1](\2)',
            markdown_content
        )
        
        # Add MDX components if enabled
        if self.mdx_components:
            markdown_content = self._add_mdx_components(markdown_content)
        
        # Ensure content ends with a single newline
        markdown_content = markdown_content.rstrip() + '\n'
        
        return markdown_content
    
    def _add_mdx_components(self, content: str) -> str:
        """Add MDX-specific components if enabled."""
        # This is a placeholder for MDX component processing
        # Could convert specific patterns to JSX components
        # For example, converting note references to custom components
        
        # Example: Convert [[Note Title]] to <NoteLink title="Note Title" />
        content = re.sub(
            r'\[\[([^\]]+)\]\]',
            r'<NoteLink title="\1" />',
            content
        )
        
        return content
    
    def _format_date(self, date_string: str) -> str:
        """Format date string for frontmatter."""
        if not date_string:
            return datetime.now().strftime(self.date_format)
        
        try:
            # Parse ISO date string
            if 'T' in date_string:
                dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            else:
                dt = datetime.strptime(date_string, '%Y-%m-%d')
            
            return dt.strftime(self.date_format)
        except Exception:
            logger.warning(f"Could not parse date: {date_string}")
            return datetime.now().strftime(self.date_format)
    
    def _escape_yaml_string(self, value: str) -> str:
        """Escape a string for safe YAML output."""
        if not value:
            return '""'
        
        # Check if the string needs quotes
        needs_quotes = (
            '"' in value or
            "'" in value or
            ':' in value or
            '-' in value or
            '[' in value or
            ']' in value or
            '{' in value or
            '}' in value or
            value.strip() != value
        )
        
        if needs_quotes:
            # Escape double quotes and wrap in quotes
            escaped = value.replace('"', '\\"')
            return f'"{escaped}"'
        else:
            return value
    
    def _clean_html_fallback(self, html_content: str) -> str:
        """Fallback method to clean HTML when conversion fails."""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            return soup.get_text()
        except Exception:
            # Last resort: return raw content
            return html_content
    
    def _generate_fallback_content(self, html_content: str, metadata: Dict) -> str:
        """Generate fallback MDX content when conversion fails."""
        title = metadata.get('title', 'Untitled Note')
        
        frontmatter = f"""---
title: "{self._escape_yaml_string(title)}"
date: {datetime.now().strftime(self.date_format)}
type: note
source: apple-notes
conversion_error: true
---

"""
        
        clean_content = self._clean_html_fallback(html_content)
        return frontmatter + clean_content
    
    def validate_mdx_output(self, mdx_content: str) -> Dict[str, Any]:
        """Validate the generated MDX content."""
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "stats": {}
        }
        
        try:
            # Check for frontmatter
            if not mdx_content.startswith('---'):
                validation_result["errors"].append("Missing frontmatter")
                validation_result["valid"] = False
            
            # Check for basic structure
            lines = mdx_content.split('\n')
            frontmatter_end = -1
            for i, line in enumerate(lines[1:], 1):
                if line.strip() == '---':
                    frontmatter_end = i
                    break
            
            if frontmatter_end == -1:
                validation_result["errors"].append("Malformed frontmatter")
                validation_result["valid"] = False
            
            # Basic stats
            validation_result["stats"] = {
                "total_lines": len(lines),
                "content_lines": len(lines) - frontmatter_end - 1 if frontmatter_end > 0 else 0,
                "character_count": len(mdx_content),
                "image_count": mdx_content.count('!['),
                "link_count": mdx_content.count('](')
            }
            
        except Exception as e:
            validation_result["errors"].append(f"Validation error: {str(e)}")
            validation_result["valid"] = False
        
        return validation_result
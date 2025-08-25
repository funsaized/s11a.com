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
        
        # Basic frontmatter generation (fallback) - Gatsby compatible
        title = metadata.get('title', 'Untitled Note')
        created = metadata.get('created', '')
        modified = metadata.get('modified', '')
        folder = metadata.get('folder', 'Notes')
        
        # Create basic frontmatter dict and use the Gatsby-compatible formatter
        basic_frontmatter_dict = {
            'title': title,
            'date': created,
            'category': folder,
            'author': 'Sai Nimmagadda'
        }
        
        # Add slug
        from filename_utils import to_kebab_case
        basic_frontmatter_dict['slug'] = to_kebab_case(title)
        
        # Add excerpt if we can generate one from content
        if content and len(content) > 50:
            # Extract first sentence or paragraph for excerpt
            import re
            # Remove frontmatter and markdown syntax for excerpt
            clean_content = re.sub(r'^---.*?---\s*', '', content, flags=re.DOTALL)
            clean_content = re.sub(r'[#*`\[\]()]+', '', clean_content)
            
            # Get first meaningful sentence
            sentences = clean_content.split('.')
            if sentences and len(sentences[0].strip()) > 20:
                excerpt = sentences[0].strip()[:150] + ('...' if len(sentences[0]) > 150 else '.')
                basic_frontmatter_dict['excerpt'] = excerpt
        
        # Add tags if enabled and folder is meaningful
        if self.tags_in_frontmatter and folder and folder != "Notes":
            basic_frontmatter_dict['tags'] = [folder.lower()]
        
        # Use the Gatsby-compatible formatter
        return self._dict_to_yaml_frontmatter(basic_frontmatter_dict)
    
    def _dict_to_yaml_frontmatter(self, frontmatter_dict: Dict[str, Any]) -> str:
        """
        Convert a dictionary to Gatsby-compatible YAML frontmatter format.
        
        Args:
            frontmatter_dict: Dictionary containing frontmatter fields
            
        Returns:
            Gatsby-compatible YAML frontmatter string
        """
        lines = ["---"]
        
        # Create a copy and add Gatsby-required fields
        formatted_dict = frontmatter_dict.copy()
        
        # Add Gatsby-required fields if missing
        if 'readingTime' not in formatted_dict:
            # Estimate reading time based on content (rough calculation)
            estimated_time = 5  # Default fallback
            formatted_dict['readingTime'] = f'{estimated_time} min read'
            
        if 'featured' not in formatted_dict:
            formatted_dict['featured'] = False
        
        # Define the order of fields for Gatsby compatibility
        field_order = ["title", "slug", "excerpt", "date", "category", "tags", "readingTime", "featured", "author"]
        
        # Add fields in order
        for field in field_order:
            if field in formatted_dict:
                value = formatted_dict[field]
                
                if field == "title":
                    # Check if title needs quotes due to special YAML characters
                    title_str = str(value)
                    # Quote if contains special YAML characters: [] {} () : | > @ # & * ! % ` ' " ? 
                    if any(char in title_str for char in '[]{}():|>@#&*!%`\'"?') or title_str.endswith(':'):
                        # Escape single quotes and wrap in single quotes
                        escaped_title = title_str.replace("'", "''")
                        lines.append(f"title: '{escaped_title}'")
                    else:
                        lines.append(f"title: {title_str}")
                    
                elif field == "slug":
                    # No quotes for slug (Gatsby style)
                    lines.append(f"slug: {value}")
                    
                elif field == "date":
                    # Format date with single quotes
                    date_str = str(value)
                    # Try to format date properly
                    try:
                        from datetime import datetime
                        # Handle various date formats
                        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S', '%m-%d-%Y']:
                            try:
                                parsed_date = datetime.strptime(date_str, fmt)
                                date_str = parsed_date.strftime('%Y-%m-%d')
                                break
                            except ValueError:
                                continue
                    except Exception:
                        pass
                    lines.append(f"date: '{date_str}'")
                    
                elif field == "excerpt" and isinstance(value, str):
                    # Use multi-line format for long excerpts (Gatsby style)
                    if len(value) > 60:
                        lines.append("excerpt: >-")
                        lines.append(f"  {value}")
                    else:
                        lines.append(f"excerpt: {value}")
                        
                elif field == "tags" and isinstance(value, list):
                    # Format tags as multi-line YAML array (Gatsby style)
                    if value:
                        lines.append("tags:")
                        for tag in value:
                            lines.append(f"  - {tag}")
                    else:
                        lines.append("tags: []")
                        
                elif field == "featured":
                    # Boolean value without quotes
                    lines.append(f"featured: {'true' if value else 'false'}")
                    
                elif isinstance(value, str):
                    # Check if value needs quotes due to special YAML characters
                    if any(char in value for char in '[]{}():|>@#&*!%`\'"?') or value.endswith(':'):
                        # Escape single quotes and wrap in single quotes
                        escaped_value = value.replace("'", "''")
                        lines.append(f"{field}: '{escaped_value}'")
                    else:
                        lines.append(f"{field}: {value}")
                else:
                    lines.append(f"{field}: {value}")
        
        # Add any remaining fields not in the order list (skip internal fields)
        skip_fields = field_order + ["modified", "folder", "type", "source"]
        for field, value in formatted_dict.items():
            if field not in skip_fields:
                if isinstance(value, str):
                    # Check if value needs quotes due to special YAML characters
                    if any(char in value for char in '[]{}():|>@#&*!%`\'"?') or value.endswith(':'):
                        # Escape single quotes and wrap in single quotes
                        escaped_value = value.replace("'", "''")
                        lines.append(f"{field}: '{escaped_value}'")
                    else:
                        lines.append(f"{field}: {value}")
                else:
                    lines.append(f"{field}: {value}")
        
        lines.extend(["---", ""])
        
        return "\n".join(lines)
    
    def _fix_invalid_markdown_formatting(self, content: str) -> str:
        """Fix invalid markdown formatting patterns from Apple Notes."""
        try:
            # Fix any sequence of 3+ asterisks around text → **text** (proper bold)
            # This handles ****text****, ***text***, *****text**** etc.
            content = re.sub(r'\*{3,}([^*]+)\*{3,}', r'**\1**', content)
            
            # Fix standalone asterisks that might cause parsing issues
            content = re.sub(r'(?<!\*)\*(?!\*)', '', content)
            
            # Convert HTML comments to MDX/JSX comments
            content = re.sub(r'<!--\s*([^>]+)\s*-->', r'{/* \1 */}', content)
            
            return content
        except Exception as e:
            logger.warning(f"Error fixing markdown formatting: {e}")
            return content
    
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
        
        # Fix invalid markdown formatting (****text**** → **text**)
        markdown_content = self._fix_invalid_markdown_formatting(markdown_content)
        
        # Fix headers that have been incorrectly wrapped with ** for bold
        # Pattern: **# Title** or **## Title** etc. → # Title or ## Title
        markdown_content = re.sub(r'\*\*(#{1,6}\s+[^*]+)\*\*', r'\1', markdown_content)
        
        # Also fix headers with bold inside: # **Title** → # Title
        markdown_content = re.sub(r'^(#{1,6}\s+)\*\*([^*]+)\*\*', r'\1\2', markdown_content, flags=re.MULTILINE)
        
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
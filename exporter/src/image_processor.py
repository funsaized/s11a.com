#!/usr/bin/env python3
"""
Image Processor for Apple Notes MDX Exporter

This module handles extraction and processing of images from Apple Notes HTML content.
It supports base64 image extraction, HEIC conversion, and file management.
"""

import os
import base64
import hashlib
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
except ImportError:
    raise ImportError("Pillow is required. Install with: pip install Pillow")

try:
    from bs4 import BeautifulSoup
except ImportError:
    raise ImportError("BeautifulSoup4 is required. Install with: pip install beautifulsoup4")

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Handles image extraction and processing for Notes export."""
    
    def __init__(self, attachments_dir: Path, config: Optional[Dict] = None):
        """
        Initialize the image processor.
        
        Args:
            attachments_dir: Directory to save extracted images
            config: Configuration dictionary with image processing options
        """
        self.attachments_dir = Path(attachments_dir)
        self.config = config or {}
        
        # Default configuration
        self.image_format = self.config.get("image_format", "jpg")
        self.image_quality = self.config.get("image_quality", 95)
        self.max_filename_length = self.config.get("max_filename_length", 50)
        
        # Ensure attachments directory exists
        self.attachments_dir.mkdir(parents=True, exist_ok=True)
        
        # Supported image formats
        self.supported_formats = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg', 
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/heic': 'heic',
            'image/heif': 'heic'
        }
        
        # Pattern for base64 images in HTML
        self.base64_pattern = re.compile(
            r'<img[^>]*src=["\']?(data:image/([^;]+);base64,([^"\'>\s]+))["\']?[^>]*>',
            re.IGNORECASE
        )
        
        logger.info(f"ImageProcessor initialized. Output dir: {self.attachments_dir}")
    
    def process_html_images(self, html_content: str, note_name: str) -> Tuple[str, List[str]]:
        """
        Process all images in HTML content.
        
        Args:
            html_content: HTML content from Apple Notes
            note_name: Name of the note (for unique filenames)
            
        Returns:
            Tuple of (modified_html, list_of_image_paths)
        """
        extracted_images = []
        modified_html = html_content
        
        try:
            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Find all images
            img_tags = soup.find_all('img')
            logger.info(f"Found {len(img_tags)} image tags in note: {note_name}")
            
            for idx, img_tag in enumerate(img_tags):
                src = img_tag.get('src', '')
                
                if src.startswith('data:image/'):
                    # Handle base64 embedded images
                    image_path = self._extract_base64_image(src, note_name, idx)
                    if image_path:
                        # Update the img tag with relative path
                        relative_path = f"./attachments/{image_path.name}"
                        img_tag['src'] = relative_path
                        extracted_images.append(str(image_path))
                        logger.debug(f"Extracted base64 image: {image_path.name}")
                
                elif src.startswith('cid:') or src.startswith('x-apple-data-detectors://'):
                    # Handle Apple Notes internal references
                    logger.warning(f"Cannot extract internal image reference: {src}")
                    # Keep the original reference for now
                
                else:
                    # Handle web URLs (download if needed)
                    if src.startswith('http'):
                        image_path = self._download_web_image(src, note_name, idx)
                        if image_path:
                            relative_path = f"./attachments/{image_path.name}"
                            img_tag['src'] = relative_path
                            extracted_images.append(str(image_path))
                            logger.debug(f"Downloaded web image: {image_path.name}")
            
            # Convert back to HTML
            modified_html = str(soup)
            
            logger.info(f"Processed {len(extracted_images)} images for note: {note_name}")
            return modified_html, extracted_images
            
        except Exception as e:
            logger.error(f"Error processing images in note '{note_name}': {e}")
            return html_content, []
    
    def _extract_base64_image(self, data_url: str, note_name: str, index: int) -> Optional[Path]:
        """Extract and save a base64 encoded image."""
        try:
            # Parse data URL
            match = re.match(r'data:image/([^;]+);base64,(.+)', data_url)
            if not match:
                logger.warning("Invalid data URL format")
                return None
            
            mime_type = match.group(1).lower()
            base64_data = match.group(2)
            
            # Decode base64
            try:
                image_data = base64.b64decode(base64_data)
            except Exception as e:
                logger.error(f"Failed to decode base64 image: {e}")
                return None
            
            # Generate unique filename
            filename = self._generate_filename(note_name, index, mime_type)
            image_path = self.attachments_dir / filename
            
            # Save and potentially convert image
            return self._save_image(image_data, image_path, mime_type)
            
        except Exception as e:
            logger.error(f"Error extracting base64 image: {e}")
            return None
    
    def _download_web_image(self, url: str, note_name: str, index: int) -> Optional[Path]:
        """Download an image from a web URL."""
        try:
            import urllib.request
            import urllib.parse
            
            # Download the image
            with urllib.request.urlopen(url, timeout=30) as response:
                image_data = response.read()
                content_type = response.headers.get('content-type', 'image/jpeg')
            
            # Extract file extension from URL or content type
            parsed_url = urllib.parse.urlparse(url)
            url_ext = os.path.splitext(parsed_url.path)[1].lower()
            
            if url_ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                mime_type = url_ext[1:]  # Remove the dot
            else:
                mime_type = content_type.split('/')[-1] if '/' in content_type else 'jpg'
            
            # Generate filename
            filename = self._generate_filename(note_name, index, mime_type)
            image_path = self.attachments_dir / filename
            
            # Save image
            return self._save_image(image_data, image_path, mime_type)
            
        except Exception as e:
            logger.error(f"Error downloading web image from {url}: {e}")
            return None
    
    def _save_image(self, image_data: bytes, image_path: Path, original_format: str) -> Optional[Path]:
        """Save image data to file, converting format if needed."""
        try:
            # Open image with Pillow
            image = Image.open(io.BytesIO(image_data))
            
            # Handle HEIC conversion
            if original_format.lower() in ['heic', 'heif']:
                logger.info(f"Converting HEIC image to {self.image_format.upper()}")
                # Convert to RGB if needed
                if image.mode in ['RGBA', 'P']:
                    image = image.convert('RGB')
                
                # Update file extension
                image_path = image_path.with_suffix(f'.{self.image_format}')
            
            # Save based on desired format
            if self.image_format == 'jpg' and image.mode in ['RGBA', 'P']:
                # Convert to RGB for JPEG
                image = image.convert('RGB')
                image.save(image_path, 'JPEG', quality=self.image_quality, optimize=True)
            elif self.image_format == 'png':
                image.save(image_path, 'PNG', optimize=True)
            else:
                # Save in original format or specified format
                image.save(image_path, quality=self.image_quality if self.image_format == 'jpg' else None)
            
            logger.debug(f"Saved image: {image_path.name} ({image.size})")
            return image_path
            
        except Exception as e:
            logger.error(f"Error saving image to {image_path}: {e}")
            # Fallback: save raw data
            try:
                with open(image_path, 'wb') as f:
                    f.write(image_data)
                logger.info(f"Saved raw image data: {image_path.name}")
                return image_path
            except Exception as e2:
                logger.error(f"Failed to save raw image data: {e2}")
                return None
    
    def _generate_filename(self, note_name: str, index: int, mime_type: str) -> str:
        """Generate a unique filename for an image."""
        # Sanitize note name
        safe_name = re.sub(r'[<>:"/\\|?*]', '-', note_name)
        safe_name = safe_name[:self.max_filename_length].strip()
        
        # Get file extension
        extension = self.supported_formats.get(f'image/{mime_type}', mime_type)
        if self.image_format and self.image_format != extension:
            extension = self.image_format
        
        # Create filename with index
        filename = f"{safe_name}-{index:03d}.{extension}"
        
        # Handle duplicates
        counter = 1
        original_filename = filename
        while (self.attachments_dir / filename).exists():
            name_part = original_filename.rsplit('.', 1)[0]
            ext_part = original_filename.rsplit('.', 1)[1]
            filename = f"{name_part}-{counter}.{ext_part}"
            counter += 1
        
        return filename
    
    def get_image_stats(self) -> Dict:
        """Get statistics about processed images."""
        if not self.attachments_dir.exists():
            return {"total_images": 0, "total_size": 0}
        
        images = list(self.attachments_dir.glob('*'))
        total_size = sum(img.stat().st_size for img in images if img.is_file())
        
        return {
            "total_images": len(images),
            "total_size": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2)
        }


# Add missing import
import io
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
import io
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union
import logging
from dataclasses import dataclass, field

try:
    from PIL import Image
    from PIL.ExifTags import TAGS
except ImportError:
    raise ImportError("Pillow is required. Install with: pip install Pillow")

# Enable HEIC/HEIF support if available
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False

try:
    from bs4 import BeautifulSoup
except ImportError:
    raise ImportError("BeautifulSoup4 is required. Install with: pip install beautifulsoup4")

from filename_utils import generate_image_filename

@dataclass
class ImageConfig:
    """Configuration for image processing."""
    image_format: str = "jpg"
    image_quality: int = 95
    max_filename_length: int = 50
    max_image_size_mb: int = 50
    enable_download: bool = True
    download_timeout: int = 30
    supported_web_formats: List[str] = field(default_factory=lambda: [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'
    ])
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        if self.image_quality < 1 or self.image_quality > 100:
            raise ValueError("image_quality must be between 1 and 100")
        if self.max_filename_length < 10:
            raise ValueError("max_filename_length must be at least 10")
        if self.max_image_size_mb < 1:
            raise ValueError("max_image_size_mb must be at least 1")


logger = logging.getLogger(__name__)


class ImageProcessor:
    """Handles image extraction and processing for Notes export."""
    
    def __init__(self, attachments_dir: Union[str, Path], config: Optional[Union[Dict, ImageConfig]] = None):
        """
        Initialize the image processor.
        
        Args:
            attachments_dir: Directory to save extracted images
            config: Configuration dictionary or ImageConfig instance
        """
        self.attachments_dir = Path(attachments_dir)
        
        # Handle config initialization
        if isinstance(config, ImageConfig):
            self.config = config
        elif isinstance(config, dict):
            self.config = ImageConfig(**config)
        else:
            self.config = ImageConfig()
        
        # Ensure attachments directory exists
        self.attachments_dir.mkdir(parents=True, exist_ok=True)
        
        # Supported image formats mapping
        self.supported_formats = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg', 
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/heic': 'heic',
            'image/heif': 'heic',
            'image/bmp': 'bmp',
            'image/tiff': 'tiff',
            'image/tif': 'tiff',
            'image/x-icon': 'ico',
            'image/vnd.microsoft.icon': 'ico',
            'image/avif': 'avif'
        }
        
        # MIME type detection patterns
        self.format_signatures = {
            b'\xff\xd8\xff': 'jpg',
            b'\x89PNG\r\n\x1a\n': 'png',
            b'GIF8': 'gif',
            b'RIFF': 'webp',  # Requires additional check for WEBP
            b'BM': 'bmp',
            b'II*\x00': 'tiff',
            b'MM\x00*': 'tiff',
            b'\x00\x00\x01\x00': 'ico'
        }
        
        # Pattern for base64 images in HTML
        self.base64_pattern = re.compile(
            r'<img[^>]*src=["\']?(data:image/([^;]+);base64,([^"\'>\s]+))["\']?[^>]*>',
            re.IGNORECASE
        )
        
        logger.info(f"ImageProcessor initialized. Output dir: {self.attachments_dir}")
        logger.info(f"Config: format={self.config.image_format}, quality={self.config.image_quality}")
        if HEIC_SUPPORT:
            logger.info("✅ HEIC/HEIF support enabled")
        else:
            logger.warning("⚠️ HEIC/HEIF support not available - install pillow-heif for better compatibility")
    
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
                        # Use absolute path for web serving: /images/articles/
                        relative_path = f"/images/articles/{image_path.name}"
                        old_src = img_tag.get('src', '')[:100]  # First 100 chars for logging
                        img_tag['src'] = relative_path
                        # Ensure alt attribute exists for better markdown conversion
                        if not img_tag.get('alt'):
                            # Use filename as alt text
                            alt_text = image_path.stem.replace('-', ' ').title()
                            img_tag['alt'] = alt_text
                        extracted_images.append(str(image_path))
                        logger.info(f"✅ Updated image src: '{old_src}...' → '{relative_path}'")
                
                elif src.startswith('cid:') or src.startswith('x-apple-data-detectors://'):
                    # Handle Apple Notes internal references
                    logger.warning(f"Cannot extract internal image reference: {src}")
                    # Keep the original reference for now
                
                else:
                    # Handle web URLs (download if needed)
                    if src.startswith('http'):
                        image_path = self._download_web_image(src, note_name, idx)
                        if image_path:
                            # Use absolute path for web serving: /images/articles/
                            relative_path = f"/images/articles/{image_path.name}"
                            img_tag['src'] = relative_path
                            # Ensure alt attribute exists for better markdown conversion
                            if not img_tag.get('alt'):
                                # Use filename as alt text
                                alt_text = image_path.stem.replace('-', ' ').title()
                                img_tag['alt'] = alt_text
                            extracted_images.append(str(image_path))
                            logger.debug(f"Downloaded web image: {image_path.name}, linked as: {relative_path}")
            
            # Convert back to HTML
            modified_html = str(soup)
            
            # Log final HTML state for debugging
            if extracted_images:
                # Show first few img tags in final HTML for verification
                final_soup = BeautifulSoup(modified_html, 'html.parser')
                final_img_tags = final_soup.find_all('img')[:2]  # First 2 images
                for i, tag in enumerate(final_img_tags):
                    src = tag.get('src', '')
                    alt = tag.get('alt', '')
                    logger.info(f"📋 Final img[{i}]: src='{src}' alt='{alt}'")
            
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
            
            # Validate image data size
            if not self._validate_image_size(image_data):
                logger.warning(f"Image too large ({len(image_data)} bytes), skipping")
                return None
            
            # Validate image format
            detected_format = self._detect_image_format(image_data)
            if detected_format:
                logger.debug(f"Detected format: {detected_format} (claimed: {mime_type})")
                mime_type = detected_format
            
            # Generate unique filename using kebab-case
            filename = generate_image_filename(note_name, index, mime_type)
            image_path = self.attachments_dir / filename
            
            # Save and potentially convert image
            return self._save_image(image_data, image_path, mime_type)
            
        except Exception as e:
            logger.error(f"Error extracting base64 image: {e}")
            return None
    
    def _download_web_image(self, url: str, note_name: str, index: int) -> Optional[Path]:
        """Download an image from a web URL with improved error handling."""
        if not self.config.enable_download:
            logger.info("Web image download disabled in config")
            return None
        
        try:
            import urllib.request
            import urllib.parse
            import urllib.error
            
            # Validate URL
            parsed_url = urllib.parse.urlparse(url)
            if not parsed_url.scheme in ['http', 'https']:
                logger.warning(f"Unsupported URL scheme: {parsed_url.scheme}")
                return None
            
            # Create request with headers
            request = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            )
            
            # Download with timeout and size limit
            with urllib.request.urlopen(request, timeout=self.config.download_timeout) as response:
                # Check content length
                content_length = response.headers.get('content-length')
                if content_length and int(content_length) > self.config.max_image_size_mb * 1024 * 1024:
                    logger.warning(f"Image too large: {content_length} bytes")
                    return None
                
                # Read data with size limit
                max_size = self.config.max_image_size_mb * 1024 * 1024
                image_data = response.read(max_size)
                content_type = response.headers.get('content-type', 'image/jpeg')
            
            # Validate downloaded data
            if not self._validate_image_size(image_data):
                return None
                
            # Detect actual format from data
            detected_format = self._detect_image_format(image_data)
            if detected_format:
                mime_type = detected_format
            else:
                # Fallback to URL extension or content-type
                url_ext = os.path.splitext(parsed_url.path)[1].lower()
                if url_ext and url_ext[1:] in self.config.supported_web_formats:
                    mime_type = url_ext[1:]
                else:
                    mime_type = content_type.split('/')[-1] if '/' in content_type else 'jpg'
            
            # Generate filename using kebab-case
            filename = generate_image_filename(note_name, index, mime_type)
            image_path = self.attachments_dir / filename
            
            # Save image
            return self._save_image(image_data, image_path, mime_type)
            
        except urllib.error.HTTPError as e:
            logger.error(f"HTTP error downloading image from {url}: {e.code} {e.reason}")
        except urllib.error.URLError as e:
            logger.error(f"URL error downloading image from {url}: {e.reason}")
        except Exception as e:
            logger.error(f"Unexpected error downloading image from {url}: {e}")
        
        return None
    
    def _save_image(self, image_data: bytes, image_path: Path, original_format: str) -> Optional[Path]:
        """Save image data to file with robust format handling and conversion."""
        try:
            # Check for HEIC/HEIF data by examining file header
            is_heic = self._detect_heic_format(image_data)
            if is_heic:
                logger.info(f"Detected HEIC/HEIF format, attempting conversion")
                original_format = 'heic'
            
            # Attempt to open image with Pillow
            try:
                image = Image.open(io.BytesIO(image_data))
                
                # Verify image integrity
                image.verify()
                
                # Reopen for processing (verify() makes image unusable)
                image = Image.open(io.BytesIO(image_data))
                
            except Exception as e:
                logger.error(f"Failed to open image with Pillow: {e}")
                return self._fallback_save(image_data, image_path, original_format)
            
            # Handle HEIC conversion - always convert to target format
            if original_format.lower() in ['heic', 'heif'] or is_heic:
                return self._convert_heic_image(image, image_path)
            
            # Handle regular image formats with proper conversion
            return self._convert_standard_image(image, image_path, original_format)
            
        except Exception as e:
            logger.error(f"Error saving image to {image_path}: {e}")
            return self._fallback_save(image_data, image_path, original_format)
    
    def _convert_heic_image(self, image: Image.Image, image_path: Path) -> Optional[Path]:
        """Convert HEIC/HEIF image to target format."""
        try:
            if not HEIC_SUPPORT:
                logger.error("HEIC support not available - install pillow-heif")
                return None
            
            logger.info(f"Converting HEIC/HEIF image to {self.config.image_format.upper()}")
            
            # Convert to RGB if needed (HEIC images often need this)
            if image.mode in ['RGBA', 'P']:
                # Create white background for transparency
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'RGBA':
                    background.paste(image, mask=image.split()[-1])  # Alpha channel as mask
                else:
                    background.paste(image)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Force file extension to target format
            image_path = image_path.with_suffix(f'.{self.config.image_format}')
            
            # Save with optimization
            save_kwargs = {'optimize': True}
            if self.config.image_format.lower() == 'jpg':
                save_kwargs.update({
                    'quality': self.config.image_quality,
                    'format': 'JPEG'
                })
            elif self.config.image_format.lower() == 'png':
                save_kwargs['format'] = 'PNG'
            
            image.save(image_path, **save_kwargs)
            logger.debug(f"Converted HEIC to {self.config.image_format.upper()}: {image_path.name} ({image.size})")
            return image_path
            
        except Exception as e:
            logger.error(f"HEIC conversion failed: {e}")
            return None
    
    def _convert_standard_image(self, image: Image.Image, image_path: Path, original_format: str) -> Optional[Path]:
        """Convert standard image formats with proper mode handling."""
        try:
            target_format = self.config.image_format.lower()
            
            # Handle format-specific conversions
            if target_format == 'jpg':
                # JPEG doesn't support transparency
                if image.mode in ['RGBA', 'P']:
                    # Create white background
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'RGBA':
                        background.paste(image, mask=image.split()[-1])
                    else:
                        background.paste(image)
                    image = background
                elif image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Ensure correct file extension
                image_path = image_path.with_suffix('.jpg')
                image.save(image_path, 'JPEG', quality=self.config.image_quality, optimize=True)
                
            elif target_format == 'png':
                # PNG supports all modes
                image_path = image_path.with_suffix('.png')
                image.save(image_path, 'PNG', optimize=True)
                
            elif target_format == 'webp':
                # WebP supports all modes
                image_path = image_path.with_suffix('.webp')
                image.save(image_path, 'WebP', quality=self.config.image_quality, optimize=True)
                
            else:
                # Keep original format or convert to JPEG as fallback
                if original_format in ['heic', 'heif'] or target_format not in self.supported_formats.values():
                    target_format = 'jpg'
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    image_path = image_path.with_suffix('.jpg')
                    image.save(image_path, 'JPEG', quality=self.config.image_quality, optimize=True)
                else:
                    image_path = image_path.with_suffix(f'.{target_format}')
                    image.save(image_path, optimize=True)
            
            logger.debug(f"Saved image: {image_path.name} ({image.size})")
            return image_path
            
        except Exception as e:
            logger.error(f"Image conversion failed: {e}")
            return None
    
    def _fallback_save(self, image_data: bytes, image_path: Path, original_format: str) -> Optional[Path]:
        """Fallback method to save raw image data when Pillow fails."""
        try:
            # Don't save raw HEIC data as it won't be viewable
            if self._detect_heic_format(image_data):
                logger.error("Cannot save raw HEIC data - conversion required but failed")
                return None
            
            # For other formats, try to save raw data
            with open(image_path, 'wb') as f:
                f.write(image_data)
            
            logger.info(f"Saved raw image data: {image_path.name} ({len(image_data)} bytes)")
            return image_path
            
        except Exception as e:
            logger.error(f"Fallback save failed: {e}")
            return None
    
    def _detect_heic_format(self, image_data: bytes) -> bool:
        """Detect HEIC/HEIF format by examining file header."""
        try:
            if len(image_data) < 32:
                return False
            
            # Check for HEIC/HEIF signatures in ftyp box
            header = image_data[:32]
            
            # HEIC/HEIF patterns (look for ftyp box with specific brand)
            heic_patterns = [
                b'ftypheic',  # HEIC
                b'ftypheif',  # HEIF  
                b'ftypmif1',  # HEIF variant
                b'ftypheix',  # HEIC variant
                b'ftyphvcC',  # HEIF sequence
                b'ftyphevc',  # HEIF video
                b'ftypmif2'   # Another HEIF variant
            ]
            
            for pattern in heic_patterns:
                if pattern in header:
                    return True
            
            # Additional check for ISO base media file format
            if header[4:8] == b'ftyp' and (b'hei' in header[8:20] or b'mif' in header[8:20]):
                return True
                    
            return False
            
        except Exception:
            return False
    
    def _detect_image_format(self, image_data: bytes) -> Optional[str]:
        """Detect image format from file signature."""
        try:
            if len(image_data) < 16:
                return None
            
            # Check file signatures
            header = image_data[:16]
            
            # JPEG
            if header.startswith(b'\xff\xd8\xff'):
                return 'jpg'
            
            # PNG
            if header.startswith(b'\x89PNG\r\n\x1a\n'):
                return 'png'
            
            # GIF
            if header.startswith(b'GIF8'):
                return 'gif'
            
            # WebP
            if header.startswith(b'RIFF') and b'WEBP' in image_data[8:16]:
                return 'webp'
            
            # BMP
            if header.startswith(b'BM'):
                return 'bmp'
            
            # TIFF (little and big endian)
            if header.startswith(b'II*\x00') or header.startswith(b'MM\x00*'):
                return 'tiff'
            
            # ICO
            if header.startswith(b'\x00\x00\x01\x00'):
                return 'ico'
            
            # HEIC/HEIF
            if self._detect_heic_format(image_data):
                return 'heic'
            
            return None
            
        except Exception:
            return None
    
    def _validate_image_size(self, image_data: bytes) -> bool:
        """Validate image data size against configured limits."""
        size_mb = len(image_data) / (1024 * 1024)
        if size_mb > self.config.max_image_size_mb:
            logger.warning(f"Image size {size_mb:.1f}MB exceeds limit {self.config.max_image_size_mb}MB")
            return False
        return True
    
    def _generate_filename(self, note_name: str, index: int, mime_type: str) -> str:
        """Generate a unique filename for an image using kebab-case conventions."""
        # Get file extension based on target format
        if mime_type.lower() in ['heic', 'heif']:
            # Always convert HEIC to target format
            extension = self.config.image_format
        else:
            # Use configured format or original format
            extension = self.supported_formats.get(f'image/{mime_type}', mime_type)
            if self.config.image_format and self.config.image_format != extension:
                extension = self.config.image_format
        
        # Use the new kebab-case filename generator
        filename = generate_image_filename(note_name, index, extension, self.config.max_filename_length)
        
        # Handle duplicates with improved logic
        counter = 1
        original_filename = filename
        while (self.attachments_dir / filename).exists():
            name_parts = original_filename.rsplit('.', 1)
            if len(name_parts) == 2:
                name_part, ext_part = name_parts
                # Insert counter before the index part
                if name_part.endswith(f"-{index:03d}"):
                    base_part = name_part[:-4]  # Remove "-000"
                    filename = f"{base_part}-{counter:02d}-{index:03d}.{ext_part}"
                else:
                    filename = f"{name_part}-{counter:02d}.{ext_part}"
            else:
                filename = f"{original_filename}-{counter:02d}"
            counter += 1
            
            # Prevent infinite loops
            if counter > 999:
                # Use timestamp as fallback
                import time
                timestamp = int(time.time())
                base_name = generate_image_filename(f"image-{timestamp}", index, extension)
                filename = base_name
                break
        
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



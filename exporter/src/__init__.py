"""
Apple Notes to MDX Exporter
A Python-based solution for extracting Apple Notes with embedded images to MDX format.
"""

__version__ = "1.0.0"
__author__ = "Apple Notes MDX Exporter"

from .notes_exporter import NotesExporter
from .applescript_bridge import AppleScriptBridge  
from .image_processor import ImageProcessor
from .mdx_converter import MDXConverter

__all__ = [
    "NotesExporter",
    "AppleScriptBridge", 
    "ImageProcessor",
    "MDXConverter"
]
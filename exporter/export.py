#!/usr/bin/env python3
"""
Apple Notes MDX Exporter - Command Line Entry Point
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from main import main

if __name__ == "__main__":
    sys.exit(main())
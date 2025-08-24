#!/usr/bin/env python3
"""
AppleScript Bridge for Apple Notes Access

This module provides a Python interface to Apple Notes via AppleScript.
It handles note extraction, metadata collection, and folder management.
"""

import os
import subprocess
import json
import re
import time
import html
from typing import Dict, List, Optional, Union, Set
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AppleScriptBridge:
    """Bridge class for interfacing with Apple Notes via AppleScript."""

    def __init__(self, batch_size: int = 50):
        """Initialize the AppleScript bridge."""
        self.timeout = 300  # 5 minutes timeout for large exports
        self.batch_size = batch_size  # Number of notes to fetch per batch
        self._verify_notes_access()
        logger.info(f"AppleScript bridge initialized with batch_size={batch_size}")

    def _verify_notes_access(self) -> bool:
        """Verify that Notes app is accessible via AppleScript."""
        test_script = '''
        tell application "Notes"
            return "accessible"
        end tell
        '''

        try:
            result = self._run_applescript(test_script)
            return result.strip() == "accessible"
        except Exception as e:
            logger.error(f"Notes app not accessible: {e}")
            raise RuntimeError("Cannot access Notes app. Please grant automation permissions in System Preferences > Security & Privacy > Privacy > Automation")

    def _run_applescript(self, script: str) -> str:
        """Execute AppleScript and return the result."""
        try:
            # Use osascript to run AppleScript
            process = subprocess.run(
                ['osascript', '-e', script],
                capture_output=True,
                text=True,
                timeout=self.timeout,
                encoding='utf-8'
            )

            if process.returncode != 0:
                error_msg = process.stderr.strip()
                logger.error(f"AppleScript error: {error_msg}")
                raise RuntimeError(f"AppleScript execution failed: {error_msg}")

            return process.stdout

        except subprocess.TimeoutExpired:
            logger.error("AppleScript execution timed out")
            raise RuntimeError("AppleScript execution timed out")
        except Exception as e:
            logger.error(f"Failed to execute AppleScript: {e}")
            raise RuntimeError(f"Failed to execute AppleScript: {e}")

    def _is_archive_folder(self, folder_name: str) -> bool:
        """Check if a folder name indicates an archive folder."""
        if not folder_name:
            return False
        
        # Check for various archive folder name patterns
        folder_lower = folder_name.lower()
        archive_patterns = [
            'archive',
            'archived',
            'archives',
            '👵🏾 archive 💀',  # Specific pattern from your existing notes
            'old',
            'deleted',
            'trash',
            'backup'
        ]
        
        # Check if folder name matches any archive pattern
        for pattern in archive_patterns:
            if pattern in folder_lower:
                return True
        
        # Check for emoji-based archive patterns (common in Apple Notes)
        if ('archive' in folder_lower and ('💀' in folder_name or '👵' in folder_name)) or \
           ('old' in folder_lower and ('💀' in folder_name or '🗑' in folder_name)):
            return True
        
        return False

    def extract_hashtags(self, content: str) -> Set[str]:
        """
        Extract hashtags from note content, handling HTML and various edge cases.
        
        Args:
            content: Note content (may contain HTML)
            
        Returns:
            Set of hashtags found (without the # symbol, lowercase)
        """
        if not content:
            return set()
        
        try:
            # Decode HTML entities first
            decoded_content = html.unescape(content)
            
            # Remove HTML tags to get plain text
            # Simple regex to remove HTML tags - good enough for hashtag extraction
            text_content = re.sub(r'<[^>]+>', ' ', decoded_content)
            
            # Extract hashtags using regex
            # Pattern: # followed by letter, then letters/numbers/underscore/hyphen
            hashtag_pattern = r'#([a-zA-Z][a-zA-Z0-9_-]*)'
            matches = re.findall(hashtag_pattern, text_content)
            
            # Return set of lowercase hashtags for case-insensitive matching
            return {tag.lower() for tag in matches}
            
        except Exception as e:
            logger.debug(f"Error extracting hashtags: {e}")
            return set()
    
    def _extract_plain_text(self, html_content: str) -> str:
        """Extract plain text from HTML content for content searching."""
        try:
            # Decode HTML entities
            decoded_content = html.unescape(html_content)
            
            # Remove HTML tags to get plain text
            text_content = re.sub(r'<[^>]+>', ' ', decoded_content)
            
            # Clean up extra whitespace
            clean_text = re.sub(r'\s+', ' ', text_content).strip()
            
            return clean_text
        except Exception as e:
            logger.debug(f"Error extracting plain text: {e}")
            return html_content  # Return original if processing fails
    
    def get_all_notes(self, folder_filter: Optional[str] = None) -> List[Dict]:
        """
        Get all notes from Apple Notes with optional filtering.

        Args:
            folder_filter: Optional folder name to filter by

        Returns:
            List of note dictionaries with metadata and content
        """
        try:
            filter_desc = []
            if folder_filter:
                filter_desc.append(f"folder: {folder_filter}")
            
            filter_str = ", ".join(filter_desc) if filter_desc else "All notes"
            logger.info(f"Extracting notes with filters: {filter_str}")

            # First, get a simple count
            count_script = '''
            tell application "Notes"
                return count of notes of default account
            end tell
            '''

            count_result = self._run_applescript(count_script)
            total_notes = int(count_result.strip())
            logger.info(f"Total notes in account: {total_notes}")

            if total_notes == 0:
                return []

            # Use a simpler approach - process notes one by one with duplicate detection
            notes_data = []
            max_notes = 9999  # Back to full processing
            seen_ids = set()  # Track unique note IDs to avoid duplicates

            for i in range(1, min(total_notes + 1, max_notes + 1)):
                try:
                    note_script = f'''
                    tell application "Notes"
                        set theNote to note {i} of default account
                        set noteLocked to password protected of theNote as boolean

                        if not noteLocked then
                            set noteID to id of theNote as string
                            set noteName to name of theNote as string
                            set noteBody to body of theNote as string
                            set modDate to modification date of theNote as date
                            set creDate to creation date of theNote as date
                            set noteContainer to container of theNote

                            set folderName to ""
                            try
                                if noteContainer is not missing value then
                                    set folderName to name of noteContainer
                                end if
                            end try

                            -- Format dates
                            set creString to (year of creDate as string) & "-" & ¬
                                           (month of creDate as integer) & "-" & ¬
                                           (day of creDate as integer)
                            set modString to (year of modDate as string) & "-" & ¬
                                           (month of modDate as integer) & "-" & ¬
                                           (day of modDate as integer)

                            return noteName & "|||" & noteBody & "|||" & creString & "|||" & modString & "|||" & folderName & "|||" & noteID
                        else
                            return "LOCKED"
                        end if
                    end tell
                    '''

                    note_result = self._run_applescript(note_script)

                    if note_result.strip() != "LOCKED":
                        parts = note_result.split('|||')

                        if len(parts) >= 6:
                            note_id = parts[5].strip()

                            # Skip duplicates
                            if note_id in seen_ids:
                                logger.debug(f"Skipping duplicate note {i}: {parts[0].strip()}")
                                continue

                            seen_ids.add(note_id)

                            note_body = parts[1].strip()
                            note_dict = {
                                "noteID": note_id,
                                "shortID": note_id.split('/')[-1] if '/' in note_id else note_id,
                                "noteName": parts[0].strip(),
                                "noteBody": note_body,
                                "creationDate": parts[2].strip(),
                                "modificationDate": parts[3].strip(),
                                "noteFolder": parts[4].strip() if parts[4].strip() else "Notes"
                            }

                            # Apply folder filter if specified
                            if folder_filter and note_dict["noteFolder"] != folder_filter:
                                continue
                            
                            # Skip notes from Archive folders
                            if self._is_archive_folder(note_dict["noteFolder"]):
                                logger.debug(f"Skipping note from Archive folder: {note_dict['noteFolder']}")
                                continue
                            
                            notes_data.append(note_dict)
                        else:
                            logger.warning(f"Note {i}: Insufficient parts in result")
                    else:
                        logger.debug(f"Note {i} is locked, skipping")

                except Exception as e:
                    logger.warning(f"Failed to extract note {i}: {e}")
                    continue

            logger.info(f"Successfully extracted {len(notes_data)} unique notes from first {max_notes} (found {len(seen_ids)} unique IDs)")
            return notes_data

        except Exception as e:
            logger.error(f"Failed to extract notes: {e}")
            raise

    def get_folders(self) -> List[str]:
        """Get list of all note folders."""
        script = '''
        tell application "Notes"
            return name of every folder of default account
        end tell
        '''

        try:
            result = self._run_applescript(script)
            # AppleScript returns comma-separated values
            folders = [folder.strip() for folder in result.split(', ') if folder.strip()]
            logger.info(f"Found {len(folders)} folders: {folders}")
            return folders
        except Exception as e:
            logger.error(f"Failed to get folders: {e}")
            return []

    def test_connection(self) -> Dict[str, Union[bool, str, int]]:
        """Test connection to Notes app and return diagnostic info."""
        try:
            folders = self.get_folders()
            sample_notes = self.get_all_notes()

            return {
                "success": True,
                "folders_count": len(folders),
                "notes_count": len(sample_notes),
                "folders": folders[:5],  # First 5 folders for diagnostics
                "message": "Connection successful"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Connection failed"
            }

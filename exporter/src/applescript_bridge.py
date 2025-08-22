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
from typing import Dict, List, Optional, Union
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AppleScriptBridge:
    """Bridge class for interfacing with Apple Notes via AppleScript."""
    
    def __init__(self):
        """Initialize the AppleScript bridge."""
        self.timeout = 300  # 5 minutes timeout for large exports
        self._verify_notes_access()
    
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
    
    def get_all_notes(self, folder_filter: Optional[str] = None) -> List[Dict]:
        """
        Get all notes from Apple Notes.
        
        Args:
            folder_filter: Optional folder name to filter by
            
        Returns:
            List of note dictionaries with metadata and content
        """
        # Build AppleScript based on folder filter
        if folder_filter:
            folder_clause = f'notes in folder "{folder_filter}" of default account'
        else:
            folder_clause = 'notes of default account'
        
        script = f'''
        set notesList to {{}}
        
        tell application "Notes"
            repeat with theNote in {folder_clause}
                set noteLocked to password protected of theNote as boolean
                
                if not noteLocked then
                    set noteID to id of theNote as string
                    set noteName to name of theNote as string
                    set noteBody to body of theNote as string
                    set modDate to modification date of theNote as date
                    set creDate to creation date of theNote as date
                    set noteContainer to container of theNote
                    
                    -- Extract folder name safely
                    set folderName to ""
                    try
                        if noteContainer is not missing value then
                            set folderName to name of noteContainer
                        end if
                    end try
                    
                    -- Extract note ID from URL
                    set oldDelimiters to AppleScript's text item delimiters
                    set AppleScript's text item delimiters to "/"
                    set theArray to every text item of noteID
                    set AppleScript's text item delimiters to oldDelimiters
                    
                    set shortID to ""
                    if length of theArray > 4 then
                        set shortID to item 5 of theArray
                    end if
                    
                    -- Format dates as ISO strings
                    set creString to my formatDate(creDate)
                    set modString to my formatDate(modDate)
                    
                    -- Build note record
                    set noteRecord to "{{" & ¬
                        "\\"noteID\\": \\"" & noteID & "\\", " & ¬
                        "\\"shortID\\": \\"" & shortID & "\\", " & ¬
                        "\\"noteName\\": \\"" & my escapeJson(noteName) & "\\", " & ¬
                        "\\"noteBody\\": \\"" & my escapeJson(noteBody) & "\\", " & ¬
                        "\\"creationDate\\": \\"" & creString & "\\", " & ¬
                        "\\"modificationDate\\": \\"" & modString & "\\", " & ¬
                        "\\"noteFolder\\": \\"" & my escapeJson(folderName) & "\\"" & ¬
                        "}}"
                    
                    set notesList to notesList & noteRecord
                end if
            end repeat
        end tell
        
        return "[" & my joinList(notesList, ", ") & "]"
        
        -- Helper functions
        on formatDate(theDate)
            return (year of theDate as string) & "-" & ¬
                   my zeroPad(month of theDate as integer) & "-" & ¬
                   my zeroPad(day of theDate as integer) & "T" & ¬
                   my zeroPad(hours of theDate as integer) & ":" & ¬
                   my zeroPad(minutes of theDate as integer) & ":" & ¬
                   my zeroPad(seconds of theDate as integer) & "Z"
        end formatDate
        
        on zeroPad(num)
            if num < 10 then
                return "0" & (num as string)
            else
                return num as string
            end if
        end zeroPad
        
        on escapeJson(txt)
            set txt to my replaceText(txt, "\\\\", "\\\\\\\\")
            set txt to my replaceText(txt, "\\"", "\\\\\\"")
            set txt to my replaceText(txt, return, "\\\\n")
            set txt to my replaceText(txt, tab, "\\\\t")
            return txt
        end escapeJson
        
        on replaceText(find, replace, subject)
            set prevTIDs to text item delimiters of AppleScript
            set text item delimiters of AppleScript to find
            set subject to text items of subject
            set text item delimiters of AppleScript to replace
            set subject to "" & subject
            set text item delimiters of AppleScript to prevTIDs
            return subject
        end replaceText
        
        on joinList(lst, delimiter)
            set prevTIDs to text item delimiters of AppleScript
            set text item delimiters of AppleScript to delimiter
            set result to lst as string
            set text item delimiters of AppleScript to prevTIDs
            return result
        end joinList
        '''
        
        try:
            logger.info(f"Extracting notes with folder filter: {folder_filter or 'All folders'}")
            result = self._run_applescript(script)
            
            # Parse the JSON result
            notes_data = json.loads(result)
            logger.info(f"Successfully extracted {len(notes_data)} notes")
            
            return notes_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AppleScript JSON output: {e}")
            logger.debug(f"Raw output: {result}")
            raise RuntimeError("Failed to parse notes data from AppleScript")
        except Exception as e:
            logger.error(f"Failed to extract notes: {e}")
            raise
    
    def get_folders(self) -> List[str]:
        """Get list of all note folders."""
        script = '''
        set foldersList to {}
        
        tell application "Notes"
            repeat with theFolder in folders of default account
                set folderName to name of theFolder as string
                set foldersList to foldersList & folderName
            end repeat
        end tell
        
        return my joinList(foldersList, "|")
        
        on joinList(lst, delimiter)
            set prevTIDs to text item delimiters of AppleScript
            set text item delimiters of AppleScript to delimiter
            set result to lst as string
            set text item delimiters of AppleScript to prevTIDs
            return result
        end joinList
        '''
        
        try:
            result = self._run_applescript(script)
            folders = [folder.strip() for folder in result.split('|') if folder.strip()]
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
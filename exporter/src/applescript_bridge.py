#!/usr/bin/env python3
"""
AppleScript Bridge for Apple Notes Access

This module provides a Python interface to Apple Notes via AppleScript.
It handles note extraction, metadata collection, and folder management.
"""

import html
import json
import logging
import os
import re
import subprocess
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple, Union

logger = logging.getLogger(__name__)


def _thread_id() -> str:
    """Get a short thread identifier for logging."""
    thread = threading.current_thread()
    # Use last 4 chars of thread name or id for brevity
    if thread.name.startswith("ThreadPoolExecutor"):
        return f"T{thread.name.split('_')[-1]}"
    return f"T{thread.ident % 1000:03d}"


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

    def _fetch_notes_batch(self, start_index: int, end_index: int) -> str:
        """
        Fetch a batch of notes in a single AppleScript call.

        Args:
            start_index: Starting note index (1-based)
            end_index: Ending note index (inclusive)

        Returns:
            Raw AppleScript output with notes separated by record delimiter
        """
        batch_size = end_index - start_index + 1
        tid = _thread_id()
        logger.info(f"  [{tid}] 🚀 Batch {start_index}-{end_index} ({batch_size} notes): Starting AppleScript...")
        batch_start = time.time()

        batch_script = f'''
        tell application "Notes"
            set outputList to {{}}
            set recordDelim to "<<<RECORD>>>"
            set fieldDelim to "|||"

            repeat with i from {start_index} to {end_index}
                try
                    set theNote to note i of default account
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

                        set noteRecord to noteName & fieldDelim & noteBody & fieldDelim & creString & fieldDelim & modString & fieldDelim & folderName & fieldDelim & noteID
                        set end of outputList to noteRecord
                    else
                        set end of outputList to "LOCKED"
                    end if
                on error errMsg
                    set end of outputList to "ERROR:" & errMsg
                end try
            end repeat

            -- Join all records with delimiter
            set AppleScript's text item delimiters to recordDelim
            set outputText to outputList as text
            set AppleScript's text item delimiters to ""
            return outputText
        end tell
        '''
        result = self._run_applescript(batch_script)
        batch_elapsed = time.time() - batch_start
        logger.info(f"  [{tid}] ✅ Batch {start_index}-{end_index}: Done in {batch_elapsed:.2f}s ({batch_elapsed/batch_size:.3f}s/note)")
        return result

    def get_all_notes(self, folder_filter: Optional[str] = None) -> List[Dict]:
        """
        Get all notes from Apple Notes with optional filtering.
        Uses batched AppleScript calls for improved performance.

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

            overall_start = time.time()
            count_result = self._run_applescript(count_script)
            total_notes = int(count_result.strip())
            logger.info(f"Total notes in account: {total_notes}")

            if total_notes == 0:
                return []

            notes_data = []
            max_notes = 9999
            seen_ids = set()  # Track unique note IDs to avoid duplicates
            notes_to_fetch = min(total_notes, max_notes)

            # Process notes in parallel batches
            num_batches = (notes_to_fetch + self.batch_size - 1) // self.batch_size
            max_workers = min(4, num_batches)  # Limit concurrent AppleScript processes

            # Visual workflow header
            logger.info(f"")
            logger.info(f"╔{'═' * 60}╗")
            logger.info(f"║  📋 PARALLEL BATCH FETCH: {notes_to_fetch} notes → {num_batches} batches")
            logger.info(f"║  🔧 Config: batch_size={self.batch_size}, workers={max_workers}")
            logger.info(f"╚{'═' * 60}╝")

            # Build batch ranges
            batch_ranges = []
            for batch_num in range(num_batches):
                start_index = batch_num * self.batch_size + 1
                end_index = min((batch_num + 1) * self.batch_size, notes_to_fetch)
                batch_ranges.append((batch_num, start_index, end_index))

            # Show batch plan
            logger.info(f"")
            logger.info(f"  📊 Batch Plan:")
            for batch_num, start, end in batch_ranges:
                logger.info(f"     Batch {batch_num + 1}: notes {start}-{end} ({end - start + 1} notes)")
            logger.info(f"")

            # Process batches in parallel
            batch_results = {}
            completed_count = 0
            logger.info(f"  🏁 Starting parallel execution...")
            logger.info(f"  ┌{'─' * 58}┐")

            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                future_to_batch = {
                    executor.submit(self._fetch_notes_batch, start, end): (batch_num, start, end)
                    for batch_num, start, end in batch_ranges
                }

                for future in as_completed(future_to_batch):
                    batch_num, start, end = future_to_batch[future]
                    try:
                        batch_results[batch_num] = future.result()
                        completed_count += 1
                        progress = "█" * completed_count + "░" * (num_batches - completed_count)
                        logger.info(f"  │ [{progress}] {completed_count}/{num_batches} batches complete")
                    except Exception as e:
                        completed_count += 1
                        logger.warning(f"  │ ❌ Batch {batch_num + 1} failed: {e}")
                        batch_results[batch_num] = ""

            logger.info(f"  └{'─' * 58}┘")
            logger.info(f"  🎉 All batches fetched!")

            # Parse results in order
            logger.info(f"")
            logger.info(f"  📝 Parsing batch results...")
            parse_start = time.time()
            total_locked = 0
            total_archived = 0
            total_duplicates = 0
            total_filtered = 0
            total_private = 0

            for batch_num in range(num_batches):
                batch_result = batch_results.get(batch_num, "")
                if not batch_result:
                    continue

                records = batch_result.split('<<<RECORD>>>')

                for record in records:
                    record = record.strip()
                    if not record:
                        continue
                    if record == "LOCKED":
                        total_locked += 1
                        continue
                    if record.startswith("ERROR:"):
                        logger.debug(f"Batch note error: {record}")
                        continue

                    parts = record.split('|||')

                    if len(parts) >= 6:
                        note_id = parts[5].strip()

                        # Skip duplicates
                        if note_id in seen_ids:
                            total_duplicates += 1
                            logger.debug(f"Skipping duplicate note: {parts[0].strip()}")
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
                            total_filtered += 1
                            continue

                        # Skip notes from Archive folders
                        if self._is_archive_folder(note_dict["noteFolder"]):
                            total_archived += 1
                            logger.debug(f"Skipping note from Archive folder: {note_dict['noteFolder']}")
                            continue

                        # Skip notes with #private tag
                        hashtags = self.extract_hashtags(note_body)
                        if "private" in hashtags:
                            total_private += 1
                            logger.debug(f"Skipping private note: {note_dict['noteName']}")
                            continue

                        notes_data.append(note_dict)
                    else:
                        logger.warning(f"Batch record: Insufficient parts in result")

            parse_elapsed = time.time() - parse_start
            overall_elapsed = time.time() - overall_start

            # Summary stats
            logger.info(f"")
            logger.info(f"╔{'═' * 60}╗")
            logger.info(f"║  📊 FETCH SUMMARY")
            logger.info(f"╠{'═' * 60}╣")
            logger.info(f"║  ✅ Collected:  {len(notes_data)} notes")
            logger.info(f"║  🔒 Locked:     {total_locked} notes")
            logger.info(f"║  📦 Archived:   {total_archived} notes")
            logger.info(f"║  🔐 Private:    {total_private} notes")
            logger.info(f"║  🔄 Duplicates: {total_duplicates} notes")
            logger.info(f"║  🚫 Filtered:   {total_filtered} notes")
            logger.info(f"╠{'═' * 60}╣")
            logger.info(f"║  ⏱️  Fetch time:  {overall_elapsed - parse_elapsed:.2f}s")
            logger.info(f"║  ⏱️  Parse time:  {parse_elapsed:.2f}s")
            logger.info(f"║  ⏱️  Total time:  {overall_elapsed:.2f}s ({overall_elapsed/max(len(notes_data), 1):.3f}s/note)")
            logger.info(f"╚{'═' * 60}╝")

            logger.info(f"Successfully extracted {len(notes_data)} unique notes from first {max_notes} (found {len(seen_ids)} unique IDs)")
            logger.info(f"⏱️  Total fetch time: {overall_elapsed:.2f}s ({overall_elapsed/max(len(notes_data), 1):.3f}s per note average)")
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

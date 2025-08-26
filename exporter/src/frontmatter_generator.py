#!/usr/bin/env python3
"""
Smart Frontmatter Generator using Anthropic's Claude API

This module generates intelligent frontmatter for markdown notes
by analyzing the content and generating relevant metadata.
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

from anthropic import Anthropic

# Load environment variables from .env file
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Try to load .env from the exporter directory
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    logger.info(f"Loaded .env file from {env_path}")
else:
    # Try current directory as fallback
    load_dotenv()

class SmartFrontmatterGenerator:
    """Generates intelligent frontmatter using Claude API."""
    
    def __init__(self, api_key: Optional[str] = None, author_name: Optional[str] = None):
        """
        Initialize the frontmatter generator.
        
        Args:
            api_key: Anthropic API key. If not provided, uses ANTHROPIC_API_KEY env var
            author_name: Author name for frontmatter. If not provided, uses AUTHOR_NAME env var or default
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.author_name = author_name or os.environ.get("AUTHOR_NAME", "Sai Nimmagadda")
        
        if not self.api_key:
            logger.warning("No Anthropic API key found. Smart frontmatter generation will be disabled.")
            logger.info("To enable: Add ANTHROPIC_API_KEY to your .env file")
            self.client = None
        else:
            try:
                self.client = Anthropic(api_key=self.api_key)
                logger.info("Anthropic client initialized for smart frontmatter generation")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")
                self.client = None
    
    def generate_frontmatter(
        self, 
        content: str, 
        existing_metadata: Dict[str, Any],
        fallback_only: bool = False
    ) -> Dict[str, Any]:
        """
        Generate smart frontmatter for a note.
        
        Args:
            content: The markdown content of the note
            existing_metadata: Existing metadata from the note (title, date, folder, etc.)
            fallback_only: If True, only use fallback generation without API
            
        Returns:
            Dictionary containing frontmatter fields
        """
        # Always include basic metadata
        frontmatter = {
            "title": existing_metadata.get("title", "Untitled Note"),
            "date": existing_metadata.get("created", datetime.now().strftime("%Y-%m-%d")),
            "author": self.author_name
        }
        
        # If no API client or fallback only, use basic generation
        if not self.client or fallback_only:
            return self._generate_fallback_frontmatter(content, existing_metadata, frontmatter)
        
        try:
            # Use Claude API to generate smart frontmatter
            enhanced_frontmatter = self._generate_with_claude(content, frontmatter)
            return enhanced_frontmatter
            
        except Exception as e:
            logger.error(f"Error generating smart frontmatter with Claude: {e}")
            # Fall back to basic generation
            return self._generate_fallback_frontmatter(content, existing_metadata, frontmatter)
    
    def _generate_with_claude(self, content: str, base_frontmatter: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate frontmatter using Claude API.
        
        Args:
            content: The markdown content
            base_frontmatter: Base frontmatter with title, date, author
            
        Returns:
            Enhanced frontmatter dictionary
        """
        # Prepare the prompt for Claude
        prompt = self._create_prompt(content, base_frontmatter)
        
        try:
            # Call Claude API with Haiku model for efficiency
            # Rate limiting is handled at the export level with delays between notes
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                temperature=0.3,  # Lower temperature for more consistent output
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse the response
            generated_text = response.content[0].text if response.content else ""
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', generated_text, re.DOTALL)
            if json_match:
                try:
                    generated_metadata = json.loads(json_match.group())
                    
                    # Merge with base frontmatter
                    frontmatter = {**base_frontmatter, **generated_metadata}
                    
                    # Ensure required fields
                    frontmatter["author"] = self.author_name  # Use configured author
                    
                    # Validate and clean the frontmatter
                    return self._validate_frontmatter(frontmatter)
                    
                except json.JSONDecodeError:
                    logger.warning("Failed to parse JSON from Claude response")
                    return base_frontmatter
            else:
                logger.warning("No JSON found in Claude response")
                return base_frontmatter
                
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            raise
    
    def _create_prompt(self, content: str, base_frontmatter: Dict[str, Any]) -> str:
        """
        Create the prompt for Claude to generate frontmatter.
        
        Args:
            content: The markdown content
            base_frontmatter: Base frontmatter data
            
        Returns:
            Formatted prompt string
        """
        # Truncate content if too long (to save tokens)
        max_content_length = 3000
        truncated_content = content[:max_content_length] if len(content) > max_content_length else content
        
        prompt = f"""Analyze this note content and generate appropriate frontmatter metadata.

Note content:
{truncated_content}

Current title: {base_frontmatter.get('title', 'Untitled')}

Generate a JSON object with these fields:
- slug: URL-friendly version of the title (lowercase, hyphens)
- category: Main category (e.g., "Technology", "Food", "Personal", "Business", "Health", "Travel", "Education")
- tags: Array of 3-8 relevant tags based on the content
- excerpt: 1-2 sentence summary of the note (max 160 characters)

Return ONLY a valid JSON object, no additional text.

Example output:
{{
  "slug": "coffee-reviews",
  "category": "Food",
  "tags": ["coffee", "reviews", "beverages", "brewing"],
  "excerpt": "Personal coffee tasting notes and reviews, featuring various roasters and brewing methods."
}}"""
        
        return prompt
    
    def _generate_fallback_frontmatter(
        self, 
        content: str, 
        existing_metadata: Dict[str, Any],
        base_frontmatter: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate basic frontmatter without API.
        
        Args:
            content: The markdown content
            existing_metadata: Existing metadata
            base_frontmatter: Base frontmatter data
            
        Returns:
            Frontmatter dictionary
        """
        title = base_frontmatter.get("title", "Untitled Note")
        
        # Generate slug from title
        slug = self._generate_slug(title)
        
        # Try to determine category from folder
        folder = existing_metadata.get("folder", "Notes")
        category = self._folder_to_category(folder)
        
        # Extract basic tags from content
        tags = self._extract_basic_tags(content, title)
        
        # Generate basic excerpt
        excerpt = self._generate_excerpt(content, title)
        
        return {
            **base_frontmatter,
            "slug": slug,
            "category": category,
            "tags": tags,
            "excerpt": excerpt
        }
    
    def _generate_slug(self, title: str) -> str:
        """Generate a URL-friendly slug from title."""
        # Convert to lowercase
        slug = title.lower()
        
        # Replace spaces and special characters with hyphens
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        
        # Limit length
        if len(slug) > 50:
            slug = slug[:50].rsplit('-', 1)[0]
        
        return slug or "untitled"
    
    def _folder_to_category(self, folder: str) -> str:
        """Map folder name to category."""
        folder_lower = folder.lower()
        
        # Common folder to category mappings
        category_map = {
            "work": "Business",
            "personal": "Personal",
            "recipes": "Food",
            "travel": "Travel",
            "tech": "Technology",
            "health": "Health",
            "fitness": "Health",
            "education": "Education",
            "learning": "Education",
            "projects": "Projects",
            "ideas": "Ideas",
            "journal": "Personal",
            "diary": "Personal",
            "meetings": "Business",
            "research": "Research"
        }
        
        for key, value in category_map.items():
            if key in folder_lower:
                return value
        
        # Default category
        return "Personal"
    
    def _extract_basic_tags(self, content: str, title: str) -> List[str]:
        """Extract basic tags from content."""
        tags = []
        
        # Extract hashtags if present
        hashtags = re.findall(r'#(\w+)', content)
        tags.extend([tag.lower() for tag in hashtags[:5]])
        
        # Common keywords to look for
        keywords = {
            "recipe": ["cooking", "food"],
            "meeting": ["business", "work"],
            "workout": ["fitness", "health"],
            "travel": ["travel", "vacation"],
            "code": ["programming", "development"],
            "design": ["design", "ui"],
            "book": ["reading", "books"],
            "movie": ["movies", "entertainment"],
            "music": ["music", "audio"],
            "photo": ["photography", "images"],
            "video": ["video", "media"],
            "project": ["projects", "work"],
            "idea": ["ideas", "brainstorming"],
            "todo": ["tasks", "productivity"],
            "list": ["lists", "organization"]
        }
        
        content_lower = content.lower()
        for keyword, associated_tags in keywords.items():
            if keyword in content_lower or keyword in title.lower():
                tags.extend(associated_tags)
        
        # Remove duplicates and limit to 8 tags
        unique_tags = list(dict.fromkeys(tags))[:8]
        
        # If no tags found, add generic one
        if not unique_tags:
            unique_tags = ["notes"]
        
        return unique_tags
    
    def _generate_excerpt(self, content: str, title: str) -> str:
        """Generate a basic excerpt from content."""
        # Remove markdown formatting
        clean_content = re.sub(r'#+ ', '', content)  # Remove headers
        clean_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_content)  # Remove bold
        clean_content = re.sub(r'\*([^*]+)\*', r'\1', clean_content)  # Remove italic
        clean_content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean_content)  # Remove links
        clean_content = re.sub(r'!\[([^\]]*)\]\([^)]+\)', '', clean_content)  # Remove images
        clean_content = re.sub(r'`[^`]+`', '', clean_content)  # Remove inline code
        clean_content = re.sub(r'```[^```]+```', '', clean_content, flags=re.DOTALL)  # Remove code blocks
        clean_content = re.sub(r'\n+', ' ', clean_content)  # Replace newlines with spaces
        clean_content = re.sub(r'\s+', ' ', clean_content)  # Normalize spaces
        
        # Get first meaningful sentence
        sentences = re.split(r'[.!?]+', clean_content)
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Skip very short sentences
                excerpt = sentence
                break
        else:
            # If no good sentence found, use beginning of content
            excerpt = clean_content[:100].strip()
        
        # Ensure excerpt is not too long
        if len(excerpt) > 160:
            excerpt = excerpt[:157] + "..."
        
        # If excerpt is too short or empty, use title-based excerpt
        if len(excerpt) < 20:
            excerpt = f"Notes about {title.lower()}"
        
        return excerpt
    
    def _validate_frontmatter(self, frontmatter: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and clean frontmatter data.
        
        Args:
            frontmatter: Raw frontmatter dictionary
            
        Returns:
            Validated and cleaned frontmatter
        """
        # Ensure all required fields exist
        required_fields = ["title", "slug", "date", "category", "tags", "excerpt", "author"]
        
        for field in required_fields:
            if field not in frontmatter:
                if field == "slug":
                    frontmatter["slug"] = self._generate_slug(frontmatter.get("title", "untitled"))
                elif field == "category":
                    frontmatter["category"] = "Personal"
                elif field == "tags":
                    frontmatter["tags"] = ["notes"]
                elif field == "excerpt":
                    frontmatter["excerpt"] = f"Notes from {frontmatter.get('title', 'untitled')}"
                elif field == "author":
                    frontmatter["author"] = self.author_name
        
        # Validate data types
        if not isinstance(frontmatter.get("tags"), list):
            frontmatter["tags"] = [str(frontmatter.get("tags", "notes"))]
        
        # Ensure tags are strings
        frontmatter["tags"] = [str(tag) for tag in frontmatter["tags"]]
        
        # Limit number of tags
        if len(frontmatter["tags"]) > 10:
            frontmatter["tags"] = frontmatter["tags"][:10]
        
        # Validate excerpt length
        if len(frontmatter.get("excerpt", "")) > 200:
            frontmatter["excerpt"] = frontmatter["excerpt"][:197] + "..."
        
        # Ensure slug is URL-safe
        frontmatter["slug"] = re.sub(r'[^a-z0-9-]', '', frontmatter["slug"].lower())
        
        return frontmatter
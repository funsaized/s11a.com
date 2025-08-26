#!/usr/bin/env node
/**
 * MDX Validator for Apple Notes Exporter
 * 
 * This script validates MDX content using the official @mdx-js/mdx compiler.
 * It checks for proper frontmatter, valid JSX syntax, and MDX compatibility.
 */

import { compile } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';

/**
 * Auto-fix MDX content by wrapping code patterns in proper code blocks
 * @param {string} content - MDX content to fix
 * @returns {string} Fixed MDX content
 */
function autoFixMDX(content) {
    const lines = content.split('\n');
    const fixedLines = [];
    let i = 0;
    let inCodeBlock = false;
    
    // Code patterns that should be wrapped in code blocks
    const codePatterns = [
        /^(interface|type|const|let|var|function|class|export|import)\s+/,
        /SCHEMA.*=.*\{/,
        /<\w+[^>]*(?:>|\/?>)/,
        /^\s*\w+\s*:\s*\w+\s*[,}]/,
        /\w+\([^)]*\{[^}]*\}[^)]*\)/
    ];
    
    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Track code block state
        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            fixedLines.push(line);
            i++;
            continue;
        }
        
        // Skip lines already in code blocks
        if (inCodeBlock) {
            fixedLines.push(line);
            i++;
            continue;
        }
        
        // Check if this line should start a code block
        const shouldBeCode = codePatterns.some(pattern => pattern.test(trimmed));
        
        if (shouldBeCode) {
            // Detect language
            let lang = '';
            if (/^(interface|type|const|let|var|function|export|import)/.test(trimmed)) {
                lang = /<\w+[^>]*>/.test(trimmed) ? 'tsx' : 'typescript';
            } else if (/SCHEMA.*=.*\{/.test(trimmed)) {
                lang = 'python';
            } else if (/<\w+[^>]*>/.test(trimmed)) {
                lang = 'tsx';
            }
            
            // Extract the code block
            const codeLines = [line];
            let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            i++;
            
            // Continue until braces are balanced or we hit a natural break
            while (i < lines.length && braceCount > 0) {
                const nextLine = lines[i];
                codeLines.push(nextLine);
                braceCount += (nextLine.match(/\{/g) || []).length - (nextLine.match(/\}/g) || []).length;
                i++;
                
                // Safety limit
                if (codeLines.length > 20) break;
            }
            
            // Wrap in code block
            fixedLines.push(`\`\`\`${lang}`);
            fixedLines.push(...codeLines);
            fixedLines.push('```');
        } else {
            // For non-code lines, escape problematic braces
            let fixedLine = line;
            
            // Simple brace escaping for isolated braces (not in obvious code context)
            if (!line.includes('```') && !codePatterns.some(p => p.test(line))) {
                // Escape isolated opening braces
                fixedLine = fixedLine.replace(/\{(?![^}]*\})/g, '\\{');
                // Escape isolated closing braces  
                fixedLine = fixedLine.replace(/(?<!\{[^{]*)\}/g, '\\}');
            }
            
            fixedLines.push(fixedLine);
            i++;
        }
    }
    
    return fixedLines.join('\n');
}

/**
 * Validate and optionally fix MDX content
 * @param {string} content - MDX content to validate
 * @param {boolean} autoFix - Whether to attempt auto-fixing
 * @returns {object} Validation result with valid flag and any errors, plus fixed content if requested
 */
async function validateMDX(content, autoFix = false) {
    const result = {
        valid: true,
        errors: [],
        warnings: [],
        details: {},
        fixedContent: null
    };

    // Auto-fix if requested
    let contentToValidate = content;
    if (autoFix) {
        contentToValidate = autoFixMDX(content);
        result.fixedContent = contentToValidate;
    }

    try {
        // First, validate YAML frontmatter if present
        if (contentToValidate.startsWith('---')) {
            const frontmatterEnd = contentToValidate.indexOf('---', 3);
            if (frontmatterEnd === -1) {
                result.valid = false;
                result.errors.push({
                    type: 'frontmatter',
                    message: 'Unclosed frontmatter block - missing closing ---'
                });
                return result;
            }

            const frontmatterContent = contentToValidate.substring(3, frontmatterEnd).trim();
            try {
                const frontmatterData = yaml.load(frontmatterContent);
                result.details.frontmatter = frontmatterData;
                
                // Check for required Gatsby fields
                const requiredFields = ['title', 'date'];
                for (const field of requiredFields) {
                    if (!frontmatterData[field]) {
                        result.warnings.push({
                            type: 'frontmatter',
                            message: `Missing recommended field: ${field}`
                        });
                    }
                }
            } catch (yamlError) {
                result.valid = false;
                result.errors.push({
                    type: 'frontmatter',
                    message: `Invalid YAML syntax: ${yamlError.message}`,
                    details: yamlError.toString()
                });
                return result;
            }
        }

        // Compile MDX to check for syntax errors
        const compiled = await compile(contentToValidate, {
            remarkPlugins: [
                remarkFrontmatter,
                remarkGfm
            ],
            // Don't generate actual output, just validate
            outputFormat: 'function-body',
            development: false
        });

        // If compilation succeeded, check for common issues
        const contentBody = contentToValidate.replace(/^---[\s\S]*?---\n*/, '');
        
        // Check for common MDX issues
        if (contentBody.includes('****')) {
            result.warnings.push({
                type: 'markdown',
                message: 'Found **** which may render incorrectly - use ** for bold'
            });
        }

        if (contentBody.includes('<!--') && !contentBody.includes('{/*')) {
            result.warnings.push({
                type: 'jsx',
                message: 'HTML comments found - consider using JSX comments {/* */} for MDX'
            });
        }

        // Check for unbalanced curly braces (common JSX issue)
        const openBraces = (contentBody.match(/{/g) || []).length;
        const closeBraces = (contentBody.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            result.warnings.push({
                type: 'jsx',
                message: `Potentially unbalanced curly braces: ${openBraces} opening, ${closeBraces} closing`
            });
        }

        // Check for invalid JSX patterns
        if (contentBody.match(/<[^>]*\/[^>]*>/)) {
            const selfClosingTags = contentBody.match(/<[^>]*\/>/g) || [];
            for (const tag of selfClosingTags) {
                if (!tag.match(/<\w+[^>]*\/>/)) {
                    result.warnings.push({
                        type: 'jsx',
                        message: `Potentially malformed self-closing tag: ${tag}`
                    });
                }
            }
        }

        result.details.stats = {
            lines: contentToValidate.split('\n').length,
            characters: contentToValidate.length,
            hasFrontmatter: contentToValidate.startsWith('---'),
            hasJSX: contentBody.includes('<') && contentBody.includes('>'),
            hasExpressions: contentBody.includes('{') && contentBody.includes('}'),
            wasAutoFixed: autoFix
        };

    } catch (error) {
        result.valid = false;
        
        // Parse MDX compilation errors
        const errorMessage = error.message || error.toString();
        
        // Extract specific MDX error patterns
        if (errorMessage.includes('Could not parse import/exports')) {
            result.errors.push({
                type: 'mdx',
                message: 'Invalid import/export syntax',
                details: errorMessage
            });
        } else if (errorMessage.includes('Unexpected end of file')) {
            result.errors.push({
                type: 'mdx',
                message: 'Unexpected end of file - likely unclosed JSX tag or expression',
                details: errorMessage
            });
        } else if (errorMessage.includes('Expected a closing tag')) {
            result.errors.push({
                type: 'jsx',
                message: 'Unclosed JSX tag',
                details: errorMessage
            });
        } else if (errorMessage.includes('Could not parse expression')) {
            result.errors.push({
                type: 'jsx',
                message: 'Invalid JavaScript expression in curly braces',
                details: errorMessage
            });
        } else {
            result.errors.push({
                type: 'mdx',
                message: 'MDX compilation failed',
                details: errorMessage
            });
        }

        // Try to extract line number from error
        const lineMatch = errorMessage.match(/(\d+):(\d+)/);
        if (lineMatch) {
            result.errors[result.errors.length - 1].line = parseInt(lineMatch[1]);
            result.errors[result.errors.length - 1].column = parseInt(lineMatch[2]);
        }
    }

    return result;
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    let autoFix = false;
    let filepath = null;
    
    // Parse arguments
    for (const arg of args) {
        if (arg === '--fix') {
            autoFix = true;
        } else if (arg !== '-') {
            filepath = arg;
        }
    }
    
    if (args.length === 0 || (!filepath && !args.includes('-'))) {
        console.error('Usage: node mdx_validator.js [--fix] <file.mdx> or provide content via stdin');
        console.error('  --fix: Attempt to auto-fix MDX issues');
        process.exit(1);
    }

    let content;
    
    if (args.includes('-')) {
        // Read from stdin
        content = readFileSync(0, 'utf-8');
    } else {
        // Read from file
        try {
            content = readFileSync(filepath, 'utf-8');
        } catch (error) {
            console.error(`Error reading file: ${error.message}`);
            process.exit(1);
        }
    }

    const result = await validateMDX(content, autoFix);
    
    // Output JSON result
    console.log(JSON.stringify(result, null, 2));
    
    // Exit with appropriate code
    process.exit(result.valid ? 0 : 1);
}

// Export for use as module
export { validateMDX };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
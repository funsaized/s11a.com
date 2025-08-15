import React, { useState, useRef } from "react";
import { Check, Copy, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  collapsible?: boolean;
  className?: string;
}

export function CodeBlock({
  children,
  language = "text",
  title,
  fileName,
  showLineNumbers = true,
  maxHeight = "400px",
  collapsible = false,
  className,
}: CodeBlockProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const getLanguageLabel = (lang: string): string => {
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      ts: "TypeScript",
      jsx: "React",
      tsx: "React TypeScript",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      kt: "Kotlin",
      swift: "Swift",
      dart: "Dart",
      scala: "Scala",
      sh: "Shell",
      bash: "Bash",
      zsh: "Zsh",
      fish: "Fish",
      powershell: "PowerShell",
      sql: "SQL",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      less: "Less",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
      yml: "YAML",
      toml: "TOML",
      ini: "INI",
      conf: "Config",
      md: "Markdown",
      mdx: "MDX",
      vue: "Vue",
      svelte: "Svelte",
      dockerfile: "Dockerfile",
      nginx: "Nginx",
      apache: "Apache",
      text: "Plain Text",
    };
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  const lines = children.split("\n");
  const shouldShowToggle = collapsible && lines.length > 10;

  return (
    <div 
      className={cn(
        "relative group rounded-lg border bg-muted/30 overflow-hidden",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {title || fileName || getLanguageLabel(language)}
          </span>
          {fileName && (
            <span className="text-xs text-muted-foreground px-2 py-1 bg-background/50 rounded">
              {fileName}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {shouldShowToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-7 w-7 p-0 hover:bg-background/50"
                  aria-label={expanded ? "Collapse code" : "Expand code"}
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {expanded ? "Collapse" : "Expand"}
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0 hover:bg-background/50"
                aria-label="Copy code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {copied ? "Copied!" : "Copy code"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Code Content */}
      <div 
        className={cn(
          "relative transition-all duration-300 ease-in-out",
          !expanded && shouldShowToggle && "max-h-60 overflow-hidden"
        )}
      >
        <pre 
          className={cn(
            "overflow-auto p-4 text-sm font-mono leading-relaxed",
            !expanded && "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          )}
          style={{ 
            maxHeight: expanded ? maxHeight : undefined 
          }}
        >
          <code 
            ref={codeRef}
            className={cn(
              `language-${language}`,
              "block whitespace-pre"
            )}
          >
            {showLineNumbers ? (
              lines.map((line, index) => (
                <div key={index} className="table-row">
                  <span 
                    className="table-cell select-none text-right pr-4 text-muted-foreground w-10 sticky left-0 bg-muted/30"
                    style={{ minWidth: '2.5rem' }}
                  >
                    {index + 1}
                  </span>
                  <span className="table-cell">
                    {line}
                  </span>
                </div>
              ))
            ) : (
              children
            )}
          </code>
        </pre>
        
        {/* Fade overlay when collapsed */}
        {!expanded && shouldShowToggle && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

// Export component variants for different use cases
export const InlineCodeBlock = ({ 
  children, 
  className 
}: { 
  children: string; 
  className?: string;
}) => (
  <code 
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      "border border-border/50",
      className
    )}
  >
    {children}
  </code>
);

export const SimpleCodeBlock = ({ 
  children, 
  language,
  className 
}: { 
  children: string; 
  language?: string;
  className?: string;
}) => (
  <CodeBlock
    className={className}
    showLineNumbers={false}
    collapsible={false}
  >
    {children}
  </CodeBlock>
);

export const CollapsibleCodeBlock = ({ 
  children,
  language,
  title,
  className 
}: { 
  children: string; 
  language?: string;
  title?: string;
  className?: string;
}) => (
  <CodeBlock
    className={className}
    language={language}
    title={title}
    collapsible={true}
  >
    {children}
  </CodeBlock>
);

export default CodeBlock;
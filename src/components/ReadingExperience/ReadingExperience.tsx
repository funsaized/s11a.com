import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Type,
  Volume2,
  VolumeX,
  Printer,
  Download,
  Eye,
  EyeOff,
  Settings,
  Minus,
  Plus,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "../../context/ThemeContext";

interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  readingWidth: "narrow" | "normal" | "wide";
  readingMode: boolean;
  dyslexicFont: boolean;
}

interface ReadingExperienceProps {
  articleId?: string;
  className?: string;
}

const fontFamilies = [
  { name: "Inter", value: "font-sans", label: "Sans Serif" },
  { name: "Georgia", value: "font-serif", label: "Serif" },
  { name: "JetBrains Mono", value: "font-mono", label: "Monospace" },
];

const widthOptions = [
  { name: "narrow", label: "Narrow", maxWidth: "65ch" },
  { name: "normal", label: "Normal", maxWidth: "75ch" },
  { name: "wide", label: "Wide", maxWidth: "100ch" },
] as const;

export function ReadingExperience({
  articleId,
  className,
}: ReadingExperienceProps): React.ReactElement {
  const [preferences, setPreferences] = useState<ReadingPreferences>({
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: "font-sans",
    readingWidth: "normal",
    readingMode: false,
    dyslexicFont: false,
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const { resolvedTheme } = useTheme();

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reading-preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn("Failed to load reading preferences:", error);
    }

    // Check speech synthesis support
    setSpeechSupported("speechSynthesis" in window);
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback(
    (updates: Partial<ReadingPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      try {
        localStorage.setItem(
          "reading-preferences",
          JSON.stringify(newPreferences),
        );
      } catch (error) {
        console.warn("Failed to save reading preferences:", error);
      }
    },
    [preferences],
  );

  // Apply CSS custom properties for reading preferences
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--reading-font-size", `${preferences.fontSize}px`);
    root.style.setProperty(
      "--reading-line-height",
      `${preferences.lineHeight}`,
    );
    root.style.setProperty(
      "--reading-width",
      widthOptions.find((w) => w.name === preferences.readingWidth)?.maxWidth ||
        "75ch",
    );

    // Toggle reading mode class
    if (preferences.readingMode) {
      document.body.classList.add("reading-mode");
    } else {
      document.body.classList.remove("reading-mode");
    }

    // Apply font family to article content
    const articleContent = articleId
      ? document.getElementById(articleId)
      : null;
    if (articleContent) {
      articleContent.className = cn(
        articleContent.className,
        preferences.fontFamily,
        preferences.dyslexicFont && "dyslexic-font",
      );
    }
  }, [preferences, articleId]);

  // Text-to-speech functionality
  const handleTextToSpeech = useCallback(() => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const content = articleId
      ? document.getElementById(articleId)?.textContent
      : document.querySelector("article")?.textContent ||
        document.querySelector("main")?.textContent;

    if (!content) return;

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speechSupported, isSpeaking, articleId]);

  // Print functionality
  const handlePrint = useCallback(() => {
    // Apply print-friendly styles temporarily
    document.body.classList.add("print-mode");

    setTimeout(() => {
      window.print();
      document.body.classList.remove("print-mode");
    }, 100);
  }, []);

  // Export functionality (simplified - could be enhanced for different formats)
  const handleExport = useCallback(() => {
    const content = articleId
      ? document.getElementById(articleId)?.innerHTML
      : document.querySelector("article")?.innerHTML || "";

    if (!content) return;

    const blob = new Blob(
      [
        `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exported Article</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
            h1, h2, h3, h4, h5, h6 { margin-top: 2em; margin-bottom: 1em; }
            p { margin-bottom: 1em; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            pre { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `,
      ],
      { type: "text/html" },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [articleId]);

  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        {/* Reading Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updatePreferences({ readingMode: !preferences.readingMode })
              }
              className={cn(
                "h-8 w-8 p-0",
                preferences.readingMode && "bg-accent",
              )}
              aria-label="Toggle reading mode"
            >
              {preferences.readingMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {preferences.readingMode
              ? "Exit reading mode"
              : "Enter reading mode"}
          </TooltipContent>
        </Tooltip>

        {/* Text-to-Speech */}
        {speechSupported && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTextToSpeech}
                className={cn("h-8 w-8 p-0", isSpeaking && "bg-accent")}
                aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSpeaking ? "Stop reading" : "Read aloud"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Print */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="h-8 w-8 p-0"
              aria-label="Print article"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print article</TooltipContent>
        </Tooltip>

        {/* Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
              aria-label="Export article"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export article</TooltipContent>
        </Tooltip>

        {/* Reading Preferences */}
        <Sheet open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
          <SheetTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Reading preferences"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reading preferences</TooltipContent>
            </Tooltip>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Reading Preferences
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Font Size */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Font Size
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updatePreferences({
                        fontSize: Math.max(12, preferences.fontSize - 2),
                      })
                    }
                    disabled={preferences.fontSize <= 12}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center text-sm">
                    {preferences.fontSize}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updatePreferences({
                        fontSize: Math.min(24, preferences.fontSize + 2),
                      })
                    }
                    disabled={preferences.fontSize >= 24}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Line Height
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updatePreferences({
                        lineHeight: Math.max(1.2, preferences.lineHeight - 0.1),
                      })
                    }
                    disabled={preferences.lineHeight <= 1.2}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center text-sm">
                    {preferences.lineHeight.toFixed(1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updatePreferences({
                        lineHeight: Math.min(2.0, preferences.lineHeight + 0.1),
                      })
                    }
                    disabled={preferences.lineHeight >= 2.0}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Font Family
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {fontFamilies.map((font) => (
                    <Button
                      key={font.value}
                      variant={
                        preferences.fontFamily === font.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updatePreferences({ fontFamily: font.value })
                      }
                      className="justify-start"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      {font.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reading Width */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Reading Width
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {widthOptions.map((width) => (
                    <Button
                      key={width.name}
                      variant={
                        preferences.readingWidth === width.name
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updatePreferences({ readingWidth: width.name })
                      }
                      className="justify-start"
                    >
                      {width.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reset to Defaults */}
              <Button
                variant="outline"
                onClick={() =>
                  updatePreferences({
                    fontSize: 16,
                    lineHeight: 1.6,
                    fontFamily: "font-sans",
                    readingWidth: "normal",
                    readingMode: false,
                    dyslexicFont: false,
                  })
                }
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Global styles for reading mode */}
      <style jsx global>{`
        .reading-mode {
          --tw-bg-opacity: 1 !important;
          background-color: ${resolvedTheme === "dark"
            ? "#1a1a1a"
            : "#fafafa"} !important;
        }

        .reading-mode .navbar,
        .reading-mode .sidebar,
        .reading-mode .footer,
        .reading-mode .reading-mode-hide {
          display: none !important;
        }

        .reading-mode main {
          max-width: var(--reading-width) !important;
          margin: 0 auto !important;
          padding: 2rem !important;
        }

        .reading-mode article {
          font-size: var(--reading-font-size) !important;
          line-height: var(--reading-line-height) !important;
        }

        .print-mode * {
          color: black !important;
          background: white !important;
        }

        .print-mode .navbar,
        .print-mode .sidebar,
        .print-mode .footer,
        .print-mode .reading-controls {
          display: none !important;
        }
      `}</style>
    </>
  );
}

export default ReadingExperience;

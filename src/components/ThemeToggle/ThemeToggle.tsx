import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "../../context/ThemeContext"
import { cn } from "@/lib/utils"
import "./ThemeToggle.css"

export interface ThemeToggleProps {
  className?: string
  showTooltip?: boolean
  enableKeyboardShortcut?: boolean
}

export function ThemeToggle({ 
  className, 
  showTooltip = true, 
  enableKeyboardShortcut = true 
}: ThemeToggleProps) {
  const { theme, toggleTheme, resolvedTheme, isLoading } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)

  // Detect platform for keyboard shortcut display
  React.useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.includes('Mac'))
  }, [])

  // Get the next theme in the cycle for tooltip
  const getNextTheme = () => {
    const themeOrder = ["light", "dark", "system"]
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    return themeOrder[nextIndex]
  }

  // Get theme description for accessibility
  const getThemeDescription = (themeType: string) => {
    switch (themeType) {
      case "light": return "Light mode"
      case "dark": return "Dark mode" 
      case "system": return "System preference"
      default: return "Light mode"
    }
  }

  // Handle theme toggle with animation
  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false)
    }, 200)
  }

  // Keyboard shortcut handler
  React.useEffect(() => {
    if (!enableKeyboardShortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T to toggle theme
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        handleToggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcut])

  // Get the appropriate icon with enhanced animations
  const getIcon = () => {
    const iconClasses = cn(
      "h-[1.2rem] w-[1.2rem] theme-toggle-icon drop-shadow-sm",
      isAnimating && "scale-95 rotate-12",
      isHovered && "scale-110"
    )

    switch (theme) {
      case "light":
        return (
          <Sun 
            className={cn(iconClasses, "theme-icon-sun")} 
            aria-hidden="true"
          />
        )
      case "dark":
        return (
          <Moon 
            className={cn(iconClasses, "theme-icon-moon")} 
            aria-hidden="true"
          />
        )
      case "system":
        return (
          <Monitor 
            className={cn(iconClasses, "theme-icon-monitor")} 
            aria-hidden="true"
          />
        )
      default:
        return (
          <Sun 
            className={cn(iconClasses, "theme-icon-sun")} 
            aria-hidden="true"
          />
        )
    }
  }

  const tooltipContent = showTooltip ? (
    <div className="text-center theme-toggle-tooltip">
      <div className="font-medium text-xs">
        {getThemeDescription(theme)}
        {theme === "system" && (
          <span className="text-muted-foreground"> ({resolvedTheme})</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        Click for {getThemeDescription(getNextTheme())}
      </div>
      {enableKeyboardShortcut && (
        <div className="text-xs text-muted-foreground mt-1 border-t border-border/50 pt-1">
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
            {isMac ? '⌘' : 'Ctrl'}
          </kbd>
          {' + '}
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
            Shift
          </kbd>
          {' + '}
          <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
            T
          </kbd>
        </div>
      )}
    </div>
  ) : null

  const buttonElement = (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        "relative theme-toggle-button",
        "hover:bg-accent/50 transition-colors duration-200",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:outline-none",
        "active:scale-95 transition-transform duration-100",
        "disabled:opacity-50 disabled:cursor-wait",
        isAnimating && "theme-toggle-switching",
        isLoading && "theme-toggle-loading",
        className
      )}
      aria-label={`Current theme: ${getThemeDescription(theme)}${theme === "system" ? ` (${resolvedTheme})` : ""}. Click to switch to ${getThemeDescription(getNextTheme())}.`}
    >
      {getIcon()}
      
      {/* Visual indicator for current theme */}
      <div 
        className={cn(
          "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full theme-indicator-dot",
          theme === "light" && "bg-amber-500 theme-icon-sun",
          theme === "dark" && "bg-blue-600 theme-icon-moon", 
          theme === "system" && "bg-violet-600 theme-icon-monitor",
          isHovered && !isLoading ? "scale-125" : "scale-100",
          isAnimating && "switching"
        )}
        aria-hidden="true"
      />
    </Button>
  )

  if (!showTooltip) {
    return buttonElement
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonElement}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  )
}

// Export variants for different use cases
export const ThemeToggleSimple = (props: Omit<ThemeToggleProps, 'showTooltip'>) => (
  <ThemeToggle {...props} showTooltip={false} />
)

export const ThemeToggleNoKeyboard = (props: Omit<ThemeToggleProps, 'enableKeyboardShortcut'>) => (
  <ThemeToggle {...props} enableKeyboardShortcut={false} />
)

export const ThemeToggleBasic = (props: Omit<ThemeToggleProps, 'showTooltip' | 'enableKeyboardShortcut'>) => (
  <ThemeToggle {...props} showTooltip={false} enableKeyboardShortcut={false} />
)
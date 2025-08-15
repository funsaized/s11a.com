import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../../context/ThemeContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  // Get the appropriate icon based on current theme
  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      case "system":
        return <Monitor className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Current theme: ${theme}. Click to cycle to next theme.`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme (current: {theme})</span>
    </Button>
  )
}
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.scss';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = '', 
  showLabel = false 
}: ThemeToggleProps): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  // Theme icons and labels
  const themeConfig = {
    light: {
      icon: '☀️',
      label: 'Light',
      ariaLabel: 'Switch to dark theme'
    },
    dark: {
      icon: '🌙',
      label: 'Dark',
      ariaLabel: 'Switch to system theme'
    },
    system: {
      icon: '💻',
      label: 'Auto',
      ariaLabel: 'Switch to light theme'
    }
  };

  const currentConfig = themeConfig[theme];

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={currentConfig.ariaLabel}
      title={`Current theme: ${currentConfig.label}. Click to cycle themes.`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {currentConfig.icon}
      </span>
      {showLabel && (
        <span className="theme-toggle__label">
          {currentConfig.label}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
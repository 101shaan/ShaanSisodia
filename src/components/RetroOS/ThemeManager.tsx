import React from 'react';

interface ThemeManagerProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({ theme, onThemeChange }) => {
  const themes = {
    matrix: {
      primary: '#00ff41',
      bg: '#000000',
      secondary: '#008f11'
    },
    amber: {
      primary: '#ffb000',
      bg: '#1a0f00',
      secondary: '#cc8800'
    },
    cyan: {
      primary: '#00ffff',
      bg: '#001a1a',
      secondary: '#00cccc'
    }
  };

  // Apply theme to CSS custom properties
  React.useEffect(() => {
    const currentTheme = themes[theme as keyof typeof themes] || themes.matrix;
    
    document.documentElement.style.setProperty('--retro-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--retro-bg', currentTheme.bg);
    document.documentElement.style.setProperty('--retro-secondary', currentTheme.secondary);
  }, [theme]);

  return null;
};
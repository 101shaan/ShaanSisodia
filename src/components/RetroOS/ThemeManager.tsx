import React from 'react';

interface ThemeManagerProps {
  theme: string;
}

export const ThemeManager: React.FC<ThemeManagerProps> = ({ theme }) => {
  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return {
          primary: '#00ff00',
          secondary: '#008800',
          background: '#000000'
        };
      case 'amber':
        return {
          primary: '#ffb000',
          secondary: '#cc8800',
          background: '#1a1a00'
        };
      case 'cyan':
        return {
          primary: '#00ffff',
          secondary: '#0088aa',
          background: '#001122'
        };
      default:
        return {
          primary: '#00ff00',
          secondary: '#008800',
          background: '#000000'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <style>{`
      .retro-terminal {
        background-color: ${colors.background};
        color: ${colors.primary};
      }
      .retro-text {
        color: ${colors.primary};
      }
      .retro-secondary {
        color: ${colors.secondary};
      }
    `}</style>
  );
};
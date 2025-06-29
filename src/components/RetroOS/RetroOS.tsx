import React, { useState, useEffect } from 'react';
import { TerminalCore } from './TerminalCore';

interface RetroOSProps {
  isActive: boolean;
  onExit: () => void;
}

export const RetroOS: React.FC<RetroOSProps> = ({ isActive, onExit }) => {
  const [currentTheme] = useState('matrix');
  const [soundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Simple loading screen that transitions to terminal after 2 seconds
  useEffect(() => {
    console.log("RetroOS mounted with isActive:", isActive);
    if (isActive) {
      const timer = setTimeout(() => {
        console.log("Loading complete, showing terminal");
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden" style={{ fontFamily: 'monospace' }}>
      {loading ? (
        // Simple loading screen
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="text-4xl font-bold mb-8" style={{ color: '#00ff41' }}>
            Loading ShaanOS...
          </div>
          <div className="w-64 h-2 bg-gray-800 rounded-full">
            <div 
              className="h-2 bg-green-500 rounded-full"
              style={{ 
                width: '100%',
                transition: 'width 2s linear',
                backgroundColor: '#00ff41'
              }}
            />
          </div>
        </div>
      ) : (
        // Terminal core - keep this as simple as possible
        <TerminalCore
          theme={currentTheme}
          soundEnabled={soundEnabled}
          onExit={onExit}
          onThemeChange={() => {}}
          onSoundToggle={() => {}}
        />
      )}
    </div>
  );
};
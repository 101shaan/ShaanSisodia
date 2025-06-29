import React, { useState, useEffect } from 'react';
import { BootSequence } from './BootSequence';
import { TerminalCore } from './TerminalCore';

interface RetroOSProps {
  isActive: boolean;
  onExit: () => void;
}

export const RetroOS: React.FC<RetroOSProps> = ({ isActive, onExit }) => {
  const [bootComplete, setBootComplete] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('matrix');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Debug info
  useEffect(() => {
    console.log('RetroOS mounted, isActive:', isActive);
    console.log('Will show boot sequence first');
    
    // Safety timeout to force terminal after 15 seconds in case boot sequence hangs
    const safetyTimer = setTimeout(() => {
      console.log('Safety timer expired, forcing terminal');
      setBootComplete(true);
    }, 15000);
    
    return () => {
      clearTimeout(safetyTimer);
      console.log('RetroOS unmounted');
    };
  }, [isActive]);

  // Simple handler for boot completion
  const handleBootComplete = () => {
    console.log('Boot sequence completed, showing terminal');
    setBootComplete(true);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {!bootComplete ? (
        <BootSequence
          onComplete={handleBootComplete}
          theme={currentTheme}
          soundEnabled={soundEnabled}
        />
      ) : (
        <TerminalCore
          theme={currentTheme}
          soundEnabled={soundEnabled}
          onExit={onExit}
          onThemeChange={setCurrentTheme}
          onSoundToggle={setSoundEnabled}
        />
      )}
    </div>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import { BootSequence } from './BootSequence';
import { TerminalCore } from './TerminalCore';

interface RetroOSProps {
  isActive: boolean;
  onExit: () => void;
}

export const RetroOS: React.FC<RetroOSProps> = ({ isActive, onExit }) => {
  const [bootComplete, setBootComplete] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('matrix');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Verbose debugging
  useEffect(() => {
    console.log("RetroOS mounted, isActive:", isActive);
    return () => {
      console.log("RetroOS unmounted");
    };
  }, [isActive]);
  
  // Track boot state changes
  useEffect(() => {
    console.log("Boot complete state changed:", bootComplete);
    
    if (bootComplete) {
      console.log("Boot complete, preparing terminal with short delay");
      // Add a delay before showing terminal to ensure smooth transition
      const timer = setTimeout(() => {
        console.log("Delay complete, showing terminal now");
        setShowTerminal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [bootComplete]);

  // Handle boot sequence completion with a memoized callback
  const handleBootComplete = useCallback(() => {
    console.log("handleBootComplete called from BootSequence");
    setBootComplete(true);
  }, []);

  // Handle exit with logging
  const handleExit = useCallback(() => {
    console.log("Exit requested from Terminal");
    onExit();
  }, [onExit]);

  // Safety check for active state
  if (!isActive) {
    console.log("RetroOS not active, returning null");
    return null;
  }
  
  console.log("Rendering RetroOS with bootComplete:", bootComplete, "showTerminal:", showTerminal);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {!bootComplete ? (
        <BootSequence
          onComplete={handleBootComplete}
          theme={currentTheme}
          soundEnabled={soundEnabled}
        />
      ) : showTerminal ? (
        <TerminalCore
          theme={currentTheme}
          soundEnabled={soundEnabled}
          onExit={handleExit}
          onThemeChange={setCurrentTheme}
          onSoundToggle={setSoundEnabled}
        />
      ) : (
        // Transition state while terminal is loading
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="text-4xl font-bold mb-8" style={{ 
            color: currentTheme === 'matrix' ? '#00ff41' : 
                  currentTheme === 'amber' ? '#ffb000' : '#00ffff' 
          }}>
            Initializing Terminal...
          </div>
          <div className="w-64 h-2 bg-gray-800 rounded-full">
            <div 
              className="h-2 rounded-full animate-pulse"
              style={{ 
                width: '100%',
                backgroundColor: currentTheme === 'matrix' ? '#00ff41' : 
                               currentTheme === 'amber' ? '#ffb000' : '#00ffff'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 text-xs p-2 bg-black bg-opacity-75 text-white">
          Boot: {bootComplete ? 'Complete' : 'In Progress'} | Terminal: {showTerminal ? 'Shown' : 'Hidden'}
        </div>
      )}
    </div>
  );
};
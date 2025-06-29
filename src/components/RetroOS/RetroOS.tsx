import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BootSequence } from './BootSequence';
import { TerminalCore } from './TerminalCore';
import { FileSystem } from './FileSystem';
import { GameEngine } from './GameEngine';
import { SoundSystem } from './SoundSystem';
import { ThemeManager } from './ThemeManager';

interface RetroOSProps {
  isActive: boolean;
  onExit: () => void;
}

export const RetroOS: React.FC<RetroOSProps> = ({ isActive, onExit }) => {
  const [bootComplete, setBootComplete] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('matrix');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug mounting
  useEffect(() => {
    console.log("RetroOS component mounted, isActive:", isActive);
    return () => {
      console.log("RetroOS component unmounted");
    };
  }, []);

  // Monitor isActive changes
  useEffect(() => {
    console.log("RetroOS isActive changed:", isActive);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      console.log("RetroOS is active, attempting to enter fullscreen");
      // Enter fullscreen mode for immersive experience
      try {
        if (containerRef.current && !isFullscreen && document.fullscreenEnabled) {
          const enterFullscreen = async () => {
            try {
              await containerRef.current?.requestFullscreen();
              setIsFullscreen(true);
              console.log("Entered fullscreen successfully");
            } catch (err) {
              console.error("Failed to enter fullscreen:", err);
            }
          };
          enterFullscreen();
        } else {
          console.log("Fullscreen not available or already in fullscreen");
        }
      } catch (err) {
        console.error("Error with fullscreen:", err);
      }
    }
  }, [isActive, isFullscreen]);

  const handleBootComplete = () => {
    console.log("Boot sequence complete, transitioning to terminal");
    setBootComplete(true);
  };

  const handleExit = () => {
    console.log("Exit requested from RetroOS");
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
      }
    } catch (err) {
      console.error("Error handling fullscreen exit:", err);
    }
    setIsFullscreen(false);
    onExit();
  };

  if (!isActive) {
    console.log("RetroOS is not active, returning null");
    return null;
  }

  console.log("Rendering RetroOS with bootComplete:", bootComplete);
  
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      style={{ fontFamily: 'monospace' }}
    >
      {/* Sound System */}
      <SoundSystem enabled={soundEnabled} />
      
      {/* Theme Manager */}
      <ThemeManager 
        theme={currentTheme} 
        onThemeChange={setCurrentTheme}
      />

      <AnimatePresence mode="wait">
        {!bootComplete ? (
          <BootSequence
            key="boot"
            onComplete={handleBootComplete}
            theme={currentTheme}
            soundEnabled={soundEnabled}
          />
        ) : (
          <TerminalCore
            key="terminal"
            theme={currentTheme}
            soundEnabled={soundEnabled}
            onExit={handleExit}
            onThemeChange={setCurrentTheme}
            onSoundToggle={setSoundEnabled}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
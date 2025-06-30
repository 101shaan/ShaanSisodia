import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
  theme: string;
  soundEnabled: boolean;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ 
  onComplete, 
  theme, 
  soundEnabled 
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);

  // Extended boot phases with LONGER durations
  const bootPhases = [
    {
      name: 'BIOS',
      messages: [
        'ShaanOS BIOS v2.1.0',
        'Copyright (C) 2025 Shaan Sisodia',
        '',
        'Performing POST (Power-On Self Test)...',
        'CPU: Intel Core i9-13900K @ 3.0GHz ✓',
        'Memory: 32768MB DDR5-5600 ✓',
        'GPU: NVIDIA RTX 4090 24GB ✓',
        'Storage: 2TB NVMe SSD ✓',
        'Network: Gigabit Ethernet ✓',
        '',
        'All systems nominal. Initializing bootloader...'
      ],
      duration: 4500  // Longer duration
    },
    {
      name: 'BOOTLOADER',
      messages: [
        'ShaanOS Bootloader v2.1',
        '========================',
        '',
        'Loading kernel modules...',
        '[████████████████████████████████] 100%',
        '',
        'Initializing memory management...',
        'Setting up virtual memory...',
        'Loading device drivers...',
        'Mounting file systems...',
        'Detecting hardware...',
        'Running pre-boot scripts...',
        '',
        'Kernel loaded successfully!'
      ],
      duration: 6000  // Longer duration
    },
    {
      name: 'KERNEL',
      messages: [
        'ShaanOS Kernel v2.1.0 starting...',
        '',
        '[    0.000000] Linux version 6.5.0-shaan',
        '[    0.001234] Command line: root=/dev/sda1 ro quiet splash',
        '[    0.002456] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
        '[    0.003678] x86/fpu: Supporting XSAVE feature 0x002: \'SSE registers\'',
        '[    0.004890] x86/fpu: Supporting XSAVE feature 0x004: \'AVX registers\'',
        '[    0.006123] Memory: 32GB available',
        '[    0.007345] CPU: 16 cores, 32 threads detected',
        '[    0.008567] PCI: Using configuration type 1 for base access',
        '[    0.009789] Setting up interrupt handlers...',
        '[    0.011012] Initializing network subsystem...',
        '[    0.012234] Loading portfolio data...',
        '[    0.013456] Mounting /home/shaan...',
        '[    0.014678] Starting system services...',
        '[    0.015890] Setting display resolution...',
        '[    0.017012] Loading user preferences...',
        '[    0.018234] Initializing security modules...',
        '',
        'System ready!',
        '',
        '==========================================',
        '      ** BOOT SEQUENCE COMPLETE **',
        ' CLICK "BOOT INTO OS" TO START THE SYSTEM',
        '==========================================',
      ],
      duration: 8000  // Longer duration
    }
  ];

  // Debug logging
  useEffect(() => {
    console.log("Boot Sequence component mounted");
    return () => {
      console.log("Boot Sequence component unmounted");
    };
  }, []);

  // Start boot sequence immediately
  useEffect(() => {
    console.log("Starting boot sequence immediately");
    runBootSequence();
  }, []);
  
  // Main boot sequence logic
  const runBootSequence = () => {
    console.log("Boot sequence initiated");
    let timeoutId: NodeJS.Timeout | null = null;
    let phaseIndex = 0;
    
    const processPhase = (index: number) => {
      if (index >= bootPhases.length) {
        console.log("All boot phases complete, waiting for user interaction");
        setBootComplete(true);
        return;
      }

      const phase = bootPhases[index];
      console.log(`Starting boot phase ${index}: ${phase.name}`);
      setCurrentPhase(index);
      
      // Clear output at the start of each phase
      setOutput([]);
      
      // Safety check that the phase exists
      if (!phase || !phase.messages) {
        console.error(`Phase ${index} is undefined or has no messages`);
        return;
      }
      
      let messageIndex = 0;
      const showMessages = () => {
        // Safety check to avoid undefined access
        if (!phase || !phase.messages || messageIndex >= phase.messages.length) {
          console.error("Invalid phase data or message index out of bounds");
          return;
        }
        
        // Get the message with safety check
        const message = phase.messages[messageIndex];
        if (message !== undefined) {
          setOutput(prev => [...prev, message]);
        } else {
          console.warn(`Message at index ${messageIndex} in phase ${index} is undefined`);
        }
        
        messageIndex++;
        
        if (messageIndex < phase.messages.length) {
          // Get the previous message safely
          const prevMessage = messageIndex > 0 ? phase.messages[messageIndex - 1] : '';
          
          // Calculate delay with safety checks
          const delay = !prevMessage ? 200 : 
                        prevMessage.includes('[') ? 300 :
                        Math.random() * 400 + 200; // Slower display for longer animation
          
          timeoutId = setTimeout(showMessages, delay);
        } else {
          // Phase complete, move to next phase
          console.log(`Phase ${index} (${phase.name}) complete, progress: ${Math.round(((index + 1) / bootPhases.length) * 100)}%`);
          setProgress(((index + 1) / bootPhases.length) * 100);
          
          timeoutId = setTimeout(() => {
            processPhase(index + 1);
          }, 1200); // Longer delay between phases
        }
      };
      
      // Start showing messages for this phase
      showMessages();
    };
    
    // Begin with phase 0
    processPhase(0);
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        console.log("Cleaning up boot sequence timeouts");
        clearTimeout(timeoutId);
      }
    };
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { primary: '#00ff41', bg: '#000000', secondary: '#008f11' };
      case 'amber':
        return { primary: '#ffb000', bg: '#1a0f00', secondary: '#cc8800' };
      case 'cyan':
        return { primary: '#00ffff', bg: '#001a1a', secondary: '#00cccc' };
      default:
        return { primary: '#00ff41', bg: '#000000', secondary: '#008f11' };
    }
  };

  const colors = getThemeColors();
  
  const handleCompleteOS = () => {
    console.log("BOOT INTO OS button clicked, transitioning to terminal");
    onComplete();
  };

  return (
    <div 
      className="w-full h-full flex flex-col justify-center items-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.primary }}
    >
      {/* Boot Progress */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>ShaanOS Boot Sequence - Phase: {bootPhases[Math.min(currentPhase, bootPhases.length-1)]?.name || 'Initializing'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Boot Output */}
      <div className="w-full max-w-4xl h-[28rem] overflow-auto font-mono text-sm leading-relaxed px-4 py-2 bg-black bg-opacity-50 rounded border border-gray-800">
        <div className="font-mono text-sm leading-relaxed">
          {output.map((line, index) => {
            // Safety check for undefined line
            if (line === undefined) return <div key={`undefined-${index}`}></div>;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={
                  line.includes && line.includes('✓') ? 'text-green-400' : 
                  line.includes && line.includes('[') && line.includes(']') ? 'text-blue-400' :
                  line.includes && line.includes('ERROR') ? 'text-red-400' :
                  line.includes && line.includes('**') ? 'text-yellow-400 font-bold' : ''
                }
              >
                {line || '\u00A0'}
              </motion.div>
            );
          })}
        </div>
        
        {/* Auto-scrolling effect */}
        {output.length > 0 && (
          <motion.div
            className="h-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
          />
        )}
      </div>

      {/* CRT Effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${colors.primary} 2px,
            ${colors.primary} 4px
          )`
        }}
      />
      
      {/* Boot button - only shown when all phases complete */}
      {bootComplete && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [0.9, 1.05, 1] }}
          transition={{ duration: 1, type: "spring" }}
          className="mt-8 px-10 py-4 text-xl bg-gray-800 border-2 border-gray-600 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105"
          style={{ 
            color: colors.primary,
            borderColor: colors.secondary
          }}
          onClick={handleCompleteOS}
        >
          BOOT INTO OS
        </motion.button>
      )}
      
      {/* Debug info in development */}
      <div className="fixed bottom-0 left-0 text-xs p-2 bg-black bg-opacity-75 text-gray-400">
        Phase: {currentPhase} | Progress: {Math.round(progress)}% | Complete: {bootComplete ? 'Yes' : 'No'}
      </div>
    </div>
  );
};
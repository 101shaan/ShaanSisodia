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

  const bootPhases = [
    {
      name: 'BIOS',
      messages: [
        'ShaanOS BIOS v2.1.0',
        'Copyright (C) 2024 Shaan Sisodia',
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
      duration: 3000
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
        '',
        'Kernel loaded successfully!'
      ],
      duration: 4000
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
        '',
        'System ready. Starting terminal interface...'
      ],
      duration: 5000
    }
  ];

  // Debug initialization
  useEffect(() => {
    console.log("BootSequence component initialized");
    return () => {
      console.log("BootSequence component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("Starting boot phase:", currentPhase);
    let timeoutId: NodeJS.Timeout;
    
    const runPhase = (phaseIndex: number) => {
      if (phaseIndex >= bootPhases.length) {
        console.log("All boot phases complete, transitioning to terminal...");
        // Ensure onComplete is actually called after a deliberate delay
        setTimeout(() => {
          console.log("Calling onComplete handler now");
          onComplete();
          
          // Double-check with an extra call as a fallback
          setTimeout(() => {
            console.log("Fallback: Calling onComplete handler again");
            onComplete();
          }, 1000);
        }, 2000); // Increased delay for better visibility
        return;
      }

      const phase = bootPhases[phaseIndex];
      console.log(`Starting boot phase: ${phase.name}`);
      setOutput([]);
      
      let messageIndex = 0;
      const showMessage = () => {
        if (messageIndex < phase.messages.length) {
          setOutput(prev => [...prev, phase.messages[messageIndex]]);
          messageIndex++;
          
          // Variable delay for realistic boot timing
          const delay = phase.messages[messageIndex - 1] === '' ? 100 : 
                       phase.messages[messageIndex - 1].includes('[') ? 200 :
                       Math.random() * 300 + 100;
          
          timeoutId = setTimeout(showMessage, delay);
        } else {
          // Phase complete, move to next
          console.log(`Boot phase ${phase.name} complete, moving to next phase`);
          setProgress((phaseIndex + 1) / bootPhases.length * 100);
          timeoutId = setTimeout(() => {
            setCurrentPhase(phaseIndex + 1);
            runPhase(phaseIndex + 1);
          }, 500);
        }
      };

      showMessage();
    };

    runPhase(currentPhase);

    return () => {
      console.log("Cleaning up boot phase timeouts");
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentPhase, onComplete]);

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

  return (
    <div 
      className="w-full h-full flex flex-col justify-center items-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.primary }}
    >
      {/* Boot Progress */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>ShaanOS Boot Sequence</span>
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
      <div className="w-full max-w-4xl h-96 overflow-hidden">
        <div className="font-mono text-sm leading-relaxed">
          {output.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className={line.includes('✓') ? 'text-green-400' : 
                        line.includes('[') && line.includes(']') ? 'text-blue-400' :
                        line.includes('ERROR') ? 'text-red-400' : ''}
            >
              {line || '\u00A0'}
            </motion.div>
          ))}
        </div>
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

      {/* Skip button for debugging */}
      <button
        className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
        onClick={() => {
          console.log("Skip button clicked, forcing completion");
          onComplete();
        }}
      >
        Skip Boot (Debug)
      </button>
    </div>
  );
};
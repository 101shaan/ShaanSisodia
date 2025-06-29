import React, { useState, useEffect } from 'react';

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
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  // Boot sequence with fixed reliable timing
  useEffect(() => {
    console.log("Boot sequence starting");
    
    // Display messages in sequence with fixed timing
    const bootMessages = [
      "ShaanOS BIOS v2.1.0",
      "Copyright (C) 2024 Shaan Sisodia",
      "Performing POST...",
      "CPU: Intel Core i9-13900K @ 3.0GHz ✓",
      "Memory: 32768MB DDR5-5600 ✓",
      "Storage: 2TB NVMe SSD ✓",
      "All systems nominal.",
      "Loading kernel modules...",
      "Setting up virtual memory...",
      "Mounting file systems...",
      "ShaanOS Kernel v2.1.0 starting...",
      "System ready. Starting terminal..."
    ];
    
    let index = 0;
    const totalMessages = bootMessages.length;
    const interval = setInterval(() => {
      if (index < totalMessages) {
        setMessages(prev => [...prev, bootMessages[index]]);
        setProgress((index + 1) / totalMessages * 100);
        index++;
      } else {
        clearInterval(interval);
        console.log("Boot sequence complete, calling onComplete");
        setTimeout(() => onComplete(), 1000); // Final delay before terminal
      }
    }, 400); // Fixed interval between messages
    
    return () => {
      clearInterval(interval);
      console.log("Boot sequence cleanup");
    };
  }, [onComplete]);
  
  // Color based on theme
  const getColor = () => {
    switch (theme) {
      case 'amber': return '#ffb000';
      case 'cyan': return '#00ffff';
      default: return '#00ff41';
    }
  };
  
  const color = getColor();

  return (
    <div 
      className="w-full h-full flex flex-col justify-center items-center p-8 bg-black"
      onClick={() => onComplete()}
    >
      {/* Click anywhere to skip */}
      <div className="text-sm mb-8 text-gray-500">Click anywhere to skip</div>
      
      {/* Boot Progress */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color }}>ShaanOS Boot Sequence</span>
          <span style={{ color }}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Boot Output */}
      <div className="w-full max-w-4xl h-96 overflow-hidden">
        <div className="font-mono text-sm leading-relaxed">
          {messages.map((line, index) => (
            <div
              key={index}
              className={line.includes('✓') ? 'text-green-400' : ''}
              style={{ color: line.includes('✓') ? '#00ff80' : color }}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* Skip button */}
      <button
        className="mt-8 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
        onClick={() => onComplete()}
      >
        Skip Boot
      </button>
    </div>
  );
};
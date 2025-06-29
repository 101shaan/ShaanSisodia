import React, { useState, useEffect, useRef } from 'react';
import { FileSystem } from './FileSystem';
import { CommandProcessor } from './CommandProcessor';

interface TerminalCoreProps {
  theme: string;
  soundEnabled: boolean;
  onExit: () => void;
  onThemeChange: (theme: string) => void;
  onSoundToggle: (enabled: boolean) => void;
}

export const TerminalCore: React.FC<TerminalCoreProps> = ({
  theme,
  soundEnabled,
  onExit,
  onThemeChange,
  onSoundToggle
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<Array<{ type: 'command' | 'output' | 'error' | 'success'; text: string }>>([
    { type: 'success', text: '╔══════════════════════════════════════════════════════════════╗' },
    { type: 'success', text: '║                    Welcome to ShaanOS v2.1                  ║' },
    { type: 'success', text: '║              The Ultimate Developer Portfolio OS             ║' },
    { type: 'success', text: '╚══════════════════════════════════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'output', text: 'System Information:' },
    { type: 'output', text: '  User: shaan@portfolio' },
    { type: 'output', text: '  Kernel: ShaanOS 2.1.0-retro' },
    { type: 'output', text: '  Uptime: Just booted' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Type "help" for available commands' },
    { type: 'output', text: 'Type "neofetch" for system info' },
    { type: 'output', text: 'Type "games" to see available games' },
    { type: 'output', text: '' }
  ]);
  const [currentDirectory] = useState('/home/shaan');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  try {
    // Safely initialize FileSystem and CommandProcessor
    const fileSystem = useRef(new FileSystem());
    const commandProcessor = useRef(new CommandProcessor(fileSystem.current));
  } catch (error) {
    console.error("Error initializing filesystem or command processor:", error);
  }

  // Add initialization logging
  useEffect(() => {
    console.log("TerminalCore component initialized with theme:", theme);
    
    // Focus input after a short delay
    setTimeout(() => {
      try {
        if (inputRef.current) {
          console.log("Focusing input field");
          inputRef.current.focus();
        }
      } catch (err) {
        console.error("Error focusing input:", err);
      }
    }, 500);
    
    return () => {
      console.log("TerminalCore component unmounted");
    };
  }, [theme]);

  useEffect(() => {
    try {
      if (outputRef.current) {
        console.log("Scrolling to bottom of terminal output");
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    } catch (err) {
      console.error("Error scrolling output:", err);
    }
  }, [output]);

  const colors = {
    primary: '#00ff41', 
    bg: '#000000', 
    secondary: '#008f11',
    error: '#ff0040',
    success: '#00ff80'
  };

  // Simple command handler that just echoes
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Add command to output
      const cmd = input;
      setOutput(prev => [
        ...prev, 
        { type: 'command', text: `shaan@portfolio:${currentDirectory}$ ${cmd}` },
        { type: 'output', text: `You typed: ${cmd}` },
        { type: 'output', text: '' }
      ]);
      setInput('');
    }
  };

  // Safety check for rendering
  try {
    console.log("Rendering TerminalCore");
    
    return (
      <div 
        className="w-full h-full flex flex-col"
        style={{ backgroundColor: colors.bg, color: colors.primary }}
      >
        {/* Terminal Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: colors.secondary, backgroundColor: colors.bg }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full cursor-pointer" onClick={onExit} />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <span className="font-mono text-sm">ShaanOS Terminal</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span>{theme.toUpperCase()}</span>
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Terminal Output */}
        <div 
          ref={outputRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed"
          style={{ backgroundColor: colors.bg }}
        >
          {output.map((line, index) => (
            <div
              key={index}
              style={{
                color: line.type === 'command' ? colors.secondary :
                      line.type === 'error' ? colors.error :
                      line.type === 'success' ? colors.success :
                      colors.primary
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <div className="p-4 border-t" style={{ borderColor: colors.secondary }}>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm" style={{ color: colors.secondary }}>
              shaan@portfolio:{currentDirectory}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none font-mono text-sm"
              style={{ color: colors.primary }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering TerminalCore:", error);
    // Fallback rendering
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-4xl font-bold text-red-500">
          Terminal Error: Check Console
        </div>
      </div>
    );
  }
};
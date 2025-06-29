import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSystem } from './FileSystem';
import { CommandProcessor } from './CommandProcessor';
import { GameEngine } from './GameEngine';

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
    { type: 'success', text: '║                    Welcome to ShaanOS v2.1                   ║' },
    { type: 'success', text: '║                       The Portfolio OS                       ║' },
    { type: 'success', text: '╚══════════════════════════════════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'output', text: 'System Information:' },
    { type: 'output', text: '  User: shaan@portfolio' },
    { type: 'output', text: '  Kernel: ShaanOS 2.1.0-retro' },
    { type: 'output', text: '  Uptime: Just booted' },
    { type: 'output', text: '  Shell: zsh 5.9 (x86_64-pc-linux-gnu)' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Type "help" for available commands' },
    { type: 'output', text: 'Type "neofetch" for system info' },
    { type: 'output', text: 'Type "games" to see available games' },
    { type: 'output', text: 'Type "portfolio" to explore projects' },
    { type: 'output', text: '' }
  ]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/shaan');
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const fileSystem = useRef(new FileSystem());
  const commandProcessor = useRef(new CommandProcessor(fileSystem.current));

  // Add initialization logging
  useEffect(() => {
    console.log("TerminalCore component initialized with theme:", theme);
    return () => {
      console.log("TerminalCore component unmounted");
    };
  }, [theme]);

  useEffect(() => {
    if (inputRef.current) {
      console.log("Focusing input field");
      inputRef.current.focus();
    }
  }, []);
  
  // Refocus input when clicked anywhere in terminal
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      console.log("Scrolling to bottom of terminal output");
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          error: '#ff0040',
          success: '#00ff80'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          error: '#ff4000',
          success: '#ffff00'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          error: '#ff4080',
          success: '#40ff80'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          error: '#ff0040',
          success: '#00ff80'
        };
    }
  };

  const colors = getThemeColors();

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      setOutput(prev => [...prev, { type: 'output', text: '' }]);
      return;
    }

    // Add to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput(prev => [...prev, { 
      type: 'command', 
      text: `shaan@portfolio:${currentDirectory}$ ${cmd}` 
    }]);

    try {
      const result = await commandProcessor.current.execute(cmd, {
        currentDirectory,
        theme,
        soundEnabled,
        onDirectoryChange: setCurrentDirectory,
        onThemeChange,
        onSoundToggle,
        onGameStart: setGameMode,
        onExit
      });

      if (result.output.length > 0) {
        setOutput(prev => [...prev, ...result.output]);
      }

      if (result.newDirectory) {
        setCurrentDirectory(result.newDirectory);
      }
    } catch (error) {
      setOutput(prev => [...prev, { 
        type: 'error', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    }

    setOutput(prev => [...prev, { type: 'output', text: '' }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: Implement tab completion
    }
  };

  if (gameMode) {
    return (
      <GameEngine
        game={gameMode}
        theme={theme}
        onExit={() => setGameMode(null)}
      />
    );
  }

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
            className={`${
              line.type === 'command' ? 'text-cyan-400 font-bold' :
              line.type === 'error' ? 'text-red-400' :
              line.type === 'success' ? 'text-green-400' :
              ''
            }`}
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
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="font-mono"
            style={{ color: colors.primary }}
          >
            █
          </motion.span>
        </div>
      </div>

      {/* CRT Scanlines Effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
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

      {/* CRT Glow Effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          boxShadow: `inset 0 0 100px ${colors.primary}40`
        }}
      />
    </div>
  );
};
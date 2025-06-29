import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal } from 'lucide-react';
import { RetroOS } from './RetroOS/RetroOS';

const TerminalOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<Array<{ type: 'command' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'Welcome to Shaan\'s Terminal v1.0' },
    { type: 'output', text: 'Type "help" for available commands' },
    { type: 'output', text: '' }
  ]);
  const [isBooting, setIsBooting] = useState(false);
  const [showRetroOS, setShowRetroOS] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        if (!isOpen && !showRetroOS && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      
      if (e.key === 'Escape' && isOpen && !showRetroOS) {
        setIsOpen(false);
      }
    };

    // Listen for 'hack' sequence
    let sequence = '';
    const handleSequence = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || showRetroOS) {
        return;
      }
      
      sequence += e.key.toLowerCase();
      if (sequence.includes('hack')) {
        setIsOpen(true);
        sequence = '';
      }
      
      // Reset sequence after 2 seconds
      setTimeout(() => {
        sequence = '';
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keydown', handleSequence);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keydown', handleSequence);
    };
  }, [isOpen, showRetroOS]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showRetroOS) {
      inputRef.current.focus();
    }
  }, [isOpen, showRetroOS]);

  // Scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const bootIntoRetroOS = () => {
    // Show minimal messages
    setOutput(prev => [...prev,
      { type: 'command', text: '$ hack' },
      { type: 'output', text: 'INITIATING SYSTEM BREACH...' },
      { type: 'output', text: 'ACTIVATING RETRO OS...' },
    ]);
    
    // Immediately show RetroOS - no delays or transitions
    setShowRetroOS(true);
    setIsOpen(false);
  };

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    
    // Add command to history
    setHistory(prev => [...prev, cmd]);
    
    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: `$ ${cmd}` }]);

    // Check for boot command first
    if (command === 'hack' || command === 'hack --init-retro-os' || command === 'boot retro-os') {
      bootIntoRetroOS();
      setInput('');
      return;
    }

    switch (command) {
      case 'help':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  help     - Show this help message' },
          { type: 'output', text: '  about    - About Shaan' },
          { type: 'output', text: '  projects - List projects' },
          { type: 'output', text: '  skills   - Show technical skills' },
          { type: 'output', text: '  contact  - Contact information' },
          { type: 'output', text: '  hack     - 🔥 Boot into ShaanOS (LEGENDARY!)' },
          { type: 'output', text: '  clear    - Clear terminal' },
          { type: 'output', text: '  exit     - Close terminal' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'about':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Shaan Sisodia - Systems Developer' },
          { type: 'output', text: '=================================' },
          { type: 'output', text: 'Age: 14 years old' },
          { type: 'output', text: 'Location: United Kingdom' },
          { type: 'output', text: 'Passion: Low-level systems' },
          { type: 'output', text: '' },
          { type: 'output', text: 'I architect solutions from the ground up,' },
          { type: 'output', text: 'whether it\'s operating systems in C/Assembly' },
          { type: 'output', text: 'or full-stack web applications.' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'projects':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Featured Projects:' },
          { type: 'output', text: '=================' },
          { type: 'output', text: '1. ShaanOS - Custom x86 operating system kernel' },
          { type: 'output', text: '2. CivSim - Real-time civilization simulator with AI' },
          { type: 'output', text: '3. Daily Glitch - Full-stack mystery story platform' },
          { type: 'output', text: '4. Ardenvale RPG - Complex text-based Dark Souls RPG' },
          { type: 'output', text: '' },
          { type: 'output', text: 'GitHub: https://github.com/101shaan' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'skills':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Technical Arsenal:' },
          { type: 'output', text: '=================' },
          { type: 'output', text: 'Languages: TypeScript, Python, C++, C, Assembly, Rust' },
          { type: 'output', text: 'Frontend: React, Next.js, TailwindCSS' },
          { type: 'output', text: 'Backend: Node.js, PostgreSQL, Supabase' },
          { type: 'output', text: 'Tools: Docker, Git, Linux, QEMU, GDB, Valgrind' },
          { type: 'output', text: 'Systems: OS Development, Memory Management, Low-level' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'contact':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Contact Information:' },
          { type: 'output', text: '===================' },
          { type: 'output', text: 'Email: shaansisodia3@gmail.com' },
          { type: 'output', text: 'GitHub: https://github.com/101shaan' },
          { type: 'output', text: 'LinkedIn: linkedin.com/in/shaan-sisodia-2810962ab' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Always open to interesting projects!' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'clear':
        setOutput([
          { type: 'output', text: 'Terminal cleared.' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'exit':
        setIsOpen(false);
        break;

      case '':
        setOutput(prev => [...prev, { type: 'output', text: '' }]);
        break;

      default:
        setOutput(prev => [...prev,
          { type: 'error', text: `Command not found: ${command}` },
          { type: 'output', text: 'Type "help" for available commands.' },
          { type: 'output', text: 'Or try "hack" to boot into ShaanOS!' },
          { type: 'output', text: '' }
        ]);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  // Check if RetroOS should be shown - Debug logging
  useEffect(() => {
    if (showRetroOS) {
      console.log("RetroOS state is active, should be displaying RetroOS component");
    }
  }, [showRetroOS]);

  // Render RetroOS if active
  if (showRetroOS) {
    console.log("Rendering RetroOS component");
    return (
      <RetroOS 
        isActive={true} 
        onExit={() => {
          console.log("RetroOS exit triggered");
          setShowRetroOS(false);
          setIsOpen(false);
        }} 
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="w-full max-w-4xl h-96 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-mono text-gray-300">shaan@portfolio:~</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Content */}
            <div className="flex flex-col h-full">
              {/* Output */}
              <div
                ref={outputRef}
                className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
              >
                {output.map((line, index) => (
                  <div
                    key={index}
                    className={`${
                      line.type === 'command' 
                        ? 'text-cyan-400' 
                        : line.type === 'error' 
                        ? 'text-red-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 font-mono text-sm">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isBooting}
                    className="flex-1 bg-transparent text-gray-100 font-mono text-sm outline-none disabled:opacity-50"
                    placeholder={isBooting ? "Booting into ShaanOS..." : "Type a command..."}
                  />
                  {!isBooting && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-cyan-400 font-mono"
                    >
                      |
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalOverlay;
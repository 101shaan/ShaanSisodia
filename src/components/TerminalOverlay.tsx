import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal } from 'lucide-react';
import { RetroOS } from './RetroOS/RetroOS';

interface TerminalOverlayProps {
  onClose?: () => void;
}

const TerminalOverlay: React.FC<TerminalOverlayProps> = ({ onClose: _onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([
    'Welcome to ShaanOS Terminal v2.1.0',
    'Type "help" for available commands',
    ''
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

  // Improved boot sequence activation
  const bootIntoRetroOS = () => {
    setOutput(prev => [...prev,
      '🔒 INITIATING SYSTEM BREACH...',
      '🔓 ACCESS GRANTED',
      '🚀 LAUNCHING RETRO OS...',
    ]);
    
    // Close this overlay and activate RetroOS immediately to avoid timing issues
    console.log("bootIntoRetroOS called, activating RetroOS and closing overlay");
    
    // Wait a moment to show the messages before transitioning
    setTimeout(() => {
      setShowRetroOS(true);  // Set this first
      setIsOpen(false);      // Then close the overlay
      setIsBooting(false);   // Reset booting state
      
      console.log("RetroOS activated:", {showRetroOS: true, isOpen: false});
    }, 1500);
  };

  // Handle RetroOS exit
  const handleRetroOSExit = () => {
    console.log("RetroOS exited");
    setShowRetroOS(false);
    // Don't reopen terminal overlay
  };

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    
    // Add command to output
    setOutput(prev => [...prev, `$ ${cmd}`]);

    // Check for boot command first
    if (command === 'hack' || command === 'hack --init-retro-os' || command === 'boot retro-os') {
      bootIntoRetroOS();
      setInput('');
      return;
    }

    switch (command) {
      case 'help':
        setOutput(prev => [...prev,
          'Available commands:',
          '  help     - Show this help message',
          '  about    - About Shaan',
          '  projects - List projects',
          '  skills   - Show technical skills',
          '  contact  - Contact information',
          '  hack     - 🔥 Boot into ShaanOS (LEGENDARY!)',
          '  clear    - Clear terminal',
          '  exit     - Close terminal',
          ''
        ]);
        break;

      case 'about':
        setOutput(prev => [...prev,
          'Shaan Sisodia - Systems Developer',
          '=================================',
          'Age: 14 years old',
          'Location: United Kingdom',
          'Passion: Low-level systems',
          '',
          'I architect solutions from the ground up,',
          'whether it\'s operating systems in C/Assembly',
          'or full-stack web applications.',
          ''
        ]);
        break;

      case 'projects':
        setOutput(prev => [...prev,
          'Featured Projects:',
          '=================',
          '1. ShaanOS - Custom x86 operating system kernel',
          '2. CivSim - Real-time civilization simulator with AI',
          '3. Daily Glitch - Full-stack mystery story platform',
          '4. Prism Language - Fast, memory-safe systems programming language',
          '',
          'GitHub: https://github.com/101shaan',
          ''
        ]);
        break;

      case 'skills':
        setOutput(prev => [...prev,
          'Technical Arsenal:',
          '=================',
          'Languages: TypeScript, Python, C++, C, Assembly, Rust',
          'Frontend: React, Next.js, TailwindCSS',
          'Backend: Node.js, PostgreSQL, Supabase',
          'Tools: Docker, Git, Linux, QEMU, GDB, Valgrind',
          'Systems: OS Development, Memory Management, Low-level',
          ''
        ]);
        break;

      case 'contact':
        setOutput(prev => [...prev,
          'Contact Information:',
          '===================',
          'Email: shaansisodia3@gmail.com',
          'GitHub: https://github.com/101shaan',
          'LinkedIn: linkedin.com/in/shaan-sisodia-2810962ab',
          '',
          'Always open to interesting projects!',
          ''
        ]);
        break;

      case 'clear':
        setOutput([
          'Terminal cleared.',
          ''
        ]);
        break;

      case 'exit':
        setIsOpen(false);
        break;

      case '':
        setOutput(prev => [...prev, '']);
        break;

      default:
        setOutput(prev => [...prev,
          `Command not found: ${command}`,
          'Type "help" for available commands.',
          'Or try "hack" to boot into ShaanOS!',
          ''
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
        onExit={handleRetroOSExit} 
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
                      line.startsWith('$') 
                        ? 'text-cyan-400' 
                        : line.startsWith('🔒') || line.startsWith('🔓') || line.startsWith('🚀')
                        ? 'text-green-400' 
                        : line.startsWith('🔥')
                        ? 'text-red-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    {line}
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
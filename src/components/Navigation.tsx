import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Arsenal', href: '#tech' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-950/80 backdrop-blur-md border-b border-cyan-500/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Now clickable to go to top */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer interactive"
          >
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span className="font-mono text-xl font-bold text-cyan-400">SS</span>
          </motion.button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="relative text-gray-300 hover:text-cyan-400 transition-colors duration-200 interactive"
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>

          {/* Terminal Hint */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hidden lg:flex items-center space-x-2 text-xs text-gray-500"
          >
            <Terminal className="w-4 h-4" />
            <span>Press 'T' for terminal</span>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
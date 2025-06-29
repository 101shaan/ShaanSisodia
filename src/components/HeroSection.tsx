import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Code, Cpu } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    'SHAAN SISODIA',
    'SYSTEMS ARCHITECT',
    'PROBLEM SOLVER'
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const typeText = (text: string, callback?: () => void) => {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          if (callback) {
            timeout = setTimeout(callback, 1500);
          }
        }
      }, 50); // Smoother, less typewriter-y
    };

    const cycle = () => {
      typeText(phases[currentPhase], () => {
        setCurrentPhase((prev) => (prev + 1) % phases.length);
      });
    };

    cycle();

    return () => {
      clearTimeout(timeout);
    };
  }, [currentPhase]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{ 
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Main heading with smoother typewriter effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            <span className="font-mono bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {displayText}
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-cyan-400"
                >
                  |
                </motion.span>
              )}
            </span>
          </h1>
        </motion.div>

        {/* Subtitle with staggered animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mb-12"
        >
          <p className="text-xl md:text-2xl text-gray-300 mb-6 font-light">
            I build systems that do interesting things.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From operating systems to real-time simulations, I create software that matters.
            Every line of code serves a purpose, every system scales with intention.
          </p>
        </motion.div>

        {/* Action buttons with proper navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            onClick={() => scrollToSection('projects')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 font-semibold rounded-sm overflow-hidden interactive"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>View Projects</span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            onClick={() => scrollToSection('contact')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 border border-cyan-500/50 text-cyan-400 font-semibold rounded-sm hover:bg-cyan-500/10 transition-all duration-200 interactive"
          >
            <span className="flex items-center space-x-2">
              <Cpu className="w-5 h-5" />
              <span>Get In Touch</span>
            </span>
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;
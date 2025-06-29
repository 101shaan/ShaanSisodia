import React from 'react';
import { motion } from 'framer-motion';

const FloatingParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Floating particles throughout the site */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Larger floating orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-2 h-2 bg-purple-400/20 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-50, 50, -50],
            x: [-25, 25, -25],
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
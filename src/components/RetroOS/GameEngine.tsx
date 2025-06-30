import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SnakeGame } from './games/SnakeGame';
import { TetrisGame } from './games/TetrisGame';
import { InvadersGame } from './games/InvadersGame';
import { PongGame } from './games/PongGame';
import { BreakoutGame } from './games/BreakoutGame';
import { PacmanGame } from './games/PacmanGame';
import { ChessGame } from './games/ChessGame';

interface GameEngineProps {
  game: string;
  theme: string;
  onExit: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ game, theme, onExit }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const loadingMessages = [
      'Initializing game engine...',
      'Loading graphics subsystem...',
      'Setting up input handlers...',
      'Allocating memory buffers...',
      'Compiling shaders...',
      'Loading game assets...',
      'Initializing sound system...',
      'Starting game loop...',
      'Game ready!'
    ];

    let messageIndex = 0;
    let progress = 0;

    const loadingInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length) {
        setLoadingText(loadingMessages[messageIndex]);
        setLoadingProgress((messageIndex + 1) / loadingMessages.length * 100);
        messageIndex++;
      } else {
        clearInterval(loadingInterval);
        setTimeout(() => setIsLoading(false), 500);
      }
    }, 300);

    return () => clearInterval(loadingInterval);
  }, []);

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

  if (isLoading) {
    return (
      <div 
        className="w-full h-full flex flex-col justify-center items-center"
        style={{ backgroundColor: colors.bg, color: colors.primary }}
      >
        <div className="w-full max-w-2xl px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
              {game.toUpperCase()}
            </h1>
            <p className="text-lg" style={{ color: colors.secondary }}>
              Loading retro gaming experience...
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{loadingText}</span>
              <span>{Math.round(loadingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full"
                style={{ backgroundColor: colors.primary }}
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="text-center text-sm" style={{ color: colors.secondary }}>
            <p>Press ESC at any time to return to terminal</p>
          </div>
        </div>

        {/* Loading animation */}
        <div className="mt-8">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="inline-block w-2 h-2 mx-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const renderGame = () => {
    switch (game) {
      case 'snake':
        return <SnakeGame theme={theme} onExit={onExit} />;
      case 'tetris':
        return <TetrisGame theme={theme} onExit={onExit} />;
      case 'invaders':
        return <InvadersGame theme={theme} onExit={onExit} />;
      case 'pong':
        return <PongGame theme={theme} onExit={onExit} />;
      case 'breakout':
        return <BreakoutGame theme={theme} onExit={onExit} />;
      case 'pacman':
        return <PacmanGame theme={theme} onExit={onExit} />;
      case 'chess':
        return <ChessGame theme={theme} onExit={onExit} />;
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
              <p className="text-lg mb-4">The game "{game}" is not implemented yet.</p>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return to Terminal
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full"
      style={{ backgroundColor: colors.bg }}
    >
      {renderGame()}
    </motion.div>
  );
};
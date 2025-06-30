import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SnakeGame } from './games/SnakeGame';
import { TetrisGame } from './games/TetrisGame';
import { InvadersGame } from './games/InvadersGame';
import { PongGame } from './games/PongGame';
import { BreakoutGame } from './games/BreakoutGame';
import { PacmanGame } from './games/PacmanGame';
import { ChessGame } from './games/ChessGame';

interface GameEngineProps {
  currentGame: string | null;
  onGameExit: () => void;
  theme: string;
}

export const GameEngine: React.FC<GameEngineProps> = ({ 
  currentGame, 
  onGameExit, 
  theme 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentGame) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentGame]);

  if (!currentGame) return null;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="text-2xl font-mono text-green-400 mb-4">
            Loading {currentGame}...
          </div>
          <div className="w-64 h-2 bg-gray-800 rounded">
            <motion.div
              className="h-full bg-green-400 rounded"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

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

  const renderGame = () => {
    switch (currentGame) {
      case 'snake':
        return <SnakeGame theme={theme} onExit={onGameExit} />;
      case 'tetris':
        return <TetrisGame theme={theme} onExit={onGameExit} />;
      case 'invaders':
        return <InvadersGame theme={theme} onExit={onGameExit} />;
      case 'pong':
        return <PongGame theme={theme} onExit={onGameExit} />;
      case 'breakout':
        return <BreakoutGame theme={theme} onExit={onGameExit} />;
      case 'pacman':
        return <PacmanGame theme={theme} onExit={onGameExit} />;
      case 'chess':
        return <ChessGame theme={theme} onExit={onGameExit} />;
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
              <p className="text-lg mb-4">The game "{currentGame}" is not implemented yet.</p>
              <button
                onClick={onGameExit}
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
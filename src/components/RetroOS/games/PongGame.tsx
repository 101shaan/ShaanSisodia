import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface PongGameProps {
  theme: string;
  onExit: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

export const PongGame: React.FC<PongGameProps> = ({ theme, onExit }) => {
  const [leftPaddleY, setLeftPaddleY] = useState(250);
  const [rightPaddleY, setRightPaddleY] = useState(250);
  const [ballPos, setBallPos] = useState<Position>({ x: 400, y: 300 });
  const [ballVel, setBallVel] = useState<Velocity>({ x: 5, y: 3 });
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PADDLE_WIDTH = 15;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 15;
  const PADDLE_SPEED = 7;
  const MAX_SCORE = 11;

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          paddle: '#00ff80',
          ball: '#ffff00',
          text: '#00ff41'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          paddle: '#ffff00',
          ball: '#ffffff',
          text: '#ffb000'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          paddle: '#40ff80',
          ball: '#ffffff',
          text: '#00ffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          paddle: '#00ff80',
          ball: '#ffff00',
          text: '#00ff41'
        };
    }
  };

  const colors = getThemeColors();

  const resetBall = useCallback(() => {
    setBallPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    setBallVel({ 
      x: Math.random() > 0.5 ? 5 : -5, 
      y: (Math.random() - 0.5) * 6 
    });
  }, []);

  const resetGame = useCallback(() => {
    setLeftPaddleY(250);
    setRightPaddleY(250);
    setLeftScore(0);
    setRightScore(0);
    setGameOver(false);
    setWinner(null);
    setIsPaused(false);
    setGameStarted(true);
    resetBall();
  }, [resetBall]);

  const updateGame = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    // Move paddles
    if (keysRef.current['w'] || keysRef.current['W']) {
      setLeftPaddleY(prev => Math.max(0, prev - PADDLE_SPEED));
    }
    if (keysRef.current['s'] || keysRef.current['S']) {
      setLeftPaddleY(prev => Math.min(GAME_HEIGHT - PADDLE_HEIGHT, prev + PADDLE_SPEED));
    }
    if (keysRef.current['ArrowUp']) {
      setRightPaddleY(prev => Math.max(0, prev - PADDLE_SPEED));
    }
    if (keysRef.current['ArrowDown']) {
      setRightPaddleY(prev => Math.min(GAME_HEIGHT - PADDLE_HEIGHT, prev + PADDLE_SPEED));
    }

    // Move ball
    setBallPos(prevPos => {
      const newPos = {
        x: prevPos.x + ballVel.x,
        y: prevPos.y + ballVel.y
      };

      // Ball collision with top/bottom walls
      if (newPos.y <= 0 || newPos.y >= GAME_HEIGHT - BALL_SIZE) {
        setBallVel(prev => ({ ...prev, y: -prev.y }));
        newPos.y = newPos.y <= 0 ? 0 : GAME_HEIGHT - BALL_SIZE;
      }

      // Ball collision with left paddle
      if (newPos.x <= PADDLE_WIDTH && 
          newPos.y + BALL_SIZE >= leftPaddleY && 
          newPos.y <= leftPaddleY + PADDLE_HEIGHT) {
        setBallVel(prev => ({ 
          x: Math.abs(prev.x), 
          y: prev.y + (newPos.y - (leftPaddleY + PADDLE_HEIGHT/2)) * 0.1 
        }));
        newPos.x = PADDLE_WIDTH;
      }

      // Ball collision with right paddle
      if (newPos.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH && 
          newPos.y + BALL_SIZE >= rightPaddleY && 
          newPos.y <= rightPaddleY + PADDLE_HEIGHT) {
        setBallVel(prev => ({ 
          x: -Math.abs(prev.x), 
          y: prev.y + (newPos.y - (rightPaddleY + PADDLE_HEIGHT/2)) * 0.1 
        }));
        newPos.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      }

      // Scoring
      if (newPos.x < 0) {
        setRightScore(prev => {
          const newScore = prev + 1;
          if (newScore >= MAX_SCORE) {
            setGameOver(true);
            setWinner('right');
          }
          return newScore;
        });
        resetBall();
        return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
      }

      if (newPos.x > GAME_WIDTH) {
        setLeftScore(prev => {
          const newScore = prev + 1;
          if (newScore >= MAX_SCORE) {
            setGameOver(true);
            setWinner('left');
          }
          return newScore;
        });
        resetBall();
        return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
      }

      return newPos;
    });
  }, [gameOver, isPaused, gameStarted, leftPaddleY, rightPaddleY, ballVel, resetBall]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(updateGame, 16); // ~60 FPS
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [updateGame, gameStarted, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (!gameStarted || gameOver) {
        if (e.key === ' ') {
          resetGame();
        }
        return;
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit, gameStarted, gameOver, resetGame]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Game Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
          PONG
        </h1>
        <div className="flex items-center justify-center space-x-8 text-2xl font-mono">
          <span>Player 1: {leftScore}</span>
          <span>-</span>
          <span>Player 2: {rightScore}</span>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative border-2 mb-6"
        style={{ 
          width: GAME_WIDTH, 
          height: GAME_HEIGHT, 
          borderColor: colors.primary,
          backgroundColor: colors.bg
        }}
      >
        {/* Center Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 opacity-50"
          style={{ 
            left: '50%', 
            backgroundColor: colors.primary,
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 10px, ${colors.primary} 10px, ${colors.primary} 20px)`
          }}
        />

        {/* Left Paddle */}
        <motion.div
          className="absolute"
          style={{
            left: 0,
            top: leftPaddleY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            backgroundColor: colors.paddle
          }}
          animate={{ y: 0 }}
          transition={{ type: "tween", duration: 0 }}
        />

        {/* Right Paddle */}
        <motion.div
          className="absolute"
          style={{
            right: 0,
            top: rightPaddleY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            backgroundColor: colors.paddle
          }}
          animate={{ y: 0 }}
          transition={{ type: "tween", duration: 0 }}
        />

        {/* Ball */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: ballPos.x,
            top: ballPos.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
            backgroundColor: colors.ball
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [`0 0 5px ${colors.ball}`, `0 0 15px ${colors.ball}`, `0 0 5px ${colors.ball}`]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Game State Overlays */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                PONG
              </h2>
              <p className="text-lg mb-4">Player 1: W/S keys</p>
              <p className="text-lg mb-4">Player 2: Arrow Up/Down</p>
              <p className="text-lg mb-6">First to {MAX_SCORE} wins!</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <h2 className="text-4xl font-bold" style={{ color: colors.primary }}>
              PAUSED
            </h2>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER
              </h2>
              <p className="text-2xl mb-6">
                {winner === 'left' ? 'Player 1' : 'Player 2'} Wins!
              </p>
              <p className="text-lg mb-4">Final Score: {leftScore} - {rightScore}</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-sm opacity-75">
        <p>ESC: Exit | SPACE: Pause/Resume</p>
        <p>Player 1: W/S | Player 2: ↑/↓</p>
      </div>
    </div>
  );
}; 
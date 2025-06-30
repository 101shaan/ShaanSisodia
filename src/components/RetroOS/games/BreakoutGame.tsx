import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface BreakoutGameProps {
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

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ theme, onExit }) => {
  const [paddleX, setPaddleX] = useState(350);
  const [ballPos, setBallPos] = useState<Position>({ x: 400, y: 500 });
  const [ballVel, setBallVel] = useState<Velocity>({ x: 5, y: -5 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const BALL_SIZE = 12;
  const PADDLE_SPEED = 8;
  const BRICK_ROWS = 6;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 25;
  const BRICK_PADDING = 5;

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          paddle: '#00ff80',
          ball: '#ffff00',
          text: '#00ff41',
          bricks: ['#ff0040', '#ff4000', '#ff8000', '#ffff00', '#80ff00', '#00ff80']
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          paddle: '#ffff00',
          ball: '#ffffff',
          text: '#ffb000',
          bricks: ['#ff4000', '#ff6000', '#ff8000', '#ffa000', '#ffc000', '#ffe000']
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          paddle: '#40ff80',
          ball: '#ffffff',
          text: '#00ffff',
          bricks: ['#ff4080', '#ff6080', '#ff8080', '#80ff80', '#80ffff', '#8080ff']
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          paddle: '#00ff80',
          ball: '#ffff00',
          text: '#00ff41',
          bricks: ['#ff0040', '#ff4000', '#ff8000', '#ffff00', '#80ff00', '#00ff80']
        };
    }
  };

  const colors = getThemeColors();

  const createBricks = useCallback((levelNum: number) => {
    const newBricks: Brick[] = [];
    const startY = 50;
    const startX = (GAME_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const maxHits = Math.min(3, Math.floor(row / 2) + 1);
        newBricks.push({
          x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
          y: startY + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          destroyed: false,
          hits: 0,
          maxHits,
          color: colors.bricks[row % colors.bricks.length],
          points: maxHits * 10
        });
      }
    }

    return newBricks;
  }, [colors.bricks]);

  const resetBall = useCallback(() => {
    setBallPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 });
    setBallVel({ 
      x: (Math.random() - 0.5) * 8, 
      y: -Math.abs(Math.random() * 3 + 4)
    });
  }, []);

  const resetGame = useCallback(() => {
    setPaddleX(350);
    setBricks(createBricks(1));
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    setGameStarted(true);
    resetBall();
  }, [createBricks, resetBall]);

  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    setBricks(createBricks(level + 1));
    resetBall();
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  }, [level, createBricks, resetBall]);

  const updateGame = useCallback(() => {
    if (gameOver || gameWon || isPaused || !gameStarted) return;

    // Move paddle
    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      setPaddleX(prev => Math.max(0, prev - PADDLE_SPEED));
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + PADDLE_SPEED));
    }

    // Move ball
    setBallPos(prevPos => {
      const newPos = {
        x: prevPos.x + ballVel.x,
        y: prevPos.y + ballVel.y
      };

      // Ball collision with walls
      if (newPos.x <= 0 || newPos.x >= GAME_WIDTH - BALL_SIZE) {
        setBallVel(prev => ({ ...prev, x: -prev.x }));
        newPos.x = newPos.x <= 0 ? 0 : GAME_WIDTH - BALL_SIZE;
      }

      if (newPos.y <= 0) {
        setBallVel(prev => ({ ...prev, y: -prev.y }));
        newPos.y = 0;
      }

      // Ball collision with paddle
      if (newPos.y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT - 20 &&
          newPos.x + BALL_SIZE >= paddleX &&
          newPos.x <= paddleX + PADDLE_WIDTH) {
        
        const hitPos = (newPos.x + BALL_SIZE/2 - paddleX) / PADDLE_WIDTH;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        const speed = Math.sqrt(ballVel.x * ballVel.x + ballVel.y * ballVel.y);
        
        setBallVel({
          x: Math.sin(angle) * speed,
          y: -Math.abs(Math.cos(angle) * speed)
        });
        
        newPos.y = GAME_HEIGHT - PADDLE_HEIGHT - 20 - BALL_SIZE;
      }

      // Ball collision with bricks
      setBricks(prevBricks => {
        const newBricks = [...prevBricks];
        let brickHit = false;

        for (let i = 0; i < newBricks.length; i++) {
          const brick = newBricks[i];
          if (brick.destroyed) continue;

          if (newPos.x < brick.x + brick.width &&
              newPos.x + BALL_SIZE > brick.x &&
              newPos.y < brick.y + brick.height &&
              newPos.y + BALL_SIZE > brick.y) {
            
            brick.hits++;
            if (brick.hits >= brick.maxHits) {
              brick.destroyed = true;
              setScore(prev => prev + brick.points);
            }

            const ballCenterX = newPos.x + BALL_SIZE / 2;
            const ballCenterY = newPos.y + BALL_SIZE / 2;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;

            const deltaX = ballCenterX - brickCenterX;
            const deltaY = ballCenterY - brickCenterY;

            if (Math.abs(deltaX / brick.width) > Math.abs(deltaY / brick.height)) {
              setBallVel(prev => ({ ...prev, x: -prev.x }));
            } else {
              setBallVel(prev => ({ ...prev, y: -prev.y }));
            }

            brickHit = true;
            break;
          }
        }

        // Check if all bricks are destroyed
        if (newBricks.every(brick => brick.destroyed)) {
          setTimeout(() => nextLevel(), 500);
        }

        return newBricks;
      });

      // Ball falls below paddle
      if (newPos.y > GAME_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            resetBall();
          }
          return newLives;
        });
        return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100 };
      }

      return newPos;
    });
  }, [gameOver, gameWon, isPaused, gameStarted, paddleX, ballVel, resetBall, nextLevel]);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && !isPaused) {
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
  }, [updateGame, gameStarted, gameOver, gameWon, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (!gameStarted || gameOver || gameWon) {
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
  }, [onExit, gameStarted, gameOver, gameWon, resetGame]);

  // Initialize bricks on mount
  useEffect(() => {
    setBricks(createBricks(1));
  }, [createBricks]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Game Title and Stats */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
          BREAKOUT
        </h1>
        <div className="flex items-center justify-center space-x-8 text-lg font-mono">
          <span>Score: {score}</span>
          <span>Lives: {lives}</span>
          <span>Level: {level}</span>
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
        {/* Bricks */}
        {bricks.map((brick, index) => (
          !brick.destroyed && (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: brick.x,
                top: brick.y,
                width: brick.width,
                height: brick.height,
                backgroundColor: brick.color,
                opacity: 1 - (brick.hits / brick.maxHits) * 0.6
              }}
              initial={{ scale: 1 }}
              animate={brick.hits > 0 ? { 
                scale: [1, 0.9, 1],
                boxShadow: [`0 0 5px ${brick.color}`, `0 0 15px ${brick.color}`, `0 0 5px ${brick.color}`]
              } : {}}
              transition={{ duration: 0.2 }}
            />
          )
        ))}

        {/* Paddle */}
        <motion.div
          className="absolute"
          style={{
            left: paddleX,
            bottom: 20,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            backgroundColor: colors.paddle,
            borderRadius: '8px'
          }}
          animate={{ 
            boxShadow: [`0 0 5px ${colors.paddle}`, `0 0 15px ${colors.paddle}`, `0 0 5px ${colors.paddle}`]
          }}
          transition={{ duration: 1, repeat: Infinity }}
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
            boxShadow: [`0 0 5px ${colors.ball}`, `0 0 15px ${colors.ball}`, `0 0 5px ${colors.ball}`]
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />

        {/* Game State Overlays */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                BREAKOUT
              </h2>
              <p className="text-lg mb-4">Use ← → or A/D to move paddle</p>
              <p className="text-lg mb-6">Break all bricks to advance!</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {isPaused && !gameOver && !gameWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              {level > 1 && bricks.every(brick => brick.destroyed) ? (
                <>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                    LEVEL {level}
                  </h2>
                  <p className="text-lg">Get Ready!</p>
                </>
              ) : (
                <h2 className="text-4xl font-bold" style={{ color: colors.primary }}>
                  PAUSED
                </h2>
              )}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER
              </h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <p className="text-lg mb-6">Level Reached: {level}</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                CONGRATULATIONS!
              </h2>
              <p className="text-2xl mb-4">You Win!</p>
              <p className="text-lg mb-4">Final Score: {score}</p>
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
        <p>← → or A/D: Move Paddle</p>
      </div>
    </div>
  );
}; 
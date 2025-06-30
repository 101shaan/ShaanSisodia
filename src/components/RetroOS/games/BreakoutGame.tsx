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
  const [ballVel, setBallVel] = useState<Velocity>({ x: 0, y: 0 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [ballStuck, setBallStuck] = useState(true);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 10;
  const BALL_SIZE = 12;
  const PADDLE_SPEED = 8;
  const BALL_SPEED = 6;

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
    const rows = Math.min(5 + Math.floor(levelNum / 2), 8);
    const cols = 10;
    const brickWidth = (GAME_WIDTH - 20) / cols;
    const brickHeight = 25;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const maxHits = Math.min(1 + Math.floor(row / 2) + Math.floor(levelNum / 3), 3);
        newBricks.push({
          x: 10 + col * brickWidth,
          y: 60 + row * (brickHeight + 2),
          width: brickWidth - 2,
          height: brickHeight,
          destroyed: false,
          hits: maxHits,
          maxHits: maxHits,
          color: colors.bricks[row % colors.bricks.length],
          points: maxHits * 10
        });
      }
    }
    
    return newBricks;
  }, [colors.bricks]);

  const launchBall = useCallback(() => {
    const angle = (Math.random() - 0.5) * Math.PI / 3; // Random angle between -30 and 30 degrees
    setBallVel({
      x: Math.sin(angle) * BALL_SPEED,
      y: -Math.cos(angle) * BALL_SPEED
    });
    setBallStuck(false);
  }, []);

  const resetBall = useCallback(() => {
    setBallPos({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT - 80 });
    setBallVel({ x: 0, y: 0 });
    setBallStuck(true);
  }, []);

  const resetGame = useCallback(() => {
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
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

  const checkCollision = useCallback((ballX: number, ballY: number, rectX: number, rectY: number, rectW: number, rectH: number) => {
    return ballX < rectX + rectW &&
           ballX + BALL_SIZE > rectX &&
           ballY < rectY + rectH &&
           ballY + BALL_SIZE > rectY;
  }, []);

  const updateGame = useCallback(() => {
    if (gameOver || gameWon || isPaused || !gameStarted) return;

    // Handle paddle movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      setPaddleX(prev => Math.max(0, prev - PADDLE_SPEED));
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      setPaddleX(prev => Math.min(GAME_WIDTH - PADDLE_WIDTH, prev + PADDLE_SPEED));
    }

    // Move ball with paddle when stuck
    if (ballStuck) {
      setBallPos(prev => ({ ...prev, x: paddleX + PADDLE_WIDTH / 2 - BALL_SIZE / 2 }));
      return;
    }

    // Move ball
    setBallPos(prevPos => {
      let newX = prevPos.x + ballVel.x;
      let newY = prevPos.y + ballVel.y;
      let newVelX = ballVel.x;
      let newVelY = ballVel.y;

      // Ball collision with walls
      if (newX <= 0) {
        newX = 0;
        newVelX = Math.abs(newVelX);
      } else if (newX >= GAME_WIDTH - BALL_SIZE) {
        newX = GAME_WIDTH - BALL_SIZE;
        newVelX = -Math.abs(newVelX);
      }

      if (newY <= 0) {
        newY = 0;
        newVelY = Math.abs(newVelY);
      }

      // Ball collision with paddle
      const paddleY = GAME_HEIGHT - 30;
      if (checkCollision(newX, newY, paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
        if (newY + BALL_SIZE > paddleY && prevPos.y + BALL_SIZE <= paddleY) {
          // Hit from above
          newY = paddleY - BALL_SIZE;
          const hitPos = (newX + BALL_SIZE / 2 - paddleX) / PADDLE_WIDTH;
          const bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
          const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
          newVelX = Math.sin(bounceAngle) * speed;
          newVelY = -Math.abs(Math.cos(bounceAngle) * speed);
        }
      }

      // Ball collision with bricks
      setBricks(prevBricks => {
        const newBricks = [...prevBricks];
        for (let i = 0; i < newBricks.length; i++) {
          const brick = newBricks[i];
          if (brick.destroyed) continue;

          if (checkCollision(newX, newY, brick.x, brick.y, brick.width, brick.height)) {
            newBricks[i] = { ...brick, hits: brick.hits - 1 };
            
            if (newBricks[i].hits <= 0) {
              newBricks[i].destroyed = true;
              setScore(prev => prev + brick.points);
            }

            // Determine bounce direction based on collision side
            const ballCenterX = newX + BALL_SIZE / 2;
            const ballCenterY = newY + BALL_SIZE / 2;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;

            const deltaX = ballCenterX - brickCenterX;
            const deltaY = ballCenterY - brickCenterY;

            const overlapX = (BALL_SIZE + brick.width) / 2 - Math.abs(deltaX);
            const overlapY = (BALL_SIZE + brick.height) / 2 - Math.abs(deltaY);

            if (overlapX < overlapY) {
              // Horizontal collision
              newVelX = deltaX > 0 ? Math.abs(newVelX) : -Math.abs(newVelX);
            } else {
              // Vertical collision
              newVelY = deltaY > 0 ? Math.abs(newVelY) : -Math.abs(newVelY);
            }

            break;
          }
        }

        // Check if all bricks are destroyed
        if (newBricks.every(brick => brick.destroyed)) {
          setTimeout(() => nextLevel(), 500);
        }

        return newBricks;
      });

      // Update ball velocity
      setBallVel({ x: newVelX, y: newVelY });

      // Ball falls below paddle
      if (newY > GAME_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            resetBall();
          }
          return newLives;
        });
        return prevPos;
      }

      return { x: newX, y: newY };
    });
  }, [gameOver, gameWon, isPaused, gameStarted, paddleX, ballVel, ballStuck, checkCollision, resetBall, nextLevel]);

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
        if (ballStuck) {
          launchBall();
        } else {
          setIsPaused(prev => !prev);
        }
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
  }, [onExit, gameStarted, gameOver, gameWon, resetGame, ballStuck, launchBall]);

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
              className="absolute border"
              style={{
                left: brick.x,
                top: brick.y,
                width: brick.width,
                height: brick.height,
                backgroundColor: brick.color,
                borderColor: colors.primary,
                opacity: 0.7 + (brick.hits / brick.maxHits) * 0.3
              }}
              initial={{ scale: 1 }}
              animate={{ 
                scale: brick.hits < brick.maxHits ? [1, 0.95, 1] : 1,
                boxShadow: brick.hits < brick.maxHits ? 
                  [`0 0 5px ${brick.color}`, `0 0 15px ${brick.color}`, `0 0 5px ${brick.color}`] : 
                  `0 0 5px ${brick.color}`
              }}
              transition={{ duration: 0.2 }}
            />
          )
        ))}

        {/* Paddle */}
        <motion.div
          className="absolute border"
          style={{
            left: paddleX,
            top: GAME_HEIGHT - 30,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            backgroundColor: colors.paddle,
            borderColor: colors.primary,
            borderRadius: '4px'
          }}
          animate={{ 
            boxShadow: [`0 0 5px ${colors.paddle}`, `0 0 15px ${colors.paddle}`, `0 0 5px ${colors.paddle}`]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Ball */}
        <motion.div
          className="absolute rounded-full border"
          style={{
            left: ballPos.x,
            top: ballPos.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
            backgroundColor: colors.ball,
            borderColor: colors.primary
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
              <p className="text-lg mb-4">Press SPACE to launch ball</p>
              <p className="text-lg mb-6">Break all bricks to advance!</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {ballStuck && gameStarted && !gameOver && !gameWon && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <p className="text-lg font-bold" style={{ color: colors.primary }}>
              Press SPACE to Launch Ball
            </p>
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
              <p className="text-2xl mb-4">You Won!</p>
              <p className="text-lg mb-4">Final Score: {score}</p>
              <p className="text-lg mb-6">Levels Completed: {level}</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm opacity-75">
        <p>ESC: Exit | SPACE: Launch Ball/Pause | ← → or A/D: Move Paddle</p>
      </div>
    </div>
  );
}; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface SnakeGameProps {
  theme: string;
  onExit: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame: React.FC<SnakeGameProps> = ({ theme, onExit }) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef<Direction>('RIGHT');

  const BOARD_SIZE = 20;
  const CELL_SIZE = 20;

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          food: '#ff0040',
          snake: '#00ff80'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          food: '#ff4000',
          snake: '#ffff00'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          food: '#ff4080',
          snake: '#40ff80'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          food: '#ff0040',
          snake: '#00ff80'
        };
    }
  };

  const colors = getThemeColors();

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, gameStarted, food, highScore, generateFood]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, 150);
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
  }, [moveSnake, gameStarted, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (!gameStarted) {
        if (e.key === ' ') {
          resetGame();
        }
        return;
      }

      if (gameOver) {
        if (e.key === ' ') {
          resetGame();
        }
        return;
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return directionRef.current !== 'DOWN' ? 'UP' : directionRef.current;
          case 'ArrowDown':
          case 's':
          case 'S':
            return directionRef.current !== 'UP' ? 'DOWN' : directionRef.current;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return directionRef.current !== 'RIGHT' ? 'LEFT' : directionRef.current;
          case 'ArrowRight':
          case 'd':
          case 'D':
            return directionRef.current !== 'LEFT' ? 'RIGHT' : directionRef.current;
          default:
            return directionRef.current;
        }
      })();

      setDirection(newDirection);
      directionRef.current = newDirection;
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit, gameStarted, gameOver, resetGame]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.primary }}
    >
      {/* Game Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
          SNAKE
        </h1>
        <div className="flex space-x-8 text-lg">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>
      </div>

      {/* Game Board */}
      <div 
        className="relative border-2 mb-6"
        style={{ 
          borderColor: colors.primary,
          width: BOARD_SIZE * CELL_SIZE,
          height: BOARD_SIZE * CELL_SIZE
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              backgroundColor: index === 0 ? colors.snake : colors.secondary,
              border: `1px solid ${colors.primary}`
            }}
          />
        ))}

        {/* Food */}
        <motion.div
          className="absolute"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
            backgroundColor: colors.food,
            border: `1px solid ${colors.primary}`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${colors.bg}CC` }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.food }}>
                GAME OVER
              </h2>
              <p className="text-lg mb-4">Final Score: {score}</p>
              <p className="text-sm" style={{ color: colors.secondary }}>
                Press SPACE to play again
              </p>
            </div>
          </motion.div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && gameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${colors.bg}CC` }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                PAUSED
              </h2>
              <p className="text-sm" style={{ color: colors.secondary }}>
                Press SPACE to continue
              </p>
            </div>
          </motion.div>
        )}

        {/* Start Screen */}
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${colors.bg}CC` }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                READY?
              </h2>
              <p className="text-sm mb-2" style={{ color: colors.secondary }}>
                Use WASD or Arrow Keys to move
              </p>
              <p className="text-sm mb-4" style={{ color: colors.secondary }}>
                Press SPACE to start
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-sm" style={{ color: colors.secondary }}>
        <p>WASD or Arrow Keys: Move | SPACE: Pause/Start | ESC: Exit</p>
      </div>
    </div>
  );
};
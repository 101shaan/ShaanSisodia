import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface PacmanGameProps {
  theme: string;
  onExit: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Ghost {
  x: number;
  y: number;
  direction: Direction;
  color: string;
}

export const PacmanGame: React.FC<PacmanGameProps> = ({ theme, onExit }) => {
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 9, y: 15 });
  const [pacmanDir, setPacmanDir] = useState<Direction>('RIGHT');
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { x: 9, y: 9, direction: 'UP', color: '#ff0000' },
    { x: 10, y: 9, direction: 'DOWN', color: '#ffb8ff' },
    { x: 8, y: 9, direction: 'LEFT', color: '#00ffff' },
    { x: 11, y: 9, direction: 'RIGHT', color: '#ffb852' }
  ]);
  const [maze, setMaze] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const nextDirRef = useRef<Direction>('RIGHT');

  const MAZE_WIDTH = 19;
  const MAZE_HEIGHT = 21;
  const CELL_SIZE = 25;

  // Maze layout: 0 = empty, 1 = wall, 2 = dot, 3 = power pellet
  const INITIAL_MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          wall: '#008f11',
          dot: '#ffff00',
          pacman: '#ffff00',
          text: '#00ff41'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          wall: '#cc8800',
          dot: '#ffffff',
          pacman: '#ffff00',
          text: '#ffb000'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          wall: '#00cccc',
          dot: '#ffffff',
          pacman: '#ffff00',
          text: '#00ffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          wall: '#0000ff',
          dot: '#ffff00',
          pacman: '#ffff00',
          text: '#00ff41'
        };
    }
  };

  const colors = getThemeColors();

  const isValidMove = useCallback((x: number, y: number, maze: number[][]) => {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    return maze[y][x] !== 1;
  }, []);

  const getDirectionOffset = (direction: Direction) => {
    switch (direction) {
      case 'UP': return { x: 0, y: -1 };
      case 'DOWN': return { x: 0, y: 1 };
      case 'LEFT': return { x: -1, y: 0 };
      case 'RIGHT': return { x: 1, y: 0 };
    }
  };

  const resetGame = useCallback(() => {
    setPacmanPos({ x: 9, y: 15 });
    setPacmanDir('RIGHT');
    setGhosts([
      { x: 9, y: 9, direction: 'UP', color: '#ff0000' },
      { x: 10, y: 9, direction: 'DOWN', color: '#ffb8ff' },
      { x: 8, y: 9, direction: 'LEFT', color: '#00ffff' },
      { x: 11, y: 9, direction: 'RIGHT', color: '#ffb852' }
    ]);
    setMaze(INITIAL_MAZE.map(row => [...row]));
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    setGameStarted(true);
    nextDirRef.current = 'RIGHT';
  }, []);

  const updateGame = useCallback(() => {
    if (gameOver || gameWon || isPaused || !gameStarted) return;

    // Move Pacman
    setPacmanPos(prevPos => {
      const offset = getDirectionOffset(nextDirRef.current);
      const newX = prevPos.x + offset.x;
      const newY = prevPos.y + offset.y;

      if (isValidMove(newX, newY, maze)) {
        setPacmanDir(nextDirRef.current);
        
        // Handle maze wrapping (tunnel effect)
        let finalX = newX;
        if (newX < 0) finalX = MAZE_WIDTH - 1;
        if (newX >= MAZE_WIDTH) finalX = 0;

        // Collect dots
        setMaze(prevMaze => {
          const newMaze = [...prevMaze];
          if (newMaze[newY][finalX] === 2) {
            newMaze[newY][finalX] = 0;
            setScore(prev => prev + 10);
          } else if (newMaze[newY][finalX] === 3) {
            newMaze[newY][finalX] = 0;
            setScore(prev => prev + 50);
          }

          // Check win condition
          const hasDotsLeft = newMaze.some(row => row.some(cell => cell === 2 || cell === 3));
          if (!hasDotsLeft) {
            setGameWon(true);
          }

          return newMaze;
        });

        return { x: finalX, y: newY };
      }

      return prevPos;
    });

    // Move Ghosts (simple AI)
    setGhosts(prevGhosts => {
      return prevGhosts.map(ghost => {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirections = directions.filter(dir => {
          const offset = getDirectionOffset(dir);
          return isValidMove(ghost.x + offset.x, ghost.y + offset.y, maze);
        });

        if (validDirections.length === 0) return ghost;

        // Simple AI: prefer moving towards Pacman, but add randomness
        let chosenDirection = ghost.direction;
        if (Math.random() < 0.3 || !validDirections.includes(ghost.direction)) {
          chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
        }

        const offset = getDirectionOffset(chosenDirection);
        let newX = ghost.x + offset.x;
        let newY = ghost.y + offset.y;

        // Handle wrapping
        if (newX < 0) newX = MAZE_WIDTH - 1;
        if (newX >= MAZE_WIDTH) newX = 0;

        return {
          ...ghost,
          x: newX,
          y: newY,
          direction: chosenDirection
        };
      });
    });

    // Check collision with ghosts
    setGhosts(prevGhosts => {
      const collision = prevGhosts.some(ghost => 
        Math.abs(ghost.x - pacmanPos.x) < 1 && Math.abs(ghost.y - pacmanPos.y) < 1
      );

      if (collision) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            // Reset positions
            setPacmanPos({ x: 9, y: 15 });
            setPacmanDir('RIGHT');
            nextDirRef.current = 'RIGHT';
          }
          return newLives;
        });
      }

      return prevGhosts;
    });
  }, [gameOver, gameWon, isPaused, gameStarted, maze, isValidMove, pacmanPos]);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && !isPaused) {
      gameLoopRef.current = setInterval(updateGame, 200); // Slower for classic feel
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
        return;
      }

      // Set next direction
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          nextDirRef.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          nextDirRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          nextDirRef.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          nextDirRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, gameStarted, gameOver, gameWon, resetGame]);

  // Initialize maze
  useEffect(() => {
    setMaze(INITIAL_MAZE.map(row => [...row]));
  }, []);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
          PAC-MAN
        </h1>
        <div className="flex items-center justify-center space-x-8 text-lg font-mono">
          <span>Score: {score}</span>
          <span>Lives: {lives}</span>
        </div>
      </div>

      <div 
        className="relative border-2 mb-6"
        style={{ 
          width: MAZE_WIDTH * CELL_SIZE, 
          height: MAZE_HEIGHT * CELL_SIZE, 
          borderColor: colors.primary,
          backgroundColor: colors.bg
        }}
      >
        {/* Maze */}
        {maze.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 1) {
              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: colors.wall
                  }}
                />
              );
            } else if (cell === 2) {
              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute rounded-full"
                  style={{
                    left: x * CELL_SIZE + CELL_SIZE/2 - 2,
                    top: y * CELL_SIZE + CELL_SIZE/2 - 2,
                    width: 4,
                    height: 4,
                    backgroundColor: colors.dot
                  }}
                />
              );
            } else if (cell === 3) {
              return (
                <motion.div
                  key={`${x}-${y}`}
                  className="absolute rounded-full"
                  style={{
                    left: x * CELL_SIZE + CELL_SIZE/2 - 6,
                    top: y * CELL_SIZE + CELL_SIZE/2 - 6,
                    width: 12,
                    height: 12,
                    backgroundColor: colors.dot
                  }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              );
            }
            return null;
          })
        )}

        {/* Pacman */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: pacmanPos.x * CELL_SIZE + 2,
            top: pacmanPos.y * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            backgroundColor: colors.pacman
          }}
          animate={{ 
            scale: [1, 0.8, 1],
            rotate: pacmanDir === 'RIGHT' ? 0 : pacmanDir === 'DOWN' ? 90 : pacmanDir === 'LEFT' ? 180 : 270
          }}
          transition={{ scale: { duration: 0.2, repeat: Infinity } }}
        />

        {/* Ghosts */}
        {ghosts.map((ghost, index) => (
          <motion.div
            key={index}
            className="absolute rounded-t-full"
            style={{
              left: ghost.x * CELL_SIZE + 2,
              top: ghost.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              backgroundColor: ghost.color,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 70% 85%, 55% 100%, 40% 85%, 25% 100%, 10% 85%, 0% 100%)'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: index * 0.1 }}
          />
        ))}

        {/* Game State Overlays */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                PAC-MAN
              </h2>
              <p className="text-lg mb-4">Use Arrow Keys or WASD to move</p>
              <p className="text-lg mb-6">Collect all dots while avoiding ghosts!</p>
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
              <p className="text-2xl mb-6">Final Score: {score}</p>
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
                YOU WIN!
              </h2>
              <p className="text-2xl mb-6">Final Score: {score}</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm opacity-75">
        <p>ESC: Exit | SPACE: Pause/Resume</p>
        <p>Arrow Keys or WASD: Move</p>
      </div>
    </div>
  );
}; 
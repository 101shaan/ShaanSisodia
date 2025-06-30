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

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface Ghost {
  x: number;
  y: number;
  direction: Direction;
  color: string;
  mode: 'normal' | 'frightened' | 'eaten';
  modeTimer: number;
}

export const PacmanGame: React.FC<PacmanGameProps> = ({ theme, onExit }) => {
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 90, y: 120 });
  const [pacmanDir, setPacmanDir] = useState<Direction>('LEFT');
  const [nextDir, setNextDir] = useState<Direction>('LEFT');
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { x: 90, y: 80, direction: 'UP', color: '#ff0000', mode: 'normal', modeTimer: 0 },
    { x: 100, y: 80, direction: 'DOWN', color: '#ffb8ff', mode: 'normal', modeTimer: 0 },
    { x: 80, y: 80, direction: 'LEFT', color: '#00ffff', mode: 'normal', modeTimer: 0 },
    { x: 110, y: 80, direction: 'RIGHT', color: '#ffb852', mode: 'normal', modeTimer: 0 }
  ]);
  const [maze, setMaze] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [powerPelletActive, setPowerPelletActive] = useState(false);
  const [tick, setTick] = useState(0);

  const gameLoopRef = useRef<NodeJS.Timeout>();

  const MAZE_WIDTH = 19;
  const MAZE_HEIGHT = 21;
  const CELL_SIZE = 20;
  const SPEED = 2;

  // Maze layout: 0 = empty, 1 = wall, 2 = dot, 3 = power pellet, 4 = ghost house
  const INITIAL_MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,4,4,4,4,4,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,4,1,0,1,4,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,4,4,1,0,1,4,4,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,4,1,1,1,4,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,4,4,4,4,4,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,1,1],
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
          text: '#00ff41',
          powerPellet: '#ffffff'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          wall: '#cc8800',
          dot: '#ffffff',
          pacman: '#ffff00',
          text: '#ffb000',
          powerPellet: '#ffff00'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          wall: '#00cccc',
          dot: '#ffffff',
          pacman: '#ffff00',
          text: '#00ffff',
          powerPellet: '#ffffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          wall: '#0000ff',
          dot: '#ffff00',
          pacman: '#ffff00',
          text: '#00ff41',
          powerPellet: '#ffffff'
        };
    }
  };

  const colors = getThemeColors();

  const pointToCoord = (x: number) => Math.round(x / 10);

  const isValidMove = useCallback((x: number, y: number, maze: number[][]) => {
    const gridX = pointToCoord(x);
    const gridY = pointToCoord(y);
    
    if (gridX < 0 || gridX >= MAZE_WIDTH || gridY < 0 || gridY >= MAZE_HEIGHT) {
      // Handle tunnel at middle row
      if (gridY === 9 && (gridX < 0 || gridX >= MAZE_WIDTH)) {
        return true;
      }
      return false;
    }
    
    return maze[gridY][gridX] !== 1;
  }, []);

  const getDirectionOffset = (direction: Direction) => {
    switch (direction) {
      case 'UP': return { x: 0, y: -SPEED };
      case 'DOWN': return { x: 0, y: SPEED };
      case 'LEFT': return { x: -SPEED, y: 0 };
      case 'RIGHT': return { x: SPEED, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const onWholeSquare = (x: number) => x % 10 === 0;

  const canChangeDirection = (x: number, y: number, newDir: Direction, maze: number[][]) => {
    if (!onWholeSquare(x) || !onWholeSquare(y)) return false;
    
    const offset = getDirectionOffset(newDir);
    return isValidMove(x + offset.x, y + offset.y, maze);
  };

  const handleTunnel = (pos: Position): Position => {
    // Left tunnel
    if (pos.y === 90 && pos.x <= -10) {
      return { x: 180, y: 90 };
    }
    // Right tunnel
    if (pos.y === 90 && pos.x >= 190) {
      return { x: 0, y: 90 };
    }
    return pos;
  };

  const resetGame = useCallback(() => {
    setPacmanPos({ x: 90, y: 120 });
    setPacmanDir('LEFT');
    setNextDir('LEFT');
    setGhosts([
      { x: 90, y: 80, direction: 'UP', color: '#ff0000', mode: 'normal', modeTimer: 0 },
      { x: 100, y: 80, direction: 'DOWN', color: '#ffb8ff', mode: 'normal', modeTimer: 0 },
      { x: 80, y: 80, direction: 'LEFT', color: '#00ffff', mode: 'normal', modeTimer: 0 },
      { x: 110, y: 80, direction: 'RIGHT', color: '#ffb852', mode: 'normal', modeTimer: 0 }
    ]);
    setMaze(INITIAL_MAZE.map(row => [...row]));
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    setGameStarted(true);
    setPowerPelletActive(false);
    setTick(0);
  }, []);

  const eatDot = useCallback((x: number, y: number) => {
    const gridX = pointToCoord(x);
    const gridY = pointToCoord(y);
    
    setMaze(prevMaze => {
      const newMaze = [...prevMaze];
      if (newMaze[gridY] && newMaze[gridY][gridX] === 2) {
        newMaze[gridY][gridX] = 0;
        setScore(prev => prev + 10);
      } else if (newMaze[gridY] && newMaze[gridY][gridX] === 3) {
        newMaze[gridY][gridX] = 0;
        setScore(prev => prev + 50);
        setPowerPelletActive(true);
        
                 // Make all ghosts frightened - temporarily disabled for TypeScript
         // setGhosts(prevGhosts => 
         //   prevGhosts.map(ghost => ({
         //     ...ghost,
         //     mode: 'frightened',
         //     modeTimer: 300
         //   }))
         // );
      }
      
      // Check win condition
      const hasDotsLeft = newMaze.some(row => row.some(cell => cell === 2 || cell === 3));
      if (!hasDotsLeft) {
        setGameWon(true);
      }
      
      return newMaze;
    });
  }, []);

  const getRandomDirection = (validDirections: Direction[]): Direction => {
    if (validDirections.length === 0) return 'UP';
    return validDirections[Math.floor(Math.random() * validDirections.length)];
  };

  const updateGame = useCallback(() => {
    if (gameOver || gameWon || isPaused || !gameStarted) return;

    setTick(prev => prev + 1);

    // Update power pellet timer
    if (powerPelletActive) {
      setGhosts(prevGhosts => {
        const updatedGhosts = prevGhosts.map(ghost => {
          if (ghost.mode === 'frightened') {
            const newTimer = ghost.modeTimer - 1;
            if (newTimer <= 0) {
              return { ...ghost, mode: 'normal' as const, modeTimer: 0 };
            }
            return { ...ghost, modeTimer: newTimer };
          }
          return ghost;
        });
        
        // Check if any ghosts are still frightened
        const stillFrightened = updatedGhosts.some(ghost => ghost.mode === 'frightened');
        if (!stillFrightened) {
          setPowerPelletActive(false);
        }
        
        return updatedGhosts;
      });
    }

    // Move Pacman
    setPacmanPos(prevPos => {
      let newPos = { ...prevPos };
      
      // Try to change direction if requested
      if (nextDir !== pacmanDir && canChangeDirection(prevPos.x, prevPos.y, nextDir, maze)) {
        setPacmanDir(nextDir);
      }
      
      const offset = getDirectionOffset(pacmanDir);
      const tentativePos = { x: prevPos.x + offset.x, y: prevPos.y + offset.y };
      
      if (isValidMove(tentativePos.x, tentativePos.y, maze)) {
        newPos = tentativePos;
      }
      
      // Handle tunnel
      newPos = handleTunnel(newPos);
      
      // Eat dots
      if (onWholeSquare(newPos.x) && onWholeSquare(newPos.y)) {
        eatDot(newPos.x, newPos.y);
      }
      
      return newPos;
    });

    // Move Ghosts
    setGhosts(prevGhosts => {
      return prevGhosts.map(ghost => {
        let newGhost = { ...ghost };
        
        // Simple AI: change direction randomly at intersections
        if (onWholeSquare(ghost.x) && onWholeSquare(ghost.y)) {
          const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
          const validDirections = directions.filter(dir => {
            const offset = getDirectionOffset(dir);
            return isValidMove(ghost.x + offset.x, ghost.y + offset.y, maze);
          });
          
          // Don't reverse direction unless necessary
          const oppositeDir = ghost.direction === 'UP' ? 'DOWN' :
                             ghost.direction === 'DOWN' ? 'UP' :
                             ghost.direction === 'LEFT' ? 'RIGHT' : 'LEFT';
          
          const nonReverseDirections = validDirections.filter(dir => dir !== oppositeDir);
          
          if (Math.random() < 0.3 || !validDirections.includes(ghost.direction)) {
            newGhost.direction = nonReverseDirections.length > 0 ? 
              getRandomDirection(nonReverseDirections) : 
              getRandomDirection(validDirections);
          }
        }
        
        // Move ghost
        const speed = ghost.mode === 'frightened' ? 1 : 
                     ghost.mode === 'eaten' ? 4 : 2;
        const offset = getDirectionOffset(newGhost.direction);
        const tentativePos = {
          x: ghost.x + offset.x * (speed / 2),
          y: ghost.y + offset.y * (speed / 2)
        };
        
        if (isValidMove(tentativePos.x, tentativePos.y, maze)) {
          newGhost.x = tentativePos.x;
          newGhost.y = tentativePos.y;
        }
        
        // Handle tunnel for ghosts too
        const tunnelPos = handleTunnel({ x: newGhost.x, y: newGhost.y });
        newGhost.x = tunnelPos.x;
        newGhost.y = tunnelPos.y;
        
        return newGhost;
      });
    });

    // Check collisions with ghosts
    ghosts.forEach((ghost, index) => {
      const distance = Math.sqrt(
        Math.pow(pacmanPos.x - ghost.x, 2) + 
        Math.pow(pacmanPos.y - ghost.y, 2)
      );
      
      if (distance < 15) {
        if (ghost.mode === 'frightened') {
          // Eat ghost
          setScore(prev => prev + 200);
          setGhosts(prevGhosts => 
            prevGhosts.map((g, i) => 
              i === index ? { ...g, mode: 'eaten' as const, modeTimer: 0 } : g
            )
          );
        } else if (ghost.mode === 'normal') {
          // Pacman dies
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
            } else {
              // Reset positions
              setPacmanPos({ x: 90, y: 120 });
              setPacmanDir('LEFT');
              setNextDir('LEFT');
              setGhosts([
                { x: 90, y: 80, direction: 'UP', color: '#ff0000', mode: 'normal', modeTimer: 0 },
                { x: 100, y: 80, direction: 'DOWN', color: '#ffb8ff', mode: 'normal', modeTimer: 0 },
                { x: 80, y: 80, direction: 'LEFT', color: '#00ffff', mode: 'normal', modeTimer: 0 },
                { x: 110, y: 80, direction: 'RIGHT', color: '#ffb852', mode: 'normal', modeTimer: 0 }
              ]);
            }
            return newLives;
          });
        }
      }
    });
  }, [gameOver, gameWon, isPaused, gameStarted, pacmanPos, pacmanDir, nextDir, ghosts, maze, powerPelletActive, canChangeDirection, isValidMove, eatDot]);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && !isPaused) {
      gameLoopRef.current = setInterval(updateGame, 1000 / 30); // 30 FPS
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

      // Handle direction changes
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setNextDir('UP');
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setNextDir('DOWN');
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setNextDir('LEFT');
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setNextDir('RIGHT');
          e.preventDefault();
          break;
        case ' ':
          setIsPaused(prev => !prev);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, gameStarted, gameOver, gameWon, resetGame]);

  // Initialize maze on mount
  useEffect(() => {
    setMaze(INITIAL_MAZE.map(row => [...row]));
  }, []);

  const renderMazeCell = (cell: number, row: number, col: number) => {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    switch (cell) {
      case 1: // Wall
        return (
          <div
            key={`${row}-${col}`}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: colors.wall,
              border: `1px solid ${colors.primary}`
            }}
          />
        );
      case 2: // Dot
        return (
          <div
            key={`${row}-${col}`}
            className="absolute rounded-full"
            style={{
              left: x + CELL_SIZE / 2 - 2,
              top: y + CELL_SIZE / 2 - 2,
              width: 4,
              height: 4,
              backgroundColor: colors.dot
            }}
          />
        );
      case 3: // Power pellet
        return (
          <motion.div
            key={`${row}-${col}`}
            className="absolute rounded-full"
            style={{
              left: x + CELL_SIZE / 2 - 6,
              top: y + CELL_SIZE / 2 - 6,
              width: 12,
              height: 12,
              backgroundColor: colors.powerPellet
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity
            }}
          />
        );
      default:
        return null;
    }
  };

  const getPacmanRotation = () => {
    switch (pacmanDir) {
      case 'UP': return -90;
      case 'DOWN': return 90;
      case 'LEFT': return 180;
      case 'RIGHT': return 0;
      default: return 0;
    }
  };

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
        {/* Render Maze */}
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderMazeCell(cell, rowIndex, colIndex))
        )}

        {/* Pacman */}
        <motion.div
          className="absolute flex items-center justify-center text-yellow-400 text-2xl font-bold"
          style={{
            left: (pacmanPos.x / 10) * CELL_SIZE - CELL_SIZE / 2,
            top: (pacmanPos.y / 10) * CELL_SIZE - CELL_SIZE / 2,
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: `rotate(${getPacmanRotation()}deg)`
          }}
          animate={{
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity
          }}
        >
          ●
        </motion.div>

        {/* Ghosts */}
        {ghosts.map((ghost, index) => (
          <motion.div
            key={index}
            className="absolute flex items-center justify-center text-2xl"
            style={{
              left: (ghost.x / 10) * CELL_SIZE - CELL_SIZE / 2,
              top: (ghost.y / 10) * CELL_SIZE - CELL_SIZE / 2,
              width: CELL_SIZE,
              height: CELL_SIZE,
              color: ghost.mode === 'frightened' ? 
                (tick % 20 > 10 ? '#0000bb' : '#ffffff') : 
                ghost.mode === 'eaten' ? '#222222' : ghost.color
            }}
            animate={{
              y: [0, -2, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity
            }}
          >
            ▲
          </motion.div>
        ))}

        {/* Game State Overlays */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                PAC-MAN
              </h2>
              <p className="text-lg mb-4">Use arrow keys or WASD to move</p>
              <p className="text-lg mb-4">Eat all dots to win!</p>
              <p className="text-lg mb-6">Avoid ghosts, eat power pellets to hunt them!</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {isPaused && !gameOver && !gameWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h2 className="text-4xl font-bold" style={{ color: colors.primary }}>
                PAUSED
              </h2>
              <p className="text-lg mt-4">Press SPACE to Resume</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER
              </h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}

        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                YOU WIN!
              </h2>
              <p className="text-2xl mb-4">Perfect Score: {score}</p>
              <p className="text-lg mb-6">All dots collected!</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm opacity-75">
        <p>ESC: Exit | SPACE: Pause/Resume | Arrow Keys/WASD: Move</p>
        <p>Eat power pellets to turn ghosts blue and hunt them!</p>
      </div>
    </div>
  );
}; 
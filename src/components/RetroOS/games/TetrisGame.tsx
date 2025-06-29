import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface TetrisGameProps {
  theme: string;
  onExit: () => void;
}

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({ theme, onExit }) => {
  const [board, setBoard] = useState<string[][]>(() => 
    Array(20).fill(null).map(() => Array(10).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const dropTimeRef = useRef(1000);

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          border: '#00ff41'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          border: '#ffb000'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          border: '#00ffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          border: '#00ff41'
        };
    }
  };

  const colors = getThemeColors();

  const tetrominoes: { [key in TetrominoType]: { shape: number[][], color: string } } = {
    I: {
      shape: [
        [1, 1, 1, 1]
      ],
      color: '#00ffff'
    },
    O: {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: '#ffff00'
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: '#800080'
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: '#00ff00'
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: '#ff0000'
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: '#0000ff'
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: '#ffa500'
    }
  };

  const createRandomPiece = useCallback((): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    const template = tetrominoes[type];
    
    return {
      type,
      shape: template.shape,
      x: Math.floor((10 - template.shape[0].length) / 2),
      y: 0,
      color: template.color
    };
  }, []);

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    
    return {
      ...piece,
      shape: rotated
    };
  };

  const isValidPosition = useCallback((piece: Tetromino, board: string[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= 10 || newY >= 20) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: Tetromino, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((board: string[][]): { newBoard: string[][], linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => !cell));
    const linesCleared = 20 - newBoard.length;
    
    while (newBoard.length < 20) {
      newBoard.unshift(Array(10).fill(''));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused || !gameStarted) return;

    setCurrentPiece(piece => {
      if (!piece) return null;

      if (isValidPosition(piece, board, 0, 1)) {
        return { ...piece, y: piece.y + 1 };
      } else {
        // Place piece and create new one
        const newBoard = placePiece(piece, board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        setBoard(clearedBoard);
        setLines(prev => prev + linesCleared);
        setScore(prev => prev + linesCleared * 100 * level);
        setLevel(Math.floor(lines / 10) + 1);
        
        // Check game over
        if (piece.y <= 1) {
          setGameOver(true);
          return null;
        }
        
        // Create new piece
        const newPiece = nextPiece || createRandomPiece();
        setNextPiece(createRandomPiece());
        
        if (!isValidPosition(newPiece, clearedBoard)) {
          setGameOver(true);
          return null;
        }
        
        return newPiece;
      }
    });
  }, [currentPiece, board, gameOver, isPaused, gameStarted, isValidPosition, placePiece, clearLines, nextPiece, createRandomPiece, level, lines]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(piece => {
      if (!piece) return null;
      
      if (isValidPosition(piece, board, dx, dy)) {
        return { ...piece, x: piece.x + dx, y: piece.y + dy };
      }
      
      return piece;
    });
  }, [currentPiece, board, gameOver, isPaused, isValidPosition]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(piece => {
      if (!piece) return null;
      
      const rotated = rotatePiece(piece);
      
      if (isValidPosition(rotated, board)) {
        return rotated;
      }
      
      return piece;
    });
  }, [currentPiece, board, gameOver, isPaused, isValidPosition]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(piece => {
      if (!piece) return null;
      
      let newY = piece.y;
      while (isValidPosition(piece, board, 0, newY - piece.y + 1)) {
        newY++;
      }
      
      return { ...piece, y: newY };
    });
  }, [currentPiece, board, gameOver, isPaused, isValidPosition]);

  const resetGame = useCallback(() => {
    setBoard(Array(20).fill(null).map(() => Array(10).fill('')));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    
    const firstPiece = createRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(createRandomPiece());
  }, [createRandomPiece]);

  useEffect(() => {
    dropTimeRef.current = Math.max(100, 1000 - (level - 1) * 100);
  }, [level]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(dropPiece, dropTimeRef.current);
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
  }, [dropPiece, gameStarted, gameOver, isPaused]);

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

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePieceHandler();
          break;
        case 'Enter':
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit, gameStarted, gameOver, resetGame, movePiece, rotatePieceHandler, hardDrop]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.primary }}
    >
      <div className="flex space-x-8">
        {/* Game Board */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
            TETRIS
          </h1>
          
          <div 
            className="relative border-2 grid grid-cols-10 gap-0"
            style={{ 
              borderColor: colors.border,
              width: '300px',
              height: '600px'
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="border"
                  style={{
                    backgroundColor: cell || colors.bg,
                    borderColor: colors.secondary + '40',
                    width: '30px',
                    height: '30px'
                  }}
                />
              ))
            )}
            
            {/* Game Over Overlay */}
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: `${colors.bg}CC` }}
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
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
                    Arrow Keys: Move | W: Rotate | Enter: Hard Drop
                  </p>
                  <p className="text-sm mb-4" style={{ color: colors.secondary }}>
                    Press SPACE to start
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col space-y-6">
          {/* Score */}
          <div 
            className="p-4 border-2"
            style={{ borderColor: colors.border }}
          >
            <h3 className="text-xl font-bold mb-2">SCORE</h3>
            <p className="text-2xl">{score}</p>
          </div>

          {/* Level */}
          <div 
            className="p-4 border-2"
            style={{ borderColor: colors.border }}
          >
            <h3 className="text-xl font-bold mb-2">LEVEL</h3>
            <p className="text-2xl">{level}</p>
          </div>

          {/* Lines */}
          <div 
            className="p-4 border-2"
            style={{ borderColor: colors.border }}
          >
            <h3 className="text-xl font-bold mb-2">LINES</h3>
            <p className="text-2xl">{lines}</p>
          </div>

          {/* Next Piece */}
          {nextPiece && (
            <div 
              className="p-4 border-2"
              style={{ borderColor: colors.border }}
            >
              <h3 className="text-xl font-bold mb-2">NEXT</h3>
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(4, 20px)` }}>
                {Array(4).fill(null).map((_, y) =>
                  Array(4).fill(null).map((_, x) => {
                    const hasBlock = nextPiece.shape[y] && nextPiece.shape[y][x];
                    return (
                      <div
                        key={`${y}-${x}`}
                        style={{
                          backgroundColor: hasBlock ? nextPiece.color : 'transparent',
                          width: '20px',
                          height: '20px',
                          border: hasBlock ? `1px solid ${colors.primary}` : 'none'
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          <div 
            className="p-4 border-2 text-sm"
            style={{ borderColor: colors.border, color: colors.secondary }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: colors.primary }}>CONTROLS</h3>
            <p>← → : Move</p>
            <p>↓ : Soft Drop</p>
            <p>↑ : Rotate</p>
            <p>Enter: Hard Drop</p>
            <p>Space: Pause</p>
            <p>ESC: Exit</p>
          </div>
        </div>
      </div>
    </div>
  );
};
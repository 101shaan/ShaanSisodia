import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ChessGameProps {
  theme: string;
  onExit: () => void;
}

type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

export const ChessGame: React.FC<ChessGameProps> = ({ theme, onExit }) => {
  const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          lightSquare: '#008f11',
          darkSquare: '#004408',
          text: '#00ff41',
          highlight: '#00ff41',
          validMove: '#ffff00'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          lightSquare: '#cc8800',
          darkSquare: '#664400',
          text: '#ffb000',
          highlight: '#ffb000',
          validMove: '#ffffff'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          lightSquare: '#00cccc',
          darkSquare: '#006666',
          text: '#00ffff',
          highlight: '#00ffff',
          validMove: '#ffffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          lightSquare: '#f0d9b5',
          darkSquare: '#b58863',
          text: '#00ff41',
          highlight: '#00ff41',
          validMove: '#ffff00'
        };
    }
  };

  const colors = getThemeColors();

  const initialBoard: (ChessPiece | null)[][] = [
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' }
    ],
    Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' } as ChessPiece)),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' } as ChessPiece)),
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' }
    ]
  ];

  const getPieceSymbol = (piece: ChessPiece): string => {
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };
    return symbols[piece.color][piece.type];
  };

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const getValidMoves = useCallback((piece: ChessPiece, fromRow: number, fromCol: number): Position[] => {
    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Forward move
        if (isValidPosition(fromRow + direction, fromCol) && !board[fromRow + direction][fromCol]) {
          moves.push({ row: fromRow + direction, col: fromCol });
          
          // Double move from starting position
          if (fromRow === startRow && !board[fromRow + 2 * direction][fromCol]) {
            moves.push({ row: fromRow + 2 * direction, col: fromCol });
          }
        }
        
        // Captures
        [-1, 1].forEach(colOffset => {
          const newRow = fromRow + direction;
          const newCol = fromCol + colOffset;
          if (isValidPosition(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol]!.color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
          }
        });
        break;

      case 'rook':
        // Horizontal and vertical moves
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([rowDir, colDir]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + rowDir * i;
            const newCol = fromCol + colDir * i;
            
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'bishop':
        // Diagonal moves
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([rowDir, colDir]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + rowDir * i;
            const newCol = fromCol + colDir * i;
            
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'queen':
        // Combination of rook and bishop
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([rowDir, colDir]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + rowDir * i;
            const newCol = fromCol + colDir * i;
            
            if (!isValidPosition(newRow, newCol)) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'king':
        // One square in any direction
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
          for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;
            const newRow = fromRow + rowOffset;
            const newCol = fromCol + colOffset;
            
            if (isValidPosition(newRow, newCol)) {
              const targetPiece = board[newRow][newCol];
              if (!targetPiece || targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
            }
          }
        }
        break;

      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([rowOffset, colOffset]) => {
          const newRow = fromRow + rowOffset;
          const newCol = fromCol + colOffset;
          
          if (isValidPosition(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        });
        break;
    }

    return moves;
  }, [board]);

  const makeMove = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      const piece = newBoard[fromRow][fromCol];
      
      if (!piece) return prevBoard;

      // Check for king capture (simplified win condition)
      const capturedPiece = newBoard[toRow][toCol];
      if (capturedPiece && capturedPiece.type === 'king') {
        setGameOver(true);
        setWinner(currentPlayer);
      }

      // Make the move
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;

      return newBoard;
    });

    setCurrentPlayer(prev => prev === 'white' ? 'black' : 'white');
    setSelectedSquare(null);
    setValidMoves([]);
  }, [currentPlayer]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || !gameStarted) return;

    const piece = board[row][col];

    if (selectedSquare) {
      // Check if this is a valid move
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves(piece, row, col));
    }
  };

  const resetGame = useCallback(() => {
    setBoard(initialBoard.map(row => row.map(piece => piece ? { ...piece } : null)));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setGameOver(false);
    setWinner(null);
    setGameStarted(true);
    setValidMoves([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (!gameStarted || gameOver) {
        if (e.key === ' ') {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, gameStarted, gameOver, resetGame]);

  useEffect(() => {
    setBoard(initialBoard.map(row => row.map(piece => piece ? { ...piece } : null)));
  }, []);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
          CHESS
        </h1>
        <div className="flex items-center justify-center space-x-8 text-lg font-mono">
          <span>Current Player: {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}</span>
        </div>
      </div>

      <div className="relative mb-6">
        <div 
          className="grid grid-cols-8 border-2"
          style={{ borderColor: colors.primary }}
        >
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-16 h-16 flex items-center justify-center text-4xl cursor-pointer relative"
                  style={{
                    backgroundColor: isSelected ? colors.highlight : 
                                   isLight ? colors.lightSquare : colors.darkSquare,
                    opacity: isSelected ? 0.8 : 1
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <span style={{ color: piece.color === 'white' ? '#ffffff' : '#000000' }}>
                      {getPieceSymbol(piece)}
                    </span>
                  )}
                  {isValidMove && (
                    <div 
                      className="absolute inset-2 rounded-full border-2 opacity-50"
                      style={{ borderColor: colors.validMove }}
                    />
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                CHESS
              </h2>
              <p className="text-lg mb-4">Click pieces to select and move</p>
              <p className="text-lg mb-6">White moves first</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER!
              </h2>
              {winner && (
                <div className="text-center mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded">
                  {winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!
                </div>
              )}
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Play Again
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm opacity-75">
        <p>ESC: Exit | SPACE: New Game</p>
        <p>Click to select pieces and make moves</p>
      </div>
    </div>
  );
}; 
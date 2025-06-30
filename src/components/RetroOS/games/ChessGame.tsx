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
  hasMoved?: boolean;
}

interface Position {
  row: number;
  col: number;
}

interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  gameOver: boolean;
  winner: PieceColor | null;
  gameStarted: boolean;
  selectedSquare: Position | null;
  validMoves: Position[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  canCastleKingside: { white: boolean; black: boolean };
  canCastleQueenside: { white: boolean; black: boolean };
  enPassantTarget: Position | null;
  moveHistory: string[];
}

export const ChessGame: React.FC<ChessGameProps> = ({ theme, onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentPlayer: 'white',
    gameOver: false,
    winner: null,
    gameStarted: false,
    selectedSquare: null,
    validMoves: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    canCastleKingside: { white: true, black: true },
    canCastleQueenside: { white: true, black: true },
    enPassantTarget: null,
    moveHistory: []
  });

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
          validMove: '#ffff00',
          check: '#ff0000'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          lightSquare: '#cc8800',
          darkSquare: '#664400',
          text: '#ffb000',
          highlight: '#ffb000',
          validMove: '#ffffff',
          check: '#ff4400'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          lightSquare: '#00cccc',
          darkSquare: '#006666',
          text: '#00ffff',
          highlight: '#00ffff',
          validMove: '#ffffff',
          check: '#ff4080'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          lightSquare: '#f0d9b5',
          darkSquare: '#b58863',
          text: '#00ff41',
          highlight: '#00ff41',
          validMove: '#ffff00',
          check: '#ff0000'
        };
    }
  };

  const colors = getThemeColors();

  const initialBoard: (ChessPiece | null)[][] = [
    [
      { type: 'rook', color: 'black', hasMoved: false },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black', hasMoved: false },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black', hasMoved: false }
    ],
    Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black', hasMoved: false } as ChessPiece)),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white', hasMoved: false } as ChessPiece)),
    [
      { type: 'rook', color: 'white', hasMoved: false },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white', hasMoved: false },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white', hasMoved: false }
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

  const findKing = useCallback((board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }, []);

  const isSquareAttacked = useCallback((board: (ChessPiece | null)[][], row: number, col: number, byColor: PieceColor): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === byColor) {
          const moves = getPieceMoves(board, piece, r, c, false); // Don't check for check to avoid recursion
          if (moves.some(move => move.row === row && move.col === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const isInCheck = useCallback((board: (ChessPiece | null)[][], color: PieceColor): boolean => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    return isSquareAttacked(board, kingPos.row, kingPos.col, color === 'white' ? 'black' : 'white');
  }, [findKing, isSquareAttacked]);

  const getPieceMoves = useCallback((board: (ChessPiece | null)[][], piece: ChessPiece, fromRow: number, fromCol: number, checkForCheck: boolean = true): Position[] => {
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
          if (isValidPosition(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (target && target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
            // En passant
            if (gameState.enPassantTarget && 
                gameState.enPassantTarget.row === newRow && 
                gameState.enPassantTarget.col === newCol) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        });
        break;

      case 'rook':
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

        // Castling
        if (!piece.hasMoved && checkForCheck) {
          const kingRow = piece.color === 'white' ? 7 : 0;
          
          // Kingside castling
          if (gameState.canCastleKingside[piece.color]) {
            const rook = board[kingRow][7];
            if (rook && rook.type === 'rook' && !rook.hasMoved &&
                !board[kingRow][5] && !board[kingRow][6] &&
                !isSquareAttacked(board, kingRow, 4, piece.color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, kingRow, 5, piece.color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, kingRow, 6, piece.color === 'white' ? 'black' : 'white')) {
              moves.push({ row: kingRow, col: 6 });
            }
          }

          // Queenside castling
          if (gameState.canCastleQueenside[piece.color]) {
            const rook = board[kingRow][0];
            if (rook && rook.type === 'rook' && !rook.hasMoved &&
                !board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3] &&
                !isSquareAttacked(board, kingRow, 4, piece.color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, kingRow, 3, piece.color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, kingRow, 2, piece.color === 'white' ? 'black' : 'white')) {
              moves.push({ row: kingRow, col: 2 });
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

    // Filter out moves that would put own king in check
    if (checkForCheck) {
      return moves.filter(move => {
        const newBoard = board.map(row => [...row]);
        newBoard[move.row][move.col] = piece;
        newBoard[fromRow][fromCol] = null;
        return !isInCheck(newBoard, piece.color);
      });
    }

    return moves;
  }, [gameState, isValidPosition, isSquareAttacked, isInCheck]);

  const getAllValidMoves = useCallback((board: (ChessPiece | null)[][], color: PieceColor): Position[][] => {
    const allMoves: Position[][] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const moves = getPieceMoves(board, piece, row, col);
          if (moves.length > 0) {
            allMoves.push(moves);
          }
        }
      }
    }
    return allMoves;
  }, [getPieceMoves]);

  const isCheckmate = useCallback((board: (ChessPiece | null)[][], color: PieceColor): boolean => {
    if (!isInCheck(board, color)) return false;
    const allMoves = getAllValidMoves(board, color);
    return allMoves.every(moves => moves.length === 0);
  }, [isInCheck, getAllValidMoves]);

  const isStalemate = useCallback((board: (ChessPiece | null)[][], color: PieceColor): boolean => {
    if (isInCheck(board, color)) return false;
    const allMoves = getAllValidMoves(board, color);
    return allMoves.every(moves => moves.length === 0);
  }, [isInCheck, getAllValidMoves]);

  const makeMove = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    setGameState(prevState => {
      const newBoard = prevState.board.map(row => [...row]);
      const piece = newBoard[fromRow][fromCol];
      
      if (!piece) return prevState;

      const newState = { ...prevState };
      
      // Handle castling
      if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
        const rookFromCol = toCol > fromCol ? 7 : 0;
        const rookToCol = toCol > fromCol ? 5 : 3;
        const rook = newBoard[fromRow][rookFromCol];
        if (rook) {
          newBoard[fromRow][rookToCol] = { ...rook, hasMoved: true };
          newBoard[fromRow][rookFromCol] = null;
        }
      }

      // Handle en passant
      if (piece.type === 'pawn' && prevState.enPassantTarget && 
          toRow === prevState.enPassantTarget.row && toCol === prevState.enPassantTarget.col) {
        const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
        newBoard[capturedPawnRow][toCol] = null;
      }

      // Set en passant target
      newState.enPassantTarget = null;
      if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        newState.enPassantTarget = { row: fromRow + (toRow - fromRow) / 2, col: fromCol };
      }

      // Update castling rights
      if (piece.type === 'king') {
        newState.canCastleKingside[piece.color] = false;
        newState.canCastleQueenside[piece.color] = false;
      }
      if (piece.type === 'rook') {
        if (fromCol === 0) newState.canCastleQueenside[piece.color] = false;
        if (fromCol === 7) newState.canCastleKingside[piece.color] = false;
      }

      // Make the move
      newBoard[toRow][toCol] = { ...piece, hasMoved: true };
      newBoard[fromRow][fromCol] = null;

      // Pawn promotion
      if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
        newBoard[toRow][toCol] = { type: 'queen', color: piece.color, hasMoved: true };
      }

      const nextPlayer = prevState.currentPlayer === 'white' ? 'black' : 'white';
      
      // Check game state
      const inCheck = isInCheck(newBoard, nextPlayer);
      const checkmate = isCheckmate(newBoard, nextPlayer);
      const stalemate = isStalemate(newBoard, nextPlayer);

      return {
        ...newState,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedSquare: null,
        validMoves: [],
        isCheck: inCheck,
        isCheckmate: checkmate,
        isStalemate: stalemate,
        gameOver: checkmate || stalemate,
        winner: checkmate ? prevState.currentPlayer : null,
        moveHistory: [...prevState.moveHistory, `${String.fromCharCode(97 + fromCol)}${8 - fromRow}-${String.fromCharCode(97 + toCol)}${8 - toRow}`]
      };
    });
  }, [isInCheck, isCheckmate, isStalemate]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.gameOver || !gameState.gameStarted) return;

    const piece = gameState.board[row][col];

    if (gameState.selectedSquare) {
      const isValidMove = gameState.validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        makeMove(gameState.selectedSquare.row, gameState.selectedSquare.col, row, col);
      } else {
        setGameState(prev => ({ ...prev, selectedSquare: null, validMoves: [] }));
      }
    } else if (piece && piece.color === gameState.currentPlayer) {
      const moves = getPieceMoves(gameState.board, piece, row, col);
      setGameState(prev => ({ 
        ...prev, 
        selectedSquare: { row, col }, 
        validMoves: moves 
      }));
    }
  };

  const resetGame = useCallback(() => {
    setGameState({
      board: initialBoard.map(row => row.map(piece => piece ? { ...piece } : null)),
      currentPlayer: 'white',
      gameOver: false,
      winner: null,
      gameStarted: true,
      selectedSquare: null,
      validMoves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      canCastleKingside: { white: true, black: true },
      canCastleQueenside: { white: true, black: true },
      enPassantTarget: null,
      moveHistory: []
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (!gameState.gameStarted || gameState.gameOver) {
        if (e.key === ' ') {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, gameState.gameStarted, gameState.gameOver, resetGame]);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      board: initialBoard.map(row => row.map(piece => piece ? { ...piece } : null))
    }));
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
          <span>Current Player: {gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)}</span>
          {gameState.isCheck && <span style={{ color: colors.check }}>CHECK!</span>}
        </div>
      </div>

      <div className="relative mb-6">
        <div 
          className="grid grid-cols-8 border-2"
          style={{ borderColor: colors.primary }}
        >
          {gameState.board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = gameState.selectedSquare?.row === rowIndex && gameState.selectedSquare?.col === colIndex;
              const isValidMove = gameState.validMoves.some(move => move.row === rowIndex && move.col === colIndex);
              const kingPos = findKing(gameState.board, gameState.currentPlayer);
              const isKingInCheck = gameState.isCheck && kingPos && kingPos.row === rowIndex && kingPos.col === colIndex;
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-16 h-16 flex items-center justify-center text-4xl cursor-pointer relative"
                  style={{
                    backgroundColor: isKingInCheck ? colors.check : 
                                   isSelected ? colors.highlight : 
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

        {!gameState.gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                CHESS
              </h2>
              <p className="text-lg mb-4">Full chess with castling, en passant, and checkmate detection</p>
              <p className="text-lg mb-6">White moves first</p>
              <p className="text-xl font-bold" style={{ color: colors.primary }}>
                Press SPACE to Start
              </p>
            </div>
          </div>
        )}

        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER!
              </h2>
              {gameState.isCheckmate && gameState.winner && (
                <div className="text-center mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded">
                  Checkmate! {gameState.winner.charAt(0).toUpperCase() + gameState.winner.slice(1)} Wins!
                </div>
              )}
              {gameState.isStalemate && (
                <div className="text-center mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded">
                  Stalemate! It's a Draw!
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
        <p>Supports castling, en passant, and pawn promotion</p>
      </div>
    </div>
  );
}; 
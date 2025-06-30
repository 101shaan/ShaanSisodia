import React, { useState, useEffect, useCallback, useRef } from 'react';

interface PacmanGameProps {
  theme: string;
  onExit: () => void;
}

const UP = 3;
const LEFT = 2;
const DOWN = 1;
const RIGHT = 11;
const WAITING = 5;
const PAUSE = 6;
const PLAYING = 7;
const DYING = 10;

export const PacmanGame: React.FC<PacmanGameProps> = ({ theme, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameStateRef = useRef(WAITING);
  const tickRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  
  const [, setScore] = useState(0);
  const [, setLives] = useState(3);
  const [, setGameState] = useState(WAITING);

  // Game map
  const map = [
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

  const gameMap = useRef([...map.map(row => [...row])]);
  const blockSize = 18;

  // Game objects
  const pacman = useRef({
    x: 90, y: 160,
    direction: LEFT,
    due: LEFT
  });

  const ghosts = useRef([
    { x: 90, y: 80, direction: UP, color: '#ff0000', eatable: null as number | null, eaten: null as number | null },
    { x: 100, y: 80, direction: DOWN, color: '#ffb8ff', eatable: null as number | null, eaten: null as number | null },
    { x: 80, y: 80, direction: LEFT, color: '#00ffff', eatable: null as number | null, eaten: null as number | null },
    { x: 110, y: 80, direction: RIGHT, color: '#ffb852', eatable: null as number | null, eaten: null as number | null }
  ]);

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { bg: '#000000', primary: '#00ff41', wall: '#008f11', dot: '#ffff00', pacman: '#ffff00', powerPellet: '#ffffff' };
      case 'amber':
        return { bg: '#1a0f00', primary: '#ffb000', wall: '#cc8800', dot: '#ffffff', pacman: '#ffff00', powerPellet: '#ffff00' };
      case 'cyan':
        return { bg: '#001a1a', primary: '#00ffff', wall: '#00cccc', dot: '#ffffff', pacman: '#ffff00', powerPellet: '#ffffff' };
      default:
        return { bg: '#000000', primary: '#00ff41', wall: '#0000ff', dot: '#ffff00', pacman: '#ffff00', powerPellet: '#ffffff' };
    }
  };

  const colors = getThemeColors();

  const pointToCoord = (x: number) => Math.round(x / 10);
  const onWholeSquare = (x: number) => x % 10 === 0;

  const isWallSpace = (pos: { x: number; y: number }) => {
    if (pos.y < 0 || pos.y >= gameMap.current.length || pos.x < 0 || pos.x >= gameMap.current[0].length) {
      return pos.y !== 9; // Tunnel row
    }
    return gameMap.current[pos.y][pos.x] === 1;
  };

  const isFloorSpace = (pos: { x: number; y: number }) => !isWallSpace(pos);

  const getNewCoord = (dir: number, current: { x: number; y: number }, speed = 2) => {
    const xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0);
    const ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);
    return {
      x: addBounded(current.x, xSpeed),
      y: addBounded(current.y, ySpeed)
    };
  };

  const addBounded = (x1: number, x2: number) => {
    const rem = x1 % 10;
    const result = rem + x2;
    if (rem !== 0 && result > 10) {
      return x1 + (10 - rem);
    } else if (rem > 0 && result < 0) {
      return x1 - rem;
    }
    return x1 + x2;
  };

  const nextSquare = (x: number, dir: number) => {
    const rem = x % 10;
    if (rem === 0) return x;
    else if (dir === RIGHT || dir === DOWN) return x + (10 - rem);
    else return x - rem;
  };

  const next = (pos: { x: number; y: number }, dir: number) => ({
    y: pointToCoord(nextSquare(pos.y, dir)),
    x: pointToCoord(nextSquare(pos.x, dir))
  });

  const onGridSquare = (pos: { x: number; y: number }) => 
    onWholeSquare(pos.y) && onWholeSquare(pos.x);

  const handleTunnel = (pos: { x: number; y: number }) => {
    if (pos.y === 90 && pos.x <= -10) return { x: 180, y: 90 };
    if (pos.y === 90 && pos.x >= 190) return { x: 0, y: 90 };
    return pos;
  };

  const movePacman = () => {
    const onGrid = onGridSquare(pacman.current);
    let npos = null;

    if (pacman.current.due !== pacman.current.direction) {
      npos = getNewCoord(pacman.current.due, pacman.current);
      if (onGrid && isFloorSpace(next(npos, pacman.current.due))) {
        pacman.current.direction = pacman.current.due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = getNewCoord(pacman.current.direction, pacman.current);
    }

    if (onGrid && isWallSpace(next(npos, pacman.current.direction))) {
      return;
    }

    pacman.current.x = npos.x;
    pacman.current.y = npos.y;

    const tunnelPos = handleTunnel(pacman.current);
    pacman.current.x = tunnelPos.x;
    pacman.current.y = tunnelPos.y;

    // Eat dots
    const gridX = pointToCoord(pacman.current.x);
    const gridY = pointToCoord(pacman.current.y);
    
    if (gameMap.current[gridY] && gameMap.current[gridY][gridX] === 2) {
      gameMap.current[gridY][gridX] = 0;
      scoreRef.current += 10;
      setScore(scoreRef.current);
    } else if (gameMap.current[gridY] && gameMap.current[gridY][gridX] === 3) {
      gameMap.current[gridY][gridX] = 0;
      scoreRef.current += 50;
      setScore(scoreRef.current);
      // Make ghosts eatable
      ghosts.current.forEach(ghost => {
        if (!ghost.eaten) {
          ghost.eatable = tickRef.current;
        }
      });
    }
  };

  const getRandomDirection = () => {
    const dirs = [UP, DOWN, LEFT, RIGHT];
    return dirs[Math.floor(Math.random() * dirs.length)];
  };

  const moveGhost = (ghost: any) => {
    const onGrid = onGridSquare(ghost);
    let npos = null;

    if (ghost.due !== ghost.direction) {
      npos = getNewCoord(ghost.due, ghost, ghost.eatable ? 1 : ghost.eaten ? 4 : 2);
      if (onGrid && isFloorSpace(next(npos, ghost.due))) {
        ghost.direction = ghost.due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = getNewCoord(ghost.direction, ghost, ghost.eatable ? 1 : ghost.eaten ? 4 : 2);
    }

    if (onGrid && isWallSpace(next(npos, ghost.direction))) {
      ghost.due = getRandomDirection();
      return;
    }

    ghost.x = npos.x;
    ghost.y = npos.y;

    const tunnelPos = handleTunnel(ghost);
    ghost.x = tunnelPos.x;
    ghost.y = tunnelPos.y;

    ghost.due = getRandomDirection();

    // Reset eatable state after time
    if (ghost.eatable && (tickRef.current - ghost.eatable) / 30 > 8) {
      ghost.eatable = null;
    }
    if (ghost.eaten && (tickRef.current - ghost.eaten) / 30 > 3) {
      ghost.eaten = null;
    }
  };

  const checkCollisions = () => {
    ghosts.current.forEach(ghost => {
      if (Math.abs(pacman.current.x - ghost.x) < 15 && Math.abs(pacman.current.y - ghost.y) < 15) {
        if (ghost.eatable) {
          ghost.eaten = tickRef.current;
          ghost.eatable = null;
          scoreRef.current += 200;
          setScore(scoreRef.current);
        } else if (!ghost.eaten) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameStateRef.current = DYING;
            setGameState(DYING);
          } else {
            // Reset positions
            pacman.current = { x: 90, y: 160, direction: LEFT, due: LEFT };
            ghosts.current.forEach((g, i) => {
              g.x = [90, 100, 80, 110][i];
              g.y = 80;
              g.eatable = null;
              g.eaten = null;
            });
          }
        }
      }
    });
  };

  const checkWin = () => {
    let dotsLeft = 0;
    for (let row of gameMap.current) {
      for (let cell of row) {
        if (cell === 2 || cell === 3) dotsLeft++;
      }
    }
    if (dotsLeft === 0) {
      gameStateRef.current = WAITING;
      setGameState(WAITING);
    }
  };

  const update = () => {
    if (gameStateRef.current === PLAYING) {
      tickRef.current++;
      movePacman();
      ghosts.current.forEach(moveGhost);
      checkCollisions();
      checkWin();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let row = 0; row < gameMap.current.length; row++) {
      for (let col = 0; col < gameMap.current[row].length; col++) {
        const x = col * blockSize;
        const y = row * blockSize;
        const cell = gameMap.current[row][col];

        if (cell === 1) {
          // Wall
          ctx.fillStyle = colors.wall;
          ctx.fillRect(x, y, blockSize, blockSize);
          ctx.strokeStyle = colors.primary;
          ctx.strokeRect(x, y, blockSize, blockSize);
        } else if (cell === 2) {
          // Dot
          ctx.fillStyle = colors.dot;
          ctx.beginPath();
          ctx.arc(x + blockSize/2, y + blockSize/2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          // Power pellet
          ctx.fillStyle = colors.powerPellet;
          ctx.beginPath();
          ctx.arc(x + blockSize/2, y + blockSize/2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw Pacman
    const pacX = (pacman.current.x / 10) * blockSize;
    const pacY = (pacman.current.y / 10) * blockSize;
    
    ctx.fillStyle = colors.pacman;
    ctx.beginPath();
    
    // Pacman mouth animation
    const mouthOpen = Math.floor(tickRef.current / 5) % 2;
    const startAngle = pacman.current.direction === RIGHT ? (mouthOpen ? 0.2 : 0) :
                      pacman.current.direction === LEFT ? (mouthOpen ? Math.PI + 0.2 : Math.PI) :
                      pacman.current.direction === UP ? (mouthOpen ? 1.7 * Math.PI : 1.5 * Math.PI) :
                      (mouthOpen ? 0.7 * Math.PI : 0.5 * Math.PI);
    const endAngle = pacman.current.direction === RIGHT ? (mouthOpen ? 2 * Math.PI - 0.2 : 2 * Math.PI) :
                     pacman.current.direction === LEFT ? (mouthOpen ? 2 * Math.PI - 0.2 : 2 * Math.PI) :
                     pacman.current.direction === UP ? (mouthOpen ? 1.3 * Math.PI : 1.5 * Math.PI) :
                     (mouthOpen ? 1.3 * Math.PI : 0.5 * Math.PI);
    
    ctx.arc(pacX + blockSize/2, pacY + blockSize/2, blockSize/2 - 2, startAngle, endAngle);
    ctx.lineTo(pacX + blockSize/2, pacY + blockSize/2);
    ctx.fill();

    // Draw ghosts
    ghosts.current.forEach(ghost => {
      const ghostX = (ghost.x / 10) * blockSize;
      const ghostY = (ghost.y / 10) * blockSize;
      
      let ghostColor = ghost.color;
      if (ghost.eatable) {
        const timeLeft = 8 - (tickRef.current - ghost.eatable) / 30;
        ghostColor = timeLeft > 2 ? '#0000BB' : (tickRef.current % 20 > 10 ? '#FFFFFF' : '#0000BB');
      } else if (ghost.eaten) {
        ghostColor = '#222222';
      }
      
      ctx.fillStyle = ghostColor;
      ctx.beginPath();
      ctx.arc(ghostX + blockSize/2, ghostY + blockSize/4, blockSize/3, Math.PI, 0);
      ctx.lineTo(ghostX + blockSize - 2, ghostY + blockSize - 2);
      ctx.lineTo(ghostX + blockSize * 0.8, ghostY + blockSize * 0.7);
      ctx.lineTo(ghostX + blockSize * 0.6, ghostY + blockSize - 2);
      ctx.lineTo(ghostX + blockSize * 0.4, ghostY + blockSize * 0.7);
      ctx.lineTo(ghostX + blockSize * 0.2, ghostY + blockSize - 2);
      ctx.lineTo(ghostX + 2, ghostY + blockSize - 2);
      ctx.fill();

      // Ghost eyes
      if (!ghost.eaten) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ghostX + blockSize * 0.3, ghostY + blockSize * 0.3, 3, 0, Math.PI * 2);
        ctx.arc(ghostX + blockSize * 0.7, ghostY + blockSize * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(ghostX + blockSize * 0.3, ghostY + blockSize * 0.3, 1, 0, Math.PI * 2);
        ctx.arc(ghostX + blockSize * 0.7, ghostY + blockSize * 0.3, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw UI
    ctx.fillStyle = colors.primary;
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${scoreRef.current}`, 10, canvas.height - 40);
    ctx.fillText(`Lives: ${livesRef.current}`, 10, canvas.height - 15);

    // Game state overlays
    if (gameStateRef.current === WAITING) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = colors.primary;
      ctx.font = '32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAC-MAN', canvas.width/2, canvas.height/2 - 60);
      ctx.font = '16px monospace';
      ctx.fillText('Arrow Keys to Move', canvas.width/2, canvas.height/2 - 20);
      ctx.fillText('Eat all dots to win!', canvas.width/2, canvas.height/2);
      ctx.fillText('Press SPACE to Start', canvas.width/2, canvas.height/2 + 40);
      ctx.textAlign = 'left';
    } else if (gameStateRef.current === DYING) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = colors.primary;
      ctx.font = '32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
      ctx.font = '16px monospace';
      ctx.fillText(`Final Score: ${scoreRef.current}`, canvas.width/2, canvas.height/2 + 20);
      ctx.fillText('Press SPACE to Restart', canvas.width/2, canvas.height/2 + 50);
      ctx.textAlign = 'left';
    }
  };

  const gameLoop = useCallback(() => {
    update();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const resetGame = () => {
    gameMap.current = [...map.map(row => [...row])];
    pacman.current = { x: 90, y: 160, direction: LEFT, due: LEFT };
    ghosts.current = [
      { x: 90, y: 80, direction: UP, color: '#ff0000', eatable: null as number | null, eaten: null as number | null },
      { x: 100, y: 80, direction: DOWN, color: '#ffb8ff', eatable: null as number | null, eaten: null as number | null },
      { x: 80, y: 80, direction: LEFT, color: '#00ffff', eatable: null as number | null, eaten: null as number | null },
      { x: 110, y: 80, direction: RIGHT, color: '#ffb852', eatable: null as number | null, eaten: null as number | null }
    ];
    scoreRef.current = 0;
    livesRef.current = 3;
    tickRef.current = 0;
    setScore(0);
    setLives(3);
    gameStateRef.current = PLAYING;
    setGameState(PLAYING);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (gameStateRef.current === WAITING || gameStateRef.current === DYING) {
        if (e.key === ' ') {
          resetGame();
        }
        return;
      }

      if (gameStateRef.current === PLAYING) {
        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            pacman.current.due = LEFT;
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            pacman.current.due = RIGHT;
            break;
          case 'ArrowUp':
          case 'w':
          case 'W':
            pacman.current.due = UP;
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            pacman.current.due = DOWN;
            break;
          case ' ':
            gameStateRef.current = gameStateRef.current === PLAYING ? PAUSE : PLAYING;
            setGameState(gameStateRef.current);
            break;
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  useEffect(() => {
    gameLoop();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <canvas
        ref={canvasRef}
        width={19 * blockSize}
        height={21 * blockSize + 60}
        className="border-2"
        style={{ borderColor: colors.primary }}
        tabIndex={0}
      />
    </div>
  );
}; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface InvadersGameProps {
  theme: string;
  onExit: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Bullet extends Position {
  id: number;
  direction: 'up' | 'down';
}

interface Invader extends Position {
  id: number;
  type: number;
  alive: boolean;
}

export const InvadersGame: React.FC<InvadersGameProps> = ({ theme, onExit }) => {
  const [playerX, setPlayerX] = useState(400);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [invaders, setInvaders] = useState<Invader[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [wave, setWave] = useState(1);

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const bulletIdRef = useRef(0);
  const invaderIdRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PLAYER_SPEED = 6;
  const BULLET_SPEED = 10;
  const INVADER_SPEED = 0.5;

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          player: '#00ff80',
          invader: '#ff0040',
          bullet: '#ffff00'
        };
      case 'amber':
        return { 
          primary: '#ffb000', 
          bg: '#1a0f00', 
          secondary: '#cc8800',
          player: '#ffff00',
          invader: '#ff4000',
          bullet: '#ffffff'
        };
      case 'cyan':
        return { 
          primary: '#00ffff', 
          bg: '#001a1a', 
          secondary: '#00cccc',
          player: '#40ff80',
          invader: '#ff4080',
          bullet: '#ffffff'
        };
      default:
        return { 
          primary: '#00ff41', 
          bg: '#000000', 
          secondary: '#008f11',
          player: '#00ff80',
          invader: '#ff0040',
          bullet: '#ffff00'
        };
    }
  };

  const colors = getThemeColors();

  const createInvaders = useCallback((waveNumber: number) => {
    const newInvaders: Invader[] = [];
    const rows = Math.min(5, 3 + Math.floor(waveNumber / 3));
    const cols = Math.min(11, 8 + Math.floor(waveNumber / 2));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newInvaders.push({
          id: invaderIdRef.current++,
          x: 100 + col * 60,
          y: 50 + row * 50,
          type: row < 2 ? 3 : row < 4 ? 2 : 1, // Different point values
          alive: true
        });
      }
    }
    
    return newInvaders;
  }, []);

  const resetGame = useCallback(() => {
    setPlayerX(400);
    setBullets([]);
    setInvaders(createInvaders(1));
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    setWave(1);
    bulletIdRef.current = 0;
    invaderIdRef.current = 0;
  }, [createInvaders]);

  const shootBullet = useCallback(() => {
    setBullets(prev => [...prev, {
      id: bulletIdRef.current++,
      x: playerX + 15, // Center of player
      y: GAME_HEIGHT - 60,
      direction: 'up'
    }]);
  }, [playerX]);

  const updateGame = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    // Move player
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      setPlayerX(prev => Math.max(0, prev - PLAYER_SPEED));
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      setPlayerX(prev => Math.min(GAME_WIDTH - 30, prev + PLAYER_SPEED));
    }

    // Move bullets
    setBullets(prev => prev
      .map(bullet => ({
        ...bullet,
        y: bullet.direction === 'up' ? bullet.y - BULLET_SPEED : bullet.y + BULLET_SPEED
      }))
      .filter(bullet => bullet.y > 0 && bullet.y < GAME_HEIGHT)
    );

    // Move invaders
    setInvaders(prev => {
      let shouldMoveDown = false;
      let newDirection = 1;

      // Check if any invader hits the edge
      const aliveInvaders = prev.filter(inv => inv.alive);
      const leftmost = Math.min(...aliveInvaders.map(inv => inv.x));
      const rightmost = Math.max(...aliveInvaders.map(inv => inv.x));

      if (leftmost <= 0 || rightmost >= GAME_WIDTH - 40) {
        shouldMoveDown = true;
        newDirection = leftmost <= 0 ? 1 : -1;
      }

      return prev.map(invader => {
        if (!invader.alive) return invader;

        if (shouldMoveDown) {
          return {
            ...invader,
            y: invader.y + 20,
            x: invader.x + newDirection * INVADER_SPEED
          };
        } else {
          return {
            ...invader,
            x: invader.x + INVADER_SPEED
          };
        }
      });
    });

    // Check bullet-invader collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      
      setInvaders(prevInvaders => {
        return prevInvaders.map(invader => {
          if (!invader.alive) return invader;

          const hitBulletIndex = remainingBullets.findIndex(bullet =>
            bullet.direction === 'up' &&
            bullet.x >= invader.x && bullet.x <= invader.x + 40 &&
            bullet.y >= invader.y && bullet.y <= invader.y + 30
          );

          if (hitBulletIndex !== -1) {
            remainingBullets.splice(hitBulletIndex, 1);
            setScore(prev => prev + invader.type * 10);
            return { ...invader, alive: false };
          }

          return invader;
        });
      });

      return remainingBullets;
    });

    // Check if all invaders are destroyed
    setInvaders(prev => {
      const aliveInvaders = prev.filter(inv => inv.alive);
      if (aliveInvaders.length === 0) {
        // Next wave
        setWave(prevWave => {
          const nextWave = prevWave + 1;
          setTimeout(() => {
            setInvaders(createInvaders(nextWave));
          }, 1000);
          return nextWave;
        });
      }
      return prev;
    });

    // Check if invaders reached the bottom
    setInvaders(prev => {
      const aliveInvaders = prev.filter(inv => inv.alive);
      const bottomInvader = Math.max(...aliveInvaders.map(inv => inv.y));
      
      if (bottomInvader >= GAME_HEIGHT - 100) {
        setGameOver(true);
      }
      
      return prev;
    });

    // Random invader shooting (reduced frequency)
    if (Math.random() < 0.001) {
      setInvaders(prev => {
        const aliveInvaders = prev.filter(inv => inv.alive);
        if (aliveInvaders.length > 0) {
          const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
          setBullets(prevBullets => [...prevBullets, {
            id: bulletIdRef.current++,
            x: shooter.x + 20,
            y: shooter.y + 30,
            direction: 'down'
          }]);
        }
        return prev;
      });
    }

    // Check player-bullet collisions
    setBullets(prevBullets => {
      const playerHit = prevBullets.some(bullet =>
        bullet.direction === 'down' &&
        bullet.x >= playerX && bullet.x <= playerX + 30 &&
        bullet.y >= GAME_HEIGHT - 50 && bullet.y <= GAME_HEIGHT - 20
      );

      if (playerHit) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        return prevBullets.filter(bullet => 
          !(bullet.direction === 'down' &&
            bullet.x >= playerX && bullet.x <= playerX + 30 &&
            bullet.y >= GAME_HEIGHT - 50 && bullet.y <= GAME_HEIGHT - 20)
        );
      }

      return prevBullets;
    });
  }, [gameOver, isPaused, gameStarted, playerX, createInvaders]);

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

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      keysRef.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        shootBullet();
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
  }, [onExit, gameStarted, gameOver, resetGame, shootBullet]);

  useEffect(() => {
    if (!gameStarted) {
      setInvaders(createInvaders(1));
    }
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [gameStarted, createInvaders]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center p-8 outline-none"
      style={{ backgroundColor: colors.bg, color: colors.primary }}
      tabIndex={0}
      onFocus={() => {}}
    >
      {/* Game Header */}
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <div className="text-2xl font-bold">SPACE INVADERS</div>
        <div className="flex space-x-8 text-lg">
          <span>Score: {score}</span>
          <span>Lives: {lives}</span>
          <span>Wave: {wave}</span>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative border-2"
        style={{ 
          borderColor: colors.primary,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundColor: colors.bg
        }}
      >
        {/* Player */}
        <div
          className="absolute"
          style={{
            left: playerX,
            bottom: 20,
            width: 30,
            height: 20,
            backgroundColor: colors.player,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />

        {/* Invaders */}
        {invaders.filter(inv => inv.alive).map(invader => (
          <motion.div
            key={invader.id}
            className="absolute"
            style={{
              left: invader.x,
              top: invader.y,
              width: 40,
              height: 30,
              backgroundColor: colors.invader
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Simple invader shape */}
            <div className="w-full h-full relative">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: colors.invader,
                  clipPath: invader.type === 3 ? 
                    'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' :
                    invader.type === 2 ?
                    'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                    'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
                }}
              />
            </div>
          </motion.div>
        ))}

        {/* Bullets */}
        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute"
            style={{
              left: bullet.x,
              top: bullet.y,
              width: 4,
              height: 10,
              backgroundColor: bullet.direction === 'up' ? colors.bullet : colors.invader
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${colors.bg}CC` }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                GAME OVER
              </h2>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <p className="text-lg mb-4">Wave Reached: {wave}</p>
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
                Press P to continue
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
              <h2 className="text-4xl font-bold mb-6" style={{ color: colors.primary }}>
                SPACE INVADERS
              </h2>
              <div className="text-lg mb-6" style={{ color: colors.secondary }}>
                <p>Defend Earth from the alien invasion!</p>
                <p className="mt-2">Destroy all invaders to advance to the next wave.</p>
              </div>
              <div className="text-sm mb-6" style={{ color: colors.secondary }}>
                <p>← → or A/D: Move</p>
                <p>SPACE: Shoot</p>
                <p>P: Pause</p>
                <p>ESC: Exit</p>
              </div>
              <p className="text-lg font-bold" style={{ color: colors.primary }}>
                Press SPACE to start
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-sm mt-4" style={{ color: colors.secondary }}>
        <p>← → : Move | SPACE: Shoot | P: Pause | ESC: Exit</p>
      </div>
    </div>
  );
};
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BreakoutGameProps {
  onGameOver?: () => void;
}

interface Brick {
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
}

interface Ball {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number;
  dy: number;
}

const BreakoutGame: React.FC<BreakoutGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Game constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  const BRICK_GAP = 2;
  const BRICK_WIDTH = 25;
  const BRICK_HEIGHT = 12;
  const WALL_SIZE = 12;

  // Level layout - same as HTML version
  const level1 = [
    [],
    [],
    [],
    [],
    [],
    [],
    ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
    ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
    ['O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
    ['O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
    ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
    ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
    ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
    ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y']
  ];

  const colorMap: { [key: string]: string } = {
    'R': '#ff0000',
    'O': '#ffa500',
    'G': '#00ff00',
    'Y': '#ffff00'
  };

  // Game state refs
  const bricksRef = useRef<Brick[]>([]);
  const paddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH / 2 - BRICK_WIDTH / 2,
    y: 440,
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    dx: 0
  });
  const ballRef = useRef<Ball>({
    x: 130,
    y: 260,
    width: 5,
    height: 5,
    speed: 2,
    dx: 0,
    dy: 0
  });

  // Initialize bricks
  const initializeBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let row = 0; row < level1.length; row++) {
      for (let col = 0; col < level1[row].length; col++) {
        const colorCode = level1[row][col];
        if (colorCode) {
          bricks.push({
            x: WALL_SIZE + (BRICK_WIDTH + BRICK_GAP) * col,
            y: WALL_SIZE + (BRICK_HEIGHT + BRICK_GAP) * row,
            color: colorMap[colorCode],
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT
          });
        }
      }
    }
    bricksRef.current = bricks;
  }, []);

  // Collision detection
  const collides = (obj1: { x: number; y: number; width: number; height: number }, 
                   obj2: { x: number; y: number; width: number; height: number }) => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  // Reset ball
  const resetBall = () => {
    ballRef.current = {
      x: 130,
      y: 260,
      width: 5,
      height: 5,
      speed: 2,
      dx: 0,
      dy: 0
    };
  };

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const paddle = paddleRef.current;
    const ball = ballRef.current;
    const bricks = bricksRef.current;

    // Clear canvas
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Move paddle
    paddle.x += paddle.dx;

    // Keep paddle within bounds
    if (paddle.x < WALL_SIZE) {
      paddle.x = WALL_SIZE;
    } else if (paddle.x + BRICK_WIDTH > CANVAS_WIDTH - WALL_SIZE) {
      paddle.x = CANVAS_WIDTH - WALL_SIZE - BRICK_WIDTH;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball wall collisions
    if (ball.x < WALL_SIZE) {
      ball.x = WALL_SIZE;
      ball.dx *= -1;
    } else if (ball.x + ball.width > CANVAS_WIDTH - WALL_SIZE) {
      ball.x = CANVAS_WIDTH - WALL_SIZE - ball.width;
      ball.dx *= -1;
    }

    if (ball.y < WALL_SIZE) {
      ball.y = WALL_SIZE;
      ball.dy *= -1;
    }

    // Ball falls below screen
    if (ball.y > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          onGameOver?.();
          return 0;
        }
        return newLives;
      });
      resetBall();
      setGameStarted(false);
    }

    // Ball-paddle collision
    if (collides(ball, paddle)) {
      ball.dy *= -1;
      ball.y = paddle.y - ball.height;
    }

    // Ball-brick collisions
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (collides(ball, brick)) {
        // Remove brick
        bricks.splice(i, 1);
        setScore(prev => prev + 10);

        // Determine collision side and bounce
        if (ball.y + ball.height - ball.speed <= brick.y ||
            ball.y >= brick.y + brick.height - ball.speed) {
          ball.dy *= -1;
        } else {
          ball.dx *= -1;
        }

        // Check win condition
        if (bricks.length === 0) {
          onGameOver?.();
        }
        break;
      }
    }

    // Draw walls
    context.fillStyle = '#00ff00';
    context.fillRect(0, 0, CANVAS_WIDTH, WALL_SIZE);
    context.fillRect(0, 0, WALL_SIZE, CANVAS_HEIGHT);
    context.fillRect(CANVAS_WIDTH - WALL_SIZE, 0, WALL_SIZE, CANVAS_HEIGHT);

    // Draw ball if moving
    if (ball.dx || ball.dy) {
      context.fillStyle = '#ffffff';
      context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    // Draw bricks
    bricks.forEach(brick => {
      context.fillStyle = brick.color;
      context.fillRect(brick.x, brick.y, brick.width, brick.height);
    });

    // Draw paddle
    context.fillStyle = '#00ffff';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [onGameOver]);

  // Keyboard handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const paddle = paddleRef.current;
    const ball = ballRef.current;

    // Left arrow or A
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      paddle.dx = -3;
      e.preventDefault();
    }
    // Right arrow or D
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      paddle.dx = 3;
      e.preventDefault();
    }

    // Space to launch ball
    if (e.code === 'Space' && ball.dx === 0 && ball.dy === 0) {
      ball.dx = ball.speed;
      ball.dy = ball.speed;
      setGameStarted(true);
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const paddle = paddleRef.current;
    
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || 
        e.code === 'KeyA' || e.code === 'KeyD') {
      paddle.dx = 0;
      e.preventDefault();
    }
  }, []);

  // Initialize game
  useEffect(() => {
    initializeBricks();
    resetBall();
    
    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, initializeBricks]);

  // Keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex space-x-4 text-green-400 font-mono">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-green-400 bg-black"
        tabIndex={0}
        style={{ imageRendering: 'pixelated' }}
      />
      
      <div className="text-green-400 font-mono text-sm text-center max-w-md">
        {!gameStarted ? (
          <div>
            <div>Press SPACE to launch ball</div>
            <div>Use ARROW KEYS or A/D to move paddle</div>
          </div>
        ) : (
          <div>Break all the bricks to win!</div>
        )}
      </div>
    </div>
  );
};

export default BreakoutGame; 
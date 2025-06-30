import React, { useState, useEffect, useCallback, useRef } from 'react';

interface BreakoutGameProps {
  theme: string;
  onExit: () => void;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ theme, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  // Game state
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'won'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 10;
  const BALL_SIZE = 10;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 76;
  const BRICK_HEIGHT = 20;
  const PADDLE_SPEED = 8;
  const BALL_SPEED = 5;

  // Game objects
  const gameObjects = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 0, dy: 0, stuck: true },
    bricks: [] as Array<{ x: number; y: number; visible: boolean; hits: number }>
  });

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return { bg: '#000000', primary: '#00ff41', paddle: '#00ff80', ball: '#ffff00', brick: '#008f11' };
      case 'amber':
        return { bg: '#1a0f00', primary: '#ffb000', paddle: '#ffff00', ball: '#ffffff', brick: '#cc8800' };
      case 'cyan':
        return { bg: '#001a1a', primary: '#00ffff', paddle: '#40ff80', ball: '#ffffff', brick: '#00cccc' };
      default:
        return { bg: '#000000', primary: '#00ff41', paddle: '#00ff80', ball: '#ffff00', brick: '#008f11' };
    }
  };

  const colors = getThemeColors();

  const initBricks = useCallback(() => {
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 4) + 40,
          y: row * (BRICK_HEIGHT + 4) + 60,
          visible: true,
          hits: 1
        });
      }
    }
    gameObjects.current.bricks = bricks;
  }, []);

  const resetBall = useCallback(() => {
    gameObjects.current.ball = {
      x: gameObjects.current.paddle.x + PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 0,
      dy: 0,
      stuck: true
    };
  }, []);

  const launchBall = useCallback(() => {
    if (gameObjects.current.ball.stuck) {
      const angle = (Math.random() - 0.5) * Math.PI / 3; // Random angle
      gameObjects.current.ball.dx = Math.sin(angle) * BALL_SPEED;
      gameObjects.current.ball.dy = -Math.cos(angle) * BALL_SPEED;
      gameObjects.current.ball.stuck = false;
    }
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    gameObjects.current.paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    initBricks();
    resetBall();
    setGameState('playing');
  }, [initBricks, resetBall]);

  const checkCollision = (rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    const { paddle, ball, bricks } = gameObjects.current;

    // Move paddle
    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      paddle.x = Math.max(0, paddle.x - PADDLE_SPEED);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      paddle.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddle.x + PADDLE_SPEED);
    }

    // Move ball with paddle when stuck
    if (ball.stuck) {
      ball.x = paddle.x + PADDLE_WIDTH / 2;
      return;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x <= 0 || ball.x >= CANVAS_WIDTH - BALL_SIZE) {
      ball.dx = -ball.dx;
      ball.x = ball.x <= 0 ? 0 : CANVAS_WIDTH - BALL_SIZE;
    }
    if (ball.y <= 0) {
      ball.dy = -ball.dy;
      ball.y = 0;
    }

    // Ball collision with paddle
    if (checkCollision(
      { x: ball.x, y: ball.y, width: BALL_SIZE, height: BALL_SIZE },
      { x: paddle.x, y: paddle.y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }
    )) {
      if (ball.y + BALL_SIZE > paddle.y && ball.dy > 0) {
        ball.dy = -ball.dy;
        ball.y = paddle.y - BALL_SIZE;
        // Add some angle based on where it hits the paddle
        const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
        ball.dx = (hitPos - 0.5) * BALL_SPEED;
      }
    }

    // Ball collision with bricks
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.visible) continue;

      if (checkCollision(
        { x: ball.x, y: ball.y, width: BALL_SIZE, height: BALL_SIZE },
        { x: brick.x, y: brick.y, width: BRICK_WIDTH, height: BRICK_HEIGHT }
      )) {
        brick.visible = false;
        ball.dy = -ball.dy;
        setScore(prev => prev + 10);
        break;
      }
    }

    // Check if all bricks are destroyed
    if (bricks.every(brick => !brick.visible)) {
      setGameState('won');
    }

    // Ball falls below paddle
    if (ball.y > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameOver');
        } else {
          resetBall();
        }
        return newLives;
      });
    }
  }, [gameState, resetBall]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'start') {
      ctx.fillStyle = colors.primary;
      ctx.font = '48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BREAKOUT', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.font = '24px monospace';
      ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Arrow Keys or A/D to Move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      return;
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = colors.primary;
      ctx.font = '48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.font = '24px monospace';
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      return;
    }

    if (gameState === 'won') {
      ctx.fillStyle = colors.primary;
      ctx.font = '48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.font = '24px monospace';
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
      return;
    }

    const { paddle, ball, bricks } = gameObjects.current;

    // Draw bricks
    ctx.fillStyle = colors.brick;
    for (const brick of bricks) {
      if (brick.visible) {
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = colors.primary;
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    }

    // Draw paddle
    ctx.fillStyle = colors.paddle;
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = colors.ball;
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // Draw UI
    ctx.fillStyle = colors.primary;
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 60);
    ctx.fillText(`Level: ${level}`, 20, 90);

    if (ball.stuck) {
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to Launch Ball', CANVAS_WIDTH / 2, 150);
    }
  }, [gameState, score, lives, level, colors]);

  const gameLoop = useCallback(() => {
    update();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      keysRef.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameOver' || gameState === 'won') {
          resetGame();
        } else if (gameState === 'playing') {
          launchBall();
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
  }, [gameState, onExit, resetGame, launchBall]);

  useEffect(() => {
    initBricks();
    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initBricks, gameLoop]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2"
        style={{ borderColor: colors.primary }}
        tabIndex={0}
      />
    </div>
  );
}; 
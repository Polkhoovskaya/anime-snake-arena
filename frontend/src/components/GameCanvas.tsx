import { useEffect, useRef, useCallback } from 'react';
import { GameState, Position } from '../game/snakeLogic';

interface GameCanvasProps {
  gameState: GameState;
  cellSize?: number;
}

export default function GameCanvas({ gameState, cellSize = 20 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D, 
    pos: Position, 
    color: string, 
    isRound: boolean = false,
    glow: boolean = false
  ) => {
    const x = pos.x * cellSize;
    const y = pos.y * cellSize;
    const padding = 1;
    
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    }
    
    ctx.fillStyle = color;
    
    if (isRound) {
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize - padding * 2) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  }, [cellSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { gridSize, snake, food } = gameState;
    const canvasSize = gridSize * cellSize;

    // Clear canvas
    ctx.fillStyle = '#1a1425';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid lines
    ctx.strokeStyle = '#2a2435';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Draw walls border for walls mode
    if (gameState.mode === 'walls') {
      ctx.strokeStyle = '#6b5b95';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvasSize - 4, canvasSize - 4);
    }

    // Draw food
    drawCell(ctx, food, '#e74c3c', true, true);

    // Draw snake body
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head with glow
        drawCell(ctx, segment, '#4ecdc4', false, true);
      } else {
        // Body with gradient
        const opacity = 1 - (index / snake.length) * 0.4;
        ctx.globalAlpha = opacity;
        drawCell(ctx, segment, '#3dbdb5', false, false);
        ctx.globalAlpha = 1;
      }
    });

    // Draw eyes on head
    if (snake.length > 0) {
      const head = snake[0];
      const eyeSize = 3;
      const eyeOffset = 5;
      ctx.fillStyle = '#1a1425';
      
      const headX = head.x * cellSize + cellSize / 2;
      const headY = head.y * cellSize + cellSize / 2;
      
      let eye1X, eye1Y, eye2X, eye2Y;
      
      switch (gameState.direction) {
        case 'UP':
          eye1X = headX - eyeOffset; eye1Y = headY - 3;
          eye2X = headX + eyeOffset; eye2Y = headY - 3;
          break;
        case 'DOWN':
          eye1X = headX - eyeOffset; eye1Y = headY + 3;
          eye2X = headX + eyeOffset; eye2Y = headY + 3;
          break;
        case 'LEFT':
          eye1X = headX - 3; eye1Y = headY - eyeOffset;
          eye2X = headX - 3; eye2Y = headY + eyeOffset;
          break;
        case 'RIGHT':
        default:
          eye1X = headX + 3; eye1Y = headY - eyeOffset;
          eye2X = headX + 3; eye2Y = headY + eyeOffset;
      }
      
      ctx.beginPath();
      ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gameState, cellSize, drawCell]);

  useEffect(() => {
    draw();
  }, [draw]);

  const canvasSize = gameState.gridSize * cellSize;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="game-canvas"
    />
  );
}

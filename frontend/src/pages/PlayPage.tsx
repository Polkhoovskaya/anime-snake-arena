import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockApi } from '../services/mockApi';
import GameCanvas from '../components/GameCanvas';
import GameControls from '../components/GameControls';
import {
  GameState,
  GameMode,
  Direction,
  createInitialState,
  moveSnake,
  changeDirection,
  startGame,
  togglePause,
  setGameMode,
} from '../game/snakeLogic';
import { toast } from 'sonner';

export default function PlayPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyDirectionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
    };

    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      setGameState(prev => togglePause(prev));
      return;
    }

    const direction = keyDirectionMap[e.key];
    if (direction) {
      e.preventDefault();
      setGameState(prev => changeDirection(prev, direction));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newState = moveSnake(prev);
        
        // Check for game over
        if (newState.status === 'game-over' && prev.status === 'playing') {
          // Submit score
          mockApi.submitScore({
            score: prev.score,
            mode: prev.mode,
            duration: 0, // Could track time
          }).then(result => {
            if (result.newHighScore && user) {
              toast.success(`🎉 New High Score: ${prev.score}!`);
            } else if (prev.score > 0) {
              toast.info(`Game Over! Score: ${prev.score}`);
            }
          });
        }
        
        return newState;
      });
    }, gameState.speed);

    return () => clearInterval(gameLoop);
  }, [gameState.status, gameState.speed, user]);

  const handleStart = () => {
    setGameState(prev => startGame(prev));
  };

  const handlePause = () => {
    setGameState(prev => togglePause(prev));
  };

  const handleModeChange = (mode: GameMode) => {
    setGameState(prev => setGameMode(prev, mode));
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="text-center mb-4 animate-slide-in">
            <h1 className="h2 fw-bold text-primary mb-2">
              🐍 Snake Game
            </h1>
            {user ? (
              <p className="text-muted">
                Playing as <strong>{user.username}</strong> | High Score: <strong>{user.highScore}</strong>
              </p>
            ) : (
              <p className="text-muted">
                Playing as Guest • <a href="/auth">Sign in</a> to save your scores!
              </p>
            )}
          </div>

          <div className="row g-4">
            <div className="col-md-7">
              <div className="d-flex justify-content-center">
                <GameCanvas gameState={gameState} cellSize={18} />
              </div>
            </div>
            <div className="col-md-5">
              <GameControls
                status={gameState.status}
                mode={gameState.mode}
                score={gameState.score}
                onStart={handleStart}
                onPause={handlePause}
                onModeChange={handleModeChange}
              />
            </div>
          </div>

          {/* Game Over Overlay */}
          {gameState.status === 'game-over' && (
            <div className="card-game p-4 mt-4 text-center animate-slide-in">
              <h2 className="h3 text-danger mb-3">💀 Game Over!</h2>
              <p className="display-4 fw-bold text-primary mb-3">{gameState.score}</p>
              <p className="text-muted mb-4">
                {gameState.score >= 200 ? 'Amazing run! 🔥' : 
                 gameState.score >= 100 ? 'Great job! 👏' : 
                 gameState.score >= 50 ? 'Nice try! 💪' : 'Keep practicing! 🎯'}
              </p>
              <button onClick={handleStart} className="btn btn-primary btn-lg">
                🔄 Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

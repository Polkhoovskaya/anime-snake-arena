import { GameMode, GameStatus } from '../game/snakeLogic';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onModeChange: (mode: GameMode) => void;
}

export default function GameControls({
  status,
  mode,
  score,
  onStart,
  onPause,
  onModeChange,
}: GameControlsProps) {
  const canChangeMode = status === 'idle' || status === 'game-over';

  return (
    <div className="card-game p-4 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 text-primary fw-bold">Score: {score}</h2>
        <span className={`badge ${status === 'playing' ? 'bg-success' : status === 'paused' ? 'bg-warning' : status === 'game-over' ? 'bg-danger' : 'bg-secondary'}`}>
          {status.toUpperCase().replace('-', ' ')}
        </span>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold mb-3">Game Mode</label>
        <div className="row g-2">
          <div className="col-6">
            <div 
              className={`mode-selector card-game p-3 text-center ${mode === 'walls' ? 'active' : ''} ${!canChangeMode ? 'opacity-50' : ''}`}
              onClick={() => canChangeMode && onModeChange('walls')}
              role="button"
            >
              <div className="fs-2 mb-2">🧱</div>
              <div className="fw-semibold">Walls</div>
              <small className="text-muted">Hit wall = Game Over</small>
            </div>
          </div>
          <div className="col-6">
            <div 
              className={`mode-selector card-game p-3 text-center ${mode === 'pass-through' ? 'active' : ''} ${!canChangeMode ? 'opacity-50' : ''}`}
              onClick={() => canChangeMode && onModeChange('pass-through')}
              role="button"
            >
              <div className="fs-2 mb-2">🌀</div>
              <div className="fw-semibold">Pass-Through</div>
              <small className="text-muted">Wrap around walls</small>
            </div>
          </div>
        </div>
      </div>

      <div className="d-grid gap-2">
        {status === 'idle' && (
          <button onClick={onStart} className="btn btn-primary btn-lg">
            🎮 Start Game
          </button>
        )}
        {status === 'playing' && (
          <button onClick={onPause} className="btn btn-warning btn-lg">
            ⏸️ Pause
          </button>
        )}
        {status === 'paused' && (
          <button onClick={onStart} className="btn btn-success btn-lg">
            ▶️ Resume
          </button>
        )}
        {status === 'game-over' && (
          <button onClick={onStart} className="btn btn-primary btn-lg">
            🔄 Play Again
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-muted rounded">
        <h6 className="fw-semibold mb-2">Controls</h6>
        <div className="row text-center small">
          <div className="col-3"><kbd>↑</kbd><br/>Up</div>
          <div className="col-3"><kbd>↓</kbd><br/>Down</div>
          <div className="col-3"><kbd>←</kbd><br/>Left</div>
          <div className="col-3"><kbd>→</kbd><br/>Right</div>
        </div>
        <div className="text-center mt-2 small text-muted">
          Press <kbd>Space</kbd> to pause/resume
        </div>
      </div>
    </div>
  );
}

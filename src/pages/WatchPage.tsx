import { useState, useEffect, useRef } from 'react';
import { mockApi, LiveGame } from '../services/mockApi';
import GameCanvas from '../components/GameCanvas';
import {
  GameState,
  createInitialState,
  simulateAIMove,
  startGame,
} from '../game/snakeLogic';

export default function WatchPage() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [spectatorState, setSpectatorState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchLiveGames = async () => {
      setLoading(true);
      const games = await mockApi.getLiveGames();
      setLiveGames(games);
      setLoading(false);
    };
    
    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedGame) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      setSpectatorState(null);
      return;
    }

    // Initialize spectator game state
    let state = createInitialState(selectedGame.mode);
    state = startGame(state);
    setSpectatorState(state);

    // Simulate AI playing
    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTime > 150) {
        lastTime = timestamp;
        setSpectatorState(prev => {
          if (!prev || prev.status !== 'playing') {
            // Reset game when AI dies
            let newState = createInitialState(selectedGame.mode);
            newState = startGame(newState);
            return newState;
          }
          return simulateAIMove(prev);
        });
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [selectedGame]);

  return (
    <div className="container py-4">
      <div className="text-center mb-4 animate-slide-in">
        <h1 className="h2 fw-bold text-primary mb-2">👀 Watch Live</h1>
        <p className="text-muted">Spectate other players in real-time</p>
      </div>

      {selectedGame && spectatorState ? (
        // Spectator View
        <div className="animate-fade-in">
          <button 
            className="btn btn-outline-primary mb-4"
            onClick={() => setSelectedGame(null)}
          >
            ← Back to Live Games
          </button>

          <div className="row g-4">
            <div className="col-md-7">
              <div className="card-game p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={selectedGame.player.avatar}
                      alt={selectedGame.player.username}
                      className="rounded-circle avatar-ring"
                      width="40"
                      height="40"
                    />
                    <div>
                      <div className="fw-semibold">{selectedGame.player.username}</div>
                      <small className="text-muted">
                        {selectedGame.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
                      </small>
                    </div>
                  </div>
                  <span className="watching-badge">
                    🔴 LIVE
                  </span>
                </div>
                <div className="d-flex justify-content-center">
                  <GameCanvas gameState={spectatorState} cellSize={18} />
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card-game p-4">
                <h3 className="h5 fw-bold text-primary mb-3">Stream Info</h3>
                <div className="mb-3">
                  <small className="text-muted">Current Score</small>
                  <div className="display-5 fw-bold text-primary">{spectatorState.score}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Viewers</small>
                  <div className="fs-4 fw-semibold">👁️ {selectedGame.viewers + 1}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Player High Score</small>
                  <div className="fs-4 fw-semibold">🏆 {selectedGame.player.highScore}</div>
                </div>
                <hr />
                <div>
                  <small className="text-muted">Games Played</small>
                  <div className="fw-semibold">{selectedGame.player.gamesPlayed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Live Games List
        <div className="animate-fade-in">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : liveGames.length === 0 ? (
            <div className="text-center py-5 card-game">
              <div className="fs-1 mb-3">😴</div>
              <h3 className="h5 text-muted">No Live Games Right Now</h3>
              <p className="text-muted mb-0">Check back later or start your own game!</p>
            </div>
          ) : (
            <div className="row g-4">
              {liveGames.map((game) => (
                <div key={game.id} className="col-md-4">
                  <div 
                    className="card-game p-4 h-100 mode-selector"
                    onClick={() => setSelectedGame(game)}
                    role="button"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={game.player.avatar}
                          alt={game.player.username}
                          className="rounded-circle avatar-ring"
                          width="48"
                          height="48"
                        />
                        <div>
                          <div className="fw-bold">{game.player.username}</div>
                          <small className="text-muted">
                            High Score: {game.player.highScore}
                          </small>
                        </div>
                      </div>
                      <span className="watching-badge">LIVE</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <small className="text-muted d-block">Current Score</small>
                        <span className="fs-4 fw-bold text-primary">{game.score}</span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Viewers</small>
                        <span className="fs-4">👁️ {game.viewers}</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${game.mode === 'walls' ? 'bg-danger' : 'bg-info'}`}>
                        {game.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
                      </span>
                      <button className="btn btn-primary btn-sm">
                        Watch →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

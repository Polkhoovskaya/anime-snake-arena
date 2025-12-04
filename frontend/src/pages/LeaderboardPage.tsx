import { useState, useEffect } from 'react';
import { mockApi, LeaderboardEntry } from '../services/mockApi';
import { GameMode } from '../game/snakeLogic';
import { useAuth } from '../contexts/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await mockApi.getLeaderboard(filter === 'all' ? undefined : filter);
      setEntries(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="fs-4">🥇</span>;
    if (rank === 2) return <span className="fs-4">🥈</span>;
    if (rank === 3) return <span className="fs-4">🥉</span>;
    return <span className="badge bg-secondary rounded-pill">{rank}</span>;
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4 animate-slide-in">
        <h1 className="h2 fw-bold text-primary mb-2">🏆 Leaderboard</h1>
        <p className="text-muted">Top players from around the world</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group" role="group">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All Modes
          </button>
          <button
            className={`btn ${filter === 'walls' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('walls')}
          >
            🧱 Walls
          </button>
          <button
            className={`btn ${filter === 'pass-through' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pass-through')}
          >
            🌀 Pass-Through
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card-game overflow-hidden animate-fade-in">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-primary-gradient text-white">
                <tr>
                  <th className="py-3 ps-4">Rank</th>
                  <th className="py-3">Player</th>
                  <th className="py-3">Mode</th>
                  <th className="py-3 text-end pe-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr 
                    key={entry.rank}
                    className={`leaderboard-row ${user?.id === entry.user.id ? 'table-warning' : ''}`}
                  >
                    <td className="py-3 ps-4 align-middle">
                      {getRankBadge(entry.rank)}
                    </td>
                    <td className="py-3 align-middle">
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={entry.user.avatar}
                          alt={entry.user.username}
                          className="rounded-circle avatar-ring"
                          width="40"
                          height="40"
                        />
                        <div>
                          <div className="fw-semibold">
                            {entry.user.username}
                            {user?.id === entry.user.id && (
                              <span className="badge bg-primary ms-2">You</span>
                            )}
                          </div>
                          <small className="text-muted">
                            {entry.user.gamesPlayed} games played
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 align-middle">
                      <span className={`badge ${entry.mode === 'walls' ? 'bg-danger' : 'bg-info'}`}>
                        {entry.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
                      </span>
                    </td>
                    <td className="py-3 pe-4 align-middle text-end">
                      <span className="fw-bold text-primary fs-5">{entry.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Position (if not in top) */}
      {user && !entries.some(e => e.user.id === user.id) && (
        <div className="card-game p-3 mt-4 animate-fade-in">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-secondary rounded-pill fs-6">#{entries.length + 1}</span>
              <img 
                src={user.avatar}
                alt={user.username}
                className="rounded-circle avatar-ring"
                width="40"
                height="40"
              />
              <div>
                <div className="fw-semibold">{user.username} <span className="badge bg-primary">You</span></div>
                <small className="text-muted">{user.gamesPlayed} games played</small>
              </div>
            </div>
            <span className="fw-bold text-primary fs-5">{user.highScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}

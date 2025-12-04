import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="bg-primary-gradient text-white py-5 flex-grow-1 d-flex align-items-center">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0 animate-slide-in">
              <h1 className="display-3 fw-bold mb-4">
                Snake Arena
                <span className="d-block text-warning">Multiplayer Edition</span>
              </h1>
              <p className="lead mb-4 opacity-90">
                Experience the classic snake game with a twist! Choose between two exciting modes, 
                compete on the global leaderboard, and watch other players live.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/play" className="btn btn-secondary btn-lg px-4">
                  🎮 Play Now
                </Link>
                <Link to="/watch" className="btn btn-outline-light btn-lg px-4">
                  👀 Watch Live
                </Link>
              </div>
              {!user && (
                <p className="mt-4 opacity-75">
                  <Link to="/auth" className="text-white">Sign up</Link> to save your scores and appear on the leaderboard!
                </p>
              )}
            </div>
            <div className="col-lg-6 text-center animate-fade-in">
              <div className="position-relative">
                <div className="display-1" style={{ fontSize: '12rem', lineHeight: 1 }}>
                  🐍
                </div>
                <div className="position-absolute" style={{ top: '20%', right: '10%', fontSize: '3rem' }}>
                  🍎
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-background">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold text-primary">Game Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">🧱</div>
                <h3 className="h5 fw-bold text-primary">Walls Mode</h3>
                <p className="text-muted mb-0">
                  Classic gameplay where hitting walls means game over. Test your precision!
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">🌀</div>
                <h3 className="h5 fw-bold text-primary">Pass-Through Mode</h3>
                <p className="text-muted mb-0">
                  Go through walls and appear on the other side. Only self-collision ends the game!
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">🏆</div>
                <h3 className="h5 fw-bold text-primary">Leaderboard</h3>
                <p className="text-muted mb-0">
                  Compete globally! Your high scores are saved and ranked against all players.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">👀</div>
                <h3 className="h5 fw-bold text-primary">Watch Live</h3>
                <p className="text-muted mb-0">
                  Spectate other players in real-time. Learn strategies from the best!
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">🎨</div>
                <h3 className="h5 fw-bold text-primary">Anime Avatars</h3>
                <p className="text-muted mb-0">
                  Choose your unique anime character avatar to represent you on the leaderboard!
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-game h-100 p-4 text-center">
                <div className="fs-1 mb-3">⚡</div>
                <h3 className="h5 fw-bold text-primary">Speed Challenge</h3>
                <p className="text-muted mb-0">
                  The more you eat, the faster you go! Can you handle the speed?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-muted">
        <div className="container text-center">
          <h2 className="fw-bold mb-4 text-primary">Ready to Play?</h2>
          <p className="lead text-muted mb-4">
            Jump into the action now or create an account to track your progress!
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/play" className="btn btn-primary btn-lg px-5">
              Start Playing
            </Link>
            <Link to="/leaderboard" className="btn btn-outline-primary btn-lg px-5">
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

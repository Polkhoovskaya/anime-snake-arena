import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg bg-primary-gradient shadow-lg sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand text-white fw-bold d-flex align-items-center gap-2">
          <span className="fs-4">🐍</span>
          <span>Snake Arena</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                to="/play" 
                className={`nav-link text-white ${isActive('/play') ? 'fw-bold' : 'opacity-75'}`}
              >
                Play
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/leaderboard" 
                className={`nav-link text-white ${isActive('/leaderboard') ? 'fw-bold' : 'opacity-75'}`}
              >
                Leaderboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/watch" 
                className={`nav-link text-white ${isActive('/watch') ? 'fw-bold' : 'opacity-75'}`}
              >
                Watch Live
              </Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-link text-white d-flex align-items-center gap-2 dropdown-toggle text-decoration-none"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="rounded-circle avatar-ring"
                    width="32"
                    height="32"
                  />
                  <span className="d-none d-md-inline">{user.username}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={logout} className="dropdown-item text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/auth" className="btn btn-outline-light btn-sm">
                  Log In
                </Link>
                <Link to="/auth?mode=signup" className="btn btn-secondary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

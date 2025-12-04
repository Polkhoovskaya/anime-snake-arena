import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ANIME_AVATARS } from '../services/mockApi';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleAvatarChange = async (avatar: string) => {
    setSaving(true);
    const success = await updateProfile({ avatar });
    setSaving(false);
    if (success) {
      toast.success('Avatar updated!');
      setIsEditingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card-game p-4 animate-slide-in">
            {/* Profile Header */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="rounded-circle avatar-ring"
                  width="120"
                  height="120"
                />
                <button
                  className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                >
                  ✏️
                </button>
              </div>
              <h1 className="h3 fw-bold text-primary mb-1">{user.username}</h1>
              <p className="text-muted">{user.email}</p>
            </div>

            {/* Avatar Selector */}
            {isEditingAvatar && (
              <div className="mb-4 p-3 bg-muted rounded animate-fade-in">
                <h6 className="fw-semibold mb-3">Choose New Avatar</h6>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {ANIME_AVATARS.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className={`rounded-circle ${user.avatar === avatar ? 'avatar-ring' : 'opacity-75 hover-opacity-100'}`}
                      width="56"
                      height="56"
                      onClick={() => handleAvatarChange(avatar)}
                      style={{ cursor: saving ? 'wait' : 'pointer' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="bg-muted rounded p-3 text-center">
                  <div className="fs-3 mb-1">🏆</div>
                  <div className="display-6 fw-bold text-primary">{user.highScore}</div>
                  <small className="text-muted">High Score</small>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-muted rounded p-3 text-center">
                  <div className="fs-3 mb-1">🎮</div>
                  <div className="display-6 fw-bold text-primary">{user.gamesPlayed}</div>
                  <small className="text-muted">Games Played</small>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-muted rounded p-3 mb-4 text-center">
              <small className="text-muted d-block">Member Since</small>
              <span className="fw-semibold">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="d-grid gap-2">
              <button 
                onClick={() => navigate('/play')} 
                className="btn btn-primary btn-lg"
              >
                🎮 Play Now
              </button>
              <button 
                onClick={() => navigate('/leaderboard')} 
                className="btn btn-outline-primary"
              >
                🏆 View Leaderboard
              </button>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

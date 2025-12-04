import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApi, ANIME_AVATARS } from '../services/mockApi';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('MockApiService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    describe('login', () => {
      it('should login with valid credentials', async () => {
        const result = await mockApi.login('snake@test.com', 'password123');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user?.username).toBe('SnakeMaster');
      });

      it('should fail login with invalid email', async () => {
        const result = await mockApi.login('invalid@test.com', 'password123');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email or password');
      });

      it('should fail login with short password', async () => {
        const result = await mockApi.login('snake@test.com', '123');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid email or password');
      });

      it('should store user in localStorage after login', async () => {
        await mockApi.login('snake@test.com', 'password123');
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    describe('signup', () => {
      it('should create new user with valid data', async () => {
        const result = await mockApi.signup(
          'NewPlayer',
          'new@test.com',
          'password123',
          ANIME_AVATARS[0]
        );
        expect(result.success).toBe(true);
        expect(result.user?.username).toBe('NewPlayer');
        expect(result.user?.email).toBe('new@test.com');
        expect(result.user?.highScore).toBe(0);
        expect(result.user?.gamesPlayed).toBe(0);
      });

      it('should fail signup with existing email', async () => {
        const result = await mockApi.signup(
          'AnotherUser',
          'snake@test.com',
          'password123',
          ANIME_AVATARS[0]
        );
        expect(result.success).toBe(false);
        expect(result.error).toBe('Email already exists');
      });

      it('should fail signup with existing username', async () => {
        const result = await mockApi.signup(
          'SnakeMaster',
          'unique@test.com',
          'password123',
          ANIME_AVATARS[0]
        );
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username already taken');
      });
    });

    describe('logout', () => {
      it('should clear user session', async () => {
        await mockApi.login('snake@test.com', 'password123');
        await mockApi.logout();
        expect(mockApi.getCurrentUser()).toBe(null);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_game_user');
      });
    });

    describe('getCurrentUser', () => {
      it('should return null when not logged in', async () => {
        await mockApi.logout();
        expect(mockApi.getCurrentUser()).toBe(null);
      });

      it('should return user when logged in', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const user = mockApi.getCurrentUser();
        expect(user).not.toBe(null);
        expect(user?.username).toBe('SnakeMaster');
      });
    });
  });

  describe('Profile', () => {
    describe('updateProfile', () => {
      it('should update user profile when logged in', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const result = await mockApi.updateProfile({ avatar: ANIME_AVATARS[5] });
        expect(result.success).toBe(true);
        expect(result.user?.avatar).toBe(ANIME_AVATARS[5]);
      });

      it('should fail to update profile when not logged in', async () => {
        await mockApi.logout();
        const result = await mockApi.updateProfile({ avatar: ANIME_AVATARS[5] });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Leaderboard', () => {
    describe('getLeaderboard', () => {
      it('should return leaderboard entries', async () => {
        const entries = await mockApi.getLeaderboard();
        expect(entries.length).toBeGreaterThan(0);
        expect(entries[0].rank).toBe(1);
      });

      it('should return entries sorted by score descending', async () => {
        const entries = await mockApi.getLeaderboard();
        for (let i = 1; i < entries.length; i++) {
          expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
        }
      });

      it('should filter by mode when specified', async () => {
        const wallsEntries = await mockApi.getLeaderboard('walls');
        wallsEntries.forEach(entry => {
          expect(entry.mode).toBe('walls');
        });

        const passThroughEntries = await mockApi.getLeaderboard('pass-through');
        passThroughEntries.forEach(entry => {
          expect(entry.mode).toBe('pass-through');
        });
      });

      it('should include user data in entries', async () => {
        const entries = await mockApi.getLeaderboard();
        entries.forEach(entry => {
          expect(entry.user).toBeDefined();
          expect(entry.user.username).toBeDefined();
          expect(entry.user.avatar).toBeDefined();
        });
      });
    });
  });

  describe('Live Games', () => {
    describe('getLiveGames', () => {
      it('should return live games', async () => {
        const games = await mockApi.getLiveGames();
        expect(games.length).toBeGreaterThan(0);
      });

      it('should include player data in games', async () => {
        const games = await mockApi.getLiveGames();
        games.forEach(game => {
          expect(game.player).toBeDefined();
          expect(game.player.username).toBeDefined();
        });
      });

      it('should include game mode', async () => {
        const games = await mockApi.getLiveGames();
        games.forEach(game => {
          expect(['walls', 'pass-through']).toContain(game.mode);
        });
      });
    });

    describe('getLiveGame', () => {
      it('should return specific game by id', async () => {
        const game = await mockApi.getLiveGame('live1');
        expect(game).not.toBe(null);
        expect(game?.id).toBe('live1');
      });

      it('should return null for non-existent game', async () => {
        const game = await mockApi.getLiveGame('non-existent');
        expect(game).toBe(null);
      });
    });
  });

  describe('Game Score', () => {
    describe('submitScore', () => {
      it('should submit score when logged in', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const result = await mockApi.submitScore({
          score: 100,
          mode: 'walls',
          duration: 60,
        });
        expect(result.success).toBe(true);
      });

      it('should detect new high score', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const user = mockApi.getCurrentUser();
        const result = await mockApi.submitScore({
          score: (user?.highScore || 0) + 1000,
          mode: 'walls',
          duration: 120,
        });
        expect(result.newHighScore).toBe(true);
      });

      it('should not flag as high score if lower than current', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const result = await mockApi.submitScore({
          score: 10,
          mode: 'walls',
          duration: 30,
        });
        expect(result.newHighScore).toBe(false);
      });

      it('should increment games played', async () => {
        await mockApi.login('snake@test.com', 'password123');
        const initialGames = mockApi.getCurrentUser()?.gamesPlayed || 0;
        await mockApi.submitScore({
          score: 50,
          mode: 'pass-through',
          duration: 45,
        });
        expect(mockApi.getCurrentUser()?.gamesPlayed).toBe(initialGames + 1);
      });
    });
  });

  describe('Avatars', () => {
    describe('getAvatars', () => {
      it('should return list of avatars', () => {
        const avatars = mockApi.getAvatars();
        expect(avatars.length).toBe(12);
      });

      it('should return valid avatar URLs', () => {
        const avatars = mockApi.getAvatars();
        avatars.forEach(avatar => {
          expect(avatar).toMatch(/^https:\/\/api\.dicebear\.com/);
        });
      });

      it('should include Ghibli-inspired names', () => {
        const avatars = mockApi.getAvatars();
        const ghibliNames = ['Chihiro', 'Totoro', 'Ponyo', 'Kiki', 'Howl', 'Sophie'];
        ghibliNames.forEach(name => {
          expect(avatars.some(a => a.includes(name))).toBe(true);
        });
      });
    });
  });

  describe('ANIME_AVATARS constant', () => {
    it('should have 12 avatars', () => {
      expect(ANIME_AVATARS.length).toBe(12);
    });

    it('should use lorelei style', () => {
      ANIME_AVATARS.forEach(avatar => {
        expect(avatar).toContain('lorelei');
      });
    });
  });
});

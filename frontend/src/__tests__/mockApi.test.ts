import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('ApiService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  const mockUser = {
    id: '1',
    username: 'SnakeMaster',
    email: 'snake@test.com',
    avatar: ANIME_AVATARS[0],
    highScore: 1000,
    gamesPlayed: 10,
    createdAt: new Date().toISOString(),
  };

  describe('Authentication', () => {
    describe('login', () => {
      it('should login with valid credentials', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, user: mockUser, token: 'fake-token' }),
        });

        const result = await mockApi.login('snake@test.com', 'password123');

        expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'snake@test.com', password: 'password123' }),
        }));
        expect(result.success).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('snake_game_token', 'fake-token');
      });

      it('should handle login failure', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ success: false, error: 'Invalid credentials' }),
        });

        const result = await mockApi.login('snake@test.com', 'wrongpass');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
      });
    });

    describe('signup', () => {
      it('should create new user', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, user: mockUser, token: 'fake-token' }),
        });

        const result = await mockApi.signup('SnakeMaster', 'snake@test.com', 'password123', ANIME_AVATARS[0]);

        expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'SnakeMaster',
            email: 'snake@test.com',
            password: 'password123',
            avatar: ANIME_AVATARS[0],
          }),
        }));
        expect(result.success).toBe(true);
      });
    });

    describe('logout', () => {
      it('should call logout endpoint and clear storage', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        await mockApi.logout();

        expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({
          method: 'POST',
        }));
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_game_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_game_user');
      });
    });
  });

  describe('Session Verification', () => {
    it('should verify valid session', async () => {
      // Mock login response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser, token: 'valid-token' }),
      });
      // Mock verifySession response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      await mockApi.login('snake@test.com', 'password123'); // Sets token

      const user = await mockApi.verifySession();

      expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/me', expect.any(Object));
      expect(user).toEqual(mockUser);
    });

    it('should clear session on invalid token', async () => {
      // Mock login response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser, token: 'valid-token' }),
      });
      // Mock verifySession response (failure)
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid token' }),
      });

      await mockApi.login('snake@test.com', 'password123'); // Sets token

      const user = await mockApi.verifySession();

      expect(user).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('snake_game_token');
    });
  });

  describe('Leaderboard', () => {
    it('should fetch leaderboard', async () => {
      const mockEntries = [{ rank: 1, user: mockUser, score: 1000, mode: 'walls', date: new Date().toISOString() }];
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries,
      });

      const entries = await mockApi.getLeaderboard();

      expect(fetchMock).toHaveBeenCalledWith('/api/leaderboard', expect.any(Object));
      expect(entries).toEqual(mockEntries);
    });

    it('should fetch leaderboard with mode filter', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await mockApi.getLeaderboard('walls');

      expect(fetchMock).toHaveBeenCalledWith('/api/leaderboard?mode=walls', expect.any(Object));
    });
  });

  describe('Live Games', () => {
    it('should fetch live games', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await mockApi.getLiveGames();

      expect(fetchMock).toHaveBeenCalledWith('/api/games/live', expect.any(Object));
    });

    it('should fetch specific live game', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'live1' }),
      });

      await mockApi.getLiveGame('live1');

      expect(fetchMock).toHaveBeenCalledWith('/api/games/live/live1', expect.any(Object));
    });
  });

  describe('Game Score', () => {
    it('should submit score', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, newHighScore: true }),
      });

      const result = await mockApi.submitScore({ score: 100, mode: 'walls', duration: 60 });

      expect(fetchMock).toHaveBeenCalledWith('/api/games/score', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ score: 100, mode: 'walls', duration: 60 }),
      }));
      expect(result.newHighScore).toBe(true);
    });
  });

  describe('Avatars', () => {
    it('should return avatars constant', () => {
      const avatars = mockApi.getAvatars();
      expect(avatars).toEqual(ANIME_AVATARS);
    });
  });
});

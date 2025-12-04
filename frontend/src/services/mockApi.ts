// Centralized mock API service
// All backend calls go through here for easy future integration

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  mode: 'pass-through' | 'walls';
  date: Date;
}

export interface LiveGame {
  id: string;
  player: User;
  score: number;
  mode: 'pass-through' | 'walls';
  viewers: number;
  startedAt: Date;
}

export interface GameResult {
  score: number;
  mode: 'pass-through' | 'walls';
  duration: number;
}

// Anime avatars with Ghibli-inspired character names
export const ANIME_AVATARS = [
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Chihiro&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Totoro&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Ponyo&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Kiki&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Howl&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie&backgroundColor=c1f4c5',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Nausicaa&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Ashitaka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=SanMononoke&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Haku&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Calcifer&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=JiJi&backgroundColor=c1f4c5',
];

// Mock data
const mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'snake@test.com', avatar: ANIME_AVATARS[0], highScore: 2450, gamesPlayed: 156, createdAt: new Date('2024-01-15') },
  { id: '2', username: 'PixelNinja', email: 'ninja@test.com', avatar: ANIME_AVATARS[1], highScore: 2100, gamesPlayed: 98, createdAt: new Date('2024-02-20') },
  { id: '3', username: 'RetroGamer', email: 'retro@test.com', avatar: ANIME_AVATARS[2], highScore: 1890, gamesPlayed: 234, createdAt: new Date('2024-01-05') },
  { id: '4', username: 'CobraKing', email: 'cobra@test.com', avatar: ANIME_AVATARS[3], highScore: 1750, gamesPlayed: 67, createdAt: new Date('2024-03-10') },
  { id: '5', username: 'VenomStrike', email: 'venom@test.com', avatar: ANIME_AVATARS[4], highScore: 1620, gamesPlayed: 145, createdAt: new Date('2024-02-01') },
  { id: '6', username: 'SerpentQueen', email: 'serpent@test.com', avatar: ANIME_AVATARS[5], highScore: 1580, gamesPlayed: 89, createdAt: new Date('2024-03-25') },
  { id: '7', username: 'SlitherPro', email: 'slither@test.com', avatar: ANIME_AVATARS[6], highScore: 1450, gamesPlayed: 201, createdAt: new Date('2024-01-30') },
  { id: '8', username: 'ViperAce', email: 'viper@test.com', avatar: ANIME_AVATARS[7], highScore: 1320, gamesPlayed: 78, createdAt: new Date('2024-04-05') },
];

const mockLiveGames: LiveGame[] = [
  { id: 'live1', player: mockUsers[1], score: 340, mode: 'walls', viewers: 12, startedAt: new Date() },
  { id: 'live2', player: mockUsers[3], score: 180, mode: 'pass-through', viewers: 5, startedAt: new Date() },
  { id: 'live3', player: mockUsers[5], score: 520, mode: 'walls', viewers: 23, startedAt: new Date() },
];

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage key for current user
const STORAGE_KEY = 'snake_game_user';

class MockApiService {
  private currentUser: User | null = null;

  constructor() {
    // Load user from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 6) {
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  }

  async signup(username: string, email: string, password: string, avatar: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    if (mockUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    if (mockUsers.some(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      avatar,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  }

  async logout(): Promise<void> {
    await delay(200);
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User }> {
    await delay(300);
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    }
    return { success: false };
  }

  // Leaderboard methods
  async getLeaderboard(mode?: 'pass-through' | 'walls'): Promise<LeaderboardEntry[]> {
    await delay(300);
    const entries: LeaderboardEntry[] = mockUsers
      .sort((a, b) => b.highScore - a.highScore)
      .map((user, index) => ({
        rank: index + 1,
        user,
        score: user.highScore,
        mode: index % 2 === 0 ? 'walls' : 'pass-through',
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }));
    
    if (mode) {
      return entries.filter(e => e.mode === mode);
    }
    return entries;
  }

  // Live games methods
  async getLiveGames(): Promise<LiveGame[]> {
    await delay(300);
    // Randomly update scores to simulate live play
    return mockLiveGames.map(game => ({
      ...game,
      score: game.score + Math.floor(Math.random() * 50),
      viewers: game.viewers + Math.floor(Math.random() * 5) - 2,
    }));
  }

  async getLiveGame(id: string): Promise<LiveGame | null> {
    await delay(200);
    return mockLiveGames.find(g => g.id === id) || null;
  }

  // Game methods
  async submitScore(result: GameResult): Promise<{ success: boolean; newHighScore: boolean }> {
    await delay(400);
    if (this.currentUser) {
      const isNewHighScore = result.score > this.currentUser.highScore;
      if (isNewHighScore) {
        this.currentUser.highScore = result.score;
      }
      this.currentUser.gamesPlayed += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      return { success: true, newHighScore: isNewHighScore };
    }
    return { success: true, newHighScore: false };
  }

  // Get avatars
  getAvatars(): string[] {
    return ANIME_AVATARS;
  }
}

export const mockApi = new MockApiService();

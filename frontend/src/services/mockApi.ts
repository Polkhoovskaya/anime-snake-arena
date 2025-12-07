import { User, LeaderboardEntry, LiveGame, GameResult } from './mockApi.local';

// Re-export types from local mock for compatibility
export type { User, LeaderboardEntry, LiveGame, GameResult };

// Anime avatars with Ghibli-inspired character names (keeping for fallback/reference)
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

const STORAGE_KEY = 'snake_game_token';
const USER_KEY = 'snake_game_user';

class ApiService {
    private token: string | null = null;
    private currentUser: User | null = null;

    constructor() {
        this.token = localStorage.getItem(STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    }

    // Auth methods
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            const data = await this.request<{ success: boolean; user: User; token: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            this.token = data.token;
            this.currentUser = data.user;
            localStorage.setItem(STORAGE_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async signup(username: string, email: string, password: string, avatar: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            const data = await this.request<{ success: boolean; user: User; token: string }>('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ username, email, password, avatar }),
            });

            this.token = data.token;
            this.currentUser = data.user;
            localStorage.setItem(STORAGE_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore logout errors
        } finally {
            this.token = null;
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
        }
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    async verifySession(): Promise<User | null> {
        if (!this.token) return null;

        try {
            const user = await this.request<User>('/auth/me');
            this.currentUser = user;
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        } catch (error) {
            this.token = null;
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }

    async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User }> {
        try {
            const data = await this.request<{ success: boolean; user: User }>('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });

            this.currentUser = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false };
        }
    }

    // Leaderboard methods
    async getLeaderboard(mode?: 'pass-through' | 'walls'): Promise<LeaderboardEntry[]> {
        try {
            const query = mode ? `?mode=${mode}` : '';
            return await this.request<LeaderboardEntry[]>(`/leaderboard${query}`);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    }

    // Live games methods
    async getLiveGames(): Promise<LiveGame[]> {
        try {
            return await this.request<LiveGame[]>('/games/live');
        } catch (error) {
            console.error('Failed to fetch live games:', error);
            return [];
        }
    }

    async getLiveGame(id: string): Promise<LiveGame | null> {
        try {
            return await this.request<LiveGame>(`/games/live/${id}`);
        } catch (error) {
            return null;
        }
    }

    // Game methods
    async submitScore(result: GameResult): Promise<{ success: boolean; newHighScore: boolean }> {
        try {
            return await this.request<{ success: boolean; newHighScore: boolean }>('/games/score', {
                method: 'POST',
                body: JSON.stringify(result),
            });
        } catch (error) {
            console.error('Failed to submit score:', error);
            return { success: false, newHighScore: false };
        }
    }

    // Get avatars
    getAvatars(): string[] {
        // We can fetch from backend if endpoint exists, otherwise return constant
        // The OpenAPI spec has /avatars endpoint
        // But for synchronous return in existing code usage, we might need to adjust.
        // However, the existing mockApi.ts had `getAvatars(): string[]` which is synchronous.
        // If we want to use backend, we need to make it async or fetch on init.
        // For now, to maintain compatibility, we'll return the constant, 
        // but we could also fetch them in constructor or have an async method.
        // Let's check if we can make it async in the app.
        // The usage in AuthPage.tsx likely expects it to be sync or simple.
        // Let's stick to constant for now to avoid breaking changes in UI, 
        // or we can try to fetch and cache.
        return ANIME_AVATARS;
    }

    async fetchAvatars(): Promise<string[]> {
        try {
            return await this.request<string[]>('/avatars');
        } catch (e) {
            return ANIME_AVATARS;
        }
    }
}

export const mockApi = new ApiService();

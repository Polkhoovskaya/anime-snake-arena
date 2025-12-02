import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  moveSnake,
  changeDirection,
  startGame,
  pauseGame,
  togglePause,
  setGameMode,
  isValidDirectionChange,
  getOppositeDirection,
  generateFood,
  simulateAIMove,
  GRID_SIZE,
  POINTS_PER_FOOD,
} from '../game/snakeLogic';

describe('Snake Game Logic', () => {
  describe('createInitialState', () => {
    it('should create initial state with default walls mode', () => {
      const state = createInitialState();
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
    });

    it('should create initial state with pass-through mode', () => {
      const state = createInitialState('pass-through');
      expect(state.mode).toBe('pass-through');
    });

    it('should position snake in center of grid', () => {
      const state = createInitialState();
      const center = Math.floor(GRID_SIZE / 2);
      expect(state.snake[0].x).toBe(center);
      expect(state.snake[0].y).toBe(center);
    });
  });

  describe('generateFood', () => {
    it('should generate food not on snake body', () => {
      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(isOnSnake).toBe(false);
      }
    });

    it('should generate food within grid bounds', () => {
      const snake = [{ x: 5, y: 5 }];
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(GRID_SIZE);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(GRID_SIZE);
      }
    });
  });

  describe('Direction changes', () => {
    it('should return opposite directions correctly', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
      expect(getOppositeDirection('DOWN')).toBe('UP');
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });

    it('should validate direction changes', () => {
      expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    });

    it('should change direction when valid', () => {
      let state = createInitialState();
      state = startGame(state);
      state = changeDirection(state, 'UP');
      expect(state.nextDirection).toBe('UP');
    });

    it('should not change to opposite direction', () => {
      let state = createInitialState();
      state = startGame(state);
      state = changeDirection(state, 'LEFT'); // Opposite of RIGHT
      expect(state.nextDirection).toBe('RIGHT');
    });

    it('should not change direction when not playing', () => {
      const state = createInitialState();
      const newState = changeDirection(state, 'UP');
      expect(newState.nextDirection).toBe('RIGHT');
    });
  });

  describe('moveSnake', () => {
    it('should move snake in current direction', () => {
      let state = createInitialState();
      state = startGame(state);
      const initialHead = { ...state.snake[0] };
      state = moveSnake(state);
      expect(state.snake[0].x).toBe(initialHead.x + 1);
      expect(state.snake[0].y).toBe(initialHead.y);
    });

    it('should grow snake when eating food', () => {
      let state = createInitialState();
      state = startGame(state);
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      const initialLength = state.snake.length;
      state = moveSnake(state);
      expect(state.snake.length).toBe(initialLength + 1);
      expect(state.score).toBe(POINTS_PER_FOOD);
    });

    it('should end game on wall collision in walls mode', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }];
      state = moveSnake(state);
      expect(state.status).toBe('game-over');
    });

    it('should wrap around in pass-through mode', () => {
      let state = createInitialState('pass-through');
      state = startGame(state);
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }];
      state = moveSnake(state);
      expect(state.snake[0].x).toBe(0);
      expect(state.status).toBe('playing');
    });

    it('should end game on self collision', () => {
      let state = createInitialState();
      state = startGame(state);
      state.snake = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
      ];
      state.direction = 'LEFT';
      state.nextDirection = 'LEFT';
      state = moveSnake(state);
      expect(state.status).toBe('game-over');
    });

    it('should not move when not playing', () => {
      const state = createInitialState();
      const newState = moveSnake(state);
      expect(newState).toEqual(state);
    });
  });

  describe('Game controls', () => {
    it('should start game from idle', () => {
      const state = createInitialState();
      const newState = startGame(state);
      expect(newState.status).toBe('playing');
    });

    it('should restart game from game-over', () => {
      let state = createInitialState();
      state = { ...state, status: 'game-over', score: 100 };
      const newState = startGame(state);
      expect(newState.status).toBe('playing');
      expect(newState.score).toBe(0);
    });

    it('should resume game from paused', () => {
      let state = createInitialState();
      state = startGame(state);
      state = pauseGame(state);
      expect(state.status).toBe('paused');
      state = startGame(state);
      expect(state.status).toBe('playing');
    });

    it('should pause game when playing', () => {
      let state = createInitialState();
      state = startGame(state);
      state = pauseGame(state);
      expect(state.status).toBe('paused');
    });

    it('should toggle pause correctly', () => {
      let state = createInitialState();
      state = startGame(state);
      state = togglePause(state);
      expect(state.status).toBe('paused');
      state = togglePause(state);
      expect(state.status).toBe('playing');
    });

    it('should not toggle pause when idle', () => {
      const state = createInitialState();
      const newState = togglePause(state);
      expect(newState.status).toBe('idle');
    });
  });

  describe('setGameMode', () => {
    it('should change mode when idle', () => {
      const state = createInitialState('walls');
      const newState = setGameMode(state, 'pass-through');
      expect(newState.mode).toBe('pass-through');
    });

    it('should change mode when game-over', () => {
      let state = createInitialState('walls');
      state = { ...state, status: 'game-over' };
      const newState = setGameMode(state, 'pass-through');
      expect(newState.mode).toBe('pass-through');
    });

    it('should not change mode when playing', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      const newState = setGameMode(state, 'pass-through');
      expect(newState.mode).toBe('walls');
    });
  });

  describe('Speed mechanics', () => {
    it('should increase speed when eating food', () => {
      let state = createInitialState();
      state = startGame(state);
      const initialSpeed = state.speed;
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      state = moveSnake(state);
      expect(state.speed).toBeLessThan(initialSpeed);
    });
  });

  describe('simulateAIMove', () => {
    it('should return a valid game state', () => {
      let state = createInitialState();
      state = startGame(state);
      const newState = simulateAIMove(state);
      expect(newState.status).toBe('playing');
      expect(newState.snake.length).toBeGreaterThanOrEqual(1);
    });

    it('should change direction randomly', () => {
      let state = createInitialState();
      state = startGame(state);
      const directions: string[] = [];
      for (let i = 0; i < 50; i++) {
        state = simulateAIMove(state);
        directions.push(state.direction);
      }
      // Should have some variety in directions
      const uniqueDirections = new Set(directions);
      expect(uniqueDirections.size).toBeGreaterThan(1);
    });
  });
});

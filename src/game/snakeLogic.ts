// Snake Game Core Logic
// Separated for testing and reusability

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'pass-through' | 'walls';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  gridSize: number;
  speed: number;
}

export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;
export const GRID_SIZE = 20;
export const POINTS_PER_FOOD = 10;

export function createInitialState(mode: GameMode = 'walls'): GameState {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: generateFood([{ x: center, y: center }, { x: center - 1, y: center }, { x: center - 2, y: center }]),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    gridSize: GRID_SIZE,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[]): Position {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

export function getOppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== getOppositeDirection(current);
}

export function moveSnake(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  const head = state.snake[0];
  const direction = state.nextDirection;
  
  let newHead: Position;
  
  switch (direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'walls') {
    if (newHead.x < 0 || newHead.x >= state.gridSize || 
        newHead.y < 0 || newHead.y >= state.gridSize) {
      return { ...state, status: 'game-over' };
    }
  } else {
    // Pass-through mode: wrap around
    newHead = {
      x: (newHead.x + state.gridSize) % state.gridSize,
      y: (newHead.y + state.gridSize) % state.gridSize,
    };
  }

  // Check self collision (excluding tail since it will move)
  const willEatFood = newHead.x === state.food.x && newHead.y === state.food.y;
  const bodyToCheck = willEatFood ? state.snake : state.snake.slice(0, -1);
  
  if (bodyToCheck.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, status: 'game-over' };
  }

  // Build new snake
  const newSnake = [newHead, ...state.snake];
  
  if (willEatFood) {
    // Keep tail (snake grows)
    const newScore = state.score + POINTS_PER_FOOD;
    const newSpeed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
    return {
      ...state,
      snake: newSnake,
      food: generateFood(newSnake),
      direction,
      score: newScore,
      speed: newSpeed,
    };
  } else {
    // Remove tail (snake moves)
    newSnake.pop();
    return {
      ...state,
      snake: newSnake,
      direction,
    };
  }
}

export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (state.status !== 'playing') return state;
  
  if (isValidDirectionChange(state.direction, newDirection)) {
    return { ...state, nextDirection: newDirection };
  }
  return state;
}

export function startGame(state: GameState): GameState {
  if (state.status === 'idle' || state.status === 'game-over') {
    return { ...createInitialState(state.mode), status: 'playing' };
  }
  if (state.status === 'paused') {
    return { ...state, status: 'playing' };
  }
  return state;
}

export function pauseGame(state: GameState): GameState {
  if (state.status === 'playing') {
    return { ...state, status: 'paused' };
  }
  return state;
}

export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') {
    return pauseGame(state);
  }
  if (state.status === 'paused') {
    return startGame(state);
  }
  return state;
}

export function setGameMode(state: GameState, mode: GameMode): GameState {
  if (state.status === 'idle' || state.status === 'game-over') {
    return { ...createInitialState(mode) };
  }
  return state;
}

// For spectating/AI simulation
export function simulateAIMove(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  const head = state.snake[0];
  const food = state.food;
  
  // Simple AI: try to move towards food
  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirections = possibleDirections.filter(d => 
    isValidDirectionChange(state.direction, d)
  );

  // Prefer direction towards food
  let bestDirection = validDirections[0];
  
  if (food.x > head.x && validDirections.includes('RIGHT')) bestDirection = 'RIGHT';
  else if (food.x < head.x && validDirections.includes('LEFT')) bestDirection = 'LEFT';
  else if (food.y > head.y && validDirections.includes('DOWN')) bestDirection = 'DOWN';
  else if (food.y < head.y && validDirections.includes('UP')) bestDirection = 'UP';

  // Add some randomness for variety
  if (Math.random() < 0.1) {
    bestDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
  }

  const newState = changeDirection(state, bestDirection);
  return moveSnake(newState);
}

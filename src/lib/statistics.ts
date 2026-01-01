export type Difficulty = 'easy' | 'moderate' | 'difficult';

export interface DifficultyStats {
  easy: number;
  moderate: number;
  difficult: number;
}

export interface DifficultyTimeStats {
  easy: number | null;
  moderate: number | null;
  difficult: number | null;
}

export interface GameStats {
  gamesPlayed: DifficultyStats;
  gamesWon: DifficultyStats;
  bestTime: DifficultyTimeStats;
  totalTime: DifficultyStats;
  hintsUsed: number;
  currentStreak: number;
  longestStreak: number;
  dailyCompleted: string[]; // ISO date strings
  lastPlayedDate: string | null;
}

const STORAGE_KEY = 'tet-puzzle-stats';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: { easy: 0, moderate: 0, difficult: 0 },
  gamesWon: { easy: 0, moderate: 0, difficult: 0 },
  bestTime: { easy: null, moderate: null, difficult: null },
  totalTime: { easy: 0, moderate: 0, difficult: 0 },
  hintsUsed: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyCompleted: [],
  lastPlayedDate: null,
};

// Get stats from localStorage
export function getStats(): GameStats {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_STATS };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_STATS };
    }
    const parsed = JSON.parse(stored) as Partial<GameStats>;
    // Merge with defaults to handle missing fields from older versions
    return {
      ...DEFAULT_STATS,
      ...parsed,
      gamesPlayed: { ...DEFAULT_STATS.gamesPlayed, ...parsed.gamesPlayed },
      gamesWon: { ...DEFAULT_STATS.gamesWon, ...parsed.gamesWon },
      bestTime: { ...DEFAULT_STATS.bestTime, ...parsed.bestTime },
      totalTime: { ...DEFAULT_STATS.totalTime, ...parsed.totalTime },
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

// Save stats to localStorage
export function saveStats(stats: GameStats): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

// Record a game start
export function recordGameStart(difficulty: Difficulty): GameStats {
  const stats = getStats();
  stats.gamesPlayed[difficulty]++;
  saveStats(stats);
  return stats;
}

// Record a game win
export function recordGameWin(
  difficulty: Difficulty,
  timeInSeconds: number,
  usedHint: boolean
): GameStats {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  // Update wins
  stats.gamesWon[difficulty]++;

  // Update time stats
  stats.totalTime[difficulty] += timeInSeconds;
  const currentBest = stats.bestTime[difficulty];
  if (currentBest === null || timeInSeconds < currentBest) {
    stats.bestTime[difficulty] = timeInSeconds;
  }

  // Update hints
  if (usedHint) {
    stats.hintsUsed++;
  }

  // Update streak
  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastPlayedDate === yesterdayStr) {
      stats.currentStreak++;
    } else {
      stats.currentStreak = 1;
    }

    stats.lastPlayedDate = today;
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  saveStats(stats);
  return stats;
}

// Record daily challenge completion
export function recordDailyCompletion(dateStr: string): GameStats {
  const stats = getStats();
  if (!stats.dailyCompleted.includes(dateStr)) {
    stats.dailyCompleted.push(dateStr);
    // Keep only last 30 days
    if (stats.dailyCompleted.length > 30) {
      stats.dailyCompleted = stats.dailyCompleted.slice(-30);
    }
  }
  saveStats(stats);
  return stats;
}

// Check if daily challenge was completed
export function isDailyCompleted(dateStr: string): boolean {
  const stats = getStats();
  return stats.dailyCompleted.includes(dateStr);
}

// Get average time for a difficulty
export function getAverageTime(difficulty: Difficulty): number | null {
  const stats = getStats();
  const gamesWon = stats.gamesWon[difficulty];
  if (gamesWon === 0) return null;
  return Math.round(stats.totalTime[difficulty] / gamesWon);
}

// Get win rate for a difficulty
export function getWinRate(difficulty: Difficulty): number {
  const stats = getStats();
  const played = stats.gamesPlayed[difficulty];
  if (played === 0) return 0;
  return Math.round((stats.gamesWon[difficulty] / played) * 100);
}

// Reset all stats
export function resetStats(): GameStats {
  const stats = { ...DEFAULT_STATS };
  saveStats(stats);
  return stats;
}

// Format time for display
export function formatTimeStats(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

import type { PuzzleState, NumberPair, GridCell, Operation } from '../types/puzzle';
import {
  createSeededRandom,
  hashString,
  getTodayDateString,
  getDateStringDaysAgo,
  seededShuffle,
  seededRandomInt,
} from './seededRandom';
import { isDailyCompleted, recordDailyCompletion, type Difficulty } from './statistics';

// Launch date - first daily challenge was on December 24, 2024
export const LAUNCH_DATE = '2024-12-24';

// Get number of days since launch
export function getDaysSinceLaunch(dateString: string): number {
  const launchDate = new Date(LAUNCH_DATE);
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - launchDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get puzzle number for a date (1-indexed)
export function getDailyChallengeNumber(dateString: string): number {
  return getDaysSinceLaunch(dateString) + 1;
}

// Get difficulty based on day of week
// Mon/Tue: Easy, Wed/Thu: Moderate, Fri/Sat/Sun: Difficult
export function getDailyChallengeDifficulty(dateString: string): Difficulty {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (dayOfWeek === 1 || dayOfWeek === 2) {
    return 'easy';
  } else if (dayOfWeek === 3 || dayOfWeek === 4) {
    return 'moderate';
  } else {
    return 'difficult'; // Fri, Sat, Sun
  }
}

// Generate a unique pair ID
function generatePairId(index: number): string {
  return `daily-pair-${index}`;
}

// Generate a cell ID
function generateCellId(index: number): string {
  return `daily-cell-${index}`;
}

// Generate number pairs using seeded random
function generateSeededPairs(random: () => number): NumberPair[] {
  const pairs: NumberPair[] = [];
  const usedPairs = new Set<string>();

  while (pairs.length < 8) {
    const first = seededRandomInt(1, 9, random);
    const second = seededRandomInt(first + 1, 10, random);
    const key = `${first}-${second}`;

    if (!usedPairs.has(key)) {
      usedPairs.add(key);
      pairs.push({
        id: generatePairId(pairs.length),
        first,
        second,
        firstOriginal: first,
        secondOriginal: second,
      });
    }
  }

  return pairs;
}

// Generate daily puzzle for a specific date
export function generateDailyPuzzle(dateString: string): PuzzleState {
  const seed = hashString(`tetonor-daily-${dateString}`);
  const random = createSeededRandom(seed);

  // Generate 8 unique pairs
  const pairs = generateSeededPairs(random);

  // Create cells - each pair used twice (once for add, once for multiply)
  const cells: GridCell[] = [];

  pairs.forEach((pair, index) => {
    // Addition cell
    cells.push({
      id: generateCellId(index * 2),
      target: pair.first! + pair.second!,
      operation: 'add' as Operation,
      solutionPairId: pair.id,
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    });

    // Multiplication cell
    cells.push({
      id: generateCellId(index * 2 + 1),
      target: pair.first! * pair.second!,
      operation: 'multiply' as Operation,
      solutionPairId: pair.id,
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    });
  });

  // Shuffle cells
  const shuffledCells = seededShuffle(cells, random);

  // Apply blanks (moderate difficulty: 7-8 blanks)
  const blankCount = seededRandomInt(7, 8, random);
  const pairsToBlank = seededShuffle([...pairs], random).slice(0, Math.ceil(blankCount / 2));

  const blankPairIds = new Set(pairsToBlank.map((p) => p.id));
  const finalPairs = pairs.map((pair) => {
    if (blankPairIds.has(pair.id)) {
      // Randomly blank first, second, or both
      const blankType = seededRandomInt(0, 2, random);
      return {
        ...pair,
        first: blankType === 1 ? null : pair.first,
        second: blankType === 0 ? null : pair.second,
      };
    }
    return pair;
  });

  // Initialize pair usage tracking
  const pairUsage: Record<string, { usedForAdd: boolean; usedForMultiply: boolean }> = {};
  pairs.forEach((pair) => {
    pairUsage[pair.id] = { usedForAdd: false, usedForMultiply: false };
  });

  return {
    grid: shuffledCells,
    strip: finalPairs,
    pairUsage,
    dimensions: { rows: 4, cols: 4 },
  };
}

// Get today's daily puzzle
export function getTodaysDailyPuzzle(): PuzzleState {
  return generateDailyPuzzle(getTodayDateString());
}

// Get a puzzle from N days ago
export function getDailyPuzzleFromDaysAgo(days: number): PuzzleState {
  return generateDailyPuzzle(getDateStringDaysAgo(days));
}

// Check if today's daily is completed
export function isTodaysDailyCompleted(): boolean {
  return isDailyCompleted(getTodayDateString());
}

// Record today's daily as completed
export function recordTodaysDailyCompletion(): void {
  recordDailyCompletion(getTodayDateString());
}

// Get daily challenge info
export interface DailyChallengeInfo {
  dateString: string;
  displayDate: string;
  isCompleted: boolean;
  isToday: boolean;
  puzzleNumber: number;
  difficulty: Difficulty;
}

// Get list of daily challenges (today + last 6 days)
export function getDailyChallengeList(): DailyChallengeInfo[] {
  const today = getTodayDateString();
  const list: DailyChallengeInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const dateString = getDateStringDaysAgo(i);
    const date = new Date(dateString);
    const displayDate = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    list.push({
      dateString,
      displayDate,
      isCompleted: isDailyCompleted(dateString),
      isToday: dateString === today,
      puzzleNumber: getDailyChallengeNumber(dateString),
      difficulty: getDailyChallengeDifficulty(dateString),
    });
  }

  return list;
}

// Get ALL daily challenges from launch to today
export function getAllDailyChallenges(): DailyChallengeInfo[] {
  const today = getTodayDateString();
  const totalDays = getDaysSinceLaunch(today) + 1;
  const list: DailyChallengeInfo[] = [];

  for (let i = 0; i < totalDays; i++) {
    const dateString = getDateStringDaysAgo(i);
    // Skip future dates (shouldn't happen, but safety check)
    if (getDaysSinceLaunch(dateString) < 0) continue;

    const date = new Date(dateString);
    const displayDate = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    list.push({
      dateString,
      displayDate,
      isCompleted: isDailyCompleted(dateString),
      isToday: dateString === today,
      puzzleNumber: getDailyChallengeNumber(dateString),
      difficulty: getDailyChallengeDifficulty(dateString),
    });
  }

  return list;
}

// Get date string from puzzle number
export function getDateFromPuzzleNumber(puzzleNumber: number): string {
  const launchDate = new Date(LAUNCH_DATE);
  launchDate.setDate(launchDate.getDate() + puzzleNumber - 1);
  return launchDate.toISOString().split('T')[0];
}

// Check if a date is valid for daily challenge (>= launch date and <= today)
export function isValidDailyDate(dateString: string): boolean {
  const daysSinceLaunch = getDaysSinceLaunch(dateString);
  const today = getTodayDateString();
  const daysUntilToday = getDaysSinceLaunch(today);
  return daysSinceLaunch >= 0 && daysSinceLaunch <= daysUntilToday;
}

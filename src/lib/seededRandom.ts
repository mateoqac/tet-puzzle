// Mulberry32 PRNG - Simple, fast, seedable random number generator
// Based on: https://github.com/bryc/code/blob/master/jshash/PRNGs.md

export function createSeededRandom(seed: number) {
  let state = seed;

  // Return a function that generates random numbers between 0 and 1
  return function random(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a hash code from a string (for creating seed from date)
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// Get today's date as YYYY-MM-DD string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get a date string for N days ago
export function getDateStringDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Get number of days since a reference date
export function getDaysSinceLaunch(dateString: string, launchDate: string = '2024-12-24'): number {
  const launch = new Date(launchDate);
  const target = new Date(dateString);
  const diffTime = target.getTime() - launch.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Shuffle an array using seeded random
export function seededShuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get a random integer between min and max (inclusive) using seeded random
export function seededRandomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

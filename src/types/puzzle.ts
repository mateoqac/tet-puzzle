/**
 * Represents an operation type in the Tet puzzle
 */
export type Operation = 'add' | 'multiply';

/**
 * Represents a pair of numbers from the strip
 */
export interface NumberPair {
  first: number | null;
  second: number | null;
  /** Original value of first (used for sorting when first is hidden) */
  firstOriginal?: number;
  /** Original value of second (used for sorting when second is hidden) */
  secondOriginal?: number;
  id: string;
}

/**
 * Represents a cell in the main puzzle grid
 */
export interface GridCell {
  /** The target number to be achieved */
  target: number;
  /** The operation type (addition or multiplication) */
  operation: Operation;
  /** The correct pair ID that solves this cell */
  solutionPairId: string;
  /** Player's current input for the first number */
  playerFirst: number | null;
  /** Player's current input for the second number */
  playerSecond: number | null;
  /** Player's selected operation */
  playerOperation: Operation | null;
  /** Unique identifier for this cell */
  id: string;
}

/**
 * Represents the usage state of a number pair
 */
export interface PairUsage {
  pairId: string;
  additionUsed: boolean;
  multiplicationUsed: boolean;
}

/**
 * Complete puzzle state
 */
export interface PuzzleState {
  /** The main grid of cells to solve */
  grid: GridCell[];
  /** The strip of number pairs available to use */
  strip: NumberPair[];
  /** Tracking which pairs have been used and how */
  pairUsage: Map<string, PairUsage>;
  /** Grid dimensions */
  dimensions: {
    rows: number;
    cols: number;
  };
}

/**
 * Configuration for puzzle generation
 */
export interface PuzzleConfig {
  /** Number of rows in the grid */
  rows: number;
  /** Number of columns in the grid */
  cols: number;
  /** Minimum value for numbers in pairs */
  minValue: number;
  /** Maximum value for numbers in pairs */
  maxValue: number;
  /** Number of blank pairs (numbers to be deduced) */
  blankPairs: number;
  /** Difficulty level affects value ranges and blank placement */
  difficulty: 'easy' | 'moderate' | 'difficult';
}

/**
 * Validation result for a cell
 */
export interface CellValidation {
  cellId: string;
  isCorrect: boolean;
  hasCorrectPair: boolean;
  hasCorrectOperation: boolean;
  expectedPair: NumberPair;
  message?: string;
}

/**
 * Complete puzzle validation result
 */
export interface PuzzleValidation {
  isComplete: boolean;
  isCorrect: boolean;
  cellValidations: CellValidation[];
  pairUsageValid: boolean;
  errors: string[];
}

/**
 * Serializable puzzle data for storage/transport
 */
export interface SerializedPuzzle {
  grid: GridCell[];
  strip: NumberPair[];
  dimensions: {
    rows: number;
    cols: number;
  };
}

import { describe, it, expect } from 'vitest';
import {
  generatePuzzle,
  createDefaultConfig,
  PRESET_CONFIGS,
  generateBeginnerPuzzle,
  generateIntermediatePuzzle,
  generateAdvancedPuzzle,
  createFixedPuzzle,
} from '../puzzleGenerator';
import { validatePuzzle } from '../puzzleValidator';
import type { PuzzleConfig, PuzzleState } from '../../types/puzzle';

describe('puzzleGenerator', () => {
  describe('generatePuzzle', () => {
    it('should generate a valid puzzle with default config', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      expect(puzzle.grid).toBeDefined();
      expect(puzzle.strip).toBeDefined();
      expect(puzzle.pairUsage).toBeDefined();
      expect(puzzle.dimensions).toEqual({ rows: config.rows, cols: config.cols });
    });

    it('should create grid with correct number of cells', () => {
      const config: PuzzleConfig = {
        rows: 4,
        cols: 4,
        minValue: 2,
        maxValue: 10,
        blankPairs: 0,
        difficulty: 'easy',
      };

      const puzzle = generatePuzzle(config);

      expect(puzzle.grid).toHaveLength(16); // 4x4 = 16
    });

    it('should create correct number of pairs', () => {
      const config: PuzzleConfig = {
        rows: 4,
        cols: 4,
        minValue: 2,
        maxValue: 10,
        blankPairs: 0,
        difficulty: 'easy',
      };

      const puzzle = generatePuzzle(config);

      // Grid has 16 cells, each pair used twice = 8 pairs
      expect(puzzle.strip).toHaveLength(8);
    });

    it('should ensure each pair is used exactly twice in grid', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      // Count how many times each pair is referenced
      const pairUsageCount = new Map<string, number>();
      puzzle.grid.forEach((cell) => {
        const count = pairUsageCount.get(cell.solutionPairId) || 0;
        pairUsageCount.set(cell.solutionPairId, count + 1);
      });

      // Each pair should be used exactly twice
      pairUsageCount.forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it('should create one add and one multiply cell for each pair', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      // Group cells by solution pair
      const cellsByPair = new Map<string, typeof puzzle.grid>();
      puzzle.grid.forEach((cell) => {
        const cells = cellsByPair.get(cell.solutionPairId) || [];
        cells.push(cell);
        cellsByPair.set(cell.solutionPairId, cells);
      });

      // Each pair should have one add and one multiply cell
      cellsByPair.forEach((cells) => {
        expect(cells).toHaveLength(2);
        const operations = cells.map((c) => c.operation).sort();
        expect(operations).toEqual(['add', 'multiply']);
      });
    });

    it('should generate numbers within specified range', () => {
      const config: PuzzleConfig = {
        rows: 2,
        cols: 2,
        minValue: 5,
        maxValue: 10,
        blankPairs: 0,
        difficulty: 'easy',
      };

      const puzzle = generatePuzzle(config);

      puzzle.strip.forEach((pair) => {
        if (pair.first !== null) {
          expect(pair.first).toBeGreaterThanOrEqual(config.minValue);
          expect(pair.first).toBeLessThanOrEqual(config.maxValue);
        }
        if (pair.second !== null) {
          expect(pair.second).toBeGreaterThanOrEqual(config.minValue);
          expect(pair.second).toBeLessThanOrEqual(config.maxValue);
        }
      });
    });

    it('should throw error for odd number of cells', () => {
      const config: PuzzleConfig = {
        rows: 3,
        cols: 3, // 9 cells = odd
        minValue: 2,
        maxValue: 10,
        blankPairs: 0,
        difficulty: 'easy',
      };

      expect(() => generatePuzzle(config)).toThrow(
        'Grid dimensions must result in an even number of cells'
      );
    });

    it('should initialize pair usage correctly', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      expect(puzzle.pairUsage.size).toBe(puzzle.strip.length);
      puzzle.pairUsage.forEach((usage) => {
        expect(usage.additionUsed).toBe(false);
        expect(usage.multiplicationUsed).toBe(false);
      });
    });

    it('should calculate targets correctly for addition', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      puzzle.grid.forEach((cell) => {
        if (cell.operation === 'add') {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          if (pair && pair.first !== null && pair.second !== null) {
            expect(cell.target).toBe(pair.first + pair.second);
          }
        }
      });
    });

    it('should calculate targets correctly for multiplication', () => {
      const config = createDefaultConfig();
      const puzzle = generatePuzzle(config);

      puzzle.grid.forEach((cell) => {
        if (cell.operation === 'multiply') {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          if (pair && pair.first !== null && pair.second !== null) {
            expect(cell.target).toBe(pair.first * pair.second);
          }
        }
      });
    });

    it('should apply blank pairs according to config', () => {
      const config: PuzzleConfig = {
        rows: 4,
        cols: 4,
        minValue: 2,
        maxValue: 10,
        blankPairs: 3,
        difficulty: 'easy',
      };

      const puzzle = generatePuzzle(config);

      // Count pairs with at least one blank
      const blankedPairs = puzzle.strip.filter(
        (pair) => pair.first === null || pair.second === null
      );

      expect(blankedPairs.length).toBeGreaterThan(0);
      expect(blankedPairs.length).toBeLessThanOrEqual(config.blankPairs);
    });
  });

  describe('createDefaultConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultConfig();

      expect(config).toEqual({
        rows: 3,
        cols: 4,
        minValue: 2,
        maxValue: 9,
        blankPairs: 1,
        difficulty: 'easy',
      });
    });
  });

  describe('PRESET_CONFIGS', () => {
    it('should have configurations for all difficulty levels', () => {
      expect(PRESET_CONFIGS.easy).toBeDefined();
      expect(PRESET_CONFIGS.moderate).toBeDefined();
      expect(PRESET_CONFIGS.difficult).toBeDefined();
    });

    it('should have valid configurations', () => {
      Object.values(PRESET_CONFIGS).forEach((config) => {
        expect(config.rows).toBeGreaterThan(0);
        expect(config.cols).toBeGreaterThan(0);
        expect(config.minValue).toBeGreaterThanOrEqual(0);
        expect(config.maxValue).toBeGreaterThan(config.minValue);
        expect(config.blankPairs).toBeGreaterThanOrEqual(0);
      });
    });

    it('should produce even number of cells', () => {
      Object.values(PRESET_CONFIGS).forEach((config) => {
        const totalCells = config.rows * config.cols;
        expect(totalCells % 2).toBe(0);
      });
    });
  });

  describe('generateBeginnerPuzzle', () => {
    it('should generate a valid beginner puzzle', () => {
      const puzzle = generateBeginnerPuzzle();

      expect(puzzle.grid).toHaveLength(16); // 4x4
      expect(puzzle.strip).toHaveLength(8);
      expect(puzzle.dimensions).toEqual({ rows: 4, cols: 4 });
    });

    it('should use numbers in range (1-50)', () => {
      const puzzle = generateBeginnerPuzzle();

      puzzle.strip.forEach((pair) => {
        const first = pair.firstOriginal ?? pair.first;
        const second = pair.secondOriginal ?? pair.second;

        if (first !== null) {
          expect(first).toBeGreaterThanOrEqual(1);
          expect(first).toBeLessThanOrEqual(50);
        }
        if (second !== null) {
          expect(second).toBeGreaterThanOrEqual(1);
          expect(second).toBeLessThanOrEqual(50);
        }
      });
    });

    it('should have 5-6 blanks', () => {
      const puzzle = generateBeginnerPuzzle();

      const blankCount = puzzle.strip.reduce((count, pair) => {
        if (pair.first === null) count++;
        if (pair.second === null) count++;
        return count;
      }, 0);

      expect(blankCount).toBeGreaterThanOrEqual(5);
      expect(blankCount).toBeLessThanOrEqual(6);
    });

    it('should generate a solvable puzzle', () => {
      const puzzle = generateBeginnerPuzzle();

      // Fill in all cells with correct answers
      const solvedPuzzle: PuzzleState = {
        ...puzzle,
        grid: puzzle.grid.map((cell) => {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          const first = pair?.firstOriginal ?? pair?.first ?? 0;
          const second = pair?.secondOriginal ?? pair?.second ?? 0;
          return {
            ...cell,
            playerFirst: first,
            playerSecond: second,
            playerOperation: cell.operation,
          };
        }),
      };

      const validation = validatePuzzle(solvedPuzzle);
      expect(validation.isCorrect).toBe(true);
    });

    it('should generate unique puzzles', () => {
      const puzzle1 = generateBeginnerPuzzle();
      const puzzle2 = generateBeginnerPuzzle();

      // Puzzles should be different (not same targets in same order)
      const targets1 = puzzle1.grid.map((c) => c.target).join(',');
      const targets2 = puzzle2.grid.map((c) => c.target).join(',');

      // Very unlikely to be the same
      expect(targets1).not.toBe(targets2);
    });
  });

  describe('generateIntermediatePuzzle', () => {
    it('should generate a valid intermediate puzzle', () => {
      const puzzle = generateIntermediatePuzzle();

      expect(puzzle.grid).toHaveLength(16); // 4x4
      expect(puzzle.strip).toHaveLength(8);
      expect(puzzle.dimensions).toEqual({ rows: 4, cols: 4 });
    });

    it('should use numbers in range (1-50)', () => {
      const puzzle = generateIntermediatePuzzle();

      puzzle.strip.forEach((pair) => {
        const first = pair.firstOriginal ?? pair.first;
        const second = pair.secondOriginal ?? pair.second;

        if (first !== null) {
          expect(first).toBeGreaterThanOrEqual(1);
          expect(first).toBeLessThanOrEqual(50);
        }
        if (second !== null) {
          expect(second).toBeGreaterThanOrEqual(1);
          expect(second).toBeLessThanOrEqual(50);
        }
      });
    });

    it('should have 7-8 blanks', () => {
      const puzzle = generateIntermediatePuzzle();

      const blankCount = puzzle.strip.reduce((count, pair) => {
        if (pair.first === null) count++;
        if (pair.second === null) count++;
        return count;
      }, 0);

      expect(blankCount).toBeGreaterThanOrEqual(7);
      expect(blankCount).toBeLessThanOrEqual(8);
    });

    it('should generate a solvable puzzle', () => {
      const puzzle = generateIntermediatePuzzle();

      // Fill in all cells with correct answers
      const solvedPuzzle: PuzzleState = {
        ...puzzle,
        grid: puzzle.grid.map((cell) => {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          const first = pair?.firstOriginal ?? pair?.first ?? 0;
          const second = pair?.secondOriginal ?? pair?.second ?? 0;
          return {
            ...cell,
            playerFirst: first,
            playerSecond: second,
            playerOperation: cell.operation,
          };
        }),
      };

      const validation = validatePuzzle(solvedPuzzle);
      expect(validation.isCorrect).toBe(true);
    });
  });

  describe('generateAdvancedPuzzle', () => {
    it('should generate a valid advanced puzzle', () => {
      const puzzle = generateAdvancedPuzzle();

      expect(puzzle.grid).toHaveLength(16); // 4x4
      expect(puzzle.strip).toHaveLength(8);
      expect(puzzle.dimensions).toEqual({ rows: 4, cols: 4 });
    });

    it('should use numbers in range (1-50)', () => {
      const puzzle = generateAdvancedPuzzle();

      puzzle.strip.forEach((pair) => {
        const first = pair.firstOriginal ?? pair.first;
        const second = pair.secondOriginal ?? pair.second;

        if (first !== null) {
          expect(first).toBeGreaterThanOrEqual(1);
          expect(first).toBeLessThanOrEqual(50);
        }
        if (second !== null) {
          expect(second).toBeGreaterThanOrEqual(1);
          expect(second).toBeLessThanOrEqual(50);
        }
      });
    });

    it('should have 10-11 blanks (only 5-6 visible)', () => {
      const puzzle = generateAdvancedPuzzle();

      const blankCount = puzzle.strip.reduce((count, pair) => {
        if (pair.first === null) count++;
        if (pair.second === null) count++;
        return count;
      }, 0);

      expect(blankCount).toBeGreaterThanOrEqual(10);
      expect(blankCount).toBeLessThanOrEqual(11);
    });

    it('should generate a solvable puzzle', () => {
      const puzzle = generateAdvancedPuzzle();

      // Fill in all cells with correct answers
      const solvedPuzzle: PuzzleState = {
        ...puzzle,
        grid: puzzle.grid.map((cell) => {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          const first = pair?.firstOriginal ?? pair?.first ?? 0;
          const second = pair?.secondOriginal ?? pair?.second ?? 0;
          return {
            ...cell,
            playerFirst: first,
            playerSecond: second,
            playerOperation: cell.operation,
          };
        }),
      };

      const validation = validatePuzzle(solvedPuzzle);
      expect(validation.isCorrect).toBe(true);
    });

    it('should produce larger target numbers', () => {
      const puzzle = generateAdvancedPuzzle();

      // Should have at least some large targets from multiplication
      const maxTarget = Math.max(...puzzle.grid.map((c) => c.target));
      expect(maxTarget).toBeGreaterThan(100); // Advanced puzzles should have large products
    });
  });

  describe('createFixedPuzzle', () => {
    it('should create the fixed example puzzle', () => {
      const puzzle = createFixedPuzzle();

      expect(puzzle.grid).toHaveLength(16);
      expect(puzzle.strip).toHaveLength(8);
      expect(puzzle.dimensions).toEqual({ rows: 4, cols: 4 });
    });

    it('should be solvable', () => {
      const puzzle = createFixedPuzzle();

      // Fill in all cells with correct answers
      const solvedPuzzle: PuzzleState = {
        ...puzzle,
        grid: puzzle.grid.map((cell) => {
          const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
          return {
            ...cell,
            playerFirst: pair?.first ?? 0,
            playerSecond: pair?.second ?? 0,
            playerOperation: cell.operation,
          };
        }),
      };

      const validation = validatePuzzle(solvedPuzzle);
      expect(validation.isCorrect).toBe(true);
    });

    it('should have consistent pairs and targets', () => {
      const puzzle = createFixedPuzzle();

      // Verify specific known values from the fixed puzzle
      expect(puzzle.strip).toHaveLength(8);

      // Each cell should reference a valid pair
      puzzle.grid.forEach((cell) => {
        const pair = puzzle.strip.find((p) => p.id === cell.solutionPairId);
        expect(pair).toBeDefined();

        if (pair && pair.first !== null && pair.second !== null) {
          if (cell.operation === 'add') {
            expect(cell.target).toBe(pair.first + pair.second);
          } else {
            expect(cell.target).toBe(pair.first * pair.second);
          }
        }
      });
    });

    it('should produce same puzzle every time', () => {
      const puzzle1 = createFixedPuzzle();
      const puzzle2 = createFixedPuzzle();

      // Should be identical
      expect(puzzle1.grid.map((c) => c.target)).toEqual(
        puzzle2.grid.map((c) => c.target)
      );
      expect(puzzle1.strip.length).toBe(puzzle2.strip.length);
    });
  });

  describe('puzzle quality checks', () => {
    it('should not have duplicate pairs in strip', () => {
      const puzzle = generateBeginnerPuzzle();

      const pairKeys = new Set<string>();
      puzzle.strip.forEach((pair) => {
        const first = pair.firstOriginal ?? pair.first ?? 0;
        const second = pair.secondOriginal ?? pair.second ?? 0;
        const key = `${Math.min(first, second)}-${Math.max(first, second)}`;
        expect(pairKeys.has(key)).toBe(false);
        pairKeys.add(key);
      });
    });

    it('should keep pairs in ascending order', () => {
      const puzzle = generateBeginnerPuzzle();

      puzzle.strip.forEach((pair) => {
        const first = pair.firstOriginal ?? pair.first;
        const second = pair.secondOriginal ?? pair.second;

        if (first !== null && second !== null) {
          expect(first).toBeLessThanOrEqual(second);
        }
      });
    });

    it('should preserve original values when applying blanks', () => {
      const config: PuzzleConfig = {
        rows: 4,
        cols: 4,
        minValue: 2,
        maxValue: 10,
        blankPairs: 5,
        difficulty: 'moderate',
      };

      const puzzle = generatePuzzle(config);

      puzzle.strip.forEach((pair) => {
        // If first is null, firstOriginal should have the value
        if (pair.first === null && pair.firstOriginal !== undefined) {
          expect(pair.firstOriginal).toBeGreaterThanOrEqual(config.minValue);
          expect(pair.firstOriginal).toBeLessThanOrEqual(config.maxValue);
        }

        // If second is null, secondOriginal should have the value
        if (pair.second === null && pair.secondOriginal !== undefined) {
          expect(pair.secondOriginal).toBeGreaterThanOrEqual(config.minValue);
          expect(pair.secondOriginal).toBeLessThanOrEqual(config.maxValue);
        }
      });
    });
  });
});

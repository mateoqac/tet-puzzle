import { describe, it, expect } from 'vitest';
import {
  validateCell,
  validatePuzzle,
  isInputValid,
  getValidPairsForCell,
  getHintForCell,
} from '../puzzleValidator';
import type { GridCell, NumberPair, PuzzleState, PairUsage } from '../../types/puzzle';

describe('puzzleValidator', () => {
  describe('validateCell', () => {
    it('should return incomplete status when cell has no player input', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(false);
      expect(validation.hasCorrectPair).toBe(false);
      expect(validation.hasCorrectOperation).toBe(false);
      expect(validation.message).toBe('Cell incomplete');
    });

    it('should validate correct cell with matching pair and operation', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'add',
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(true);
      expect(validation.hasCorrectPair).toBe(true);
      expect(validation.hasCorrectOperation).toBe(true);
      expect(validation.message).toBe('Correct!');
    });

    it('should validate cell with numbers in reverse order', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: 7,
        playerSecond: 3,
        playerOperation: 'add',
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(true);
      expect(validation.hasCorrectPair).toBe(true);
      expect(validation.hasCorrectOperation).toBe(true);
    });

    it('should reject cell with incorrect operation', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'multiply', // Wrong operation
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(false);
      expect(validation.hasCorrectOperation).toBe(false);
      expect(validation.message).toBe('Result does not match target');
    });

    it('should reject cell with pair not in strip', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: 4,
        playerSecond: 6, // This pair doesn't exist in strip
        playerOperation: 'add',
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(false);
      expect(validation.hasCorrectPair).toBe(false);
      expect(validation.hasCorrectOperation).toBe(true);
      expect(validation.message).toBe('Pair not found in strip');
    });

    it('should validate multiplication correctly', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 21,
        operation: 'multiply',
        solutionPairId: 'pair-1',
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'multiply',
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(true);
      expect(validation.hasCorrectPair).toBe(true);
      expect(validation.hasCorrectOperation).toBe(true);
    });

    it('should work with blank pairs using original values', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'add',
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: null, second: 7, firstOriginal: 3 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const validation = validateCell(cell, puzzle);

      expect(validation.isCorrect).toBe(true);
      expect(validation.hasCorrectPair).toBe(true);
      expect(validation.hasCorrectOperation).toBe(true);
    });
  });

  describe('validatePuzzle', () => {
    it('should validate complete and correct puzzle', () => {
      const pairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
      ];

      const grid: GridCell[] = [
        {
          id: 'cell-1',
          target: 10,
          operation: 'add',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add',
        },
        {
          id: 'cell-2',
          target: 21,
          operation: 'multiply',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'multiply',
        },
      ];

      const puzzle: PuzzleState = {
        grid,
        strip: pairs,
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      const validation = validatePuzzle(puzzle);

      expect(validation.isComplete).toBe(true);
      expect(validation.isCorrect).toBe(true);
      expect(validation.pairUsageValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.cellValidations).toHaveLength(2);
      expect(validation.cellValidations.every(v => v.isCorrect)).toBe(true);
    });

    it('should detect incomplete puzzle', () => {
      const pairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
      ];

      const grid: GridCell[] = [
        {
          id: 'cell-1',
          target: 10,
          operation: 'add',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add',
        },
        {
          id: 'cell-2',
          target: 21,
          operation: 'multiply',
          solutionPairId: 'pair-1',
          playerFirst: null, // Incomplete
          playerSecond: null,
          playerOperation: null,
        },
      ];

      const puzzle: PuzzleState = {
        grid,
        strip: pairs,
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      const validation = validatePuzzle(puzzle);

      expect(validation.isComplete).toBe(false);
      expect(validation.isCorrect).toBe(false);
    });

    it('should detect when pair is used twice for same operation', () => {
      const pairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
        { id: 'pair-2', first: 2, second: 5 },
      ];

      const grid: GridCell[] = [
        {
          id: 'cell-1',
          target: 10,
          operation: 'add',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add',
        },
        {
          id: 'cell-2',
          target: 10,
          operation: 'multiply',
          solutionPairId: 'pair-2',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add', // Using pair-1 for addition again
        },
        {
          id: 'cell-3',
          target: 21,
          operation: 'multiply',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'multiply',
        },
        {
          id: 'cell-4',
          target: 7,
          operation: 'add',
          solutionPairId: 'pair-2',
          playerFirst: 2,
          playerSecond: 5,
          playerOperation: 'add',
        },
      ];

      const puzzle: PuzzleState = {
        grid,
        strip: pairs,
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
          ['pair-2', { pairId: 'pair-2', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 2, cols: 2 },
      };

      const validation = validatePuzzle(puzzle);

      expect(validation.isComplete).toBe(false);
      expect(validation.isCorrect).toBe(false);
      // One of the cells using pair-1 for addition should be marked incorrect
      const cell2Validation = validation.cellValidations.find(v => v.cellId === 'cell-2');
      expect(cell2Validation?.isCorrect).toBe(false);
      expect(cell2Validation?.message).toBe('Pair already used for this operation');
    });

    it('should detect when not all pairs are used correctly', () => {
      const pairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
      ];

      const grid: GridCell[] = [
        {
          id: 'cell-1',
          target: 10,
          operation: 'add',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add',
        },
        {
          id: 'cell-2',
          target: 10,
          operation: 'multiply',
          solutionPairId: 'pair-1',
          playerFirst: 3,
          playerSecond: 7,
          playerOperation: 'add', // Should be multiply
        },
      ];

      const puzzle: PuzzleState = {
        grid,
        strip: pairs,
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      const validation = validatePuzzle(puzzle);

      expect(validation.isComplete).toBe(false);
      expect(validation.pairUsageValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('not used correctly');
    });
  });

  describe('isInputValid', () => {
    it('should validate addition correctly', () => {
      expect(isInputValid(3, 7, 10, 'add')).toBe(true);
      expect(isInputValid(7, 3, 10, 'add')).toBe(true);
      expect(isInputValid(3, 7, 11, 'add')).toBe(false);
    });

    it('should validate multiplication correctly', () => {
      expect(isInputValid(3, 7, 21, 'multiply')).toBe(true);
      expect(isInputValid(7, 3, 21, 'multiply')).toBe(true);
      expect(isInputValid(3, 7, 20, 'multiply')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isInputValid(0, 5, 5, 'add')).toBe(true);
      expect(isInputValid(0, 5, 0, 'multiply')).toBe(true);
      expect(isInputValid(1, 1, 2, 'add')).toBe(true);
      expect(isInputValid(1, 1, 1, 'multiply')).toBe(true);
    });
  });

  describe('getValidPairsForCell', () => {
    it('should return pairs that solve the cell', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const availablePairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 }, // 3 + 7 = 10 ✓
        { id: 'pair-2', first: 2, second: 5 }, // 2 + 5 = 7 ✗
        { id: 'pair-3', first: 4, second: 6 }, // 4 + 6 = 10 ✓
      ];

      const validPairs = getValidPairsForCell(cell, availablePairs);

      expect(validPairs).toHaveLength(2);
      expect(validPairs.map(p => p.id)).toContain('pair-1');
      expect(validPairs.map(p => p.id)).toContain('pair-3');
    });

    it('should return pairs for multiplication', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 21,
        operation: 'multiply',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const availablePairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 }, // 3 × 7 = 21 ✓
        { id: 'pair-2', first: 2, second: 5 }, // 2 × 5 = 10 ✗
        { id: 'pair-3', first: 1, second: 21 }, // 1 × 21 = 21 ✓
      ];

      const validPairs = getValidPairsForCell(cell, availablePairs);

      expect(validPairs).toHaveLength(2);
      expect(validPairs.map(p => p.id)).toContain('pair-1');
      expect(validPairs.map(p => p.id)).toContain('pair-3');
    });

    it('should exclude pairs with null values', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const availablePairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
        { id: 'pair-2', first: null, second: 7 }, // Blank pair
      ];

      const validPairs = getValidPairsForCell(cell, availablePairs);

      expect(validPairs).toHaveLength(1);
      expect(validPairs[0].id).toBe('pair-1');
    });

    it('should return empty array when no pairs solve cell', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 100,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const availablePairs: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
        { id: 'pair-2', first: 2, second: 5 },
      ];

      const validPairs = getValidPairsForCell(cell, availablePairs);

      expect(validPairs).toHaveLength(0);
    });
  });

  describe('getHintForCell', () => {
    it('should provide hint for addition', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const hint = getHintForCell(cell, puzzle);

      expect(hint).toBe('Try adding 3 and 7');
    });

    it('should provide hint for multiplication', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 21,
        operation: 'multiply',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const hint = getHintForCell(cell, puzzle);

      expect(hint).toBe('Try multiplying 3 and 7');
    });

    it('should return null when solution pair not found', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-2', // Non-existent pair
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: 3, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const hint = getHintForCell(cell, puzzle);

      expect(hint).toBeNull();
    });

    it('should return null when pair has null values', () => {
      const cell: GridCell = {
        id: 'cell-1',
        target: 10,
        operation: 'add',
        solutionPairId: 'pair-1',
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      };

      const puzzle: PuzzleState = {
        grid: [cell],
        strip: [
          { id: 'pair-1', first: null, second: 7 },
        ],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 1 },
      };

      const hint = getHintForCell(cell, puzzle);

      expect(hint).toBeNull();
    });
  });
});

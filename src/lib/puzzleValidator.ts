import type {
  PuzzleState,
  GridCell,
  NumberPair,
  CellValidation,
  PuzzleValidation,
  Operation,
  PairUsage,
} from '../types/puzzle';

/**
 * Finds a number pair by ID
 */
function findPairById(pairs: NumberPair[], id: string): NumberPair | undefined {
  return pairs.find((pair) => pair.id === id);
}

/**
 * Checks if two pairs match (accounting for null values in blanks)
 */
function pairsMatch(pair1: NumberPair, first: number, second: number): boolean {
  return (
    (pair1.first === first && pair1.second === second) ||
    (pair1.first === second && pair1.second === first)
  );
}

/**
 * Calculates the result of an operation
 */
function calculateResult(
  first: number,
  second: number,
  operation: Operation
): number {
  if (operation === 'add') {
    return first + second;
  } else {
    return first * second;
  }
}

/**
 * Finds a pair in the strip that matches the given numbers (ignoring order)
 */
function findMatchingPair(pairs: NumberPair[], first: number, second: number): NumberPair | undefined {
  return pairs.find((pair) => {
    // Get the actual values (use original if available for blanks)
    const pairFirst = pair.firstOriginal ?? pair.first;
    const pairSecond = pair.secondOriginal ?? pair.second;

    return (
      (pairFirst === first && pairSecond === second) ||
      (pairFirst === second && pairSecond === first)
    );
  });
}

/**
 * Finds an available pair that matches the numbers and hasn't been used for the given operation
 */
function findAvailablePair(
  pairs: NumberPair[],
  first: number,
  second: number,
  operation: Operation,
  usageTracker: Map<string, PairUsage>
): NumberPair | undefined {
  return pairs.find((pair) => {
    // Get the actual values (use original if available for blanks)
    const pairFirst = pair.firstOriginal ?? pair.first;
    const pairSecond = pair.secondOriginal ?? pair.second;

    const numbersMatch =
      (pairFirst === first && pairSecond === second) ||
      (pairFirst === second && pairSecond === first);

    if (!numbersMatch) return false;

    // Check if this pair is still available for this operation
    const usage = usageTracker.get(pair.id);
    if (!usage) return false;

    if (operation === 'add') {
      return !usage.additionUsed;
    } else {
      return !usage.multiplicationUsed;
    }
  });
}

/**
 * Validates a single grid cell
 * In Tetonor, any pair from the strip can be used as long as:
 * 1. The math is correct (numbers + operation = target)
 * 2. The pair exists in the strip
 */
export function validateCell(
  cell: GridCell,
  puzzle: PuzzleState
): CellValidation {
  const solutionPair = findPairById(puzzle.strip, cell.solutionPairId);

  // Check if player has entered values
  if (
    cell.playerFirst === null ||
    cell.playerSecond === null ||
    cell.playerOperation === null
  ) {
    return {
      cellId: cell.id,
      isCorrect: false,
      hasCorrectPair: false,
      hasCorrectOperation: false,
      expectedPair: solutionPair ?? { first: null, second: null, id: '' },
      message: 'Cell incomplete',
    };
  }

  // Validate the player's operation produces the correct result
  const calculatedResult = calculateResult(
    cell.playerFirst,
    cell.playerSecond,
    cell.playerOperation
  );
  const hasCorrectOperation = calculatedResult === cell.target;

  // Check if the pair exists in the strip
  const matchingPair = findMatchingPair(puzzle.strip, cell.playerFirst, cell.playerSecond);
  const hasCorrectPair = matchingPair !== undefined;

  const isCorrect = hasCorrectPair && hasCorrectOperation;

  return {
    cellId: cell.id,
    isCorrect,
    hasCorrectPair,
    hasCorrectOperation,
    expectedPair: solutionPair ?? { first: null, second: null, id: '' },
    message: isCorrect
      ? 'Correct!'
      : !hasCorrectOperation
      ? 'Result does not match target'
      : 'Pair not found in strip',
  };
}

/**
 * Validates the entire puzzle
 */
export function validatePuzzle(puzzle: PuzzleState): PuzzleValidation {
  const cellValidations: CellValidation[] = [];
  const errors: string[] = [];
  const pairUsageCount = new Map<string, PairUsage>();

  // Initialize pair usage tracking
  puzzle.strip.forEach((pair) => {
    pairUsageCount.set(pair.id, {
      pairId: pair.id,
      additionUsed: false,
      multiplicationUsed: false,
    });
  });

  // Validate each cell
  for (const cell of puzzle.grid) {
    const solutionPair = findPairById(puzzle.strip, cell.solutionPairId);

    // Check if player has entered values
    if (
      cell.playerFirst === null ||
      cell.playerSecond === null ||
      cell.playerOperation === null
    ) {
      cellValidations.push({
        cellId: cell.id,
        isCorrect: false,
        hasCorrectPair: false,
        hasCorrectOperation: false,
        expectedPair: solutionPair ?? { first: null, second: null, id: '' },
        message: 'Cell incomplete',
      });
      continue;
    }

    // Validate the player's operation produces the correct result
    const calculatedResult = calculateResult(
      cell.playerFirst,
      cell.playerSecond,
      cell.playerOperation
    );
    const hasCorrectOperation = calculatedResult === cell.target;

    // Find an available pair that matches and hasn't been used for this operation
    const availablePair = findAvailablePair(
      puzzle.strip,
      cell.playerFirst,
      cell.playerSecond,
      cell.playerOperation,
      pairUsageCount
    );

    // Also check if the pair exists at all (even if already used)
    const pairExists = findMatchingPair(puzzle.strip, cell.playerFirst, cell.playerSecond) !== undefined;

    let hasCorrectPair = availablePair !== undefined;
    let message = '';

    if (!hasCorrectOperation) {
      message = 'Result does not match target';
    } else if (!pairExists) {
      message = 'Pair not found in strip';
    } else if (!availablePair) {
      message = 'Pair already used for this operation';
    } else {
      message = 'Correct!';
    }

    const isCorrect = hasCorrectPair && hasCorrectOperation;

    cellValidations.push({
      cellId: cell.id,
      isCorrect,
      hasCorrectPair,
      hasCorrectOperation,
      expectedPair: solutionPair ?? { first: null, second: null, id: '' },
      message,
    });

    // Mark the pair as used if valid
    if (availablePair) {
      const usage = pairUsageCount.get(availablePair.id);
      if (usage) {
        if (cell.playerOperation === 'add') {
          usage.additionUsed = true;
        } else {
          usage.multiplicationUsed = true;
        }
      }
    }
  }

  // Check if all pairs are used exactly twice
  let pairUsageValid = true;
  pairUsageCount.forEach((usage, pairId) => {
    const pair = findPairById(puzzle.strip, pairId);
    if (!usage.additionUsed || !usage.multiplicationUsed) {
      pairUsageValid = false;
      if (pair) {
        const pairFirst = pair.firstOriginal ?? pair.first;
        const pairSecond = pair.secondOriginal ?? pair.second;
        errors.push(
          `Pair (${pairFirst}, ${pairSecond}) not used correctly - must be used once for addition and once for multiplication`
        );
      }
    }
  });

  const isComplete = cellValidations.every(
    (v) => v.hasCorrectPair && v.hasCorrectOperation
  );
  const isCorrect = isComplete && pairUsageValid && errors.length === 0;

  return {
    isComplete,
    isCorrect,
    cellValidations,
    pairUsageValid,
    errors,
  };
}

/**
 * Checks if a specific player input is valid (matches target)
 */
export function isInputValid(
  first: number,
  second: number,
  target: number,
  operation: Operation
): boolean {
  const result = calculateResult(first, second, operation);
  return result === target;
}

/**
 * Gets all valid pairs that could solve a specific cell
 */
export function getValidPairsForCell(
  cell: GridCell,
  availablePairs: NumberPair[]
): NumberPair[] {
  return availablePairs.filter((pair) => {
    if (pair.first === null || pair.second === null) {
      return false;
    }

    const result = calculateResult(pair.first, pair.second, cell.operation);
    return result === cell.target;
  });
}

/**
 * Provides a hint for a specific cell
 */
export function getHintForCell(
  cell: GridCell,
  puzzle: PuzzleState
): string | null {
  const solutionPair = findPairById(puzzle.strip, cell.solutionPairId);

  if (!solutionPair || solutionPair.first === null || solutionPair.second === null) {
    return null;
  }

  const operation = cell.operation === 'add' ? 'adding' : 'multiplying';
  return `Try ${operation} ${solutionPair.first} and ${solutionPair.second}`;
}

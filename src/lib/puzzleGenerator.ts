import type {
  NumberPair,
  GridCell,
  PuzzleState,
  PuzzleConfig,
  Operation,
} from '../types/puzzle';

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generates random number pairs ensuring they're in ascending order
 */
function generateNumberPairs(
  count: number,
  minValue: number,
  maxValue: number
): NumberPair[] {
  const pairs: NumberPair[] = [];
  const usedPairs = new Set<string>();

  while (pairs.length < count) {
    const first = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    const second = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

    // Ensure ascending order
    const [min, max] = first <= second ? [first, second] : [second, first];
    const pairKey = `${min}-${max}`;

    // Avoid duplicates
    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      pairs.push({
        first: min,
        second: max,
        id: generateId(),
      });
    }
  }

  // Sort pairs by first number, then by second number
  return pairs.sort((a, b) => {
    if (a.first !== b.first) {
      return (a.first ?? 0) - (b.first ?? 0);
    }
    return (a.second ?? 0) - (b.second ?? 0);
  });
}

/**
 * Calculates the result of an operation on a pair
 */
function calculateResult(pair: NumberPair, operation: Operation): number {
  const first = pair.first ?? 0;
  const second = pair.second ?? 0;

  if (operation === 'add') {
    return first + second;
  } else {
    return first * second;
  }
}

/**
 * Assigns pairs to grid cells ensuring each pair is used exactly twice
 * (once for addition and once for multiplication)
 */
function assignPairsToGrid(
  pairs: NumberPair[],
  rows: number,
  cols: number
): GridCell[] {
  const totalCells = rows * cols;
  const requiredPairs = totalCells / 2;

  if (pairs.length < requiredPairs) {
    throw new Error(
      `Not enough pairs: need ${requiredPairs}, have ${pairs.length}`
    );
  }

  const grid: GridCell[] = [];
  const operations: Operation[] = ['add', 'multiply'];

  // Use only the required number of pairs
  const selectedPairs = pairs.slice(0, requiredPairs);

  // Create two cells for each pair (one add, one multiply)
  selectedPairs.forEach((pair) => {
    operations.forEach((operation) => {
      const target = calculateResult(pair, operation);
      grid.push({
        target,
        operation,
        solutionPairId: pair.id,
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
        id: generateId(),
      });
    });
  });

  // Shuffle the grid to randomize positions
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }

  return grid;
}

/**
 * Makes some pairs blank based on difficulty
 */
function applyBlankPairs(
  pairs: NumberPair[],
  blankCount: number,
  difficulty: PuzzleConfig['difficulty']
): NumberPair[] {
  if (blankCount === 0) {
    return pairs;
  }

  const blankedPairs = [...pairs];
  const indicesToBlank = new Set<number>();

  // Select random pairs to make blank
  while (indicesToBlank.size < Math.min(blankCount, pairs.length)) {
    const index = Math.floor(Math.random() * pairs.length);
    indicesToBlank.add(index);
  }

  indicesToBlank.forEach((index) => {
    const pair = blankedPairs[index];

    // Difficulty determines what gets blanked
    switch (difficulty) {
      case 'easy':
        // Only blank one number from the pair
        if (Math.random() > 0.5) {
          pair.first = null;
        } else {
          pair.second = null;
        }
        break;

      case 'moderate':
        // Randomly blank one or both numbers
        if (Math.random() > 0.3) {
          pair.first = null;
          pair.second = null;
        } else {
          if (Math.random() > 0.5) {
            pair.first = null;
          } else {
            pair.second = null;
          }
        }
        break;

      case 'difficult':
        // Usually blank both numbers
        pair.first = null;
        pair.second = null;
        break;
    }
  });

  return blankedPairs;
}

/**
 * Main function to generate a complete Tet puzzle
 */
export function generatePuzzle(config: PuzzleConfig): PuzzleState {
  const { rows, cols, minValue, maxValue, blankPairs, difficulty } = config;
  const totalCells = rows * cols;

  // We need exactly half as many pairs as cells (each pair used twice)
  const pairCount = totalCells / 2;

  if (totalCells % 2 !== 0) {
    throw new Error('Grid dimensions must result in an even number of cells');
  }

  // Generate number pairs
  let pairs = generateNumberPairs(pairCount, minValue, maxValue);

  // Assign pairs to grid cells
  const grid = assignPairsToGrid(pairs, rows, cols);

  // Apply blank pairs for difficulty
  pairs = applyBlankPairs(pairs, blankPairs, difficulty);

  // Initialize pair usage tracking
  const pairUsage = new Map(
    pairs.map((pair) => [
      pair.id,
      {
        pairId: pair.id,
        additionUsed: false,
        multiplicationUsed: false,
      },
    ])
  );

  return {
    grid,
    strip: pairs,
    pairUsage,
    dimensions: { rows, cols },
  };
}

/**
 * Creates a default easy puzzle configuration
 */
export function createDefaultConfig(): PuzzleConfig {
  return {
    rows: 3,
    cols: 4,
    minValue: 2,
    maxValue: 9,
    blankPairs: 1,
    difficulty: 'easy',
  };
}

/**
 * Creates preset configurations for different difficulty levels
 */
export const PRESET_CONFIGS: Record<string, PuzzleConfig> = {
  easy: {
    rows: 4,
    cols: 4,
    minValue: 2,
    maxValue: 10,
    blankPairs: 0,
    difficulty: 'easy',
  },
  moderate: {
    rows: 4,
    cols: 4,
    minValue: 2,
    maxValue: 20,
    blankPairs: 0,
    difficulty: 'moderate',
  },
  difficult: {
    rows: 4,
    cols: 4,
    minValue: 2,
    maxValue: 50,
    blankPairs: 0,
    difficulty: 'difficult',
  },
};

/**
 * Verifica si un par produce targets únicos (sin colisiones con targets existentes)
 */
function hasUniqueTargets(
  first: number,
  second: number,
  usedTargets: Set<number>
): boolean {
  const sum = first + second;
  const product = first * second;
  return !usedTargets.has(sum) && !usedTargets.has(product) && sum !== product;
}

/**
 * Cuenta cuántas colisiones produciría un par con los targets existentes
 */
function countTargetCollisions(
  first: number,
  second: number,
  usedTargets: Set<number>
): number {
  const sum = first + second;
  const product = first * second;
  let collisions = 0;
  if (usedTargets.has(sum)) collisions++;
  if (usedTargets.has(product)) collisions++;
  if (sum === product) collisions++;
  return collisions;
}

/**
 * ESTRATEGIA PRINCIPIANTE (Easy)
 * - Números del 1-50
 * - Números en el strip PUEDEN repetirse
 * - Máximo 1-2 targets repetidos si es necesario
 * - 5-6 espacios en blanco
 */
export function generateBeginnerPuzzle(): PuzzleState {
  const pairCount = 8;
  const maxAttempts = 100;
  const maxAllowedCollisions = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pairs: NumberPair[] = [];
    const usedPairs = new Set<string>();
    const usedTargets = new Set<number>();
    let totalCollisions = 0;

    let iterations = 0;
    while (pairs.length < pairCount && iterations < 500) {
      iterations++;

      // Números del 1-50
      const first = Math.floor(Math.random() * 50) + 1;
      const second = Math.floor(Math.random() * 50) + 1;

      const [min, max] = first <= second ? [first, second] : [second, first];
      const pairKey = `${min}-${max}`;
      const collisions = countTargetCollisions(min, max, usedTargets);

      // Evitar pares idénticos, permitir hasta maxAllowedCollisions en targets
      if (!usedPairs.has(pairKey) && totalCollisions + collisions <= maxAllowedCollisions) {
        usedPairs.add(pairKey);
        usedTargets.add(min + max);
        usedTargets.add(min * max);
        totalCollisions += collisions;
        pairs.push({
          id: `pair-${pairs.length + 1}`,
          first: min,
          second: max,
        });
      }
    }

    if (pairs.length === pairCount) {
      const blankCount = 5 + Math.floor(Math.random() * 2); // 5-6 blanks
      return buildPuzzleFromPairs(pairs, blankCount);
    }
  }

  // Fallback: generar sin restricción de targets únicos
  return generateBeginnerPuzzleFallback();
}

function generateBeginnerPuzzleFallback(): PuzzleState {
  const pairCount = 8;
  const pairs: NumberPair[] = [];
  const usedPairs = new Set<string>();

  while (pairs.length < pairCount) {
    const first = Math.floor(Math.random() * 50) + 1;
    const second = Math.floor(Math.random() * 50) + 1;
    const [min, max] = first <= second ? [first, second] : [second, first];
    const pairKey = `${min}-${max}`;

    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      pairs.push({
        id: `pair-${pairs.length + 1}`,
        first: min,
        second: max,
      });
    }
  }

  const blankCount = 5 + Math.floor(Math.random() * 2); // 5-6 blanks
  return buildPuzzleFromPairs(pairs, blankCount);
}

/**
 * ESTRATEGIA INTERMEDIO (Moderate)
 * - Números del 1-50
 * - Máximo 1-2 targets repetidos si es necesario
 * - 7-8 espacios en blanco en la tira
 */
export function generateIntermediatePuzzle(): PuzzleState {
  const pairCount = 8;
  const maxAttempts = 100;
  const maxAllowedCollisions = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pairs: NumberPair[] = [];
    const usedPairs = new Set<string>();
    const usedTargets = new Set<number>();
    let totalCollisions = 0;

    let iterations = 0;
    while (pairs.length < pairCount && iterations < 500) {
      iterations++;

      // Números del 1-50
      const first = Math.floor(Math.random() * 50) + 1;
      const second = Math.floor(Math.random() * 50) + 1;

      const [min, max] = first <= second ? [first, second] : [second, first];
      const pairKey = `${min}-${max}`;
      const collisions = countTargetCollisions(min, max, usedTargets);

      // Evitar pares duplicados, permitir hasta maxAllowedCollisions
      if (!usedPairs.has(pairKey) && totalCollisions + collisions <= maxAllowedCollisions) {
        usedPairs.add(pairKey);
        usedTargets.add(min + max);
        usedTargets.add(min * max);
        totalCollisions += collisions;
        pairs.push({
          id: `pair-${pairs.length + 1}`,
          first: min,
          second: max,
        });
      }
    }

    if (pairs.length === pairCount) {
      const blankCount = 7 + Math.floor(Math.random() * 2); // 7-8 blanks
      return buildPuzzleFromPairs(pairs, blankCount);
    }
  }

  return generateIntermediatePuzzleFallback();
}

function generateIntermediatePuzzleFallback(): PuzzleState {
  const pairCount = 8;
  const pairs: NumberPair[] = [];
  const usedPairs = new Set<string>();

  while (pairs.length < pairCount) {
    const first = Math.floor(Math.random() * 50) + 1;
    const second = Math.floor(Math.random() * 50) + 1;

    const [min, max] = first <= second ? [first, second] : [second, first];
    const pairKey = `${min}-${max}`;

    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      pairs.push({
        id: `pair-${pairs.length + 1}`,
        first: min,
        second: max,
      });
    }
  }

  const blankCount = 7 + Math.floor(Math.random() * 2); // 7-8 blanks
  return buildPuzzleFromPairs(pairs, blankCount);
}

/**
 * ESTRATEGIA AVANZADO (Difficult)
 * - Números del 1-50
 * - Máximo 1-2 targets repetidos si es necesario
 * - 10-11 espacios en blanco (solo 5-6 números visibles)
 */
export function generateAdvancedPuzzle(): PuzzleState {
  const pairCount = 8;
  const maxAttempts = 100;
  const maxAllowedCollisions = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pairs: NumberPair[] = [];
    const usedPairs = new Set<string>();
    const usedTargets = new Set<number>();
    let totalCollisions = 0;

    let iterations = 0;
    while (pairs.length < pairCount && iterations < 500) {
      iterations++;

      // Números del 1-50
      const first = Math.floor(Math.random() * 50) + 1;
      const second = Math.floor(Math.random() * 50) + 1;

      const [min, max] = first <= second ? [first, second] : [second, first];
      const pairKey = `${min}-${max}`;
      const collisions = countTargetCollisions(min, max, usedTargets);

      // Evitar pares duplicados, permitir hasta maxAllowedCollisions
      if (!usedPairs.has(pairKey) && totalCollisions + collisions <= maxAllowedCollisions) {
        usedPairs.add(pairKey);
        usedTargets.add(min + max);
        usedTargets.add(min * max);
        totalCollisions += collisions;
        pairs.push({
          id: `pair-${pairs.length + 1}`,
          first: min,
          second: max,
        });
      }
    }

    if (pairs.length === pairCount) {
      const blankCount = 10 + Math.floor(Math.random() * 2); // 10-11 blanks (solo 5-6 visibles)
      return buildPuzzleFromPairs(pairs, blankCount);
    }
  }

  return generateAdvancedPuzzleFallback();
}

function generateAdvancedPuzzleFallback(): PuzzleState {
  const pairCount = 8;
  const pairs: NumberPair[] = [];
  const usedPairs = new Set<string>();

  while (pairs.length < pairCount) {
    const first = Math.floor(Math.random() * 50) + 1;
    const second = Math.floor(Math.random() * 50) + 1;

    const [min, max] = first <= second ? [first, second] : [second, first];
    const pairKey = `${min}-${max}`;

    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      pairs.push({
        id: `pair-${pairs.length + 1}`,
        first: min,
        second: max,
      });
    }
  }

  const blankCount = 10 + Math.floor(Math.random() * 2); // 10-11 blanks (solo 5-6 visibles)
  return buildPuzzleFromPairs(pairs, blankCount);
}

/**
 * Construye un PuzzleState a partir de un array de pares
 * @param pairs - Los pares de números
 * @param blankCount - Cantidad de números a ocultar en la tira (0 = ninguno)
 */
function buildPuzzleFromPairs(pairs: NumberPair[], blankCount: number = 0): PuzzleState {
  const grid: GridCell[] = [];

  // Crear dos celdas por cada par (suma y producto)
  pairs.forEach((pair) => {
    const sum = (pair.first ?? 0) + (pair.second ?? 0);
    const product = (pair.first ?? 0) * (pair.second ?? 0);

    grid.push({
      id: generateId(),
      target: sum,
      operation: 'add',
      solutionPairId: pair.id,
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    });

    grid.push({
      id: generateId(),
      target: product,
      operation: 'multiply',
      solutionPairId: pair.id,
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    });
  });

  // Mezclar la grilla
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }

  // Aplicar espacios en blanco a la tira
  const stripWithBlanks = applyBlanksToStrip(pairs, blankCount);

  const pairUsage = new Map(
    stripWithBlanks.map((pair) => [
      pair.id,
      {
        pairId: pair.id,
        additionUsed: false,
        multiplicationUsed: false,
      },
    ])
  );

  return {
    grid,
    strip: stripWithBlanks,
    pairUsage,
    dimensions: { rows: 4, cols: 4 },
  };
}

/**
 * Aplica espacios en blanco aleatorios a los números de la tira
 * Guarda los valores originales para poder ordenar correctamente
 */
function applyBlanksToStrip(pairs: NumberPair[], blankCount: number): NumberPair[] {
  // Crear una copia profunda de los pares con valores originales
  const pairsWithBlanks = pairs.map(pair => ({
    ...pair,
    first: pair.first,
    second: pair.second,
    firstOriginal: pair.first ?? undefined,
    secondOriginal: pair.second ?? undefined,
  }));

  if (blankCount === 0) {
    return pairsWithBlanks;
  }

  // Crear lista de todas las posiciones posibles (pairIndex, 'first' | 'second')
  const positions: Array<{ pairIndex: number; field: 'first' | 'second' }> = [];
  pairsWithBlanks.forEach((_, index) => {
    positions.push({ pairIndex: index, field: 'first' });
    positions.push({ pairIndex: index, field: 'second' });
  });

  // Mezclar posiciones
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Aplicar blanks a las primeras N posiciones
  const blanksToApply = Math.min(blankCount, positions.length);
  for (let i = 0; i < blanksToApply; i++) {
    const pos = positions[i];
    pairsWithBlanks[pos.pairIndex][pos.field] = null;
  }

  return pairsWithBlanks;
}

/**
 * Creates the fixed example puzzle for development
 */
export function createFixedPuzzle(): PuzzleState {
  // Fixed pairs for the example puzzle
  const pairs: NumberPair[] = [
    { id: 'pair-1', first: 18, second: 19 },  // 37=+, 342=×
    { id: 'pair-2', first: 20, second: 21 },  // 41=+, 420=×
    { id: 'pair-3', first: 6, second: 44 },   // 50=+, 264=×
    { id: 'pair-4', first: 10, second: 50 },  // 60=+, 500=×
    { id: 'pair-5', first: 8, second: 32 },   // 40=+, 256=×
    { id: 'pair-6', first: 8, second: 24 },   // 32=+, 192=×
    { id: 'pair-7', first: 14, second: 24 },  // 38=+, 336=×
    { id: 'pair-8', first: 2, second: 26 },   // 28=+, 52=×
  ];

  // Fixed grid matching the example image
  // Row 1: 38, 500, 37, 28
  // Row 2: 420, 50, 256, 40
  // Row 3: 41, 264, 32, 336
  // Row 4: 192, 52, 342, 60
  const grid: GridCell[] = [
    // Row 1
    { id: 'cell-0', target: 38, operation: 'add', solutionPairId: 'pair-7', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-1', target: 500, operation: 'multiply', solutionPairId: 'pair-4', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-2', target: 37, operation: 'add', solutionPairId: 'pair-1', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-3', target: 28, operation: 'add', solutionPairId: 'pair-8', playerFirst: null, playerSecond: null, playerOperation: null },
    // Row 2
    { id: 'cell-4', target: 420, operation: 'multiply', solutionPairId: 'pair-2', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-5', target: 50, operation: 'add', solutionPairId: 'pair-3', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-6', target: 256, operation: 'multiply', solutionPairId: 'pair-5', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-7', target: 40, operation: 'add', solutionPairId: 'pair-5', playerFirst: null, playerSecond: null, playerOperation: null },
    // Row 3
    { id: 'cell-8', target: 41, operation: 'add', solutionPairId: 'pair-2', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-9', target: 264, operation: 'multiply', solutionPairId: 'pair-3', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-10', target: 32, operation: 'add', solutionPairId: 'pair-6', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-11', target: 336, operation: 'multiply', solutionPairId: 'pair-7', playerFirst: null, playerSecond: null, playerOperation: null },
    // Row 4
    { id: 'cell-12', target: 192, operation: 'multiply', solutionPairId: 'pair-6', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-13', target: 52, operation: 'multiply', solutionPairId: 'pair-8', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-14', target: 342, operation: 'multiply', solutionPairId: 'pair-1', playerFirst: null, playerSecond: null, playerOperation: null },
    { id: 'cell-15', target: 60, operation: 'add', solutionPairId: 'pair-4', playerFirst: null, playerSecond: null, playerOperation: null },
  ];

  const pairUsage = new Map(
    pairs.map((pair) => [
      pair.id,
      {
        pairId: pair.id,
        additionUsed: false,
        multiplicationUsed: false,
      },
    ])
  );

  return {
    grid,
    strip: pairs,
    pairUsage,
    dimensions: { rows: 4, cols: 4 },
  };
}

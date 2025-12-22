# Example Tetonor Puzzle Walkthrough

This document shows a concrete example of how a Tetonor puzzle is generated and solved.

## Example Puzzle Generation

### Step 1: Generate Number Pairs

Configuration: Easy (3x4 grid, values 2-9)

```typescript
const pairs = generateNumberPairs(6, 2, 9);
// Result (example):
[
  { first: 2, second: 5, id: 'pair-1' },
  { first: 3, second: 6, id: 'pair-2' },
  { first: 4, second: 7, id: 'pair-3' },
  { first: 2, second: 8, id: 'pair-4' },
  { first: 5, second: 7, id: 'pair-5' },
  { first: 3, second: 9, id: 'pair-6' }
]
```

### Step 2: Calculate Targets for Each Pair

Each pair generates two targets:

| Pair | Addition | Multiplication |
|------|----------|----------------|
| (2, 5) | 2 + 5 = 7 | 2 × 5 = 10 |
| (3, 6) | 3 + 6 = 9 | 3 × 6 = 18 |
| (4, 7) | 4 + 7 = 11 | 4 × 7 = 28 |
| (2, 8) | 2 + 8 = 10 | 2 × 8 = 16 |
| (5, 7) | 5 + 7 = 12 | 5 × 7 = 35 |
| (3, 9) | 3 + 9 = 12 | 3 × 9 = 27 |

Total: 12 cells (6 pairs × 2 operations)

### Step 3: Create Grid (Before Shuffling)

```typescript
const grid = [
  { target: 7,  operation: 'add',      solutionPairId: 'pair-1' },
  { target: 10, operation: 'multiply', solutionPairId: 'pair-1' },
  { target: 9,  operation: 'add',      solutionPairId: 'pair-2' },
  { target: 18, operation: 'multiply', solutionPairId: 'pair-2' },
  { target: 11, operation: 'add',      solutionPairId: 'pair-3' },
  { target: 28, operation: 'multiply', solutionPairId: 'pair-3' },
  { target: 10, operation: 'add',      solutionPairId: 'pair-4' },
  { target: 16, operation: 'multiply', solutionPairId: 'pair-4' },
  { target: 12, operation: 'add',      solutionPairId: 'pair-5' },
  { target: 35, operation: 'multiply', solutionPairId: 'pair-5' },
  { target: 12, operation: 'add',      solutionPairId: 'pair-6' },
  { target: 27, operation: 'multiply', solutionPairId: 'pair-6' },
];
```

### Step 4: Shuffle Grid (Random Example)

After shuffling, the grid might look like:

```
Row 1:  28(×)  |  7(+)   |  16(×)  |  12(+)
Row 2:  10(+)  |  35(×)  |  9(+)   |  11(+)
Row 3:  18(×)  |  12(+)  |  10(×)  |  27(×)
```

### Step 5: Apply Blanks (Easy = 1 blank pair)

Let's blank one number from pair (3, 6):

```typescript
const strip = [
  { first: 2, second: 5, id: 'pair-1' },
  { first: 3, second: null, id: 'pair-2' },  // One blank!
  { first: 4, second: 7, id: 'pair-3' },
  { first: 2, second: 8, id: 'pair-4' },
  { first: 5, second: 7, id: 'pair-5' },
  { first: 3, second: 9, id: 'pair-6' }
]
```

## Visual Representation

### The Puzzle As Presented to Player

```
┌─────────────────────────────────────────────┐
│          TETONOR PUZZLE                     │
└─────────────────────────────────────────────┘

Grid (what player sees):
╔═══════╦═══════╦═══════╦═══════╗
║  28   ║   7   ║  16   ║  12   ║
║   ×   ║   +   ║   ×   ║   +   ║
║ [?][?]║ [?][?]║ [?][?]║ [?][?]║
╠═══════╬═══════╬═══════╬═══════╣
║  10   ║  35   ║   9   ║  11   ║
║   +   ║   ×   ║   +   ║   +   ║
║ [?][?]║ [?][?]║ [?][?]║ [?][?]║
╠═══════╬═══════╬═══════╬═══════╣
║  18   ║  12   ║  10   ║  27   ║
║   ×   ║   +   ║   ×   ║   ×   ║
║ [?][?]║ [?][?]║ [?][?]║ [?][?]║
╚═══════╩═══════╩═══════╩═══════╝

Available Pairs:
┌────────────────────────────────────────────┐
│  (2,5)  (3,?)  (4,7)  (2,8)  (5,7)  (3,9) │
└────────────────────────────────────────────┘

Rule: Each pair must be used exactly twice:
      once for + and once for ×
```

## Solution Process

### Player's Deduction Steps

1. **Find Easy Wins**: Look for unique targets
   - 28 can only be 4×7 (largest multiplication)
   - 27 can only be 3×9
   - 35 can only be 5×7

2. **Mark Used Pairs**:
   - (4,7): Used for 28(×), still need for addition
   - (3,9): Used for 27(×), still need for addition
   - (5,7): Used for 35(×), still need for addition

3. **Find Corresponding Additions**:
   - 4+7 = 11 → Fill in 11(+) with (4,7)
   - 3+9 = 12 → Fill in one 12(+) with (3,9)
   - 5+7 = 12 → Fill in other 12(+) with (5,7)

4. **Deduce the Blank**:
   - We have 18(×) which needs the blanked pair (3,?)
   - 3 × ? = 18 → ? = 6
   - So the pair is (3,6)

5. **Complete Remaining Cells**:
   - 3+6 = 9 → Fill in 9(+) with (3,6)
   - 18(×) with (3,6) ✓
   - Still have (2,5) and (2,8)
   - 2+5 = 7 → Fill in 7(+)
   - 2×5 = 10 → Fill in one 10(×)
   - 2+8 = 10 → Fill in other 10(+)
   - 2×8 = 16 → Fill in 16(×)

### Completed Solution

```
╔═══════╦═══════╦═══════╦═══════╗
║  28   ║   7   ║  16   ║  12   ║
║   ×   ║   +   ║   ×   ║   +   ║
║ [4][7]║ [2][5]║ [2][8]║ [5][7]║
╠═══════╬═══════╬═══════╬═══════╣
║  10   ║  35   ║   9   ║  11   ║
║   +   ║   ×   ║   +   ║   +   ║
║ [2][8]║ [5][7]║ [3][6]║ [4][7]║
╠═══════╬═══════╬═══════╬═══════╣
║  18   ║  12   ║  10   ║  27   ║
║   ×   ║   +   ║   ×   ║   ×   ║
║ [3][6]║ [3][9]║ [2][5]║ [3][9]║
╚═══════╩═══════╩═══════╩═══════╝
```

### Pair Usage Verification

| Pair | Addition Used | Multiplication Used | Valid? |
|------|---------------|---------------------|--------|
| (2,5) | 7(+) ✓ | 10(×) ✓ | ✓ |
| (3,6) | 9(+) ✓ | 18(×) ✓ | ✓ |
| (4,7) | 11(+) ✓ | 28(×) ✓ | ✓ |
| (2,8) | 10(+) ✓ | 16(×) ✓ | ✓ |
| (5,7) | 12(+) ✓ | 35(×) ✓ | ✓ |
| (3,9) | 12(+) ✓ | 27(×) ✓ | ✓ |

**Result**: Puzzle solved correctly!

## Data Structure Representation

### PuzzleState Object

```typescript
const puzzleState: PuzzleState = {
  dimensions: { rows: 3, cols: 4 },

  strip: [
    { first: 2, second: 5, id: 'pair-1' },
    { first: 3, second: 6, id: 'pair-2' },  // Was null, player deduced 6
    { first: 4, second: 7, id: 'pair-3' },
    { first: 2, second: 8, id: 'pair-4' },
    { first: 5, second: 7, id: 'pair-5' },
    { first: 3, second: 9, id: 'pair-6' }
  ],

  grid: [
    {
      target: 28,
      operation: 'multiply',
      solutionPairId: 'pair-3',
      playerFirst: 4,
      playerSecond: 7,
      id: 'cell-1'
    },
    {
      target: 7,
      operation: 'add',
      solutionPairId: 'pair-1',
      playerFirst: 2,
      playerSecond: 5,
      id: 'cell-2'
    },
    // ... 10 more cells
  ],

  pairUsage: Map {
    'pair-1' => { pairId: 'pair-1', additionUsed: true, multiplicationUsed: true },
    'pair-2' => { pairId: 'pair-2', additionUsed: true, multiplicationUsed: true },
    // ... rest of pairs
  }
};
```

## Validation Flow

### When Player Clicks "Check Solution"

```typescript
// 1. Validate each cell
const cellValidations = grid.map(cell => ({
  cellId: cell.id,
  isCorrect:
    (cell.playerFirst === solution.first && cell.playerSecond === solution.second) &&
    (calculateResult(cell.playerFirst, cell.playerSecond, cell.operation) === cell.target),
  hasCorrectPair: true,
  hasCorrectOperation: true
}));

// 2. Check pair usage
const pairUsageValid =
  allPairs.every(pair =>
    usedForAddition(pair) && usedForMultiplication(pair)
  );

// 3. Return result
const validation: PuzzleValidation = {
  isComplete: true,
  isCorrect: true,
  cellValidations,
  pairUsageValid: true,
  errors: []
};
```

## Component Rendering

### React Component Tree

```
<TetonorPuzzle initialPuzzle={puzzleState}>
  │
  ├─ <PuzzleGrid>
  │   ├─ <GridCellComponent cell={grid[0]} />  // 28(×)
  │   ├─ <GridCellComponent cell={grid[1]} />  // 7(+)
  │   ├─ <GridCellComponent cell={grid[2]} />  // 16(×)
  │   └─ ... (9 more cells)
  │
  ├─ <PuzzleStrip>
  │   ├─ <div>(2, 5)</div>
  │   ├─ <div>(3, ?)</div>  // Shows ? for null
  │   └─ ... (4 more pairs)
  │
  └─ <div className="puzzle-controls">
      ├─ <button>Check Solution</button>
      └─ <button>Reset</button>
```

## Type Flow Example

### Adding User Input

```typescript
// User types "4" in first input of cell-1
↓
handleFirstInput(e: Event)
  const value = parseInt(e.target.value, 10)  // 4
↓
onInput(cell.id, 4, cell.playerSecond)
↓
handleCellInput('cell-1', 4, null)
↓
setPuzzle(prev => ({
  ...prev,
  grid: prev.grid.map(cell =>
    cell.id === 'cell-1'
      ? { ...cell, playerFirst: 4 }  // Update this cell
      : cell                          // Keep others unchanged
  )
}))
↓
Component re-renders with new state
↓
Input shows "4"
```

## Summary

This example demonstrates:
1. How puzzles are generated from pairs
2. How the puzzle appears to the player
3. The logical deduction process
4. How validation works
5. The underlying data structures
6. How TypeScript types ensure correctness

The complete flow from generation → display → solving → validation is type-safe and follows Tetonor puzzle rules exactly.

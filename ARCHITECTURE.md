# Tet Puzzle - Technical Architecture

## Overview

This document provides a detailed technical breakdown of the Tet puzzle game implementation, focusing on architecture decisions, type safety patterns, and implementation strategies.

## Technology Stack

- **Astro 5.x**: Static site generation with partial hydration
- **Preact**: Lightweight React alternative for interactive components
- **TypeScript**: Strict mode for maximum type safety
- **CSS**: Vanilla CSS with CSS Grid and Flexbox

## Project Structure

```
src/
├── components/              # Interactive UI components (Preact)
│   ├── TetPuzzle.tsx        # Root component, state management
│   ├── PuzzleGrid.tsx       # Grid layout and cell orchestration
│   ├── GridCellComponent.tsx # Individual cell with inputs
│   ├── PuzzleStrip.tsx      # Number pair display
│   └── *.css                # Component-specific styles
├── lib/                     # Pure TypeScript business logic
│   ├── puzzleGenerator.ts   # Puzzle generation algorithm
│   └── puzzleValidator.ts   # Validation and checking logic
├── types/                   # TypeScript type definitions
│   └── puzzle.ts            # All puzzle-related types
└── pages/                   # Astro pages (SSG)
    └── index.astro          # Main entry point
```

## Type System Architecture

### Core Types (`src/types/puzzle.ts`)

#### Operation Type
```typescript
type Operation = 'add' | 'multiply';
```
Simple union type for operation discrimination. This allows exhaustive type checking in switch statements.

#### NumberPair Interface
```typescript
interface NumberPair {
  first: number | null;   // null represents blanks to deduce
  second: number | null;
  id: string;             // Unique identifier for tracking
}
```
**Design decisions:**
- Uses `null` over `undefined` for explicit "blank" state
- Always maintains ascending order (first <= second)
- ID enables React key props and pair tracking

#### GridCell Interface
```typescript
interface GridCell {
  target: number;            // The answer to achieve
  operation: Operation;      // How to achieve it
  solutionPairId: string;    // Links to correct pair
  playerFirst: number | null;
  playerSecond: number | null;
  id: string;
}
```
**Design decisions:**
- Separates solution data from player input
- Uses reference (solutionPairId) rather than embedding pair
- Nullable player inputs represent empty state

#### PuzzleState Interface
```typescript
interface PuzzleState {
  grid: GridCell[];
  strip: NumberPair[];
  pairUsage: Map<string, PairUsage>;
  dimensions: { rows: number; cols: number };
}
```
**Design decisions:**
- Uses `Map` for O(1) pair lookup and usage tracking
- Grid is flat array (simplifies operations, CSS Grid handles layout)
- Dimensions stored separately for layout flexibility

### Type Safety Patterns

1. **No Any Types**: Strict TypeScript mode with zero `any` usage
2. **Explicit Nullability**: `null` used intentionally, never implicit
3. **Branded Types**: IDs are strings but semantically distinct
4. **Union Types**: Operation type enables exhaustive checking
5. **Read-only where appropriate**: Validation results are immutable

## Algorithm Design

### Puzzle Generation (`puzzleGenerator.ts`)

#### Step-by-step Process

```
1. Generate Number Pairs
   ├─> Create random pairs within value range
   ├─> Ensure uniqueness
   └─> Sort in ascending order

2. Assign Pairs to Grid
   ├─> Each pair generates 2 cells (add + multiply)
   ├─> Calculate target for each operation
   └─> Shuffle to randomize positions

3. Apply Blanks
   ├─> Select pairs based on difficulty
   ├─> Blank one or both numbers
   └─> Maintain solvability

4. Return Complete PuzzleState
```

#### Key Functions

**generateNumberPairs()**
```typescript
function generateNumberPairs(
  count: number,
  minValue: number,
  maxValue: number
): NumberPair[]
```
- Uses Set to track used pairs and prevent duplicates
- Normalizes order (smaller number first)
- Returns sorted array for strip display

**assignPairsToGrid()**
```typescript
function assignPairsToGrid(
  pairs: NumberPair[],
  rows: number,
  cols: number
): GridCell[]
```
- Creates exactly 2 cells per pair
- Fisher-Yates shuffle for randomization
- Validates grid size matches pair count

**applyBlankPairs()**
```typescript
function applyBlankPairs(
  pairs: NumberPair[],
  blankCount: number,
  difficulty: 'easy' | 'medium' | 'hard'
): NumberPair[]
```
- Difficulty-based blanking strategy:
  - **Easy**: Blank one number per pair
  - **Medium**: Randomly blank one or both
  - **Hard**: Blank both numbers
- Non-destructive (clones array)

### Validation Logic (`puzzleValidator.ts`)

#### Validation Levels

1. **Cell-level Validation**
   - Checks if input pair matches target number
   - Verifies correct operation used
   - Returns detailed feedback

2. **Puzzle-level Validation**
   - Validates all cells
   - Ensures each pair used exactly twice
   - Tracks operation usage (one add, one multiply per pair)

#### Key Functions

**validateCell()**
```typescript
function validateCell(
  cell: GridCell,
  puzzle: PuzzleState
): CellValidation
```
- Checks completeness (both inputs filled)
- Validates operation result
- Compares against solution pair
- Returns granular feedback

**validatePuzzle()**
```typescript
function validatePuzzle(
  puzzle: PuzzleState
): PuzzleValidation
```
- Validates all cells
- Tracks pair usage in Map
- Detects duplicate usage
- Checks for missing pairs
- Aggregates errors

**pairsMatch()**
```typescript
function pairsMatch(
  pair: NumberPair,
  first: number,
  second: number
): boolean
```
- Order-agnostic comparison
- Handles null values in blanks
- Used for player input validation

## Component Architecture

### State Management Strategy

**Unidirectional Data Flow:**
```
User Input
    ↓
Event Handler (TetPuzzle)
    ↓
State Update (setPuzzle)
    ↓
Props Cascade
    ↓
Component Re-render
```

### Component Hierarchy

```
TetPuzzle (stateful container)
    ├─> PuzzleGrid (layout coordinator)
    │    └─> GridCellComponent[] (individual cells)
    └─> PuzzleStrip (pair display)
```

### TetPuzzle Component

**Responsibilities:**
- Owns puzzle state
- Handles user actions (check, reset)
- Manages validation state
- Coordinates child components

**State:**
```typescript
const [puzzle, setPuzzle] = useState<PuzzleState>(initialPuzzle);
const [selectedCell, setSelectedCell] = useState<string | null>(null);
const [showValidation, setShowValidation] = useState(false);
const [isComplete, setIsComplete] = useState(false);
```

**Key Design Decisions:**
- State is immutable (uses spreading for updates)
- Validation is lazy (only when requested)
- Initial puzzle generated server-side (SSG)

### PuzzleGrid Component

**Responsibilities:**
- Layouts cells in CSS Grid
- Passes validation to cells
- Handles cell selection state

**Props Interface:**
```typescript
interface PuzzleGridProps {
  grid: GridCell[];
  dimensions: { rows: number; cols: number };
  onCellInput: (cellId: string, first: number | null, second: number | null) => void;
  onCellSelect: (cellId: string) => void;
  selectedCellId: string | null;
  showValidation: boolean;
  puzzle: PuzzleState;
}
```

### GridCellComponent

**Responsibilities:**
- Renders single cell UI
- Handles number inputs
- Shows validation feedback
- Manages focus state

**Key Features:**
- Controlled inputs (value from props)
- Input validation (prevents negative numbers)
- Visual states: default, selected, correct, incorrect
- Accessibility (ARIA labels)

### PuzzleStrip Component

**Responsibilities:**
- Displays number pairs
- Shows blanks as "?"
- Provides usage hint

**Props:**
```typescript
interface PuzzleStripProps {
  strip: NumberPair[];
}
```

## CSS Architecture

### Layout Strategy

1. **CSS Grid for Main Layout**
   - Dynamic columns based on puzzle dimensions
   - Responsive gap sizing
   - Auto-fit cells

2. **Flexbox for Internal Components**
   - Cell internal layout
   - Button groups
   - Pair display

### Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Tablet: 481px - 768px
- Mobile: <= 480px

**Adaptive Elements:**
- Grid gaps reduce on smaller screens
- Font sizes scale down
- Input sizes adjust
- Button layouts stack on mobile

### CSS Variables Strategy

While not currently implemented, consider adding:
```css
:root {
  --color-primary: #4caf50;
  --color-error: #f44336;
  --color-border: #cfd8dc;
  --spacing-unit: 1rem;
  --border-radius: 8px;
}
```

## Performance Considerations

### Astro Islands Architecture

- **Server-side Generation**: Puzzle generated at build time
- **Partial Hydration**: Only TetPuzzle component is interactive
- **Client Directive**: `client:load` for immediate interactivity
- **Minimal JS**: Only Preact and component code shipped

### Optimization Strategies

1. **Component Memoization** (future):
   ```typescript
   const MemoizedGridCell = memo(GridCellComponent);
   ```

2. **Lazy Validation**:
   - Validation only runs on user request
   - Not on every state update

3. **Flat Grid Array**:
   - Single array instead of nested
   - Easier to map/filter
   - Better for React reconciliation

## Data Flow Examples

### User Input Flow

```
1. User types "4" in first input
   ↓
2. GridCellComponent.handleFirstInput fires
   ↓
3. Calls onInput(cellId, 4, playerSecond)
   ↓
4. TetPuzzle.handleCellInput updates state
   ↓
5. setPuzzle creates new state object
   ↓
6. React re-renders affected components
   ↓
7. Input shows "4", validation cleared
```

### Validation Flow

```
1. User clicks "Check Solution"
   ↓
2. handleCheckSolution() called
   ↓
3. setShowValidation(true)
   ↓
4. validatePuzzle(puzzle) runs
   ↓
5. Each cell validated via validateCell()
   ↓
6. Pair usage tracked in Map
   ↓
7. Results returned as PuzzleValidation
   ↓
8. setIsComplete(validation.isCorrect)
   ↓
9. Components re-render with validation
   ↓
10. Visual feedback shown (green/red borders)
```

## Testing Recommendations

### Unit Tests

```typescript
// puzzleGenerator.test.ts
describe('generateNumberPairs', () => {
  test('generates correct number of pairs', () => {
    const pairs = generateNumberPairs(6, 2, 9);
    expect(pairs).toHaveLength(6);
  });

  test('maintains ascending order', () => {
    const pairs = generateNumberPairs(10, 1, 20);
    pairs.forEach(pair => {
      expect(pair.first).toBeLessThanOrEqual(pair.second);
    });
  });

  test('prevents duplicates', () => {
    const pairs = generateNumberPairs(10, 1, 5);
    const pairStrings = pairs.map(p => `${p.first}-${p.second}`);
    const unique = new Set(pairStrings);
    expect(unique.size).toBe(pairs.length);
  });
});
```

### Component Tests

```typescript
// GridCellComponent.test.tsx
describe('GridCellComponent', () => {
  test('renders target number', () => {
    const cell = createMockCell({ target: 10 });
    render(<GridCellComponent cell={cell} ... />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('calls onInput when user types', async () => {
    const onInput = vi.fn();
    render(<GridCellComponent onInput={onInput} ... />);
    const input = screen.getAllByRole('spinbutton')[0];
    await userEvent.type(input, '5');
    expect(onInput).toHaveBeenCalledWith(cellId, 5, null);
  });
});
```

## Future Enhancements

### 1. Difficulty Selector UI
```typescript
interface DifficultyConfig {
  label: string;
  config: PuzzleConfig;
  description: string;
}

const difficulties: DifficultyConfig[] = [
  { label: 'Easy', config: PRESET_CONFIGS.easy, description: '3×4 grid' },
  { label: 'Medium', config: PRESET_CONFIGS.medium, description: '4×4 grid' },
  { label: 'Hard', config: PRESET_CONFIGS.hard, description: '4×6 grid' },
];
```

### 2. Hint System
```typescript
function provideHint(cellId: string, puzzle: PuzzleState): string {
  const cell = puzzle.grid.find(c => c.id === cellId);
  return getHintForCell(cell, puzzle);
}
```

### 3. Persistence Layer
```typescript
interface SavedGame {
  puzzle: SerializedPuzzle;
  progress: PlayerProgress;
  timestamp: number;
}

function saveGame(state: PuzzleState): void {
  const serialized: SavedGame = {
    puzzle: serializePuzzle(state),
    progress: extractProgress(state),
    timestamp: Date.now(),
  };
  localStorage.setItem('tet-puzzle-save', JSON.stringify(serialized));
}
```

### 4. Statistics Tracking
```typescript
interface Statistics {
  gamesPlayed: number;
  gamesCompleted: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
}
```

## Deployment

### Build Output
```
dist/
├── index.html              # Main page
├── _astro/
│   ├── *.js               # Bundled Preact components
│   ├── *.css              # Bundled styles
│   └── client.*.js        # Preact runtime
└── favicon.svg
```

### Hosting Options
- **Vercel**: Zero-config Astro support
- **Netlify**: Automatic deployments
- **GitHub Pages**: Static hosting
- **Cloudflare Pages**: Global edge network

### Environment Variables (future)
```env
PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
PUBLIC_API_URL=https://api.example.com
```

## Conclusion

This architecture prioritizes:
- **Type Safety**: Comprehensive TypeScript types
- **Maintainability**: Clear separation of concerns
- **Performance**: Minimal client-side JavaScript
- **User Experience**: Responsive, accessible UI
- **Extensibility**: Easy to add features

The design follows Astro's philosophy of shipping minimal JavaScript while maintaining rich interactivity where needed.

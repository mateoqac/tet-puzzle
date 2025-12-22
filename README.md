# Tetonor Puzzle Game

A TypeScript-powered Tetonor puzzle game built with Astro and Preact. Tetonor is a number logic puzzle where players must use pairs of numbers to create both sums and products.

## Game Rules

1. A main grid displays target numbers
2. Below the grid is a "strip" containing pairs of numbers in ascending order
3. Each target number can be formed by EITHER adding OR multiplying a pair from the strip
4. Each pair must be used EXACTLY twice: once for addition and once for multiplication
5. Some numbers in the strip may be blank and must be deduced by the player
6. Example: If the strip has the pair (4, 6), it can solve both 10 (4+6) and 24 (4×6)

## Project Structure

```
tetonor-puzzle/
├── src/
│   ├── components/          # Preact components
│   │   ├── TetonorPuzzle.tsx       # Main puzzle container
│   │   ├── PuzzleGrid.tsx          # Grid layout component
│   │   ├── GridCellComponent.tsx   # Individual cell component
│   │   ├── PuzzleStrip.tsx         # Number strip component
│   │   └── *.css                   # Component styles
│   ├── lib/                 # Core logic
│   │   ├── puzzleGenerator.ts      # Puzzle generation algorithm
│   │   └── puzzleValidator.ts      # Validation logic
│   ├── types/              # TypeScript definitions
│   │   └── puzzle.ts               # Type definitions
│   └── pages/              # Astro pages
│       └── index.astro             # Main page
├── astro.config.mjs        # Astro configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Architecture Overview

### Type System (`src/types/puzzle.ts`)

The entire puzzle system is built on a robust TypeScript foundation:

- **Operation**: Union type for 'add' | 'multiply'
- **NumberPair**: Represents a pair of numbers (can be null for blanks)
- **GridCell**: Individual puzzle cell with target, operation, and player input
- **PuzzleState**: Complete puzzle including grid, strip, and usage tracking
- **PuzzleConfig**: Configuration for puzzle generation
- **Validation Types**: CellValidation and PuzzleValidation for checking solutions

### Core Algorithms

#### Puzzle Generation (`src/lib/puzzleGenerator.ts`)

The `generatePuzzle()` function creates valid Tetonor puzzles:

1. **Pair Generation**: Creates unique number pairs within specified ranges
2. **Grid Assignment**: Assigns each pair to exactly two cells (one add, one multiply)
3. **Shuffling**: Randomizes cell positions
4. **Blank Application**: Strategically makes some numbers blank based on difficulty

Key features:
- Ensures mathematical validity
- Prevents duplicate pairs
- Maintains ascending order in the strip
- Configurable difficulty levels (easy, medium, hard)

#### Validation (`src/lib/puzzleValidator.ts`)

Comprehensive validation system:

- **Cell Validation**: Checks if player input matches the target and uses correct pair
- **Puzzle Validation**: Ensures all cells are correct and pairs are used properly
- **Pair Usage Tracking**: Verifies each pair is used exactly twice (once per operation)
- **Hint System**: Provides helpful hints for stuck players

### Component Architecture

Built with Preact for efficient client-side interactivity:

1. **TetonorPuzzle**: Main container managing state and user actions
   - Handles puzzle state
   - Coordinates validation
   - Manages user interactions (check, reset)

2. **PuzzleGrid**: Renders the grid layout
   - Responsive grid system
   - Passes validation state to cells

3. **GridCellComponent**: Individual cell with inputs
   - Target number display
   - Operation indicator
   - Input fields for player answers
   - Visual feedback (correct/incorrect)

4. **PuzzleStrip**: Displays available number pairs
   - Shows pairs with blanks as "?"
   - Visual hint for pair usage rule

### State Management

State flows unidirectionally:
- Main state in `TetonorPuzzle` component
- User inputs update via callbacks
- Validation is computed on-demand
- No external state management needed (Preact's built-in state is sufficient)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
cd tetonor-puzzle
pnpm install
```

### Development

```bash
pnpm dev
```

Visit `http://localhost:4321` to play the game.

### Build for Production

```bash
pnpm build
```

The built site will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

### Testing

```bash
pnpm test
```

## Configuration

Puzzle difficulty can be configured using the preset configs in `puzzleGenerator.ts`:

```typescript
import { PRESET_CONFIGS } from './lib/puzzleGenerator';

// Easy: 3x4 grid, values 2-9, 1 blank pair
const easyPuzzle = generatePuzzle(PRESET_CONFIGS.easy);

// Medium: 4x4 grid, values 2-12, 2 blank pairs
const mediumPuzzle = generatePuzzle(PRESET_CONFIGS.medium);

// Hard: 4x6 grid, values 3-15, 3 blank pairs
const hardPuzzle = generatePuzzle(PRESET_CONFIGS.hard);
```

Or create custom configurations:

```typescript
const customConfig: PuzzleConfig = {
  rows: 3,
  cols: 6,
  minValue: 1,
  maxValue: 10,
  blankPairs: 2,
  difficulty: 'medium',
};

const puzzle = generatePuzzle(customConfig);
```

## Key Features

### Type Safety
- Strict TypeScript throughout
- No `any` types
- Comprehensive interfaces for all data structures
- Type-safe validation and generation

### Performance
- Astro's partial hydration (only Preact components are interactive)
- Minimal JavaScript shipped to client
- Server-side puzzle generation
- Efficient re-renders with Preact

### Responsive Design
- Mobile-first approach
- Flexible grid layout
- Touch-friendly inputs
- Adaptive font sizes and spacing

### User Experience
- Visual feedback for correct/incorrect answers
- Cell selection highlighting
- Clear operation indicators
- Helpful instructions and hints
- Accessible form inputs with ARIA labels

## Extending the Game

### Adding New Features

1. **Multiple Difficulty Levels**: Add difficulty selector in UI
2. **Timer**: Track solving time
3. **Hints System**: Show correct pair for a selected cell
4. **Puzzle History**: Save/load completed puzzles
5. **Daily Challenge**: Generate consistent puzzle based on date
6. **Undo/Redo**: Implement action history

### Adding Persistence

To save puzzle state:

```typescript
// Serialize puzzle state
const serialized = JSON.stringify({
  grid: puzzle.grid,
  strip: puzzle.strip,
  dimensions: puzzle.dimensions,
});

// Store in localStorage
localStorage.setItem('currentPuzzle', serialized);

// Load and restore
const saved = localStorage.getItem('currentPuzzle');
if (saved) {
  const data = JSON.parse(saved);
  setPuzzle({ ...data, pairUsage: new Map() });
}
```

## Testing Strategy

Recommended tests to implement:

1. **Unit Tests** (Vitest):
   - Puzzle generation validity
   - Validation logic
   - Pair matching algorithms

2. **Component Tests** (Testing Library):
   - User input handling
   - Validation display
   - Button interactions

3. **Integration Tests**:
   - Complete puzzle solving flow
   - Reset functionality
   - Multiple puzzle generations

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- Responsive design maintained
- Tests for new features
- Clear commit messages

## Acknowledgments

Inspired by the classic Tetonor puzzle game format.

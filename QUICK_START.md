# Tet Puzzle - Quick Start Guide

## Get Started in 3 Steps

### 1. Navigate to the Project
```bash
cd /Users/mateqac/Work/tet-puzzle
```

### 2. Start Development Server
```bash
npm run dev
```

The game will be available at: `http://localhost:4321`

### 3. Play the Game!

Open your browser and start solving Tet puzzles.

## How to Play

1. **Understand the Goal**: Each number in the grid can be made by either adding or multiplying a pair from the strip below
2. **Fill in the Boxes**: Enter the two numbers from a pair that create each target number
3. **Use Each Pair Twice**: Every pair must be used exactly once for addition (+) and once for multiplication (×)
4. **Deduce Blanks**: Some pairs show "?" - figure out what numbers they should be!
5. **Check Your Solution**: Click "Check Solution" when complete

## Example

If the strip contains the pair `(4, 6)`:
- It can solve `10` using addition: `4 + 6 = 10`
- It can solve `24` using multiplication: `4 × 6 = 24`

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

## File Structure Overview

```
src/
├── components/          # UI components
│   ├── TetPuzzle.tsx           # Main game component
│   ├── PuzzleGrid.tsx          # Grid layout
│   ├── GridCellComponent.tsx   # Individual cells
│   └── PuzzleStrip.tsx         # Number pairs display
├── lib/                 # Game logic
│   ├── puzzleGenerator.ts      # Creates puzzles
│   └── puzzleValidator.ts      # Checks solutions
├── types/
│   └── puzzle.ts               # TypeScript types
└── pages/
    └── index.astro             # Entry point
```

## Customizing Difficulty

Edit `src/pages/index.astro` to change difficulty:

```typescript
// Current (Easy: 3x4 grid)
const puzzle = generatePuzzle(PRESET_CONFIGS.easy);

// Change to Medium (4x4 grid)
const puzzle = generatePuzzle(PRESET_CONFIGS.medium);

// Change to Hard (4x6 grid)
const puzzle = generatePuzzle(PRESET_CONFIGS.hard);
```

Or create a custom configuration:

```typescript
const customPuzzle = generatePuzzle({
  rows: 3,
  cols: 6,
  minValue: 2,
  maxValue: 12,
  blankPairs: 2,
  difficulty: 'medium',
});
```

## Key Features

- Type-safe TypeScript implementation
- Responsive design (works on mobile and desktop)
- Automatic puzzle generation
- Real-time validation feedback
- Visual indicators for correct/incorrect answers

## Development Tips

### Hot Reload
The dev server supports hot module replacement - changes to components update instantly.

### TypeScript Checking
```bash
npm run astro check
```

### View Type Errors in VS Code
Install the Astro VS Code extension for inline type checking.

## Need More Information?

- Full documentation: `README.md`
- Technical details: `ARCHITECTURE.md`
- Game rules: See "Tet Puzzle Rules" section in README

## Common Issues

### Port Already in Use
If port 4321 is busy:
```bash
npm run dev -- --port 3000
```

### TypeScript Errors
Ensure you're using Node.js 18+ and all dependencies are installed:
```bash
npm install
```

## Next Steps

1. Try solving a puzzle
2. Experiment with different difficulty levels
3. Read the architecture docs to understand how it works
4. Consider adding features like:
   - Timer
   - Hint system
   - Multiple difficulty UI selector
   - Statistics tracking

Happy puzzling!

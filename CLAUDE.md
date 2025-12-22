# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:4321

# Build
pnpm build            # Production build to dist/
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage report
```

To run a single test file:
```bash
pnpm vitest src/lib/__tests__/puzzleGenerator.test.ts
```

## Architecture

**Stack**: Astro + Preact + TypeScript (strict mode) + Vitest

### Core Puzzle Logic (`src/lib/`)

- **puzzleGenerator.ts**: Creates valid Tetonor puzzles. Each number pair must be used exactly twice: once for addition and once for multiplication. Supports `PRESET_CONFIGS` for easy/moderate/difficult levels.
- **puzzleValidator.ts**: Validates player solutions and tracks pair usage.

### Type System (`src/types/puzzle.ts`)

Central type definitions including `PuzzleState`, `GridCell`, `NumberPair`, and validation types.

### Components (`src/components/`)

Preact components with unidirectional state flow:
- **TetonorPuzzle.tsx**: Main container, owns all puzzle state
- **PuzzleGrid.tsx**: Grid layout
- **GridCellComponent.tsx**: Cell with inputs for player answers
- **PuzzleStrip.tsx**: Displays number pairs
- **SuccessModal.tsx**: Completion modal with confetti

### Testing

Tests live in `__tests__/` directories adjacent to source files. Uses Testing Library with jsdom. The test setup aliases React to Preact compat in `vitest.config.ts`.

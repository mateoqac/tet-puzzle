# Tet Puzzle - Test Suite

This document describes the comprehensive test suite for the Tet Puzzle application.

## Test Structure

The test suite follows modern testing best practices with a focus on behavior over implementation:

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── puzzleValidator.test.ts    # Unit tests for validation logic
│   │   └── puzzleGenerator.test.ts    # Unit tests for puzzle generation
│   ├── puzzleValidator.ts
│   └── puzzleGenerator.ts
├── components/
│   ├── __tests__/
│   │   ├── GridCellComponent.test.tsx # Component tests for grid cells
│   │   ├── PuzzleStrip.test.tsx       # Component tests for number strip
│   │   ├── PuzzleGrid.test.tsx        # Component tests for grid layout
│   │   ├── SuccessModal.test.tsx      # Component tests for success modal
│   │   └── TetPuzzle.test.tsx          # Integration tests for main app
│   └── ...
└── test/
    └── setup.ts                        # Test setup and global config
```

## Running Tests

### Install Dependencies

First, install all test dependencies:

```bash
npm install
```

### Available Test Commands

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite includes:

### Unit Tests (lib/)

**puzzleValidator.test.ts** - 60+ tests covering:
- `validateCell()`: Cell validation with various scenarios
- `validatePuzzle()`: Full puzzle validation
- `isInputValid()`: Input validation
- `getValidPairsForCell()`: Finding valid pairs
- `getHintForCell()`: Hint generation
- Edge cases: blank pairs, duplicate usage, incorrect operations

**puzzleGenerator.test.ts** - 50+ tests covering:
- `generatePuzzle()`: Puzzle generation with configs
- `generateBeginnerPuzzle()`: Beginner difficulty (1-12, 0-3 blanks)
- `generateIntermediatePuzzle()`: Intermediate difficulty (1-23, 3-6 blanks)
- `generateAdvancedPuzzle()`: Advanced difficulty (1-50, 6-9 blanks)
- `createFixedPuzzle()`: Fixed example puzzle
- Puzzle quality: no duplicates, correct targets, solvability
- Configuration validation

### Component Tests (components/)

**GridCellComponent.test.tsx** - 40+ tests covering:
- Rendering: target display, inputs, operation button
- User interactions: number input, operation toggling, clicking
- Keyboard navigation: arrow keys, Enter, Space
- Validation display: correct/incorrect states
- Accessibility: ARIA attributes, screen reader support

**PuzzleStrip.test.tsx** - 30+ tests covering:
- Rendering: sorted numbers, blank inputs
- Crossing out: toggle functionality, independent state
- Blank inputs: typing, crossing out filled blanks, clearing
- Edge cases: empty strip, all blanks, large numbers

**PuzzleGrid.test.tsx** - 25+ tests covering:
- Rendering: grid layout, cell display
- Grid layouts: 3x4, 4x4, dynamic sizing
- Event forwarding: input, select, navigation
- Validation states
- Accessibility: ARIA grid structure

**SuccessModal.test.tsx** - 20+ tests covering:
- Rendering: conditional display, content
- Interactions: button click, Escape key
- Focus management: trap, restoration
- Accessibility: dialog role, ARIA labels

### Integration Tests (components/)

**TetPuzzle.test.tsx** - 30+ tests covering:
- Full game flow: difficulty selection → filling cells → validation → success
- Difficulty switching: puzzle regeneration, state reset
- Cell interactions: input, operations, validation clearing
- Reset functionality: clearing inputs and state
- Success flow: modal display, play again
- Edge cases: rapid changes, partial completion

## Test Philosophy

### Testing Trophy Approach

The test suite follows the Testing Trophy methodology:

1. **Static Analysis** (TypeScript, ESLint)
2. **Unit Tests** - Pure functions and utilities (lib/)
3. **Integration Tests** (largest portion) - User-facing behavior (components/)
4. **E2E Tests** - Not included but can be added with Playwright

### Key Principles

1. **Test Behavior, Not Implementation**
   - Query elements by role, label, text (how users find them)
   - Avoid testing internal state or implementation details
   - Tests fail when user-visible behavior breaks

2. **Realistic User Interactions**
   - Use `userEvent` for realistic event simulation
   - Test keyboard navigation and accessibility
   - Verify screen reader announcements

3. **Proper Async Handling**
   - Use `findBy*` queries for async elements
   - Use `waitFor` for assertions on state changes
   - No arbitrary timeouts

4. **Maintainable Tests**
   - Descriptive test names explaining expected behavior
   - Arrange-Act-Assert pattern
   - Isolated tests with proper cleanup

## Test Utilities

### Setup (src/test/setup.ts)

- Configures Testing Library matchers
- Automatic cleanup after each test
- Mocks `canvas-confetti` for headless testing
- Provides global test utilities

### Vitest Config (vitest.config.ts)

- jsdom environment for browser APIs
- Preact compatibility with React aliases
- Coverage reporting (v8 provider)
- Automatic global test imports

## Coverage Goals

Current test coverage targets:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View detailed coverage:

```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Component Test Template

```typescript
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('should [expected behavior]', async () => {
    const user = userEvent.setup();

    // Arrange
    render(<ComponentName prop="value" />);

    // Act
    await user.click(screen.getByRole('button'));

    // Assert
    expect(screen.getByText('result')).toBeInTheDocument();
  });
});
```

## Continuous Integration

Tests are designed to run in CI environments:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## Troubleshooting

### Common Issues

**"Cannot find module 'preact'"**
- Run `npm install` to ensure all dependencies are installed

**Tests timing out**
- Check for async operations without proper `await`
- Ensure `waitFor` is used for state changes

**Flaky tests**
- Avoid `setTimeout` - use `waitFor` instead
- Ensure proper cleanup between tests
- Use `user.setup()` for each test

### Debug Mode

```bash
# Run specific test file
npx vitest run src/lib/__tests__/puzzleValidator.test.ts

# Run with verbose output
npx vitest run --reporter=verbose

# Run single test by name
npx vitest run -t "should validate cell"
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library - Preact](https://testing-library.com/docs/preact-testing-library/intro)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all existing tests pass
3. Aim for > 80% coverage on new code
4. Test user-facing behavior, not implementation
5. Add accessibility tests when applicable

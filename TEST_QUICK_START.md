# Tet Puzzle Tests - Quick Start Guide

## Installation

```bash
npm install
```

This will install all test dependencies including:
- Vitest (test runner)
- @testing-library/preact (component testing)
- jsdom (browser environment)
- Coverage tools

## Running Tests

### Basic Commands

```bash
# Watch mode (recommended for development)
npm test

# Run once (for CI or quick check)
npm run test:run

# Interactive UI (great for debugging)
npm run test:ui

# With coverage report
npm run test:coverage
```

### Watch Mode Features

When running `npm test`, you can use these commands:
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename
- Press `t` to filter by test name
- Press `c` to clear console
- Press `q` to quit

## Test Structure

```
src/
├── lib/__tests__/
│   ├── puzzleValidator.test.ts     (60+ unit tests)
│   └── puzzleGenerator.test.ts     (50+ unit tests)
├── components/__tests__/
│   ├── GridCellComponent.test.tsx  (40+ component tests)
│   ├── PuzzleStrip.test.tsx        (30+ component tests)
│   ├── PuzzleGrid.test.tsx         (25+ component tests)
│   ├── SuccessModal.test.tsx       (20+ component tests)
│   └── TetPuzzle.test.tsx           (30+ integration tests)
└── test/
    └── setup.ts                     (global test config)
```

## What's Tested

### Unit Tests
- Puzzle validation logic
- Puzzle generation algorithms
- All difficulty levels (Beginner, Intermediate, Advanced)
- Edge cases and error handling

### Component Tests
- All UI components
- User interactions (click, type, keyboard)
- Accessibility (ARIA, screen readers)
- Visual feedback (validation states)

### Integration Tests
- Complete game workflows
- Difficulty switching
- Reset and replay functionality
- Success flow with modal

## Viewing Coverage

```bash
npm run test:coverage
open coverage/index.html
```

Coverage report shows:
- Which lines are tested
- Which branches are covered
- Overall coverage percentages
- Untested code paths

## Running Specific Tests

```bash
# Run single test file
npx vitest run src/lib/__tests__/puzzleValidator.test.ts

# Run tests matching pattern
npx vitest run -t "should validate cell"

# Run only component tests
npx vitest run src/components

# Run with verbose output
npx vitest run --reporter=verbose
```

## Debugging Tests

### UI Mode (Recommended)
```bash
npm run test:ui
```
Opens a browser with:
- Visual test runner
- Click tests to run
- View test details
- Inspect failures

### VSCode Debugging
1. Set breakpoint in test file
2. Run "Debug Test" from testing sidebar
3. Or add to launch.json:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:run"],
  "console": "integratedTerminal"
}
```

## Common Tasks

### Add a New Test

1. Create test file next to source:
   ```
   src/components/MyComponent.tsx
   src/components/__tests__/MyComponent.test.tsx
   ```

2. Write test:
   ```typescript
   import { render, screen } from '@testing-library/preact';
   import MyComponent from '../MyComponent';

   describe('MyComponent', () => {
     it('should render correctly', () => {
       render(<MyComponent />);
       expect(screen.getByText('Hello')).toBeInTheDocument();
     });
   });
   ```

3. Run tests:
   ```bash
   npm test
   ```

### Update Snapshot (if using snapshots)
```bash
# Update all snapshots
npx vitest run -u

# Update specific test
npx vitest run -t "test name" -u
```

## Understanding Test Output

### Success
```
✓ src/lib/__tests__/puzzleValidator.test.ts (60)
✓ src/components/__tests__/GridCellComponent.test.tsx (40)

Test Files  7 passed (7)
     Tests  260 passed (260)
  Start at  10:30:00
  Duration  1.23s
```

### Failure
```
❯ src/lib/__tests__/puzzleValidator.test.ts (60)
  ❯ validateCell
    × should validate correct cell
      Expected: true
      Received: false
```

## Troubleshooting

### Tests Won't Run

**Error: Cannot find module**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Port already in use (for UI mode)**
```bash
# Kill process on port 51204
lsof -ti:51204 | xargs kill -9
```

### Slow Tests

```bash
# Run tests in parallel
npm test -- --pool=threads

# Run with limited workers
npm test -- --maxWorkers=2
```

### Flaky Tests

1. Check for async issues - add `await`
2. Use `waitFor` for state changes
3. Ensure proper cleanup
4. Check test isolation

## Test Best Practices

### DO
- Test user-visible behavior
- Use semantic queries (getByRole, getByLabelText)
- Write descriptive test names
- Keep tests isolated
- Use async/await properly

### DON'T
- Test implementation details
- Use querySelector when possible to avoid
- Share state between tests
- Use arbitrary timeouts
- Mock everything

## Examples

### Query Priority
```typescript
// Good - how users find elements
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/hello/i)

// Okay - last resort
screen.getByTestId('submit-button')

// Bad - implementation detail
container.querySelector('.submit-btn')
```

### User Interactions
```typescript
// Good - realistic events
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// Bad - synthetic events
fireEvent.click(button);
```

### Async Handling
```typescript
// Good - wait for element to appear
const element = await screen.findByText('loaded');

// Good - wait for assertion
await waitFor(() => {
  expect(screen.getByText('success')).toBeInTheDocument();
});

// Bad - arbitrary wait
await new Promise(resolve => setTimeout(resolve, 1000));
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm run test:run

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

### GitLab CI
```yaml
test:
  script:
    - npm ci
    - npm run test:run
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

## Resources

- **Full Documentation**: See TEST_README.md
- **Test Summary**: See TESTING_SUMMARY.md
- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/docs/preact-testing-library/intro
- **User Event**: https://testing-library.com/docs/user-event/intro

## Getting Help

### Common Questions

**Q: Why are my tests failing?**
A: Check the error message. Most failures are due to:
   - Missing await on async operations
   - Wrong query (element doesn't exist)
   - Timing issues (use waitFor)

**Q: How do I test accessibility?**
A: Use ARIA queries and roles:
```typescript
expect(screen.getByRole('button')).toBeInTheDocument();
expect(button).toHaveAttribute('aria-label', 'Submit');
```

**Q: How do I mock a module?**
A: In test setup or test file:
```typescript
vi.mock('module-name', () => ({
  default: vi.fn(),
}));
```

**Q: Can I see test coverage in real-time?**
A: Use UI mode:
```bash
npm run test:ui
```
Then enable "Coverage" in the UI.

## Next Steps

1. Run `npm test` to start watching tests
2. Open TEST_README.md for detailed documentation
3. Check TESTING_SUMMARY.md for what's covered
4. Start writing new features with tests!

Happy Testing! 🧪

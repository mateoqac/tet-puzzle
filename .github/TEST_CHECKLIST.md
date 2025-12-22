# Test Checklist for New Features

Use this checklist when adding new features to ensure comprehensive test coverage.

## Before Writing Code

- [ ] Write failing tests first (TDD approach)
- [ ] Consider edge cases and error conditions
- [ ] Plan accessibility requirements

## Unit Tests (for lib/ functions)

- [ ] Test happy path (normal operation)
- [ ] Test with minimum valid input
- [ ] Test with maximum valid input
- [ ] Test with invalid input
- [ ] Test with null/undefined
- [ ] Test with edge cases (empty arrays, zero, negative numbers)
- [ ] Test error handling
- [ ] Test return values are correct

**Example test structure:**
```typescript
describe('functionName', () => {
  describe('when given valid input', () => {
    it('should return expected result', () => {
      // test here
    });
  });

  describe('when given invalid input', () => {
    it('should throw error', () => {
      // test here
    });
  });
});
```

## Component Tests

### Rendering
- [ ] Component renders without crashing
- [ ] All expected elements are present
- [ ] Default props render correctly
- [ ] Different prop combinations render correctly
- [ ] Conditional rendering works

### User Interactions
- [ ] Click handlers work
- [ ] Input handlers work (typing, clearing)
- [ ] Form submission works
- [ ] Keyboard interactions work (Enter, Space, Escape)
- [ ] Focus management works

### State Management
- [ ] State updates on user interaction
- [ ] State updates trigger re-renders
- [ ] State resets when appropriate
- [ ] Multiple state updates work correctly

### Accessibility
- [ ] Proper ARIA roles
- [ ] ARIA labels are descriptive
- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (manual check)

**Example test structure:**
```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    it('should render main elements', () => {
      // test
    });
  });

  describe('user interactions', () => {
    it('should handle click', async () => {
      const user = userEvent.setup();
      // test
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // test
    });
  });
});
```

## Integration Tests

- [ ] Complete user workflows
- [ ] Multiple components working together
- [ ] State flows between components
- [ ] Error states propagate correctly
- [ ] Success states show correctly

## Checklist by Feature Type

### Adding a New Grid Cell Feature

- [ ] Cell renders new UI elements
- [ ] User can interact with new feature
- [ ] Keyboard navigation still works
- [ ] Validation includes new feature
- [ ] Hints include new feature
- [ ] Reset clears new feature
- [ ] Accessibility maintained

### Adding a New Difficulty Level

- [ ] Generator creates valid puzzles
- [ ] Correct number range
- [ ] Correct blank count
- [ ] All puzzles are solvable
- [ ] Validation works
- [ ] UI button added
- [ ] State resets on switch

### Adding a New Validation Rule

- [ ] Rule correctly identifies valid input
- [ ] Rule correctly identifies invalid input
- [ ] Error message is clear
- [ ] UI shows validation state
- [ ] Screen reader announces error
- [ ] Rule doesn't break existing validation

### Adding a New Modal/Dialog

- [ ] Modal opens/closes correctly
- [ ] Focus trapped in modal
- [ ] Escape key closes modal
- [ ] Focus restored on close
- [ ] ARIA dialog attributes
- [ ] Backdrop click handling
- [ ] Content is accessible

## Coverage Requirements

Before committing:
- [ ] All new code has tests
- [ ] Coverage is > 80% on new files
- [ ] All tests pass
- [ ] No console errors/warnings

```bash
npm run test:coverage
```

## Accessibility Testing

Manual checks (beyond automated tests):
- [ ] Tab navigation works logically
- [ ] Screen reader tested (NVDA/JAWS/VoiceOver)
- [ ] Keyboard-only navigation works
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] No motion causes vestibular issues

## Performance Testing

For computationally intensive features:
- [ ] Large puzzles (max size) perform well
- [ ] Generation doesn't block UI
- [ ] Validation is fast (< 100ms)
- [ ] No memory leaks

**Example performance test:**
```typescript
it('should generate puzzle quickly', () => {
  const start = Date.now();
  generateAdvancedPuzzle();
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000); // 1 second max
});
```

## Regression Testing

When fixing bugs:
- [ ] Write test that reproduces bug
- [ ] Verify test fails before fix
- [ ] Verify test passes after fix
- [ ] Check no other tests broke

## Documentation

- [ ] Update TEST_README.md if needed
- [ ] Add JSDoc comments to complex test helpers
- [ ] Update TESTING_SUMMARY.md with new test counts
- [ ] Add examples to TEST_QUICK_START.md if helpful

## Code Review Checklist

Before requesting review:
- [ ] Tests follow existing patterns
- [ ] Test names are descriptive
- [ ] No unnecessary mocks
- [ ] Async operations have await
- [ ] No flaky tests (run 10 times to verify)
- [ ] Tests are isolated (can run in any order)

## CI/CD Integration

- [ ] Tests pass in CI
- [ ] Coverage uploaded
- [ ] No warnings in output
- [ ] Build succeeds

## Common Patterns

### Testing Loading States
```typescript
it('should show loading state', async () => {
  render(<Component />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
it('should show error message', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole('button'));

  expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
});
```

### Testing Conditional Rendering
```typescript
it('should show element when condition is true', () => {
  render(<Component showElement={true} />);
  expect(screen.getByTestId('element')).toBeInTheDocument();
});

it('should hide element when condition is false', () => {
  render(<Component showElement={false} />);
  expect(screen.queryByTestId('element')).not.toBeInTheDocument();
});
```

### Testing Forms
```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<Form onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/name/i), 'John');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

## Anti-Patterns to Avoid

### ❌ Don't Test Implementation Details
```typescript
// Bad - testing state
expect(component.state.count).toBe(5);

// Good - testing behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### ❌ Don't Use Arbitrary Waits
```typescript
// Bad
await new Promise(r => setTimeout(r, 1000));

// Good
await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());
```

### ❌ Don't Mock Everything
```typescript
// Bad - mocking too much
vi.mock('./utils');
vi.mock('./helpers');
vi.mock('./validators');

// Good - only mock external dependencies
vi.mock('canvas-confetti');
```

## Final Checks

Before marking PR as ready:
- [ ] `npm run test:run` passes
- [ ] `npm run test:coverage` shows adequate coverage
- [ ] Tests are readable and maintainable
- [ ] Tests document expected behavior
- [ ] No disabled or skipped tests without good reason

## Resources

- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [User Event](https://testing-library.com/docs/user-event/intro)

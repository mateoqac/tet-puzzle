import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PuzzleStrip from '../PuzzleStrip';
import type { NumberPair } from '../../types/puzzle';

describe('PuzzleStrip', () => {
  const mockStrip: NumberPair[] = [
    { id: 'pair-1', first: 3, second: 7 },
    { id: 'pair-2', first: 5, second: 9 },
    { id: 'pair-3', first: 2, second: 4 },
  ];

  describe('rendering', () => {
    it('should render all numbers from pairs', () => {
      render(<PuzzleStrip strip={mockStrip} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
    });

    it('should render numbers in sorted order', () => {
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const numbers = container.querySelectorAll('.strip-number');
      const textContent = Array.from(numbers).map((n) => n.textContent);

      // Should be sorted: 2, 3, 4, 5, 7, 9
      expect(textContent).toEqual(['2', '3', '4', '5', '7', '9']);
    });

    it('should render exactly twice as many items as pairs', () => {
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const items = container.querySelectorAll('.strip-number, .blank-input');
      expect(items).toHaveLength(mockStrip.length * 2);
    });

    it('should render blank inputs for null values', () => {
      const stripWithBlanks: NumberPair[] = [
        { id: 'pair-1', first: null, second: 7, firstOriginal: 3 },
        { id: 'pair-2', first: 5, second: null, secondOriginal: 9 },
      ];

      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInputs = screen.getAllByRole('textbox');
      expect(blankInputs).toHaveLength(2);
    });

    it('should sort blanks by original values', () => {
      const stripWithBlanks: NumberPair[] = [
        { id: 'pair-1', first: null, second: 9, firstOriginal: 7 },
        { id: 'pair-2', first: 3, second: null, secondOriginal: 5 },
      ];

      const { container } = render(<PuzzleStrip strip={stripWithBlanks} />);

      const items = Array.from(container.querySelectorAll('.strip-number, .blank-input'));
      const values = items.map((item) => {
        if (item.tagName === 'INPUT') {
          return 'blank';
        }
        return item.textContent;
      });

      // Should be sorted by original values: 3, blank(5), blank(7), 9
      expect(values).toEqual(['3', 'blank', 'blank', '9']);
    });
  });

  describe('crossing out numbers', () => {
    it('should toggle crossed state on click', async () => {
      const user = userEvent.setup();
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const firstNumber = screen.getByText('2');

      // Click to cross out
      await user.click(firstNumber);
      expect(firstNumber).toHaveClass('crossed');

      // Click again to uncross
      await user.click(firstNumber);
      expect(firstNumber).not.toHaveClass('crossed');
    });

    it('should maintain crossed state for multiple numbers independently', async () => {
      const user = userEvent.setup();
      render(<PuzzleStrip strip={mockStrip} />);

      const number2 = screen.getByText('2');
      const number5 = screen.getByText('5');

      await user.click(number2);
      await user.click(number5);

      expect(number2).toHaveClass('crossed');
      expect(number5).toHaveClass('crossed');

      // Uncross only one
      await user.click(number2);

      expect(number2).not.toHaveClass('crossed');
      expect(number5).toHaveClass('crossed'); // Should still be crossed
    });

    it('should allow crossing out all numbers', async () => {
      const user = userEvent.setup();
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const numbers = container.querySelectorAll('.strip-number:not(.blank-input)');

      for (const number of Array.from(numbers)) {
        await user.click(number as HTMLElement);
      }

      numbers.forEach((number) => {
        expect(number).toHaveClass('crossed');
      });
    });
  });

  describe('blank inputs', () => {
    const stripWithBlanks: NumberPair[] = [
      { id: 'pair-1', first: null, second: 7, firstOriginal: 3 },
      { id: 'pair-2', first: 5, second: 9 },
    ];

    it('should allow typing in blank inputs', async () => {
      const user = userEvent.setup();
      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox', { name: /blank number/i });
      await user.type(blankInput, '3');

      expect(blankInput).toHaveValue('3');
    });

    it('should limit blank input to 2 characters', () => {
      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox', { name: /blank number/i });
      expect(blankInput).toHaveAttribute('maxLength', '2');
    });

    it('should allow crossing out blank inputs with values', async () => {
      const user = userEvent.setup();
      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox', { name: /blank number/i });

      // Type a value
      await user.type(blankInput, '3');

      // Click to cross out
      await user.click(blankInput);

      expect(blankInput).toHaveClass('crossed');
    });

    it('should not cross out empty blank inputs on click', async () => {
      const user = userEvent.setup();
      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox', { name: /blank number/i });

      // Click empty input
      await user.click(blankInput);

      expect(blankInput).not.toHaveClass('crossed');
    });

    it('should clear crossed state when value is cleared', async () => {
      const user = userEvent.setup();
      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox', { name: /blank number/i });

      // Type and cross out
      await user.type(blankInput, '3');
      await user.click(blankInput);
      expect(blankInput).toHaveClass('crossed');

      // Clear the value
      await user.clear(blankInput);

      expect(blankInput).not.toHaveClass('crossed');
    });

    it('should render multiple blank inputs correctly', () => {
      const multiBlankStrip: NumberPair[] = [
        { id: 'pair-1', first: null, second: null, firstOriginal: 3, secondOriginal: 7 },
        { id: 'pair-2', first: null, second: 9, firstOriginal: 5 },
      ];

      render(<PuzzleStrip strip={multiBlankStrip} />);

      const blankInputs = screen.getAllByRole('textbox');
      expect(blankInputs).toHaveLength(3);
    });

    it('should maintain state for each blank input independently', async () => {
      const user = userEvent.setup();
      const multiBlankStrip: NumberPair[] = [
        { id: 'pair-1', first: null, second: null, firstOriginal: 3, secondOriginal: 7 },
      ];

      render(<PuzzleStrip strip={multiBlankStrip} />);

      const blankInputs = screen.getAllByRole('textbox');

      await user.type(blankInputs[0], '3');
      await user.type(blankInputs[1], '7');

      expect(blankInputs[0]).toHaveValue('3');
      expect(blankInputs[1]).toHaveValue('7');
    });
  });

  describe('component resets', () => {
    it('should reset state when receiving new strip via key prop', () => {
      const { rerender } = render(
        <PuzzleStrip key={1} strip={mockStrip} />
      );

      // Cross out a number
      const number = screen.getByText('2');
      number.click();

      // Re-render with new key (simulates new puzzle)
      rerender(<PuzzleStrip key={2} strip={mockStrip} />);

      const newNumber = screen.getByText('2');
      expect(newNumber).not.toHaveClass('crossed');
    });
  });

  describe('accessibility', () => {
    it('should have accessible labels for blank inputs', () => {
      const stripWithBlanks: NumberPair[] = [
        { id: 'pair-1', first: null, second: 7, firstOriginal: 3 },
        { id: 'pair-2', first: null, second: 9, firstOriginal: 5 },
      ];

      render(<PuzzleStrip strip={stripWithBlanks} />);

      expect(screen.getByLabelText(/blank number 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/blank number 2/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const stripWithBlanks: NumberPair[] = [
        { id: 'pair-1', first: null, second: 7, firstOriginal: 3 },
      ];

      render(<PuzzleStrip strip={stripWithBlanks} />);

      const blankInput = screen.getByRole('textbox');

      // Tab to input
      await user.tab();
      expect(blankInput).toHaveFocus();

      // Type with keyboard
      await user.keyboard('3');
      expect(blankInput).toHaveValue('3');
    });
  });

  describe('responsive design', () => {
    it('should have puzzle-strip class for responsive styling', () => {
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const puzzleStrip = container.querySelector('.puzzle-strip');
      expect(puzzleStrip).toBeInTheDocument();
    });

    it('should have strip-number class on number elements for responsive sizing', () => {
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const stripNumbers = container.querySelectorAll('.strip-number');
      expect(stripNumbers.length).toBeGreaterThan(0);
    });

    it('should render numbers that can scale with viewport', () => {
      const { container } = render(<PuzzleStrip strip={mockStrip} />);

      const puzzleStrip = container.querySelector('.puzzle-strip');
      expect(puzzleStrip).toBeInTheDocument();
      // Strip should be flexible and not overflow
      expect(puzzleStrip).not.toHaveStyle({ overflow: 'visible' });
    });
  });

  describe('edge cases', () => {
    it('should handle empty strip', () => {
      const { container } = render(<PuzzleStrip strip={[]} />);

      const items = container.querySelectorAll('.strip-number, .blank-input');
      expect(items).toHaveLength(0);
    });

    it('should handle single pair', () => {
      const singlePair: NumberPair[] = [
        { id: 'pair-1', first: 3, second: 7 },
      ];

      render(<PuzzleStrip strip={singlePair} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should handle all blanks', () => {
      const allBlanks: NumberPair[] = [
        { id: 'pair-1', first: null, second: null, firstOriginal: 3, secondOriginal: 7 },
        { id: 'pair-2', first: null, second: null, firstOriginal: 5, secondOriginal: 9 },
      ];

      render(<PuzzleStrip strip={allBlanks} />);

      const blankInputs = screen.getAllByRole('textbox');
      expect(blankInputs).toHaveLength(4);
    });

    it('should handle large numbers', () => {
      const largeNumbers: NumberPair[] = [
        { id: 'pair-1', first: 99, second: 100 },
      ];

      render(<PuzzleStrip strip={largeNumbers} />);

      expect(screen.getByText('99')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle pairs with same numbers', () => {
      const samePair: NumberPair[] = [
        { id: 'pair-1', first: 5, second: 5 },
      ];

      render(<PuzzleStrip strip={samePair} />);

      const numbers = screen.getAllByText('5');
      expect(numbers).toHaveLength(2);
    });
  });
});

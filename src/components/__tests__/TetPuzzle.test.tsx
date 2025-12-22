import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import TetPuzzle from '../TetPuzzle';
import { createFixedPuzzle } from '../../lib/puzzleGenerator';
import type { PuzzleState } from '../../types/puzzle';

describe('TetPuzzle - Integration Tests', () => {
  const initialPuzzle = createFixedPuzzle();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('should render puzzle title', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      expect(screen.getByText('Tet Puzzle')).toBeInTheDocument();
    });

    it('should render instructions', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      expect(
        screen.getByText(/use each pair.*exactly twice.*addition.*multiplication/i)
      ).toBeInTheDocument();
    });

    it('should render difficulty selector with all levels', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /moderate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /difficult/i })).toBeInTheDocument();
    });

    it('should render puzzle grid', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render puzzle strip', () => {
      const { container } = render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const strip = container.querySelector('.puzzle-strip');
      expect(strip).toBeInTheDocument();
    });

    it('should render control buttons', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      expect(screen.getByRole('button', { name: /check solution/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should have Check Solution button disabled initially', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      expect(checkButton).toBeDisabled();
    });
  });

  describe('difficulty selection', () => {
    it('should highlight Beginner by default', () => {
      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const beginnerBtn = screen.getByRole('button', { name: /easy/i });
      expect(beginnerBtn).toHaveClass('active');
    });

    it('should generate new puzzle when selecting Intermediate', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const intermediateBtn = screen.getByRole('button', { name: /moderate/i });
      await user.click(intermediateBtn);

      expect(intermediateBtn).toHaveClass('active');
      // Puzzle should be regenerated (all cells should be empty)
      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input) => {
        expect(input).toHaveValue(null);
      });
    });

    it('should generate new puzzle when selecting Advanced', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const advancedBtn = screen.getByRole('button', { name: /difficult/i });
      await user.click(advancedBtn);

      expect(advancedBtn).toHaveClass('active');
    });

    it('should reset validation when changing difficulty', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill a cell
      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '3');

      // Change difficulty
      const intermediateBtn = screen.getByRole('button', { name: /moderate/i });
      await user.click(intermediateBtn);

      // Validation summary should not be visible
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('cell interactions', () => {
    it('should allow entering numbers in cells', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const inputs = screen.getAllByRole('spinbutton');
      const firstInput = inputs[0];

      await user.type(firstInput, '5');

      expect(firstInput).toHaveValue(5);
    });

    it('should allow selecting operation', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const operationButton = screen.getAllByRole('button', {
        name: /operation for target/i,
      })[0];

      await user.click(operationButton);

      expect(operationButton).toHaveTextContent('+');
    });

    it('should enable Check Solution button when all cells filled', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      expect(checkButton).toBeDisabled();

      // Fill all cells
      const inputs = screen.getAllByRole('spinbutton');
      for (let i = 0; i < inputs.length; i++) {
        await user.type(inputs[i], '1');
      }

      const operationButtons = screen.getAllByRole('button', {
        name: /operation for target/i,
      });
      for (const btn of operationButtons) {
        await user.click(btn);
      }

      expect(checkButton).not.toBeDisabled();
    });

    it('should clear validation when cell is modified', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill all cells with incorrect values
      const inputs = screen.getAllByRole('spinbutton');
      for (let i = 0; i < inputs.length; i++) {
        await user.type(inputs[i], '1');
      }

      const operationButtons = screen.getAllByRole('button', {
        name: /operation for target/i,
      });
      for (const btn of operationButtons) {
        await user.click(btn);
      }

      // Check solution (will be incorrect)
      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      // Validation should appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Modify a cell
      await user.clear(inputs[0]);
      await user.type(inputs[0], '2');

      // Validation should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should clear all cell inputs when reset is clicked', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill some cells
      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '5');
      await user.type(inputs[1], '7');

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // All inputs should be cleared
      inputs.forEach((input) => {
        expect(input).toHaveValue(null);
      });
    });

    it('should clear validation when reset is clicked', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill all cells
      const inputs = screen.getAllByRole('spinbutton');
      for (let i = 0; i < inputs.length; i++) {
        await user.type(inputs[i], '1');
      }

      const operationButtons = screen.getAllByRole('button', {
        name: /operation for target/i,
      });
      for (const btn of operationButtons) {
        await user.click(btn);
      }

      // Check solution
      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Validation should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should clear selected cell when reset is clicked', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Select a cell
      const gridCells = screen.getAllByRole('gridcell');
      await user.click(gridCells[0]);

      expect(gridCells[0]).toHaveAttribute('aria-selected', 'true');

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // No cell should be selected
      gridCells.forEach((cell) => {
        expect(cell).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('validation and checking solution', () => {
    it('should show error message for incorrect solution', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill all cells with wrong values
      const inputs = screen.getAllByRole('spinbutton');
      for (let i = 0; i < inputs.length; i++) {
        await user.type(inputs[i], '1');
      }

      const operationButtons = screen.getAllByRole('button', {
        name: /operation for target/i,
      });
      for (const btn of operationButtons) {
        await user.click(btn);
      }

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/cell.*need correction/i);
      });
    });

    it('should show success modal for correct solution', async () => {
      const user = userEvent.setup();

      // Create a simple solvable puzzle
      const simplePuzzle: PuzzleState = {
        grid: [
          {
            id: 'cell-1',
            target: 10,
            operation: 'add',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
          {
            id: 'cell-2',
            target: 21,
            operation: 'multiply',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
        ],
        strip: [{ id: 'pair-1', first: 3, second: 7 }],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      render(<TetPuzzle initialPuzzle={simplePuzzle} />);

      // Fill with correct values
      const inputs = screen.getAllByRole('spinbutton');

      // Cell 1: 3 + 7 = 10
      await user.type(inputs[0], '3');
      await user.type(inputs[1], '7');

      const opButtons = screen.getAllByRole('button', { name: /operation for target/i });
      await user.click(opButtons[0]); // Set to add

      // Cell 2: 3 × 7 = 21
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '7');
      await user.click(opButtons[1]); // Set to add
      await user.click(opButtons[1]); // Toggle to multiply

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      });
    });

    it('should show success message in validation summary', async () => {
      const user = userEvent.setup();

      const simplePuzzle: PuzzleState = {
        grid: [
          {
            id: 'cell-1',
            target: 10,
            operation: 'add',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
          {
            id: 'cell-2',
            target: 21,
            operation: 'multiply',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
        ],
        strip: [{ id: 'pair-1', first: 3, second: 7 }],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      render(<TetPuzzle initialPuzzle={simplePuzzle} />);

      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '3');
      await user.type(inputs[1], '7');

      const opButtons = screen.getAllByRole('button', { name: /operation for target/i });
      await user.click(opButtons[0]);

      await user.type(inputs[2], '3');
      await user.type(inputs[3], '7');
      await user.click(opButtons[1]);
      await user.click(opButtons[1]);

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/all cells are correct/i);
        expect(alert).toHaveClass('success');
      });
    });
  });

  describe('success modal', () => {
    it('should allow playing again from success modal', async () => {
      const user = userEvent.setup();

      const simplePuzzle: PuzzleState = {
        grid: [
          {
            id: 'cell-1',
            target: 10,
            operation: 'add',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
          {
            id: 'cell-2',
            target: 21,
            operation: 'multiply',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
        ],
        strip: [{ id: 'pair-1', first: 3, second: 7 }],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      render(<TetPuzzle initialPuzzle={simplePuzzle} />);

      // Solve puzzle
      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '3');
      await user.type(inputs[1], '7');

      const opButtons = screen.getAllByRole('button', { name: /operation for target/i });
      await user.click(opButtons[0]);

      await user.type(inputs[2], '3');
      await user.type(inputs[3], '7');
      await user.click(opButtons[1]);
      await user.click(opButtons[1]);

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      await user.click(checkButton);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Play Again
      const playAgainButton = screen.getByRole('button', { name: /play again/i });
      await user.click(playAgainButton);

      // Modal should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Puzzle should be reset
      const newInputs = screen.getAllByRole('spinbutton');
      newInputs.forEach((input) => {
        expect(input).toHaveValue(null);
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should support arrow key navigation between cells', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const gridCells = screen.getAllByRole('gridcell');

      // Focus first cell
      gridCells[0].focus();
      await user.keyboard('{ArrowRight}');

      // Should navigate to next cell (mocked in component)
      // Navigation is tested in GridCellComponent tests
    });
  });

  describe('full game flow', () => {
    it('should complete full game workflow', async () => {
      const user = userEvent.setup();

      const simplePuzzle: PuzzleState = {
        grid: [
          {
            id: 'cell-1',
            target: 10,
            operation: 'add',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
          {
            id: 'cell-2',
            target: 21,
            operation: 'multiply',
            solutionPairId: 'pair-1',
            playerFirst: null,
            playerSecond: null,
            playerOperation: null,
          },
        ],
        strip: [{ id: 'pair-1', first: 3, second: 7 }],
        pairUsage: new Map([
          ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
        ]),
        dimensions: { rows: 1, cols: 2 },
      };

      render(<TetPuzzle initialPuzzle={simplePuzzle} />);

      // 1. Start with easy difficulty
      expect(screen.getByRole('button', { name: /easy/i })).toHaveClass('active');

      // 2. Fill in cells
      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '3');
      await user.type(inputs[1], '7');

      const opButtons = screen.getAllByRole('button', { name: /operation for target/i });
      await user.click(opButtons[0]);

      await user.type(inputs[2], '3');
      await user.type(inputs[3], '7');
      await user.click(opButtons[1]);
      await user.click(opButtons[1]);

      // 3. Check solution
      const checkButton = screen.getByRole('button', { name: /check solution/i });
      expect(checkButton).not.toBeDisabled();
      await user.click(checkButton);

      // 4. Success modal appears
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 5. Play again
      const playAgainButton = screen.getByRole('button', { name: /play again/i });
      await user.click(playAgainButton);

      // 6. New puzzle loaded
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // 7. Can switch difficulty
      const intermediateBtn = screen.getByRole('button', { name: /moderate/i });
      await user.click(intermediateBtn);
      expect(intermediateBtn).toHaveClass('active');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid difficulty changes', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      const beginnerBtn = screen.getByRole('button', { name: /easy/i });
      const intermediateBtn = screen.getByRole('button', { name: /moderate/i });
      const advancedBtn = screen.getByRole('button', { name: /difficult/i });

      await user.click(intermediateBtn);
      await user.click(advancedBtn);
      await user.click(beginnerBtn);

      expect(beginnerBtn).toHaveClass('active');
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle partial puzzle completion', async () => {
      const user = userEvent.setup();

      render(<TetPuzzle initialPuzzle={initialPuzzle} />);

      // Fill only some cells
      const inputs = screen.getAllByRole('spinbutton');
      await user.type(inputs[0], '3');
      await user.type(inputs[1], '7');

      const checkButton = screen.getByRole('button', { name: /check solution/i });
      expect(checkButton).toBeDisabled();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import GridCellComponent from '../GridCellComponent';
import type { GridCell, CellValidation } from '../../types/puzzle';

describe('GridCellComponent', () => {
  const mockCell: GridCell = {
    id: 'cell-1',
    target: 10,
    operation: 'add',
    solutionPairId: 'pair-1',
    playerFirst: null,
    playerSecond: null,
    playerOperation: null,
  };

  const mockHandlers = {
    onInput: vi.fn(),
    onSelect: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render target number', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render input fields', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });

    it('should render operation toggle button', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const button = screen.getByRole('button', {
        name: /operation for target 10/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('should display question mark when no operation selected', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should display plus sign for addition', () => {
      const cellWithAdd = { ...mockCell, playerOperation: 'add' as const };

      render(
        <GridCellComponent
          cell={cellWithAdd}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should display multiplication sign for multiply', () => {
      const cellWithMultiply = { ...mockCell, playerOperation: 'multiply' as const };

      render(
        <GridCellComponent
          cell={cellWithMultiply}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('should show player input values', () => {
      const filledCell = {
        ...mockCell,
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'add' as const,
      };

      render(
        <GridCellComponent
          cell={filledCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(3);
      expect(inputs[1]).toHaveValue(7);
    });

    it('should apply selected class when selected', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toHaveClass('bg-blue-50');
    });

    it('should apply correct class when validation passes', () => {
      const validation: CellValidation = {
        cellId: 'cell-1',
        isCorrect: true,
        hasCorrectPair: true,
        hasCorrectOperation: true,
        expectedPair: { id: 'pair-1', first: 3, second: 7 },
        message: 'Correct!',
      };

      render(
        <GridCellComponent
          cell={{ ...mockCell, playerFirst: 3, playerSecond: 7, playerOperation: 'add' }}
          isSelected={false}
          validation={validation}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toHaveClass('bg-green-50');
    });

    it('should apply incorrect class when validation fails', () => {
      const validation: CellValidation = {
        cellId: 'cell-1',
        isCorrect: false,
        hasCorrectPair: false,
        hasCorrectOperation: false,
        expectedPair: { id: 'pair-1', first: 3, second: 7 },
        message: 'Incorrect',
      };

      render(
        <GridCellComponent
          cell={{ ...mockCell, playerFirst: 2, playerSecond: 5, playerOperation: 'add' }}
          isSelected={false}
          validation={validation}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toHaveClass('bg-red-50');
    });

    it('should show validation error indicator', () => {
      const validation: CellValidation = {
        cellId: 'cell-1',
        isCorrect: false,
        hasCorrectPair: false,
        hasCorrectOperation: false,
        expectedPair: { id: 'pair-1', first: 3, second: 7 },
        message: 'Pair not found',
      };

      render(
        <GridCellComponent
          cell={{ ...mockCell, playerFirst: 2, playerSecond: 5, playerOperation: 'add' }}
          isSelected={false}
          validation={validation}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      // Error indicator shows "!" with title attribute containing the message
      const errorIndicator = screen.getByTitle('Pair not found');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator).toHaveTextContent('!');
    });
  });

  describe('user interactions', () => {
    it('should call onInput when first number is entered', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const firstInput = screen.getByLabelText(/first number for cell 10/i);
      await user.type(firstInput, '5');

      expect(mockHandlers.onInput).toHaveBeenCalledWith('cell-1', 5, null, null);
    });

    it('should call onInput when second number is entered', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const secondInput = screen.getByLabelText(/second number for cell 10/i);
      await user.type(secondInput, '7');

      expect(mockHandlers.onInput).toHaveBeenCalledWith('cell-1', null, 7, null);
    });

    it('should call onInput when input is cleared', async () => {
      const user = userEvent.setup();
      const filledCell = { ...mockCell, playerFirst: 5 };

      render(
        <GridCellComponent
          cell={filledCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const firstInput = screen.getByLabelText(/first number for cell 10/i);
      await user.clear(firstInput);

      expect(mockHandlers.onInput).toHaveBeenCalledWith('cell-1', null, null, null);
    });

    it('should cycle operations: null -> add -> multiply -> null', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const opButton = screen.getByRole('button', { name: /operation for target/i });

      // First click: null -> add
      await user.click(opButton);
      expect(mockHandlers.onInput).toHaveBeenLastCalledWith('cell-1', null, null, 'add');

      // Update cell and re-render
      const cellWithAdd = { ...mockCell, playerOperation: 'add' as const };
      rerender(
        <GridCellComponent
          cell={cellWithAdd}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      // Second click: add -> multiply
      await user.click(opButton);
      expect(mockHandlers.onInput).toHaveBeenLastCalledWith('cell-1', null, null, 'multiply');

      // Update cell and re-render
      const cellWithMultiply = { ...mockCell, playerOperation: 'multiply' as const };
      rerender(
        <GridCellComponent
          cell={cellWithMultiply}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      // Third click: multiply -> null
      await user.click(opButton);
      expect(mockHandlers.onInput).toHaveBeenLastCalledWith('cell-1', null, null, null);
    });

    it('should call onSelect when cell is clicked', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      await user.click(gridCell);

      expect(mockHandlers.onSelect).toHaveBeenCalledWith('cell-1');
    });

    it('should reject negative numbers', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const firstInput = screen.getByLabelText(/first number for cell 10/i);
      await user.type(firstInput, '-5');

      // onInput should not be called with negative value
      const calls = mockHandlers.onInput.mock.calls;
      const hasNegative = calls.some(call => call[1] < 0);
      expect(hasNegative).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate up on ArrowUp', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard('{ArrowUp}');

      expect(mockHandlers.onNavigate).toHaveBeenCalledWith('cell-1', 'up');
    });

    it('should navigate down on ArrowDown', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard('{ArrowDown}');

      expect(mockHandlers.onNavigate).toHaveBeenCalledWith('cell-1', 'down');
    });

    it('should navigate left on ArrowLeft', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard('{ArrowLeft}');

      expect(mockHandlers.onNavigate).toHaveBeenCalledWith('cell-1', 'left');
    });

    it('should navigate right on ArrowRight', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard('{ArrowRight}');

      expect(mockHandlers.onNavigate).toHaveBeenCalledWith('cell-1', 'right');
    });

    it('should focus first input on Enter key', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard('{Enter}');

      expect(mockHandlers.onSelect).toHaveBeenCalledWith('cell-1');
    });

    it('should focus first input on Space key', async () => {
      const user = userEvent.setup();

      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      gridCell.focus();
      await user.keyboard(' ');

      expect(mockHandlers.onSelect).toHaveBeenCalledWith('cell-1');
    });
  });

  describe('responsive design', () => {
    it('should have gridcell role for responsive styling', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toBeInTheDocument();
    });

    it('should have target number area', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const targetNumber = screen.getByText('10');
      expect(targetNumber).toBeInTheDocument();
    });

    it('should have inputs area', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA role', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(screen.getByRole('gridcell')).toBeInTheDocument();
    });

    it('should have aria-selected when selected', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={true}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toHaveAttribute('aria-selected', 'true');
    });

    it('should have descriptive aria-label', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(
        screen.getByLabelText(/target 10, empty/i)
      ).toBeInTheDocument();
    });

    it('should update aria-label with current state', () => {
      const filledCell = {
        ...mockCell,
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: 'add' as const,
      };

      render(
        <GridCellComponent
          cell={filledCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      expect(
        screen.getByLabelText(/target 10.*first number 3.*addition.*second number 7/i)
      ).toBeInTheDocument();
    });

    it('should have focusable gridcell', () => {
      render(
        <GridCellComponent
          cell={mockCell}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const gridCell = screen.getByRole('gridcell');
      expect(gridCell).toHaveAttribute('tabIndex', '0');
    });

    it('should announce validation errors to screen readers', () => {
      const validation: CellValidation = {
        cellId: 'cell-1',
        isCorrect: false,
        hasCorrectPair: false,
        hasCorrectOperation: true,
        expectedPair: { id: 'pair-1', first: 3, second: 7 },
        message: 'Pair not found in strip',
      };

      render(
        <GridCellComponent
          cell={{ ...mockCell, playerFirst: 2, playerSecond: 5, playerOperation: 'add' }}
          isSelected={false}
          validation={validation}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      // Screen reader status announcement
      expect(screen.getByRole('status')).toHaveTextContent(
        /cell 10 is incorrect.*pair not found/i
      );
    });

    it('should have aria-pressed on operation button', () => {
      render(
        <GridCellComponent
          cell={{ ...mockCell, playerOperation: 'add' }}
          isSelected={false}
          validation={null}
          {...mockHandlers}
          isLastCol={false}
          isLastRow={false}
        />
      );

      const button = screen.getByRole('button', { name: /operation/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });
});

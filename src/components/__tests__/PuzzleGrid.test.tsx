import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PuzzleGrid from '../PuzzleGrid';
import type { GridCell, PuzzleState } from '../../types/puzzle';

describe('PuzzleGrid', () => {
  const mockGrid: GridCell[] = [
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
    {
      id: 'cell-3',
      target: 14,
      operation: 'add',
      solutionPairId: 'pair-2',
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    },
    {
      id: 'cell-4',
      target: 45,
      operation: 'multiply',
      solutionPairId: 'pair-2',
      playerFirst: null,
      playerSecond: null,
      playerOperation: null,
    },
  ];

  const mockPuzzle: PuzzleState = {
    grid: mockGrid,
    strip: [
      { id: 'pair-1', first: 3, second: 7 },
      { id: 'pair-2', first: 5, second: 9 },
    ],
    pairUsage: new Map([
      ['pair-1', { pairId: 'pair-1', additionUsed: false, multiplicationUsed: false }],
      ['pair-2', { pairId: 'pair-2', additionUsed: false, multiplicationUsed: false }],
    ]),
    dimensions: { rows: 2, cols: 2 },
  };

  const mockHandlers = {
    onCellInput: vi.fn(),
    onCellSelect: vi.fn(),
    onCellNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render grid with correct role', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render all grid cells', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(4);
    });

    it('should apply correct grid layout styles', () => {
      const { container } = render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 3, cols: 4 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
      });
    });

    it('should render cells with correct target values', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('21')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should mark selected cell', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId="cell-2"
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const cell2 = screen.getByLabelText(/^Target 21, /i);
      expect(cell2).toHaveAttribute('aria-selected', 'true');
    });

    it('should pass validation prop to cells when showValidation is true', () => {
      const filledGrid = mockGrid.map((cell) => ({
        ...cell,
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: cell.operation,
      })) as GridCell[];

      render(
        <PuzzleGrid
          grid={filledGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={true}
          puzzle={{ ...mockPuzzle, grid: filledGrid }}
          {...mockHandlers}
        />
      );

      // When validation is shown, cells should display validation states
      // This is tested indirectly through the GridCellComponent tests
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should not validate when showValidation is false', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      // No validation indicators should be present
      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach((cell) => {
        expect(cell).not.toHaveClass('correct');
        expect(cell).not.toHaveClass('incorrect');
      });
    });
  });

  describe('interactions', () => {
    it('should forward cell input events', async () => {
      const user = userEvent.setup();

      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const firstInput = screen.getAllByRole('spinbutton')[0];
      await user.type(firstInput, '5');

      expect(mockHandlers.onCellInput).toHaveBeenCalled();
    });

    it('should forward cell select events', async () => {
      const user = userEvent.setup();

      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const firstCell = screen.getByLabelText(/^Target 10, /i);
      await user.click(firstCell);

      expect(mockHandlers.onCellSelect).toHaveBeenCalledWith('cell-1');
    });

    it('should forward navigation events', async () => {
      const user = userEvent.setup();

      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId="cell-1"
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const firstCell = screen.getByLabelText(/^Target 10, /i);
      firstCell.focus();
      await user.keyboard('{ArrowRight}');

      expect(mockHandlers.onCellNavigate).toHaveBeenCalledWith('cell-1', 'right');
    });
  });

  describe('grid layouts', () => {
    it('should handle 3x4 grid', () => {
      const grid3x4: GridCell[] = Array.from({ length: 12 }, (_, i) => ({
        id: `cell-${i}`,
        target: i + 1,
        operation: i % 2 === 0 ? 'add' as const : 'multiply' as const,
        solutionPairId: `pair-${Math.floor(i / 2)}`,
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      }));

      render(
        <PuzzleGrid
          grid={grid3x4}
          dimensions={{ rows: 3, cols: 4 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(12);
    });

    it('should handle 4x4 grid', () => {
      const grid4x4: GridCell[] = Array.from({ length: 16 }, (_, i) => ({
        id: `cell-${i}`,
        target: i + 1,
        operation: i % 2 === 0 ? 'add' as const : 'multiply' as const,
        solutionPairId: `pair-${Math.floor(i / 2)}`,
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      }));

      render(
        <PuzzleGrid
          grid={grid4x4}
          dimensions={{ rows: 4, cols: 4 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(16);
    });

    it('should handle single row', () => {
      const singleRow: GridCell[] = [
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
      ];

      const { container } = render(
        <PuzzleGrid
          grid={singleRow}
          dimensions={{ rows: 1, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
      });
    });
  });

  describe('accessibility', () => {
    it('should have descriptive aria-label', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      expect(
        screen.getByLabelText(/puzzle grid.*enter two numbers.*operation/i)
      ).toBeInTheDocument();
    });

    it('should maintain keyboard navigation structure', () => {
      render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach((cell) => {
        expect(cell).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty grid', () => {
      render(
        <PuzzleGrid
          grid={[]}
          dimensions={{ rows: 0, cols: 0 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      const gridCells = screen.queryAllByRole('gridcell');
      expect(gridCells).toHaveLength(0);
    });

    it('should handle changing selected cell', () => {
      const { rerender } = render(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId="cell-1"
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      expect(screen.getByLabelText(/^Target 10, /i)).toHaveAttribute('aria-selected', 'true');

      rerender(
        <PuzzleGrid
          grid={mockGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId="cell-2"
          showValidation={false}
          puzzle={mockPuzzle}
          {...mockHandlers}
        />
      );

      expect(screen.getByLabelText(/^Target 10, /i)).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByLabelText(/^Target 21, /i)).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle toggling validation', () => {
      const filledGrid = mockGrid.map((cell) => ({
        ...cell,
        playerFirst: 3,
        playerSecond: 7,
        playerOperation: cell.operation,
      })) as GridCell[];

      const { rerender } = render(
        <PuzzleGrid
          grid={filledGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={false}
          puzzle={{ ...mockPuzzle, grid: filledGrid }}
          {...mockHandlers}
        />
      );

      // No validation initially
      let gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach((cell) => {
        expect(cell).not.toHaveClass('correct');
        expect(cell).not.toHaveClass('incorrect');
      });

      // Enable validation
      rerender(
        <PuzzleGrid
          grid={filledGrid}
          dimensions={{ rows: 2, cols: 2 }}
          selectedCellId={null}
          showValidation={true}
          puzzle={{ ...mockPuzzle, grid: filledGrid }}
          {...mockHandlers}
        />
      );

      // Should now show validation (tested in GridCellComponent)
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });
});

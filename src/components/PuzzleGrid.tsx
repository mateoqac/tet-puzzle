import type { GridCell, PuzzleState, Operation } from '../types/puzzle';
import { validateCell } from '../lib/puzzleValidator';
import GridCellComponent from './GridCellComponent';
import './PuzzleGrid.css';

interface PuzzleGridProps {
  grid: GridCell[];
  dimensions: { rows: number; cols: number };
  onCellInput: (
    cellId: string,
    first: number | null,
    second: number | null,
    operation: Operation | null
  ) => void;
  onCellSelect: (cellId: string) => void;
  onCellNavigate: (
    cellId: string,
    direction: 'up' | 'down' | 'left' | 'right'
  ) => void;
  selectedCellId: string | null;
  showValidation: boolean;
  puzzle: PuzzleState;
}

export default function PuzzleGrid({
  grid,
  dimensions,
  onCellInput,
  onCellSelect,
  onCellNavigate,
  selectedCellId,
  showValidation,
  puzzle,
}: PuzzleGridProps) {
  return (
    <div
      class="puzzle-grid"
      role="grid"
      aria-label="Puzzle grid - enter two numbers and select an operation for each target"
      style={{
        gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
        gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
      }}
    >
      {grid.map((cell) => {
        const validation = showValidation ? validateCell(cell, puzzle) : null;
        const isSelected = cell.id === selectedCellId;

        return (
          <GridCellComponent
            key={cell.id}
            cell={cell}
            isSelected={isSelected}
            validation={validation}
            onInput={onCellInput}
            onSelect={onCellSelect}
            onNavigate={onCellNavigate}
          />
        );
      })}
    </div>
  );
}

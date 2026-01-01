import type { GridCell, PuzzleState, Operation } from '../types/puzzle';
import { validateCell } from '../lib/puzzleValidator';
import GridCellComponent, { type SelectionField } from './GridCellComponent';
import type { InputMode } from '../lib/settings';

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
  inputMode?: InputMode;
  activeField?: SelectionField | null;
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
  inputMode = 'keyboard',
  activeField = null,
}: PuzzleGridProps) {
  return (
    <div
      class="grid mx-auto w-fit border border-black bg-white"
      role="grid"
      aria-label="Puzzle grid - enter two numbers and select an operation for each target"
      style={{
        gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
        gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
      }}
    >
      {grid.map((cell, index) => {
        const validation = showValidation ? validateCell(cell, puzzle) : null;
        const isSelected = cell.id === selectedCellId;
        const isLastCol = (index + 1) % dimensions.cols === 0;
        const isLastRow = index >= grid.length - dimensions.cols;

        return (
          <GridCellComponent
            key={cell.id}
            cell={cell}
            isSelected={isSelected}
            validation={validation}
            onInput={onCellInput}
            onSelect={onCellSelect}
            onNavigate={onCellNavigate}
            isLastCol={isLastCol}
            isLastRow={isLastRow}
            inputMode={inputMode}
            activeField={isSelected ? activeField : null}
          />
        );
      })}
    </div>
  );
}

import type { GridCell, CellValidation, Operation } from '../types/puzzle';
import './GridCellComponent.css';

interface GridCellComponentProps {
  cell: GridCell;
  isSelected: boolean;
  validation: CellValidation | null;
  onInput: (
    cellId: string,
    first: number | null,
    second: number | null,
    operation: Operation | null
  ) => void;
  onSelect: (cellId: string) => void;
  onNavigate: (cellId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
}

export default function GridCellComponent({
  cell,
  isSelected,
  validation,
  onInput,
  onSelect,
  onNavigate,
}: GridCellComponentProps) {
  const handleFirstInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value === '' ? null : parseInt(input.value, 10);
    if (value !== null && (isNaN(value) || value < 0)) {
      return;
    }
    onInput(cell.id, value, cell.playerSecond, cell.playerOperation);
  };

  const handleSecondInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const value = input.value === '' ? null : parseInt(input.value, 10);
    if (value !== null && (isNaN(value) || value < 0)) {
      return;
    }
    onInput(cell.id, cell.playerFirst, value, cell.playerOperation);
  };

  const handleOperationToggle = (e: Event) => {
    e.stopPropagation();
    // Cycle through: null -> add -> multiply -> null
    let nextOperation: Operation | null;
    if (cell.playerOperation === null) {
      nextOperation = 'add';
    } else if (cell.playerOperation === 'add') {
      nextOperation = 'multiply';
    } else {
      nextOperation = null;
    }
    onInput(cell.id, cell.playerFirst, cell.playerSecond, nextOperation);
  };

  const handleClick = () => {
    onSelect(cell.id);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onNavigate(cell.id, 'up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigate(cell.id, 'down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onNavigate(cell.id, 'left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNavigate(cell.id, 'right');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        // Focus first input when pressing Enter/Space on cell
        const firstInput = (e.target as HTMLElement).querySelector('input') as HTMLInputElement;
        firstInput?.focus();
        break;
    }
  };

  const getCellClassName = () => {
    const classes = ['grid-cell'];
    if (isSelected) classes.push('selected');
    if (validation) {
      if (validation.isCorrect) {
        classes.push('correct');
      } else if (
        cell.playerFirst !== null &&
        cell.playerSecond !== null &&
        cell.playerOperation !== null
      ) {
        classes.push('incorrect');
      }
    }
    return classes.join(' ');
  };

  const getOperationDisplay = () => {
    if (cell.playerOperation === 'add') return '+';
    if (cell.playerOperation === 'multiply') return '×';
    return '';
  };

  const getOperationLabel = () => {
    if (cell.playerOperation === 'add') return 'addition';
    if (cell.playerOperation === 'multiply') return 'multiplication';
    return 'none selected, click to cycle through add and multiply';
  };

  const getAccessibleDescription = () => {
    const parts: string[] = [];
    if (cell.playerFirst !== null) parts.push(`first number ${cell.playerFirst}`);
    if (cell.playerOperation) parts.push(`operation ${getOperationLabel()}`);
    if (cell.playerSecond !== null) parts.push(`second number ${cell.playerSecond}`);
    if (parts.length === 0) return 'empty';
    return parts.join(', ');
  };

  return (
    <div
      class={getCellClassName()}
      role="gridcell"
      aria-selected={isSelected}
      aria-label={`Target ${cell.target}, ${getAccessibleDescription()}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div class="cell-target">
        <span class="target-number">{cell.target}</span>
      </div>
      <div class="cell-inputs">
        <input
          type="number"
          min="0"
          max="99"
          class="cell-input"
          value={cell.playerFirst ?? ''}
          onInput={handleFirstInput}
          placeholder=""
          aria-label={`First number for cell ${cell.target}`}
        />
        <button
          type="button"
          class={`cell-operation ${
            cell.playerOperation === null
              ? 'no-operation'
              : cell.playerOperation === 'add'
              ? 'op-add'
              : 'op-multiply'
          }`}
          onClick={handleOperationToggle}
          aria-label={`Operation for target ${cell.target}: ${getOperationLabel()}`}
          aria-pressed={cell.playerOperation !== null}
          title="Click to cycle: + (add) → × (multiply) → clear"
        >
          {getOperationDisplay() || '?'}
        </button>
        <input
          type="number"
          min="0"
          max="99"
          class="cell-input"
          value={cell.playerSecond ?? ''}
          onInput={handleSecondInput}
          placeholder=""
          aria-label={`Second number for cell ${cell.target}`}
        />
      </div>
      {validation && !validation.isCorrect && cell.playerFirst !== null && (
        <div class="validation-message" title={validation.message} aria-hidden="true">
          !
        </div>
      )}
      {/* Screen reader announcement for validation state */}
      <div role="status" aria-live="polite" class="sr-only">
        {validation && !validation.isCorrect && cell.playerFirst !== null &&
          `Cell ${cell.target} is incorrect: ${validation.message}`
        }
      </div>
    </div>
  );
}

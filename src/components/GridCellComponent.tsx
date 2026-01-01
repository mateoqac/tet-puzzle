import type { GridCell, CellValidation, Operation } from '../types/puzzle';
import type { InputMode } from '../lib/settings';

export type SelectionField = 'first' | 'operation' | 'second';

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
  isLastCol: boolean;
  isLastRow: boolean;
  inputMode?: InputMode;
  activeField?: SelectionField | null;
}

export default function GridCellComponent({
  cell,
  isSelected,
  validation,
  onInput,
  onSelect,
  onNavigate,
  isLastCol,
  isLastRow,
  inputMode = 'keyboard',
  activeField = null,
}: GridCellComponentProps) {
  const isSelectionMode = inputMode === 'selection';
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
    const classes = [
      'w-[70px] sm:w-[90px] md:w-[100px] lg:w-[120px]',
      'flex flex-col cursor-pointer relative bg-white',
      !isLastCol ? 'border-r border-black' : '',
      !isLastRow ? 'border-b border-black' : '',
      'hover:bg-gray-50',
      'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 focus-visible:z-10',
    ];

    if (isSelected) classes.push('bg-blue-50');
    if (validation) {
      if (validation.isCorrect) {
        classes.push('bg-green-50');
      } else if (
        cell.playerFirst !== null &&
        cell.playerSecond !== null &&
        cell.playerOperation !== null
      ) {
        classes.push('bg-red-50');
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

  const getOperationClassName = () => {
    const base = [
      'w-1/3 h-full border-none bg-transparent text-center',
      'text-sm sm:text-base font-semibold text-black font-serif',
      'cursor-pointer outline-none p-0 flex items-center justify-center',
      'transition-colors duration-150',
      'border-r border-black',
    ];

    if (!isSelectionMode) {
      base.push('focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:-outline-offset-2 focus-visible:bg-blue-100');
    }

    // Active field highlighting in selection mode
    if (isSelectionMode && isSelected && activeField === 'operation') {
      base.push('bg-blue-200 ring-2 ring-blue-500 ring-inset');
    } else if (cell.playerOperation === null) {
      base.push('text-gray-400 italic font-normal');
      base.push('hover:bg-gray-100');
    } else if (cell.playerOperation === 'add') {
      base.push('bg-blue-100 hover:bg-blue-200');
    } else if (cell.playerOperation === 'multiply') {
      base.push('bg-orange-100 hover:bg-orange-200');
    }

    return base.join(' ');
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
      {/* Correct checkmark */}
      {validation?.isCorrect && (
        <span class="absolute top-1 left-1 text-green-700 text-sm font-bold">✓</span>
      )}

      <div class="flex items-center justify-center h-[45px] sm:h-[50px] md:h-[55px] lg:h-[60px] border-b border-dashed border-black">
        <span class="text-lg sm:text-xl md:text-2xl font-normal text-black font-serif">{cell.target}</span>
      </div>

      <div class="flex items-stretch justify-center h-[36px] sm:h-[40px] md:h-[42px] lg:h-[44px] relative">
        <input
          type="number"
          min="0"
          max="99"
          class={`w-1/3 h-full border-none bg-transparent text-center text-xs sm:text-sm font-normal text-black font-serif outline-none border-r border-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            isSelectionMode
              ? `cursor-pointer ${isSelected && activeField === 'first' ? 'bg-blue-200 ring-2 ring-blue-500 ring-inset' : ''}`
              : 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:-outline-offset-2 focus-visible:bg-blue-100'
          }`}
          value={cell.playerFirst ?? ''}
          onInput={isSelectionMode ? undefined : handleFirstInput}
          readOnly={isSelectionMode}
          placeholder=""
          aria-label={`First number for cell ${cell.target}`}
        />
        <button
          type="button"
          class={getOperationClassName()}
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
          class={`w-1/3 h-full border-none bg-transparent text-center text-xs sm:text-sm font-normal text-black font-serif outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            isSelectionMode
              ? `cursor-pointer ${isSelected && activeField === 'second' ? 'bg-blue-200 ring-2 ring-blue-500 ring-inset' : ''}`
              : 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:-outline-offset-2 focus-visible:bg-blue-100'
          }`}
          value={cell.playerSecond ?? ''}
          onInput={isSelectionMode ? undefined : handleSecondInput}
          readOnly={isSelectionMode}
          placeholder=""
          aria-label={`Second number for cell ${cell.target}`}
        />

        {/* Tick marks at bottom */}
        <span class="absolute bottom-0 left-[16.66%] w-px h-2 bg-black -translate-x-1/2" />
        <span class="absolute bottom-0 right-[16.66%] w-px h-2 bg-black translate-x-1/2" />
      </div>

      {validation && !validation.isCorrect && cell.playerFirst !== null && (
        <div class="absolute top-0.5 right-0.5 bg-red-600 text-white w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold" title={validation.message} aria-hidden="true">
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

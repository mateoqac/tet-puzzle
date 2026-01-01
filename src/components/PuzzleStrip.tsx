import { useState } from 'preact/hooks';
import type { NumberPair } from '../types/puzzle';
import type { InputMode } from '../lib/settings';

interface PuzzleStripProps {
  strip: NumberPair[];
  inputMode?: InputMode;
  onNumberSelect?: (number: number) => void;
}

export default function PuzzleStrip({ strip, inputMode = 'keyboard', onNumberSelect }: PuzzleStripProps) {
  const isSelectionMode = inputMode === 'selection';
  // Track which indices are crossed out
  const [crossedOut, setCrossedOut] = useState<Set<number>>(new Set());
  // Track user inputs for blank cells
  const [blankInputs, setBlankInputs] = useState<Map<number, string>>(new Map());

  // Extract all numbers with their display value and sort value
  const allItems: Array<{ displayValue: number | null; sortValue: number }> = [];

  strip.forEach((pair) => {
    // First number
    const firstSortValue = pair.firstOriginal ?? pair.first ?? 0;
    allItems.push({
      displayValue: pair.first,
      sortValue: firstSortValue,
    });

    // Second number
    const secondSortValue = pair.secondOriginal ?? pair.second ?? 0;
    allItems.push({
      displayValue: pair.second,
      sortValue: secondSortValue,
    });
  });

  // Sort by the original value (ascending)
  allItems.sort((a, b) => a.sortValue - b.sortValue);

  // Toggle crossed out state for a number or select in selection mode
  const handleClick = (index: number, hasValue: boolean, displayValue: number | null) => {
    if (!hasValue) return; // Don't toggle blanks

    // In selection mode, call onNumberSelect instead of toggling
    if (isSelectionMode && onNumberSelect && displayValue !== null) {
      onNumberSelect(displayValue);
      // Also toggle crossed state for visual feedback
      setCrossedOut((prev) => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
      return;
    }

    setCrossedOut((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Handle input change for blank cells
  const handleBlankInput = (index: number, value: string) => {
    setBlankInputs((prev) => {
      const newMap = new Map(prev);
      if (value === '') {
        newMap.delete(index);
      } else {
        newMap.set(index, value);
      }
      return newMap;
    });

    // Clear crossed state when value is cleared
    if (value === '') {
      setCrossedOut((prev) => {
        if (prev.has(index)) {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        }
        return prev;
      });
    }
  };

  // Toggle crossed out state for blank inputs
  const handleBlankClick = (index: number, hasValue: boolean) => {
    if (!hasValue) return;

    setCrossedOut((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const totalItems = allItems.length;

  return (
    <div class="grid grid-cols-8 sm:grid-cols-16 w-fit mx-auto mt-6 border border-gray-300 rounded overflow-hidden">
      {allItems.map((item, index) => {
        const isBlank = item.displayValue === null;
        const isCrossed = crossedOut.has(index);
        const isLastInRow = (index + 1) % 8 === 0;
        const isLastInRowDesktop = (index + 1) % 16 === 0;
        const isSecondRow = index >= 8;

        // Base styles for grid separators (thin gray lines)
        const borderClasses = `
          ${!isLastInRow ? 'border-r border-gray-300 sm:border-r' : 'sm:border-r sm:border-gray-300'}
          ${isLastInRowDesktop ? 'sm:!border-r-0' : ''}
          ${isSecondRow ? 'border-t border-gray-300 sm:border-t-0' : ''}
        `;

        if (isBlank) {
          const blankValue = blankInputs.get(index) || '';
          const hasBlankValue = blankValue.length > 0;

          return (
            <div key={index} class={`${borderClasses} p-0.5`}>
              <input
                type="text"
                class={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center font-serif text-sm sm:text-base font-normal text-black outline-none text-center p-0 bg-gray-50 border-2 border-dashed border-blue-300 rounded-sm focus:bg-blue-50 focus:border-blue-400 ${
                  isCrossed && hasBlankValue ? 'line-through decoration-2 bg-red-200 !border-red-300 cursor-pointer' : ''
                }`}
                value={blankValue}
                onInput={(e) => handleBlankInput(index, (e.target as HTMLInputElement).value)}
                onClick={(e) => {
                  if (hasBlankValue) {
                    e.preventDefault();
                    handleBlankClick(index, true);
                  }
                }}
                onFocus={(e) => {
                  if (hasBlankValue && isCrossed) {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                maxLength={2}
                aria-label={`Blank number ${index + 1}`}
              />
            </div>
          );
        }

        return (
          <span
            key={index}
            class={`${borderClasses} w-7 sm:w-9 h-7 sm:h-9 flex items-center justify-center bg-white font-serif text-sm sm:text-base font-normal text-black cursor-pointer hover:bg-gray-100 ${
              isCrossed ? 'line-through decoration-2 bg-red-200 hover:bg-red-200' : ''
            } ${isSelectionMode && !isCrossed ? 'hover:bg-blue-100' : ''}`}
            onClick={() => handleClick(index, true, item.displayValue)}
          >
            {item.displayValue}
          </span>
        );
      })}
    </div>
  );
}

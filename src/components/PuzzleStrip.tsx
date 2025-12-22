import { useState } from 'preact/hooks';
import type { NumberPair } from '../types/puzzle';
import './PuzzleStrip.css';

interface PuzzleStripProps {
  strip: NumberPair[];
}

export default function PuzzleStrip({ strip }: PuzzleStripProps) {
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

  // Toggle crossed out state for a number
  const handleClick = (index: number, hasValue: boolean) => {
    if (!hasValue) return; // Don't toggle blanks

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

  return (
    <div class="puzzle-strip">
      {allItems.map((item, index) => {
        const isBlank = item.displayValue === null;
        const isCrossed = crossedOut.has(index);

        if (isBlank) {
          const blankValue = blankInputs.get(index) || '';
          const hasBlankValue = blankValue.length > 0;

          return (
            <input
              key={index}
              type="text"
              class={`strip-number blank-input ${isCrossed && hasBlankValue ? 'crossed' : ''}`}
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
          );
        }

        return (
          <span
            key={index}
            class={`strip-number ${isCrossed ? 'crossed' : ''}`}
            onClick={() => handleClick(index, true)}
          >
            {item.displayValue}
          </span>
        );
      })}
    </div>
  );
}

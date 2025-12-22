import { useState } from 'preact/hooks';
import confetti from 'canvas-confetti';
import type { PuzzleState, Operation } from '../types/puzzle';
import { validatePuzzle } from '../lib/puzzleValidator';
import {
  generateBeginnerPuzzle,
  generateIntermediatePuzzle,
  generateAdvancedPuzzle,
} from '../lib/puzzleGenerator';
import PuzzleGrid from './PuzzleGrid';
import PuzzleStrip from './PuzzleStrip';
import SuccessModal from './SuccessModal';
import './TetPuzzle.css';

type Difficulty = 'easy' | 'moderate' | 'difficult';

interface TetPuzzleProps {
  initialPuzzle: PuzzleState;
}

export default function TetPuzzle({ initialPuzzle }: TetPuzzleProps) {
  const [puzzle, setPuzzle] = useState<PuzzleState>(initialPuzzle);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stripKey, setStripKey] = useState(0);

  // Generate new puzzle based on difficulty
  const generateNewPuzzle = (newDifficulty: Difficulty) => {
    let newPuzzle: PuzzleState;

    switch (newDifficulty) {
      case 'easy':
        newPuzzle = generateBeginnerPuzzle();
        break;
      case 'moderate':
        newPuzzle = generateIntermediatePuzzle();
        break;
      case 'difficult':
        newPuzzle = generateAdvancedPuzzle();
        break;
    }

    setPuzzle(newPuzzle);
    setDifficulty(newDifficulty);
    setSelectedCell(null);
    setShowValidation(false);
    setStripKey((prev) => prev + 1);
  };

  // Update cell input (numbers and operation)
  const handleCellInput = (
    cellId: string,
    first: number | null,
    second: number | null,
    operation: Operation | null
  ) => {
    setPuzzle((prev) => ({
      ...prev,
      grid: prev.grid.map((cell) =>
        cell.id === cellId
          ? { ...cell, playerFirst: first, playerSecond: second, playerOperation: operation }
          : cell
      ),
    }));
    setShowValidation(false);
  };

  // Handle cell selection
  const handleCellSelect = (cellId: string) => {
    setSelectedCell(cellId);
  };

  // Handle keyboard navigation between cells
  const handleCellNavigate = (
    cellId: string,
    direction: 'up' | 'down' | 'left' | 'right'
  ) => {
    const currentIndex = puzzle.grid.findIndex((c) => c.id === cellId);
    if (currentIndex === -1) return;

    const { cols, rows } = puzzle.dimensions;
    const currentRow = Math.floor(currentIndex / cols);
    const currentCol = currentIndex % cols;

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(rows - 1, currentRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, currentCol - 1);
        break;
      case 'right':
        newCol = Math.min(cols - 1, currentCol + 1);
        break;
    }

    const newIndex = newRow * cols + newCol;
    if (newIndex !== currentIndex && newIndex < puzzle.grid.length) {
      const newCell = puzzle.grid[newIndex];
      setSelectedCell(newCell.id);
      // Focus the new cell element
      setTimeout(() => {
        const cellElement = document.querySelector(
          `[aria-label^="Target ${newCell.target}"]`
        ) as HTMLElement;
        cellElement?.focus();
      }, 0);
    }
  };

  // Trigger confetti celebration
  const triggerConfetti = () => {
    const burst = () => {
      // Center burst
      confetti({
        particleCount: 240,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 120,
          angle: 60,
          spread: 50,
          origin: { x: 0, y: 0.6 },
        });
        confetti({
          particleCount: 120,
          angle: 120,
          spread: 50,
          origin: { x: 1, y: 0.6 },
        });
      }, 200);
    };

    // First burst
    burst();

    // Second burst after 1.5 seconds
    setTimeout(burst, 1500);
  };

  // Check solution
  const handleCheckSolution = () => {
    setShowValidation(true);
    const validation = validatePuzzle(puzzle);

    if (validation.isCorrect) {
      triggerConfetti();
      setShowModal(true);
    }
  };

  // Handle play again from modal
  const handlePlayAgain = () => {
    setShowModal(false);
    generateNewPuzzle(difficulty);
  };

  // Reset puzzle
  const handleReset = () => {
    setPuzzle((prev) => ({
      ...prev,
      grid: prev.grid.map((cell) => ({
        ...cell,
        playerFirst: null,
        playerSecond: null,
        playerOperation: null,
      })),
    }));
    setShowValidation(false);
    setSelectedCell(null);
    setStripKey((prev) => prev + 1);
  };

  // Check if puzzle is filled (all numbers and operations selected)
  const isPuzzleFilled = puzzle.grid.every(
    (cell) =>
      cell.playerFirst !== null &&
      cell.playerSecond !== null &&
      cell.playerOperation !== null
  );

  return (
    <div class="tet-puzzle">
      <div class="puzzle-header">
        <h1>Tet Puzzle</h1>
        <p class="puzzle-instructions">
          Use each pair of numbers from the strip below exactly twice: once for
          addition and once for multiplication.
        </p>
      </div>

      <div class="difficulty-selector">
        <button
          class={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => generateNewPuzzle('easy')}
        >
          Easy
        </button>
        <button
          class={`difficulty-btn ${difficulty === 'moderate' ? 'active' : ''}`}
          onClick={() => generateNewPuzzle('moderate')}
        >
          Moderate
        </button>
        <button
          class={`difficulty-btn ${difficulty === 'difficult' ? 'active' : ''}`}
          onClick={() => generateNewPuzzle('difficult')}
        >
          Difficult
        </button>
      </div>

      <PuzzleGrid
        grid={puzzle.grid}
        dimensions={puzzle.dimensions}
        onCellInput={handleCellInput}
        onCellSelect={handleCellSelect}
        onCellNavigate={handleCellNavigate}
        selectedCellId={selectedCell}
        showValidation={showValidation}
        puzzle={puzzle}
      />

      <PuzzleStrip key={stripKey} strip={puzzle.strip} />

      {showValidation && (
        <div
          role="alert"
          class={`validation-summary ${
            validatePuzzle(puzzle).isCorrect ? 'success' : 'error'
          }`}
        >
          {validatePuzzle(puzzle).isCorrect ? (
            <span>✓ All cells are correct!</span>
          ) : (
            <span>
              ✗ {puzzle.grid.filter((cell) => {
                const v = validatePuzzle(puzzle);
                const cellValidation = v.cellValidations.find((cv) => cv.cellId === cell.id);
                return cellValidation && !cellValidation.isCorrect &&
                  cell.playerFirst !== null &&
                  cell.playerSecond !== null &&
                  cell.playerOperation !== null;
              }).length} cell(s) need correction
            </span>
          )}
        </div>
      )}

      <div class="puzzle-controls">
        <button
          onClick={handleCheckSolution}
          disabled={!isPuzzleFilled}
          class="btn btn-primary"
        >
          Check Solution
        </button>
        <button onClick={handleReset} class="btn btn-secondary">
          Reset
        </button>
        {/* TODO: Uncomment to test success animation
        <button
          onClick={() => {
            triggerConfetti();
            setShowModal(true);
          }}
          class="btn btn-secondary"
          style={{ background: '#ffe0e0' }}
        >
          Test Success
        </button> */}

      </div>

      <SuccessModal isOpen={showModal} onPlayAgain={handlePlayAgain} />
    </div>
  );
}

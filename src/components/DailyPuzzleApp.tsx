import { useState, useCallback, useEffect } from 'preact/hooks';
import confetti from 'canvas-confetti';
import type { PuzzleState, Operation } from '../types/puzzle';
import { validatePuzzle, getHintForCell } from '../lib/puzzleValidator';
import { recordGameWin, type Difficulty as StatsDifficulty, isDailyCompleted, recordDailyCompletion } from '../lib/statistics';
import { getSettings, type Settings } from '../lib/settings';
import { I18nContext, useI18n, useTranslation } from '../i18n';
import PuzzleGrid from './PuzzleGrid';
import PuzzleStrip from './PuzzleStrip';
import SuccessBanner from './SuccessBanner';
import Header from './Header';
import StatsDisplay from './StatsDisplay';
import SettingsPanel from './SettingsPanel';
import Footer from './Footer';
import type { SelectionField } from './GridCellComponent';

interface DailyPuzzleAppProps {
  initialPuzzle: PuzzleState;
  dateString: string;
  puzzleNumber: number;
  difficulty: string;
}

function DailyPuzzleInner({ initialPuzzle, dateString, puzzleNumber, difficulty }: DailyPuzzleAppProps) {
  const { t } = useTranslation();
  const [puzzle, setPuzzle] = useState<PuzzleState>(initialPuzzle);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [stripKey, setStripKey] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(isDailyCompleted(dateString));

  // Settings
  const [settings, setSettings] = useState<Settings>(getSettings());

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(!dailyCompleted);

  // Stats and modals
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  // Hint state
  const [hintsRemaining, setHintsRemaining] = useState(1);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Selection mode state
  const [activeField, setActiveField] = useState<SelectionField>('first');

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Update cell input
  const handleCellInput = (
    cellId: string,
    first: number | null,
    second: number | null,
    operation: Operation | null
  ) => {
    // Get current cell state to detect changes
    const currentCell = puzzle.grid.find((c) => c.id === cellId);

    setPuzzle((prev) => ({
      ...prev,
      grid: prev.grid.map((cell) =>
        cell.id === cellId
          ? { ...cell, playerFirst: first, playerSecond: second, playerOperation: operation }
          : cell
      ),
    }));
    setShowValidation(false);

    // In selection mode, advance field when operation is set
    if (settings.inputMode === 'selection' && cellId === selectedCell && currentCell) {
      if (currentCell.playerOperation === null && operation !== null) {
        setActiveField('second');
      }
    }
  };

  // Handle cell selection
  const handleCellSelect = (cellId: string) => {
    setSelectedCell(cellId);
  };

  // Handle keyboard navigation
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
    }
  };

  // Handle number selection from strip (selection mode)
  const handleStripNumberSelect = (number: number) => {
    if (!selectedCell || settings.inputMode !== 'selection') return;

    const cell = puzzle.grid.find((c) => c.id === selectedCell);
    if (!cell) return;

    // Place number in the active field
    if (activeField === 'first') {
      handleCellInput(selectedCell, number, cell.playerSecond, cell.playerOperation);
      setActiveField('operation');
    } else if (activeField === 'second') {
      handleCellInput(selectedCell, cell.playerFirst, number, cell.playerOperation);
      // Move to next incomplete cell
      moveToNextCell();
    }
  };

  // Move to the next incomplete cell after completing current one
  const moveToNextCell = () => {
    const currentIndex = puzzle.grid.findIndex((c) => c.id === selectedCell);
    if (currentIndex === -1) return;

    // Find next incomplete cell
    for (let i = 1; i <= puzzle.grid.length; i++) {
      const nextIndex = (currentIndex + i) % puzzle.grid.length;
      const nextCell = puzzle.grid[nextIndex];
      if (
        nextCell.playerFirst === null ||
        nextCell.playerSecond === null ||
        nextCell.playerOperation === null
      ) {
        setSelectedCell(nextCell.id);
        setActiveField('first');
        return;
      }
    }
    // All cells filled, stay on current
    setActiveField('first');
  };

  // Handle cell selection (update for selection mode)
  const handleCellSelectWithMode = (cellId: string) => {
    setSelectedCell(cellId);
    // In selection mode, determine which field to activate based on cell state
    if (settings.inputMode === 'selection') {
      const cell = puzzle.grid.find((c) => c.id === cellId);
      if (cell) {
        if (cell.playerFirst === null) {
          setActiveField('first');
        } else if (cell.playerOperation === null) {
          setActiveField('operation');
        } else if (cell.playerSecond === null) {
          setActiveField('second');
        } else {
          setActiveField('first'); // Reset if all filled
        }
      }
    }
  };

  // Confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 240,
      spread: 70,
      origin: { y: 0.6 },
    });

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

  // Check solution
  const handleCheckSolution = () => {
    setShowValidation(true);
    const validation = validatePuzzle(puzzle);

    if (validation.isCorrect) {
      setIsTimerRunning(false);

      if (!dailyCompleted) {
        recordDailyCompletion(dateString);
        setDailyCompleted(true);
        recordGameWin(difficulty as StatsDifficulty, elapsedTime, usedHint);
      }

      triggerConfetti();
      setShowSuccessBanner(true);
    }
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
    setShowSuccessBanner(false);
    setSelectedCell(null);
    setStripKey((prev) => prev + 1);
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // Handle hint
  const handleHint = () => {
    if (hintsRemaining <= 0) return;

    let cellToHint = selectedCell
      ? puzzle.grid.find((c) => c.id === selectedCell)
      : puzzle.grid.find(
          (c) =>
            c.playerFirst === null ||
            c.playerSecond === null ||
            c.playerOperation === null
        );

    if (!cellToHint) {
      const validation = validatePuzzle(puzzle);
      const incorrectCell = validation.cellValidations.find((cv) => !cv.isCorrect);
      if (incorrectCell) {
        cellToHint = puzzle.grid.find((c) => c.id === incorrectCell.cellId);
      }
    }

    if (cellToHint) {
      const hint = getHintForCell(cellToHint, puzzle);
      if (hint) {
        setCurrentHint(hint);
        setHintsRemaining((prev) => prev - 1);
        setUsedHint(true);
        setSelectedCell(cellToHint.id);
      }
    }
  };

  const isPuzzleFilled = puzzle.grid.every(
    (cell) =>
      cell.playerFirst !== null &&
      cell.playerSecond !== null &&
      cell.playerOperation !== null
  );

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    moderate: 'bg-blue-100 text-blue-700',
    difficult: 'bg-red-100 text-red-700',
  };

  return (
    <div class="max-w-[800px] mx-auto">
      <Header
        elapsedTime={elapsedTime}
        showTimer={settings.showTimer}
        onOpenStats={() => setShowStats(true)}
        onOpenArchive={() => window.location.href = '/daily/archive'}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div class="p-8 md:p-4 font-serif bg-white rounded-xl shadow-sm mt-4">
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-3 mb-2">
            <h1 class="text-[1.75rem] md:text-2xl font-bold text-gray-900 font-serif">
              {t('dailyChallenge')} #{puzzleNumber}
            </h1>
            <span class={`px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}>
              {t(difficulty as 'easy' | 'moderate' | 'difficult')}
            </span>
          </div>
          <p class="text-sm md:text-base text-gray-600 max-w-[500px] mx-auto leading-relaxed">
            {t('instructions')}
          </p>
          {dailyCompleted && (
            <div class="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('completed')}
            </div>
          )}
        </div>

        <PuzzleGrid
          grid={puzzle.grid}
          dimensions={puzzle.dimensions}
          onCellInput={handleCellInput}
          onCellSelect={handleCellSelectWithMode}
          onCellNavigate={handleCellNavigate}
          selectedCellId={selectedCell}
          showValidation={showValidation}
          puzzle={puzzle}
          inputMode={settings.inputMode}
          activeField={activeField}
        />

        <PuzzleStrip
          key={stripKey}
          strip={puzzle.strip}
          inputMode={settings.inputMode}
          onNumberSelect={handleStripNumberSelect}
        />

        <div class="flex flex-col items-center gap-3 mt-4 mb-2">
          <button
            onClick={handleHint}
            disabled={hintsRemaining <= 0}
            class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hintsRemaining > 0 ? t('hint') : t('noHintsLeft')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              {t('hint')} ({hintsRemaining})
            </span>
          </button>
          {currentHint && (
            <div class="px-5 py-3 bg-amber-50 border border-amber-500 rounded-lg text-[0.95rem] text-amber-800 text-center max-w-[300px]" role="alert">
              {currentHint}
            </div>
          )}
        </div>

        {showValidation && (
          <div
            role="alert"
            class={`mt-4 px-4 py-3 rounded-lg text-center text-[0.95rem] font-medium ${
              validatePuzzle(puzzle).isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {validatePuzzle(puzzle).isCorrect ? (
              <span>✓ {t('allCorrect')}</span>
            ) : (
              <span>
                ✗ {puzzle.grid.filter((cell) => {
                  const v = validatePuzzle(puzzle);
                  const cellValidation = v.cellValidations.find((cv) => cv.cellId === cell.id);
                  return cellValidation && !cellValidation.isCorrect &&
                    cell.playerFirst !== null &&
                    cell.playerSecond !== null &&
                    cell.playerOperation !== null;
                }).length} {t('cellsNeedCorrection')}
              </span>
            )}
          </div>
        )}

        <div class="flex gap-4 justify-center mt-8 md:flex-col">
          <button
            onClick={handleCheckSolution}
            disabled={!isPuzzleFilled}
            class="min-h-[44px] px-6 py-3 text-base font-medium rounded-lg cursor-pointer transition-all duration-150 font-sans bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed md:w-full"
          >
            {t('checkSolution')}
          </button>
          <button
            onClick={handleReset}
            class="min-h-[44px] px-6 py-3 text-base font-medium border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 font-sans bg-white text-gray-700 hover:bg-gray-50 md:w-full"
          >
            {t('reset')}
          </button>
        </div>

        {/* View Archive Link */}
        <a
          href="/daily/archive"
          class="flex items-center gap-3 p-4 mt-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group no-underline"
        >
          <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-600">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-medium text-gray-700">{t('viewAllChallenges')}</span>
            <span class="block text-xs text-gray-500">{t('exploreAndTrack')}</span>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-gray-400 group-hover:text-gray-600 transition-colors"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>

      <SuccessBanner isVisible={showSuccessBanner} onViewArchive={() => window.location.href = '/daily/archive'} elapsedTime={elapsedTime} />
      <StatsDisplay isOpen={showStats} onClose={() => setShowStats(false)} />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
      />
      <Footer />
    </div>
  );
}

export default function DailyPuzzleApp(props: DailyPuzzleAppProps) {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <DailyPuzzleInner {...props} />
    </I18nContext.Provider>
  );
}

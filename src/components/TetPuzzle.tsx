import { useState, useCallback, useEffect } from 'preact/hooks';
import confetti from 'canvas-confetti';
import type { PuzzleState, Operation } from '../types/puzzle';
import { validatePuzzle, getHintForCell } from '../lib/puzzleValidator';
import {
  generateBeginnerPuzzle,
  generateIntermediatePuzzle,
  generateAdvancedPuzzle,
} from '../lib/puzzleGenerator';
import { recordGameWin, type Difficulty as StatsDifficulty } from '../lib/statistics';
import {
  getTodaysDailyPuzzle,
  isTodaysDailyCompleted,
  recordTodaysDailyCompletion,
  getDailyChallengeNumber,
  getDailyChallengeDifficulty,
} from '../lib/dailyChallenge';
import { getTodayDateString } from '../lib/seededRandom';
import { getSettings, type Settings } from '../lib/settings';
import { useTranslation } from '../i18n';
import PuzzleGrid from './PuzzleGrid';
import PuzzleStrip from './PuzzleStrip';
import SuccessBanner from './SuccessBanner';
import Timer from './Timer';
import StatsDisplay from './StatsDisplay';
import DailyArchive from './DailyArchive';
import SettingsPanel from './SettingsPanel';
import type { SelectionField } from './GridCellComponent';

type Difficulty = 'easy' | 'moderate' | 'difficult';
type GameMode = 'daily' | 'free';

interface TetPuzzleProps {
  initialPuzzle: PuzzleState;
}

export default function TetPuzzle({ initialPuzzle }: TetPuzzleProps) {
  const { t } = useTranslation();
  const [puzzle, setPuzzle] = useState<PuzzleState>(initialPuzzle);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameMode, setGameMode] = useState<GameMode>('free');
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [stripKey, setStripKey] = useState(0);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Stats state
  const [showStats, setShowStats] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [usedHint, setUsedHint] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<Settings>(getSettings());

  // Hint state
  const [hintsRemaining, setHintsRemaining] = useState(1);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Selection mode state
  const [activeField, setActiveField] = useState<SelectionField>('first');

  const handleTimerTick = useCallback(() => {
    setElapsedTime((prev) => prev + 1);
  }, []);

  // Switch to daily mode
  const switchToDaily = () => {
    const dailyPuzzle = getTodaysDailyPuzzle();
    setPuzzle(dailyPuzzle);
    setGameMode('daily');
    setDailyCompleted(isTodaysDailyCompleted());
    setSelectedCell(null);
    setShowValidation(false);
    setShowSuccessBanner(false);
    setStripKey((prev) => prev + 1);
    setElapsedTime(0);
    setIsTimerRunning(!isTodaysDailyCompleted());
    setUsedHint(false);
    setHintsRemaining(1);
    setCurrentHint(null);
  };

  // Switch to free play mode
  const switchToFreePlay = () => {
    setGameMode('free');
    generateNewPuzzle(difficulty);
  };

  // Handle selecting a puzzle from archive
  const handleArchivePuzzleSelect = (archivePuzzle: PuzzleState, _dateString: string) => {
    setPuzzle(archivePuzzle);
    setGameMode('daily');
    setSelectedCell(null);
    setShowValidation(false);
    setShowSuccessBanner(false);
    setStripKey((prev) => prev + 1);
    setElapsedTime(0);
    setIsTimerRunning(true);
    setUsedHint(false);
    setHintsRemaining(1);
    setCurrentHint(null);
  };

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
    setShowSuccessBanner(false);
    setStripKey((prev) => prev + 1);
    // Reset timer and hints
    setElapsedTime(0);
    setIsTimerRunning(true);
    setUsedHint(false);
    setHintsRemaining(1);
    setCurrentHint(null);
  };

  // Update cell input (numbers and operation)
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
      // If operation was just set (was null, now not null), advance to 'second'
      if (currentCell.playerOperation === null && operation !== null) {
        setActiveField('second');
      }
    }
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
      setIsTimerRunning(false); // Stop timer on success

      if (gameMode === 'daily') {
        // Record daily completion
        recordTodaysDailyCompletion();
        setDailyCompleted(true);
        // Also record as moderate difficulty win
        recordGameWin('moderate' as StatsDifficulty, elapsedTime, usedHint);
      } else {
        // Record win in statistics
        recordGameWin(difficulty as StatsDifficulty, elapsedTime, usedHint);
      }

      triggerConfetti();
      setShowSuccessBanner(true);
    }
  };

  // Handle viewing archive from success banner
  const handleViewArchive = () => {
    setShowArchive(true);
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
    // Reset timer
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // Handle hint request
  const handleHint = () => {
    if (hintsRemaining <= 0) return;

    // If no cell selected, select the first incomplete cell
    let cellToHint = selectedCell
      ? puzzle.grid.find((c) => c.id === selectedCell)
      : puzzle.grid.find(
          (c) =>
            c.playerFirst === null ||
            c.playerSecond === null ||
            c.playerOperation === null
        );

    if (!cellToHint) {
      // If all cells are filled, find the first incorrect one
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

  // Check if puzzle is filled (all numbers and operations selected)
  const isPuzzleFilled = puzzle.grid.every(
    (cell) =>
      cell.playerFirst !== null &&
      cell.playerSecond !== null &&
      cell.playerOperation !== null
  );

  return (
    <div class="max-w-[800px] mx-auto p-8 md:p-4 font-serif bg-white rounded-xl shadow-sm">
      <div class="text-center mb-6">
        <h1 class="text-[1.75rem] md:text-2xl font-bold text-gray-900 mb-2 font-serif">{t('title')}</h1>
        <p class="text-sm md:text-base text-gray-600 max-w-[500px] mx-auto leading-relaxed">
          {t('instructions')}
        </p>
      </div>

      <div class="flex justify-center gap-2 mb-4">
        <button
          class={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 ${
            gameMode === 'daily'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={switchToDaily}
        >
          {t('dailyChallenge')}
          {dailyCompleted && gameMode === 'daily' && (
            <span class="ml-2 text-emerald-400 font-bold" title={t('completed')}>✓</span>
          )}
        </button>
        <button
          class={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 ${
            gameMode === 'free'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={switchToFreePlay}
        >
          {t('freePlay')}
        </button>
      </div>

      <div class="flex items-center justify-center gap-6 mb-6 flex-wrap">
        {gameMode === 'free' && (
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <button
              class={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 font-sans focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
                difficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
              onClick={() => generateNewPuzzle('easy')}
            >
              {t('easy')}
            </button>
            <button
              class={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 font-sans focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
                difficulty === 'moderate' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              onClick={() => generateNewPuzzle('moderate')}
            >
              {t('moderate')}
            </button>
            <button
              class={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 font-sans focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
                difficulty === 'difficult' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
              onClick={() => generateNewPuzzle('difficult')}
            >
              {t('difficult')}
            </button>
          </div>
        )}
        {gameMode === 'daily' && (
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 italic">{t('todaysPuzzle')}</span>
            <button
              class="inline-flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg cursor-pointer text-gray-500 transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              onClick={() => setShowArchive(true)}
              title={t('archive')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </div>
        )}
        {settings.showTimer && (
          <Timer
            elapsedTime={elapsedTime}
            isRunning={isTimerRunning}
            onTick={handleTimerTick}
          />
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
          class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={hintsRemaining > 0 ? t('hint') : t('noHintsLeft')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            {t('hint')} ({hintsRemaining})
          </span>
        </button>
        {currentHint && (
          <div class="px-5 py-3 bg-amber-50 border border-amber-400 rounded-lg text-[0.95rem] text-amber-800 text-center max-w-[300px]" role="alert">
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

      <div class="flex gap-3 justify-center mt-8 md:flex-col">
        <button
          onClick={handleCheckSolution}
          disabled={!isPuzzleFilled}
          class="min-h-[44px] px-6 py-3 text-base font-medium rounded-lg cursor-pointer transition-all duration-150 font-sans bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 md:w-full"
        >
          {t('checkSolution')}
        </button>
        <button
          onClick={handleReset}
          class="min-h-[44px] px-6 py-3 text-base font-medium border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 font-sans bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 md:w-full"
        >
          {t('reset')}
        </button>
        <div class="flex gap-2">
          <button
            onClick={() => setShowStats(true)}
            class="min-h-[44px] px-3 py-3 text-base font-medium border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 font-sans bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 inline-flex items-center justify-center"
            aria-label={t('statistics')}
            title={t('statistics')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="block">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            class="min-h-[44px] px-3 py-3 text-base font-medium border border-gray-300 rounded-lg cursor-pointer transition-all duration-150 font-sans bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600 focus-visible:outline-offset-2 inline-flex items-center justify-center"
            aria-label={t('settings')}
            title={t('settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="block">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* View All Challenges Link - shown when in daily mode */}
      {gameMode === 'daily' && (
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
      )}

      <SuccessBanner isVisible={showSuccessBanner} onViewArchive={handleViewArchive} elapsedTime={elapsedTime} />
      <StatsDisplay isOpen={showStats} onClose={() => setShowStats(false)} />
      <DailyArchive
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onSelectPuzzle={handleArchivePuzzleSelect}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

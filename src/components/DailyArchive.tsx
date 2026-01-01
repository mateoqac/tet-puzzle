import { useState, useEffect } from 'preact/hooks';
import { useTranslation } from '../i18n';
import {
  getDailyChallengeList,
  generateDailyPuzzle,
  type DailyChallengeInfo,
} from '../lib/dailyChallenge';
import type { PuzzleState } from '../types/puzzle';

interface DailyArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPuzzle: (puzzle: PuzzleState, dateString: string) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const { t } = useTranslation();

  const colors = {
    easy: 'bg-green-100 text-green-700',
    moderate: 'bg-blue-100 text-blue-700',
    difficult: 'bg-red-100 text-red-700',
  };

  return (
    <span
      class={`px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded ${colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700'}`}
    >
      {t(difficulty as 'easy' | 'moderate' | 'difficult')}
    </span>
  );
}

export default function DailyArchive({ isOpen, onClose, onSelectPuzzle }: DailyArchiveProps) {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<DailyChallengeInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      setChallenges(getDailyChallengeList());
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (challenge: DailyChallengeInfo) => {
    const puzzle = generateDailyPuzzle(challenge.dateString);
    onSelectPuzzle(puzzle, challenge.dateString);
    onClose();
  };

  if (!isOpen) return null;

  const completedCount = challenges.filter((c) => c.isCompleted).length;

  return (
    <div
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-[1000] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div class="bg-white rounded-xl shadow-xl max-w-[90%] w-[400px] relative animate-slide-up overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 id="archive-title" class="font-serif text-xl font-bold text-gray-900">{t('archive')}</h2>
            <p class="text-sm text-gray-500">{completedCount}/{challenges.length} {t('completed').toLowerCase()}</p>
          </div>
          <button
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="p-4 max-h-[60vh] overflow-y-auto">
          <ul class="space-y-2">
            {challenges.map((challenge) => (
              <li key={challenge.dateString}>
                <button
                  class={`w-full p-4 bg-white rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 text-left hover:shadow-md ${
                    challenge.isToday ? 'border-emerald-500 border-2' : 'border-gray-200 hover:border-gray-300'
                  } ${challenge.isCompleted ? 'border-l-4 border-l-emerald-500' : ''}`}
                  onClick={() => handleSelect(challenge)}
                >
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-bold text-gray-900">#{challenge.puzzleNumber}</span>
                      {challenge.isToday && (
                        <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-medium">
                          {t('todaysPuzzle')}
                        </span>
                      )}
                    </div>
                    <span class="text-sm text-gray-500">{challenge.displayDate}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DifficultyBadge difficulty={challenge.difficulty} />
                    {challenge.isCompleted && (
                      <div class="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-emerald-600">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* View All Link */}
          <a
            href="/daily/archive"
            class="flex items-center justify-center gap-2 mt-4 py-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium no-underline"
          >
            {t('viewAllChallenges')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

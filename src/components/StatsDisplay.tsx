import { useState, useEffect } from 'preact/hooks';
import { useTranslation } from '../i18n';
import {
  getStats,
  getAverageTime,
  formatTimeStats,
  type GameStats,
  type Difficulty,
} from '../lib/statistics';
import ShareButton from './ShareButton';

interface StatsDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsDisplay({ isOpen, onClose }: StatsDisplayProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  useEffect(() => {
    if (isOpen) {
      setStats(getStats());
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !stats) return null;

  const totalPlayed =
    stats.gamesPlayed.easy + stats.gamesPlayed.moderate + stats.gamesPlayed.difficult;
  const totalWon = stats.gamesWon.easy + stats.gamesWon.moderate + stats.gamesWon.difficult;
  const hasStats = totalPlayed > 0;

  return (
    <div
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-[1000] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div class="bg-white rounded-xl shadow-xl max-w-[90%] w-[380px] relative animate-slide-up overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="stats-title" class="font-serif text-xl font-bold text-gray-900">
            {t('statistics')}
          </h2>
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

        <div class="p-6">
          {!hasStats ? (
            /* Empty State */
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400">
                  <path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 3 18.88 3 17.2 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 5.28 2 6.12 2 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17Z" />
                  <path d="M12 7v4l2 2" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">{t('noStatsYet')}</h3>
              <p class="text-sm text-gray-500 max-w-[250px] mx-auto">{t('completeFirstPuzzle')}</p>
            </div>
          ) : (
            /* Stats Content */
            <>
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <span class="block text-2xl font-bold text-gray-900 font-mono">{totalPlayed}</span>
                  <span class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">{t('gamesPlayed')}</span>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <span class="block text-2xl font-bold text-gray-900 font-mono">{totalWon}</span>
                  <span class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">{t('gamesWon')}</span>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <span class="block text-2xl font-bold text-gray-900 font-mono">{stats.currentStreak}</span>
                  <span class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">{t('currentStreak')}</span>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <span class="block text-2xl font-bold text-gray-900 font-mono">{stats.longestStreak}</span>
                  <span class="block text-xs text-gray-500 mt-1 uppercase tracking-wide">{t('longestStreak')}</span>
                </div>
              </div>

              <div class="flex gap-2 mb-4">
                {(['easy', 'moderate', 'difficult'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    class={`flex-1 p-2 text-sm rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedDifficulty === diff
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {t(diff)}
                  </button>
                ))}
              </div>

              <div class="bg-gray-50 rounded-xl p-4 mb-6">
                <div class="flex justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500 text-sm">{t('gamesPlayed')}</span>
                  <span class="font-semibold text-gray-900 font-mono">{stats.gamesPlayed[selectedDifficulty]}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500 text-sm">{t('gamesWon')}</span>
                  <span class="font-semibold text-gray-900 font-mono">{stats.gamesWon[selectedDifficulty]}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500 text-sm">{t('bestTime')}</span>
                  <span class="font-semibold text-gray-900 font-mono">{formatTimeStats(stats.bestTime[selectedDifficulty])}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-500 text-sm">{t('averageTime')}</span>
                  <span class="font-semibold text-gray-900 font-mono">{formatTimeStats(getAverageTime(selectedDifficulty))}</span>
                </div>
              </div>
            </>
          )}

          {/* Share Button - always visible */}
          <ShareButton stats={stats} />
        </div>
      </div>
    </div>
  );
}

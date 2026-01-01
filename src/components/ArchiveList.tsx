import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { useTranslation, useI18n, I18nContext } from '../i18n';
import {
  getAllDailyChallenges,
  type DailyChallengeInfo,
} from '../lib/dailyChallenge';
import Footer from './Footer';

const ITEMS_PER_PAGE = 20;

type SortMode = 'id-desc' | 'id-asc' | 'progress';

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

function ArchiveListInner() {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<DailyChallengeInfo[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('id-desc');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChallenges(getAllDailyChallenges());
  }, []);

  // Reset visible count when sort mode changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [sortMode]);

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const totalCount = challenges.length;
  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sortedChallenges = [...challenges].sort((a, b) => {
    switch (sortMode) {
      case 'id-asc':
        return a.puzzleNumber - b.puzzleNumber;
      case 'id-desc':
        return b.puzzleNumber - a.puzzleNumber;
      case 'progress':
        // Completed last, incomplete first, then by date
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return b.puzzleNumber - a.puzzleNumber;
      default:
        return 0;
    }
  });

  const visibleChallenges = sortedChallenges.slice(0, visibleCount);
  const hasMore = visibleCount < sortedChallenges.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-serif font-bold text-center text-gray-900 mb-8">
        {t('archiveGames')}
      </h1>

      {/* Progress Bar */}
      <div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm text-gray-600">
            {t('completed')}: <strong class="text-gray-900">{completedCount}</strong>
          </div>
          <strong class="text-gray-900">{completedPercent}%</strong>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completedPercent}%` }}
          />
        </div>
      </div>

      {/* Sort Buttons */}
      <div class="flex gap-2 mb-4">
        <button
          class={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
            sortMode.startsWith('id')
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
          }`}
          onClick={() => setSortMode(sortMode === 'id-desc' ? 'id-asc' : 'id-desc')}
        >
          {t('sortById')} {sortMode === 'id-asc' ? '↑' : '↓'}
        </button>
        <button
          class={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
            sortMode === 'progress'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
          }`}
          onClick={() => setSortMode('progress')}
        >
          {t('sortByProgress')}
        </button>
      </div>

      {/* Challenge List */}
      <div class="space-y-2">
        {visibleChallenges.map((challenge) => (
          <a
            key={challenge.dateString}
            href={`/daily/${challenge.dateString}`}
            class={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 no-underline group ${
              challenge.isCompleted ? 'border-l-4 border-emerald-500' : ''
            }`}
          >
            <div class="flex items-center gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-gray-900">#{challenge.puzzleNumber}</span>
                  {challenge.isToday && (
                    <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-medium">
                      {t('todaysPuzzle')}
                    </span>
                  )}
                </div>
                <span class="text-sm text-gray-500">{challenge.displayDate}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <DifficultyBadge difficulty={challenge.difficulty} />
              {challenge.isCompleted && (
                <div class="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-gray-300 group-hover:text-gray-500 transition-colors"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Loader for infinite scroll */}
      {hasMore && (
        <div ref={loaderRef} class="py-8 text-center">
          <div class="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      <Footer />
    </div>
  );
}

// Wrapper with i18n context
export default function ArchiveList() {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <ArchiveListInner />
    </I18nContext.Provider>
  );
}

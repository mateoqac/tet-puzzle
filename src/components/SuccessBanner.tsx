import { useTranslation } from '../i18n';

interface SuccessBannerProps {
  isVisible: boolean;
  onViewArchive: () => void;
  elapsedTime?: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SuccessBanner({ isVisible, onViewArchive, elapsedTime }: SuccessBannerProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <button
      class="flex items-center gap-4 w-full px-5 py-4 mt-6 bg-gradient-to-br from-blue-500 to-blue-600 border-none rounded-xl cursor-pointer transition-all duration-200 text-left animate-slide-in hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-300 focus-visible:outline-offset-2 sm:px-4 sm:py-3.5 sm:gap-3"
      onClick={onViewArchive}
      aria-label={t('viewAllChallenges')}
    >
      <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-white shrink-0 sm:w-9 sm:h-9">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sm:w-5 sm:h-5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div class="flex-1 flex flex-col gap-1">
        <span class="text-base font-semibold text-white font-sans sm:text-[0.95rem]">{t('viewAllChallenges')}</span>
        <span class="text-[0.85rem] text-white/85 font-sans sm:text-[0.8rem]">
          {elapsedTime !== undefined && (
            <span class="font-medium">{t('yourTime')}: {formatTime(elapsedTime)} · </span>
          )}
          {t('exploreAndTrack')}
        </span>
      </div>
      <div class="text-white/80 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}

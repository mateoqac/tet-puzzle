import { useTranslation, type Language } from '../i18n';
import { formatTimeStats } from '../lib/statistics';

interface HeaderProps {
  elapsedTime: number;
  showTimer: boolean;
  onOpenStats: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  elapsedTime,
  showTimer,
  onOpenStats,
  onOpenArchive,
  onOpenSettings,
}: HeaderProps) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <header class="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-100">
      {/* Logo */}
      <a href="/" class="flex items-center gap-2 no-underline">
        <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
          <span class="text-white font-bold text-sm">T</span>
        </div>
        <span class="font-serif font-bold text-gray-900 text-lg hidden sm:block">Tetonor</span>
      </a>

      {/* Timer (center) */}
      {showTimer && (
        <div class="flex items-center gap-2 text-gray-600">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-gray-400"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span class="font-mono text-base font-medium tabular-nums">
            {formatTimeStats(elapsedTime)}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div class="flex items-center gap-1">
        {/* Language Selector */}
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden mr-2">
          <button
            class={`px-2 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 ${
              language === 'en'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setLanguage('en')}
            aria-label={t('english')}
            title={t('english')}
          >
            EN
          </button>
          <button
            class={`px-2 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 ${
              language === 'es'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setLanguage('es')}
            aria-label={t('spanish')}
            title={t('spanish')}
          >
            ES
          </button>
        </div>

        {/* Archive Button */}
        <button
          onClick={onOpenArchive}
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          aria-label={t('archive')}
          title={t('archive')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>

        {/* Stats Button */}
        <button
          onClick={onOpenStats}
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          aria-label={t('statistics')}
          title={t('statistics')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          aria-label={t('settings')}
          title={t('settings')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

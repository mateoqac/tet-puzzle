import type { PuzzleState } from '../types/puzzle';
import { I18nContext, useI18n, useTranslation, type Language } from '../i18n';
import TetPuzzle from './TetPuzzle';
import Footer from './Footer';

interface AppProps {
  initialPuzzle: PuzzleState;
}

function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div class="absolute top-0 right-0 flex gap-1 z-10 md:static md:justify-end md:mb-2">
      <button
        class={`px-2 py-1 border text-xs font-medium cursor-pointer transition-all duration-200 rounded-sm focus:outline focus:outline-2 focus:outline-gray-800 focus:outline-offset-1 ${
          language === 'en'
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
        }`}
        onClick={() => setLanguage('en')}
        aria-label={t('english')}
        title={t('english')}
      >
        EN
      </button>
      <button
        class={`px-2 py-1 border text-xs font-medium cursor-pointer transition-all duration-200 rounded-sm focus:outline focus:outline-2 focus:outline-gray-800 focus:outline-offset-1 ${
          language === 'es'
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
        }`}
        onClick={() => setLanguage('es')}
        aria-label={t('spanish')}
        title={t('spanish')}
      >
        ES
      </button>
    </div>
  );
}

export default function App({ initialPuzzle }: AppProps) {
  const i18n = useI18n();

  return (
    <I18nContext.Provider value={i18n}>
      <div class="relative">
        <LanguageSelector />
        <TetPuzzle initialPuzzle={initialPuzzle} />
        <Footer />
      </div>
    </I18nContext.Provider>
  );
}

import { createContext } from 'preact';
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import { translations, type Language, type TranslationKey } from './translations';

const STORAGE_KEY = 'tet-puzzle-language';

// Detect browser language
function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
}

// Get initial language from localStorage or browser
function getInitialLanguage(): Language {
  if (typeof localStorage === 'undefined') return getBrowserLanguage();

  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored;
  }
  return getBrowserLanguage();
}

// Context type
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

// Create context with default values
export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key],
});

// Hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Hook for i18n state management (use this in the root component)
export function useI18n(serverLang?: Language) {
  const [language, setLanguageState] = useState<Language>(serverLang || 'en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    // If server provided a language, use it as default but allow user override from localStorage
    const storedLang = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) as Language | null : null;

    // Priority: stored preference > server-provided lang > browser detection
    if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
      setLanguageState(storedLang);
    } else if (serverLang) {
      setLanguageState(serverLang);
    } else {
      setLanguageState(getInitialLanguage());
    }
    setIsInitialized(true);
  }, [serverLang]);

  // Set language and persist to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    // Navigate to the correct URL for the language
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      let newPath: string;

      if (lang === 'es') {
        // If not already on /es/, add /es/ prefix
        if (!currentPath.startsWith('/es')) {
          newPath = '/es' + (currentPath === '/' ? '/' : currentPath);
        } else {
          return; // Already on Spanish URL
        }
      } else {
        // If on /es/, remove the prefix
        if (currentPath.startsWith('/es')) {
          newPath = currentPath.replace(/^\/es/, '') || '/';
        } else {
          return; // Already on English URL
        }
      }

      // Ensure trailing slash
      if (!newPath.endsWith('/')) {
        newPath += '/';
      }

      window.location.href = newPath;
    }
  }, []);

  // Translation function
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    isInitialized,
  };
}

// Export types and translations for external use
export { translations, type Language, type TranslationKey };

// Server-side translation helper for Astro pages
export function getTranslations(lang: Language) {
  return (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };
}

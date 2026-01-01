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
export function useI18n() {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguageState(initialLang);
    setIsInitialized(true);
  }, []);

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

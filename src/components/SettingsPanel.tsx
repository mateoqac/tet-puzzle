import { useState, useEffect } from 'preact/hooks';
import { useTranslation } from '../i18n';
import { getSettings, updateSetting, type Settings, type InputMode } from '../lib/settings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsPanel({ isOpen, onClose, onSettingsChange }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleInputModeChange = (mode: InputMode) => {
    const newSettings = updateSetting('inputMode', mode);
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleToggle = (key: 'showTimer' | 'startWithDaily') => {
    const newSettings = updateSetting(key, !settings[key]);
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-[1000] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div class="bg-white rounded-xl shadow-xl max-w-[90%] w-[380px] relative animate-slide-up overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="settings-title" class="font-serif text-xl font-bold text-gray-900">
            {t('settings')}
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

        <div class="p-6 space-y-6">
          {/* Input Mode */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">{t('inputMode')}</label>
            <div class="grid grid-cols-2 gap-3">
              {/* Keyboard Option */}
              <button
                class={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  settings.inputMode === 'keyboard'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputModeChange('keyboard')}
              >
                <div class="flex items-center gap-2 mb-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class={settings.inputMode === 'keyboard' ? 'text-emerald-600' : 'text-gray-400'}
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="8" x2="6" y2="8" />
                    <line x1="10" y1="8" x2="10" y2="8" />
                    <line x1="14" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="8" x2="18" y2="8" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="16" x2="18" y2="16" />
                  </svg>
                  <span class={`font-medium ${settings.inputMode === 'keyboard' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {t('keyboard')}
                  </span>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">{t('keyboardDesc')}</p>
              </button>

              {/* Selection Option */}
              <button
                class={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  settings.inputMode === 'selection'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleInputModeChange('selection')}
              >
                <div class="flex items-center gap-2 mb-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class={settings.inputMode === 'selection' ? 'text-emerald-600' : 'text-gray-400'}
                  >
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                  </svg>
                  <span class={`font-medium ${settings.inputMode === 'selection' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {t('selection')}
                  </span>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">{t('selectionDesc')}</p>
              </button>
            </div>
          </div>

          {/* Toggle Options */}
          <div class="space-y-4">
            {/* Show Timer */}
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-sm font-medium text-gray-700">{t('showTimer')}</span>
                <span class="block text-xs text-gray-500 mt-0.5">{t('showTimerDesc')}</span>
              </div>
              <button
                role="switch"
                aria-checked={settings.showTimer}
                onClick={() => handleToggle('showTimer')}
                class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.showTimer ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  class={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    settings.showTimer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Start with Daily */}
            <div class="flex items-center justify-between">
              <div>
                <span class="block text-sm font-medium text-gray-700">{t('startWithDaily')}</span>
                <span class="block text-xs text-gray-500 mt-0.5">{t('startWithDailyDesc')}</span>
              </div>
              <button
                role="switch"
                aria-checked={settings.startWithDaily}
                onClick={() => handleToggle('startWithDaily')}
                class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.startWithDaily ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  class={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    settings.startWithDaily ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Daily Challenge Link */}
          <a
            href="/daily/archive"
            class="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group no-underline"
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
              <span class="block text-sm font-medium text-gray-700">{t('playDailyChallenge')}</span>
              <span class="block text-xs text-gray-500">{t('playTodaysPuzzle')}</span>
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
      </div>
    </div>
  );
}

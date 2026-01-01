export type InputMode = 'keyboard' | 'selection';

export interface Settings {
  inputMode: InputMode;
  showTimer: boolean;
  startWithDaily: boolean;
}

const STORAGE_KEY = 'tet-puzzle-settings';

const DEFAULT_SETTINGS: Settings = {
  inputMode: 'keyboard',
  showTimer: true,
  startWithDaily: false,
};

// Get settings from localStorage
export function getSettings(): Settings {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(stored) as Partial<Settings>;
    // Merge with defaults to handle missing fields from older versions
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// Save settings to localStorage
export function saveSettings(settings: Settings): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

// Update a single setting
export function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Settings {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  return settings;
}

// Reset settings to defaults
export function resetSettings(): Settings {
  const settings = { ...DEFAULT_SETTINGS };
  saveSettings(settings);
  return settings;
}

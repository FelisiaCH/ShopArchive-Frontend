import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_LANGUAGE, type LanguageCode } from '../i18n/languages';

/**
 * The interface language — belongs to the person using the app on this device (docs/I18N.md,
 * "Two independent language settings"). Deliberately a separate store from
 * `receiptLanguageStore.ts`: the receipt language belongs to the shop, not the person, and
 * changing one must never change the other. Persisted under its own `sa_` key so the two are
 * independent in storage as well as in code.
 */
const STORAGE_KEY = 'sa_language';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ language: state.language }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LanguageCode } from '../i18n/languages';

/**
 * The receipt language — a shop setting, not a personal one (docs/I18N.md, "Two independent
 * language settings": "the person reading a printed receipt is usually not the person who
 * recorded the sale"). `'app'` means "same as the interface language" and is the default, matching
 * the export's Settings screen. This store exists only to keep the setting real and independent
 * of `languageStore.ts` in this phase — F8 builds the screen that actually changes it.
 */
const STORAGE_KEY = 'sa_receipt_language';

export type ReceiptLanguage = LanguageCode | 'app';

interface ReceiptLanguageState {
  receiptLanguage: ReceiptLanguage;
  setReceiptLanguage: (receiptLanguage: ReceiptLanguage) => void;
}

export const useReceiptLanguageStore = create<ReceiptLanguageState>()(
  persist(
    (set) => ({
      receiptLanguage: 'app',
      setReceiptLanguage: (receiptLanguage) => set({ receiptLanguage }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ receiptLanguage: state.receiptLanguage }),
    },
  ),
);

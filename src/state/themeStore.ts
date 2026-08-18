import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme selection — the one piece of genuine UI state F1 needs, so it is the first real use of
 * Zustand (CLAUDE.md: "UI state | Zustand, for UI concerns only — never as a cache for server
 * data"). It was installed in F0 and unused until now.
 *
 * Four choices, matching F1.md: light, dark, oled, and system (follow the OS). `system` never
 * resolves to `oled` — the OS has no OLED preference to report, only light/dark — so a shop that
 * wants the true-black theme has to choose it explicitly.
 */
export type ThemeMode = 'light' | 'dark' | 'oled' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/** Client storage keys are prefixed `sa_` (CLAUDE.md naming convention). */
const STORAGE_KEY = 'sa_theme';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);

/** Applies `mode` to `<html data-theme>`, where every token in `tokens.css` reads it from. */
export function applyThemeAttribute(mode: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', mode);
}

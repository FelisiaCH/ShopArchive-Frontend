import { useEffect } from 'react';

import { useLanguageStore } from './languageStore';

/**
 * Keeps `<html lang>` in sync with the store — every screen reader and `:lang()` CSS rule reads
 * it from there, including the Lao/Thai line-height fix in `global.css`. The inline script in
 * `index.html` sets it before first paint from the same `sa_language` storage, mirroring how
 * `useApplyTheme` avoids a theme flash; this hook takes over for every change after.
 */
export function useApplyLanguage(): void {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
}

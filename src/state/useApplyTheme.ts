import { useEffect } from 'react';

import { applyThemeAttribute, useThemeStore } from './themeStore';

/**
 * Keeps `<html data-theme>` in sync with the store. Call once near the app root. The inline
 * script in `index.html` sets the same attribute before first paint (from the same `sa_theme`
 * storage) so there is no flash of the wrong theme while React boots; this hook takes over from
 * there for every change after.
 */
export function useApplyTheme(): void {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyThemeAttribute(mode);
  }, [mode]);
}

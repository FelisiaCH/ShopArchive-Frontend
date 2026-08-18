import { useEffect, useState } from 'react';

import { useLanguageStore } from '../state/languageStore';
import {
  cacheKey,
  getCachedDictionary,
  getFallbackDictionary,
  loadDictionary,
  type Namespace,
} from './loader';

/** Substitutes `{{name}}` placeholders. Whole sentences carry their own placeholders
 *  (docs/I18N.md: "No sentence assembly from fragments") — this never concatenates strings. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

function readPath(dict: unknown, path: string): string | undefined {
  let cursor: unknown = dict;
  for (const segment of path.split('.')) {
    if (typeof cursor !== 'object' || cursor === null || !(segment in cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Loads the current interface language's dictionary for one namespace and returns a `t()` that
 * reads from it, falling back to English for a key the active language hasn't translated yet
 * (docs/I18N.md: "English is the reference. A missing key falls back to English"). `ready` is
 * false only while a language that was never loaded before (Lao or Thai, the first time) is
 * being fetched — `t()` still returns usable text during that window, via the English fallback,
 * so nothing renders blank.
 */
export function useTranslation(namespace: Namespace = 'common') {
  const language = useLanguageStore((state) => state.language);

  // Keyed by language+namespace so a dictionary that finished loading for a language the user has
  // since navigated away from is never mistaken for the current one (no stale-language flash).
  const [loaded, setLoaded] = useState<{
    key: string;
    dict: ReturnType<typeof getFallbackDictionary>;
  } | null>(null);

  useEffect(() => {
    // Already in memory (English always is) — nothing to load, so nothing to set from an effect.
    if (getCachedDictionary(language, namespace)) return;

    let cancelled = false;
    void loadDictionary(language, namespace).then((dict) => {
      if (!cancelled) setLoaded({ key: cacheKey(language, namespace), dict });
    });
    return () => {
      cancelled = true;
    };
  }, [language, namespace]);

  const cached = getCachedDictionary(language, namespace);
  const key = cacheKey(language, namespace);
  const current = cached ?? (loaded && loaded.key === key ? loaded.dict : undefined);
  const ready = current !== undefined;
  const dict = current ?? getFallbackDictionary(namespace);
  const fallback = getFallbackDictionary(namespace);

  function t(path: string, vars?: Record<string, string | number>): string {
    const value = readPath(dict, path) ?? readPath(fallback, path) ?? path;
    return interpolate(value, vars);
  }

  return { t, ready, language };
}

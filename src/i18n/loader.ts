import enCommonJson from './en/common.json';
import type { CommonDictionary } from './dictionaries';
import { DEFAULT_LANGUAGE, type LanguageCode } from './languages';

export type Namespace = 'common';

type DictionaryFor<N extends Namespace> = N extends 'common' ? CommonDictionary : never;

const enCommon: CommonDictionary = enCommonJson;

/**
 * One loader per language per namespace. English resolves synchronously — it is the reference
 * language (docs/I18N.md) and the fallback every other language reads through, so it has to be
 * available before anything asks for it. Lao and Thai are `import()`, loaded only once a shop
 * actually picks them ("each language is a separate file loaded on demand", docs/I18N.md) —
 * fifteen more will join this map as their own translations are finished, never all at once.
 */
const loaders: { [L in LanguageCode]: { [N in Namespace]: () => Promise<DictionaryFor<N>> } } = {
  en: { common: () => Promise.resolve(enCommon) },
  lo: { common: () => import('./lo/common.json').then((mod) => mod.default) },
  th: { common: () => import('./th/common.json').then((mod) => mod.default) },
};

const cache = new Map<string, unknown>();
cache.set(cacheKey('en', 'common'), enCommon);

export function cacheKey(language: LanguageCode, namespace: Namespace): string {
  return `${language}:${namespace}`;
}

/** Returns a dictionary only if it is already in memory — never triggers a load. */
export function getCachedDictionary<N extends Namespace>(
  language: LanguageCode,
  namespace: N,
): DictionaryFor<N> | undefined {
  return cache.get(cacheKey(language, namespace)) as DictionaryFor<N> | undefined;
}

export async function loadDictionary<N extends Namespace>(
  language: LanguageCode,
  namespace: N,
): Promise<DictionaryFor<N>> {
  const cached = getCachedDictionary(language, namespace);
  if (cached) return cached;
  const dict = await loaders[language][namespace]();
  cache.set(cacheKey(language, namespace), dict);
  return dict;
}

const fallbacks: { [N in Namespace]: DictionaryFor<N> } = {
  common: enCommon,
};

/** Always available synchronously — the fallback text a missing key or a still-loading language
 *  falls back to (docs/I18N.md: "A missing key falls back to English"). */
export function getFallbackDictionary<N extends Namespace>(namespace: N): DictionaryFor<N> {
  return fallbacks[namespace];
}

export { DEFAULT_LANGUAGE };

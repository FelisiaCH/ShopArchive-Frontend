/**
 * The three languages docs/I18N.md ships complete. Fifteen more shipped with the old project as
 * a starting point there — none of them are wired up here, since a screen half in English is
 * worse than a screen entirely in English, and this phase only has to prove the system for the
 * three that are actually finished.
 */
export type LanguageCode = 'en' | 'lo' | 'th';

export interface LanguageInfo {
  code: LanguageCode;
  /** The language's own name, written in its own script — shown in a picker regardless of which
   *  language is currently active, the way every OS language switcher does it. */
  nativeName: string;
}

export const LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'lo', nativeName: 'ລາວ' },
  { code: 'th', nativeName: 'ไทย' },
];

/** English is the reference language (docs/I18N.md): every other language falls back to it, and
 *  it is the one dictionary loaded eagerly rather than on demand. */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}

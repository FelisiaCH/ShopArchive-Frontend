import { afterEach, beforeEach, expect, test } from 'vitest';

import { useLanguageStore } from './languageStore';

beforeEach(() => {
  localStorage.clear();
  useLanguageStore.setState({ language: 'en' });
});

afterEach(() => {
  localStorage.clear();
});

test('defaults to English, the reference language', () => {
  expect(useLanguageStore.getState().language).toBe('en');
});

test('setLanguage updates the store and persists under the sa_ prefixed key', () => {
  useLanguageStore.getState().setLanguage('lo');
  expect(useLanguageStore.getState().language).toBe('lo');

  const stored = localStorage.getItem('sa_language');
  expect(stored).not.toBeNull();
  expect(JSON.parse(stored as string).state.language).toBe('lo');
});

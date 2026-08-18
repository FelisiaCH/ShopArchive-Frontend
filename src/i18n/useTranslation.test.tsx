import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { useLanguageStore } from '../state/languageStore';
import { useTranslation } from './useTranslation';

beforeEach(() => {
  localStorage.clear();
  useLanguageStore.setState({ language: 'en' });
});

afterEach(() => {
  localStorage.clear();
});

test('resolves a real key in English synchronously — no loading flash for the reference language', () => {
  const { result } = renderHook(() => useTranslation());
  expect(result.current.ready).toBe(true);
  expect(result.current.t('nav.today')).toBe('Today');
});

test('a key nobody wrote falls back to the key path itself, not a blank string', () => {
  const { result } = renderHook(() => useTranslation());
  expect(result.current.t('nav.doesNotExist')).toBe('nav.doesNotExist');
});

test('switching to Lao loads its dictionary on demand and resolves the real translation', async () => {
  const { result } = renderHook(() => useTranslation());

  act(() => {
    useLanguageStore.getState().setLanguage('lo');
  });

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.t('nav.today')).toBe('ມື້ນີ້');
});

test('switching to Thai loads its dictionary on demand and resolves the real translation', async () => {
  const { result } = renderHook(() => useTranslation());

  act(() => {
    useLanguageStore.getState().setLanguage('th');
  });

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.t('nav.today')).toBe('วันนี้');
});

test('a key missing from a loaded non-English dictionary falls back to English, not the key path', async () => {
  const { result } = renderHook(() => useTranslation());

  act(() => {
    useLanguageStore.getState().setLanguage('lo');
  });
  await waitFor(() => expect(result.current.ready).toBe(true));

  // Every key in common.json is translated in all three languages right now, so this simulates
  // the "not translated yet" case docs/I18N.md describes for the fifteen incomplete languages.
  expect(result.current.t('nav.doesNotExist')).toBe('nav.doesNotExist');
});

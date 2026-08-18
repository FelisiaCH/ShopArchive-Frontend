import { afterEach, beforeEach, expect, test } from 'vitest';

import { useLanguageStore } from './languageStore';
import { useReceiptLanguageStore } from './receiptLanguageStore';

beforeEach(() => {
  localStorage.clear();
  useLanguageStore.setState({ language: 'en' });
  useReceiptLanguageStore.setState({ receiptLanguage: 'app' });
});

afterEach(() => {
  localStorage.clear();
});

test('defaults to "app" (same as the interface language)', () => {
  expect(useReceiptLanguageStore.getState().receiptLanguage).toBe('app');
});

test('persists under its own sa_ prefixed key', () => {
  useReceiptLanguageStore.getState().setReceiptLanguage('th');

  const stored = localStorage.getItem('sa_receipt_language');
  expect(stored).not.toBeNull();
  expect(JSON.parse(stored as string).state.receiptLanguage).toBe('th');
});

test('docs/I18N.md: "changing one must never change the other" — interface language independence', () => {
  useReceiptLanguageStore.getState().setReceiptLanguage('lo');
  useLanguageStore.getState().setLanguage('th');

  expect(useReceiptLanguageStore.getState().receiptLanguage).toBe('lo');
  expect(useLanguageStore.getState().language).toBe('th');
});

test('the reverse: changing the receipt language never changes the interface language', () => {
  useLanguageStore.getState().setLanguage('lo');
  useReceiptLanguageStore.getState().setReceiptLanguage('th');

  expect(useLanguageStore.getState().language).toBe('lo');
  expect(useReceiptLanguageStore.getState().receiptLanguage).toBe('th');
});

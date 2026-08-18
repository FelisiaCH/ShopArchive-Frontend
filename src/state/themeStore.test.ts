import { afterEach, beforeEach, expect, test } from 'vitest';

import { useThemeStore } from './themeStore';

beforeEach(() => {
  localStorage.clear();
  useThemeStore.setState({ mode: 'system' });
});

afterEach(() => {
  localStorage.clear();
});

test('defaults to system', () => {
  expect(useThemeStore.getState().mode).toBe('system');
});

test('setMode updates the store and persists under the sa_ prefixed key', () => {
  useThemeStore.getState().setMode('oled');
  expect(useThemeStore.getState().mode).toBe('oled');

  const stored = localStorage.getItem('sa_theme');
  expect(stored).not.toBeNull();
  expect(JSON.parse(stored as string).state.mode).toBe('oled');
});

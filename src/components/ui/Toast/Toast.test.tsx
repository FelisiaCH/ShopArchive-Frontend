import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Toast } from './Toast';

test('error variant: uses an assertive alert role', () => {
  render(<Toast variant="error" message="Could not reach the shop server." />);
  expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
});

test('info variant: uses a polite status role', () => {
  render(<Toast variant="info" message="Report sent." />);
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});

test('dismiss button calls onDismiss', () => {
  const onDismiss = vi.fn();
  render(<Toast message="Entry saved." onDismiss={onDismiss} />);
  screen.getByRole('button', { name: 'Dismiss' }).click();
  expect(onDismiss).toHaveBeenCalled();
});

test('subtle variant: the quiet corner indicator for a background refresh', () => {
  render(<Toast variant="subtle" message="Refreshing…" />);
  expect(screen.getByText('Refreshing…')).toBeInTheDocument();
});

test('auto-dismisses after the given duration', () => {
  vi.useFakeTimers();
  const onDismiss = vi.fn();
  render(<Toast message="Entry saved." onDismiss={onDismiss} autoDismissMs={3000} />);
  expect(onDismiss).not.toHaveBeenCalled();
  vi.advanceTimersByTime(3000);
  expect(onDismiss).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

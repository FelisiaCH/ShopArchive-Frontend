import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { ProgressBar } from './ProgressBar';

test('reports megabytes sent of total, and the percentage, as CLAUDE.md requires', () => {
  render(<ProgressBar sentBytes={2_400_000} totalBytes={8_100_000} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuenow', '30');
  expect(screen.getByText('2.4 MB of 8.1 MB')).toBeInTheDocument();
  expect(screen.getByText('30%')).toBeInTheDocument();
});

test('stalled: says the connection has gone quiet and offers retry', () => {
  const onRetry = vi.fn();
  render(<ProgressBar sentBytes={1_000_000} totalBytes={5_000_000} stalled onRetry={onRetry} />);
  expect(screen.getByText(/connection has gone quiet/i)).toBeInTheDocument();
  screen.getByRole('button', { name: 'Retry' }).click();
  expect(onRetry).toHaveBeenCalled();
});

import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Button } from './Button';

test('idle: is enabled and shows its label', () => {
  render(<Button>Save entry</Button>);
  const button = screen.getByRole('button', { name: 'Save entry' });
  expect(button).toBeEnabled();
});

test('busy: swaps the label, shows a spinner, and disables the button so a second press cannot fire', () => {
  render(
    <Button busy busyLabel="Saving…">
      Save entry
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Saving…' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});

test('disabled: cannot be clicked', () => {
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Save entry
    </Button>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));
  expect(onClick).not.toHaveBeenCalled();
});

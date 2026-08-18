import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Sheet } from './Sheet';

test('closed: renders nothing', () => {
  render(
    <Sheet open={false} title="New entry" onClose={() => {}}>
      content
    </Sheet>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('open: renders as a modal dialog labelled by its title', () => {
  render(
    <Sheet open title="New entry" onClose={() => {}}>
      content
    </Sheet>,
  );
  expect(screen.getByRole('dialog', { name: 'New entry' })).toBeInTheDocument();
});

test('Escape and the close button both call onClose', () => {
  const onClose = vi.fn();
  render(
    <Sheet open title="New entry" onClose={onClose}>
      content
    </Sheet>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(1);

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(2);
});

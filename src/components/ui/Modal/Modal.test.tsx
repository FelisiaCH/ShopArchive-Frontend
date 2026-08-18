import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Modal } from './Modal';

test('closed: renders nothing', () => {
  render(
    <Modal open={false} title="Confirm entry" onClose={() => {}}>
      content
    </Modal>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('open: renders the dialog and its actions', () => {
  render(
    <Modal open title="Confirm entry" onClose={() => {}} actions={<button>Confirm</button>}>
      $38.40 · Cash
    </Modal>,
  );
  expect(screen.getByRole('dialog', { name: 'Confirm entry' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
});

test('clicking the backdrop calls onClose, clicking the panel does not', () => {
  const onClose = vi.fn();
  render(
    <Modal open title="Confirm entry" onClose={onClose}>
      content
    </Modal>,
  );
  fireEvent.click(screen.getByRole('dialog'));
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
  expect(onClose).toHaveBeenCalledTimes(1);
});

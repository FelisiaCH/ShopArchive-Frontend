import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { MemoryRouter } from 'react-router';

import { BottomNav } from './BottomNav';

test('renders the four mobile tabs plus the add-entry FAB, Notes deliberately excluded', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <BottomNav />
    </MemoryRouter>,
  );

  for (const name of ['Today', 'Record', 'Reports', 'Account']) {
    expect(screen.getByRole('link', { name: new RegExp(name), hidden: true })).toBeInTheDocument();
  }
  expect(screen.queryByRole('link', { name: /Notes/, hidden: true })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Add entry', hidden: true })).toHaveAttribute(
    'href',
    '/record',
  );
});

test('marks the current tab with aria-current', () => {
  render(
    <MemoryRouter initialEntries={['/reports']}>
      <BottomNav />
    </MemoryRouter>,
  );

  expect(screen.getByRole('link', { name: /Reports/, hidden: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByRole('link', { name: /^Today/, hidden: true })).not.toHaveAttribute(
    'aria-current',
  );
});

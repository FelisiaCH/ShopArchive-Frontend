import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { MemoryRouter } from 'react-router';

import { Sidebar } from './Sidebar';

test('renders every sidebar destination as a link, Today marked current for the default route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar />
    </MemoryRouter>,
  );

  for (const name of ['Today', 'Record', 'Notes', 'Reports', 'Settings']) {
    expect(screen.getByRole('link', { name: new RegExp(name), hidden: true })).toBeInTheDocument();
  }

  expect(screen.getByRole('link', { name: /Today/, hidden: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByRole('link', { name: /Record/, hidden: true })).not.toHaveAttribute(
    'aria-current',
  );
});

test('marks Record current on /record instead, not Today', () => {
  render(
    <MemoryRouter initialEntries={['/record']}>
      <Sidebar />
    </MemoryRouter>,
  );

  expect(screen.getByRole('link', { name: /Record/, hidden: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(screen.getByRole('link', { name: /^Today/, hidden: true })).not.toHaveAttribute(
    'aria-current',
  );
});

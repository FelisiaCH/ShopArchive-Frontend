import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppShell } from './AppShell';

function renderShellAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <h1>Today screen</h1> },
          { path: 'record', element: <h1>Record screen</h1> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

test('renders the routed screen alongside both navs', () => {
  renderShellAt('/');

  expect(screen.getByRole('heading', { name: 'Today screen' })).toBeInTheDocument();
  // Both navs are always in the DOM — CSS decides which one is visible at a given width.
  expect(screen.getAllByRole('link', { name: /Record/, hidden: true }).length).toBe(2);
});

test('navigating to a different route swaps the screen', () => {
  renderShellAt('/record');

  expect(screen.getByRole('heading', { name: 'Record screen' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Today screen' })).not.toBeInTheDocument();
});

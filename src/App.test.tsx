import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { App } from './App';

test('mounts the providers and renders the shell at its default route (Today)', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
  // The shell itself: at least one nav renders the primary destinations (sidebar and bottom bar
  // are both in the DOM at once — CSS, not React, decides which one shows at a given width).
  // jsdom has no matchMedia, so both navs' display:none base rule always "wins" here regardless
  // of width — real show/hide is a browser concern, verified separately with Playwright.
  expect(screen.getAllByRole('link', { name: /record/i, hidden: true }).length).toBeGreaterThan(0);
});

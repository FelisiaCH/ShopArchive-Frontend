import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { App } from './App';

test('mounts the providers and renders the placeholder route', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'ShopArchive' })).toBeInTheDocument();
});

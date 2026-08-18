import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { router } from './router';
import { useApplyTheme } from './state/useApplyTheme';

/**
 * Query defaults are deliberately left alone here. Retry, timeout, and idempotency behaviour are
 * decided in F3 with the API layer, where a lost answer has to be told apart from a failed write.
 */
const queryClient = new QueryClient();

export function App() {
  useApplyTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

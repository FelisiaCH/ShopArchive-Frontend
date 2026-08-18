import { createBrowserRouter } from 'react-router';

import { Placeholder } from './routes/Placeholder';

/** One placeholder route. The real screens and the shell around them arrive in F2. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Placeholder />,
  },
]);

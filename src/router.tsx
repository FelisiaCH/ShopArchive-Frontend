import { createBrowserRouter } from 'react-router';

import { Placeholder } from './routes/Placeholder';
import { Styleguide } from './routes/Styleguide';

/**
 * The placeholder route and the F1 component gallery. The real screens and the shell around them
 * — navigation, i18n, the router structure this app will actually ship with — arrive in F2.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Placeholder />,
  },
  {
    path: '/styleguide',
    element: <Styleguide />,
  },
]);

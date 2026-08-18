import { createBrowserRouter } from 'react-router';

import { AppShell } from './components/shell/AppShell';
import { NotFound } from './routes/screens/NotFound';
import { Notes } from './routes/screens/Notes';
import { Record } from './routes/screens/Record';
import { Reports } from './routes/screens/Reports';
import { Settings } from './routes/screens/Settings';
import { Today } from './routes/screens/Today';
import { Styleguide } from './routes/Styleguide';

/**
 * The real shell — F2. Every screen but `/styleguide` renders inside `AppShell` (sidebar or
 * bottom bar, depending on width) so navigation and route-transition motion are never something
 * an individual screen has to opt into. `/styleguide` stays outside it: it is F1's component
 * gallery for browser verification, not part of the app a shop uses.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Today /> },
      { path: 'record', element: <Record /> },
      { path: 'notes', element: <Notes /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/styleguide',
    element: <Styleguide />,
  },
]);

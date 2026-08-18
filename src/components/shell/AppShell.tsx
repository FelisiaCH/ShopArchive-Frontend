import { Outlet, useLocation } from 'react-router';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

/**
 * The persistent chrome every real screen renders inside: the desktop sidebar or the mobile
 * bottom bar (never both — `Sidebar.module.css`/`BottomNav.module.css` show/hide with the same
 * 860px breakpoint), and the routed screen itself.
 *
 * Route transitions: `key={pathname}` remounts the content wrapper on every navigation, which
 * replays its `fadeRise` entrance (the export's own keyframe, from `motion.css`) — the same
 * primitive F1 already ships, not a new animation library. `prefers-reduced-motion` already
 * collapses it globally (`motion.css`), so this needs no reduced-motion handling of its own.
 */
export function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <div key={pathname} className={styles.transition}>
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

import { Link, NavLink } from 'react-router';

import { Icon } from '../ui';
import { useTranslation } from '../../i18n/useTranslation';
import { BOTTOM_NAV_ITEMS, SETTINGS_ROUTE } from './navItems';
import styles from './BottomNav.module.css';

/**
 * The mobile tab bar — visible below the shell's breakpoint. Today / Record / Reports / Account
 * plus a centre "+" are read straight off the export's mobile frame (79px bar height, 24px side
 * padding, the `add` FAB at 46×46 with 14px corners) with Playwright — see the F2 PR body.
 *
 * The "+" always goes to `/record` for now, same as the Record tab. In the export it opens the
 * "New entry" sheet directly rather than the list — that behaviour belongs to F4, which builds
 * Record's actual content; this phase only has a route to send it to.
 */
export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className={styles.bar} aria-label={t('nav.sectionShop')}>
      {BOTTOM_NAV_ITEMS.slice(0, 2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
          }
        >
          <Icon name={item.icon} className={styles.icon} />
          <span className={styles.label}>{t(`nav.${item.labelKey}`)}</span>
        </NavLink>
      ))}

      <Link to="/record" className={styles.fab} aria-label={t('nav.addEntry')}>
        <Icon name="add" className={styles.fabIcon} />
      </Link>

      {BOTTOM_NAV_ITEMS.slice(2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
          }
        >
          <Icon name={item.icon} className={styles.icon} />
          <span className={styles.label}>{t(`nav.${item.labelKey}`)}</span>
        </NavLink>
      ))}

      <NavLink
        to={SETTINGS_ROUTE}
        className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab)}
      >
        <Icon name="account_circle" className={styles.icon} />
        <span className={styles.label}>{t('nav.account')}</span>
      </NavLink>
    </nav>
  );
}

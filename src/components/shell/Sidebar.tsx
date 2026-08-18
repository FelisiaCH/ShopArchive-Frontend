import { NavLink } from 'react-router';

import { Icon } from '../ui';
import { useTranslation } from '../../i18n/useTranslation';
import { SETTINGS_ROUTE, SIDEBAR_NAV_ITEMS } from './navItems';
import styles from './Sidebar.module.css';

/**
 * The desktop nav column — visible at and above the shell's breakpoint (`AppShell.module.css`),
 * hidden with CSS rather than left out of the tree, so there is nothing to mount/unmount when the
 * window is resized. Layout and every value below (228px width, 8px active-row radius, the
 * `#ecece5` active background, the icon set) are read off `design/Shopbook_Daily.html`'s desktop
 * frame with Playwright, not guessed — see the F2 PR body.
 *
 * The export's sidebar also carries the shop's name, the signed-in owner's name, "Switch user",
 * and "Sign out". None of that exists yet — there is no backend, no session, and this phase runs
 * before both (F3 owns sign-in and session state; F8 owns the account screen). Rendering that
 * chrome now would mean inventing a shop and a person nobody has signed in as, so it is left for
 * the phase that actually has the data — noted here rather than built as a placeholder.
 */
export function Sidebar() {
  const { t } = useTranslation();

  return (
    <nav className={styles.sidebar} aria-label={t('nav.sectionShop')}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          S
        </span>
        <span className={styles.brandName}>{t('app.name')}</span>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>{t('nav.sectionShop')}</span>
        <ul className={styles.list}>
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? `${styles.row} ${styles.rowActive}` : styles.row
                }
              >
                <Icon name={item.icon} className={styles.icon} />
                {t(`nav.${item.labelKey}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <NavLink
          to={SETTINGS_ROUTE}
          className={({ isActive }) =>
            isActive ? `${styles.row} ${styles.rowActive}` : styles.row
          }
        >
          <Icon name="settings" className={styles.icon} />
          {t('nav.settings')}
        </NavLink>
      </div>
    </nav>
  );
}

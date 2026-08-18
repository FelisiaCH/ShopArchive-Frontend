import { Link } from 'react-router';

import { Icon } from '../../components/ui';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './RoutePlaceholder.module.css';

/** An unknown path inside the shell — still navigable, in the interface language, rather than a
 *  blank page. Not one of the five real destinations, so it gets its own small screen instead of
 *  going through RoutePlaceholder (which speaks for a nav item; this one does not have one). */
export function NotFound() {
  const { t } = useTranslation();

  return (
    <main className={styles.screen}>
      <Icon name="signpost" className={styles.icon} />
      <h1 className={styles.title}>{t('notFound.title')}</h1>
      <p className={styles.note}>{t('notFound.body')}</p>
      <Link to="/">{t('nav.today')}</Link>
    </main>
  );
}

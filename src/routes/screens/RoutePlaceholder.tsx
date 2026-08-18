import type { CommonDictionary } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { Icon } from '../../components/ui';
import styles from './RoutePlaceholder.module.css';

interface RoutePlaceholderProps {
  titleKey: keyof CommonDictionary['nav'];
  icon: string;
}

/**
 * Stands in for a real screen this phase does not build. F2's scope is the shell, navigation,
 * and i18n around it — Record's, Today's, Notes's, Reports's, and Settings's actual content
 * arrive in F3 through F8, each replacing the matching file in this directory. This exists so
 * every nav destination goes somewhere real, in the interface language, rather than a route that
 * 404s or a blank screen.
 */
export function RoutePlaceholder({ titleKey, icon }: RoutePlaceholderProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.screen}>
      <Icon name={icon} className={styles.icon} />
      <h1 className={styles.title}>{t(`nav.${titleKey}`)}</h1>
      <p className={styles.note}>{t('placeholder.note')}</p>
    </main>
  );
}

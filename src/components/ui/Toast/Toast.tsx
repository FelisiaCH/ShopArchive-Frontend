import { useEffect } from 'react';

import { Icon } from '../Icon/Icon';
import styles from './Toast.module.css';

export type ToastVariant = 'info' | 'success' | 'error' | 'subtle';

export interface ToastProps {
  variant?: ToastVariant;
  message: string;
  onDismiss?: () => void;
  /** Auto-dismiss after this many ms. Omit for a toast that stays until dismissed — an error the
   *  user needs to read and act on should not vanish on a timer. */
  autoDismissMs?: number;
}

const ICONS: Record<ToastVariant, string | null> = {
  info: 'info',
  success: 'check_circle',
  error: 'error',
  subtle: null,
};

/**
 * A corner notification. `variant="subtle"` is CLAUDE.md #9's "quiet corner indicator for a
 * background refresh" — deliberately unstyled next to the others, so a background sync never
 * competes with the number the user actually came to read.
 */
export function Toast({ variant = 'info', message, onDismiss, autoDismissMs }: ToastProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  const icon = ICONS[variant];
  const classes = `${styles.toast} ${styles[variant]}`;

  return (
    <div
      className={classes}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      {icon && <Icon name={icon} className={styles.icon} />}
      <span className={styles.message}>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

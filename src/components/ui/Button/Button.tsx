import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  /** True while a request this press started is still in flight. */
  busy?: boolean;
  /** Shown in place of `children` while `busy` — the label swapped to the verb (CLAUDE.md #9),
   *  e.g. "Save entry" becomes "Saving…". */
  busyLabel?: ReactNode;
  children: ReactNode;
}

/**
 * The one button every screen uses. Three states this phase requires: idle, busy (spinner +
 * swapped label, still disabled so a second press can't fire — CLAUDE.md #10), and disabled.
 */
export function Button({
  variant = 'primary',
  busy = false,
  busyLabel,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], busy ? styles.busy : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className ? `${classes} ${className}` : classes}
      disabled={disabled || busy}
      aria-busy={busy}
      {...rest}
    >
      {busy && <span className={styles.spinner} aria-hidden="true" />}
      {busy ? (busyLabel ?? children) : children}
    </button>
  );
}

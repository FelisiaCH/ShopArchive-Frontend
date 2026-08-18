import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { Icon } from '../Icon/Icon';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Shown under the field when there is no error. */
  help?: string;
  /** Shown under the field instead of `help`, in the negative colour, with `aria-invalid` set. */
  error?: string;
}

/** A labelled text input with help text, a disabled state, and an error state. */
export function TextField({ label, help, error, ...rest }: TextFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const hasError = Boolean(error);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={hasError ? `${styles.input} ${styles.error}` : styles.input}
        aria-invalid={hasError}
        aria-describedby={help || error ? helpId : undefined}
        {...rest}
      />
      {hasError ? (
        <span id={helpId} className={styles.errorMessage} role="alert">
          <Icon name="error" />
          {error}
        </span>
      ) : help ? (
        <span id={helpId} className={styles.help}>
          {help}
        </span>
      ) : null}
    </div>
  );
}

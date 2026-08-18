import { useRef, useState } from 'react';

import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './CodeEntry.module.css';

const LENGTH = 6;

export interface CodeEntryProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once the sixth digit lands. */
  onComplete?: (value: string) => void;
  /** True while the code is being checked against the server — boxes lock, no error shown yet. */
  busy?: boolean;
  /** "That code didn't work" — CLAUDE.md #12: keeps what was typed, says what happened. */
  error?: string;
  /** The elevated state expired before a code was entered — CLAUDE.md #13: "The interface says
   *  when it has expired rather than failing the action mysteriously." Locks the boxes; the only
   *  way forward is requesting a new code. */
  expired?: boolean;
  onRequestNewCode?: () => void;
}

/**
 * The six-digit authenticator code every admin action needs (CLAUDE.md #13). Not drawn anywhere
 * in the design export — the mockups predate the decision that admin actions need a second
 * factor at all (F1.md, "Where the design is wrong").
 */
export function CodeEntry({
  value,
  onChange,
  onComplete,
  busy = false,
  error,
  expired = false,
  onRequestNewCode,
}: CodeEntryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const disabled = busy || expired;

  function handleChange(next: string) {
    const digits = next.replace(/\D/g, '').slice(0, LENGTH);
    onChange(digits);
    if (digits.length === LENGTH) onComplete?.(digits);
  }

  const digits = value.split('');
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <div className={styles.wrapper}>
      <div className={styles.boxRow} onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={LENGTH}
          value={value}
          disabled={disabled}
          aria-label="Six-digit authenticator code"
          aria-invalid={Boolean(error)}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {Array.from({ length: LENGTH }, (_, index) => {
          const isActive = focused && !disabled && index === activeIndex;
          const classes = [
            styles.box,
            digits[index] ? styles.filled : '',
            isActive ? styles.active : '',
            error ? styles.error : '',
            disabled ? styles.disabled : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={index} className={classes} aria-hidden="true">
              {digits[index] ?? (isActive ? <span className={styles.caret} /> : null)}
            </div>
          );
        })}
      </div>
      {expired ? (
        <div className={`${styles.helper} ${styles.expired}`} role="alert">
          <Icon name="timer_off" />
          <span>This code has expired.</span>
          {onRequestNewCode && (
            <Button variant="secondary" onClick={onRequestNewCode}>
              Get a new code
            </Button>
          )}
        </div>
      ) : error ? (
        <div className={`${styles.helper} ${styles.error}`} role="alert">
          <Icon name="error" />
          <span>{error}</span>
        </div>
      ) : (
        <div className={styles.helper}>
          <span>Enter the 6-digit code from your authenticator app.</span>
        </div>
      )}
    </div>
  );
}

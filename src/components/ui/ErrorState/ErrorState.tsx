import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './ErrorState.module.css';

export interface ErrorStateProps {
  /** Plain language, not a code — CLAUDE.md #12: "'Could not reach the shop server' is a
   *  sentence a shop owner can act on; a red toast reading 'Error' is not." */
  message: string;
  onRetry?: () => void;
  retryBusy?: boolean;
}

/** A failed request, with a message a shop owner can act on and a way to try again. */
export function ErrorState({ message, onRetry, retryBusy = false }: ErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <Icon name="cloud_off" className={styles.icon} />
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} busy={retryBusy} busyLabel="Retrying…">
          Retry
        </Button>
      )}
    </div>
  );
}

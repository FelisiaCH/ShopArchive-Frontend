import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** Bytes sent so far. */
  sentBytes: number;
  /** Total bytes for the upload. */
  totalBytes: number;
  /** True when the connection has gone quiet — CLAUDE.md: "A stalled upload says the connection
   *  has gone quiet and offers retry." */
  stalled?: boolean;
  onRetry?: () => void;
}

function formatMB(bytes: number): string {
  return (bytes / (1000 * 1000)).toFixed(1);
}

/**
 * A determinate upload indicator: megabytes sent of total, plus percentage (CLAUDE.md #9 — this
 * is what stops a staff member on slow Wi-Fi concluding the shot failed and retaking it) and a
 * stalled state with retry.
 */
export function ProgressBar({ sentBytes, totalBytes, stalled = false, onRetry }: ProgressBarProps) {
  const ratio = totalBytes > 0 ? Math.min(1, sentBytes / totalBytes) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress"
      >
        <div
          className={stalled ? `${styles.fill} ${styles.stalled}` : styles.fill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={styles.readout}>
        <span>
          {formatMB(sentBytes)} MB of {formatMB(totalBytes)} MB
        </span>
        <span className={styles.percentage}>{percent}%</span>
      </div>
      {stalled && (
        <div className={styles.stalledMessage}>
          <Icon name="wifi_off" />
          <span>Connection has gone quiet.</span>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

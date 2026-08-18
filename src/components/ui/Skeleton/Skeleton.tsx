import type { CSSProperties } from 'react';

import styles from './Skeleton.module.css';

export type SkeletonShape = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * A placeholder shaped like the real content it stands in for (CLAUDE.md #9: "Skeleton shaped
 * like the real content for loading screens... A spinner where a skeleton belongs is a defect").
 * `shape="rect"` with an explicit width/height is how a caller matches a card, an avatar frame,
 * or a chart bar; `"text"` and `"circle"` cover the two shapes almost everything else needs.
 */
export function Skeleton({ shape = 'text', width, height, className }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height: shape === 'text' ? undefined : height,
  };
  const classes = [
    styles.skeleton,
    shape === 'text' ? styles.text : '',
    shape === 'circle' ? styles.circle : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={className ? `${classes} ${className}` : classes}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  );
}

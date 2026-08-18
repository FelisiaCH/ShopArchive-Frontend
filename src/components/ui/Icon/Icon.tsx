import styles from './Icon.module.css';

export interface IconProps {
  /** A Material Symbols Rounded ligature name, e.g. `"receipt_long"`. */
  name: string;
  className?: string;
}

/** A Material Symbols Rounded glyph. Always `aria-hidden` — icons never carry meaning alone. */
export function Icon({ name, className }: IconProps) {
  return (
    <span className={className ? `${styles.icon} ${className}` : styles.icon} aria-hidden="true">
      {name}
    </span>
  );
}

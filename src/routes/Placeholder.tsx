import styles from './Placeholder.module.css';

/**
 * The scaffold's only route. It exists to prove the stack is wired — router, styling, and the
 * vendored fonts — and it is replaced by the real shell in F2.
 */
export function Placeholder() {
  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>ShopArchive</h1>
      <p className={styles.body}>
        Scaffold only. The design system arrives in F1 and the shell, navigation, and translations
        in F2.
      </p>
      <div className={styles.specimens}>
        <span className={styles.geist}>Geist 0123456789</span>
        <span className={styles.googleSans}>Google Sans 0123456789</span>
        <span className={styles.googleSans} lang="lo">
          ຮ້ານຄ້າ
        </span>
        <span className={styles.googleSans} lang="th">
          ร้านค้า
        </span>
        <span className={styles.mono}>Google Sans Code 0123456789</span>
        <span className={styles.icon} aria-hidden="true">
          receipt_long
        </span>
      </div>
    </main>
  );
}

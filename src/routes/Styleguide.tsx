import { useState } from 'react';

import {
  Button,
  CodeEntry,
  EmptyState,
  ErrorState,
  Modal,
  ProgressBar,
  Sheet,
  Skeleton,
  TextField,
  Toast,
} from '../components/ui';
import { useApplyTheme } from '../state/useApplyTheme';
import { useThemeStore, type ThemeMode } from '../state/themeStore';
import styles from './Styleguide.module.css';

const THEMES: ThemeMode[] = ['light', 'dark', 'oled', 'system'];

const SWATCHES = [
  'color-canvas',
  'color-surface',
  'color-surface-raised',
  'color-surface-sunken',
  'color-border',
  'color-border-subtle',
  'color-divider',
  'color-ink',
  'color-ink-hover',
  'color-text-primary',
  'color-text-secondary',
  'color-text-muted',
  'color-text-label',
  'color-text-faint',
  'color-positive',
  'color-negative',
];

/**
 * A component gallery — every base component in every state, at every theme, for F1's browser
 * verification pass. Not a screen from the design (F2 builds the real shell and navigation); this
 * route exists so design-system claims can be checked with `getComputedStyle` instead of read off
 * the CSS. Kept for now as a living reference; F2 can fold it into dev tooling or drop it.
 */
export function Styleguide() {
  useApplyTheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const [buttonBusy, setButtonBusy] = useState(false);
  const [fieldError, setFieldError] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(2_400_000);
  const [stalled, setStalled] = useState(false);
  const [code, setCode] = useState('');
  const [codeExpired, setCodeExpired] = useState(false);
  const totalBytes = 8_100_000;

  return (
    <main className={styles.page}>
      <div className={styles.themeSwitcher} data-testid="theme-switcher">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            className={styles.themeButton}
            data-active={mode === t}
            data-testid={`theme-${t}`}
            onClick={() => setMode(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <section className={styles.section} data-testid="section-colors">
        <span className={styles.sectionLabel}>Colour tokens</span>
        <div className={styles.swatchGrid}>
          {SWATCHES.map((token) => (
            <div key={token} className={styles.swatch} data-token={token}>
              <div className={styles.swatchColor} style={{ background: `var(--${token})` }} />
              <div className={styles.swatchLabel}>{token}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} data-testid="section-type">
        <span className={styles.sectionLabel}>Type</span>
        <div className={styles.typeSample}>
          <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)' }}>
            Daily takings
          </span>
          <span className={styles.amount} style={{ fontSize: 'var(--text-display-lg)' }}>
            $741.65
          </span>
          <span lang="lo" style={{ fontSize: 'var(--text-lg)' }}>
            ຮ້ານຄ້າຂອງທ່ານມີຍອດຂາຍລວມທັງໝົດໃນມື້ນີ້ແມ່ນເທົ່າໃດ
          </span>
          <span lang="th" style={{ fontSize: 'var(--text-lg)' }}>
            ยอดขายรวมของร้านค้าคุณวันนี้เป็นเท่าไหร่
          </span>
        </div>
      </section>

      <section className={styles.section} data-testid="section-buttons">
        <span className={styles.sectionLabel}>Button — idle, busy, disabled</span>
        <div className={styles.row}>
          <Button data-testid="button-idle" onClick={() => setButtonBusy(true)}>
            Save entry
          </Button>
          <Button
            data-testid="button-busy"
            busy={buttonBusy}
            busyLabel="Saving…"
            onClick={() => setButtonBusy(false)}
          >
            Save entry
          </Button>
          <Button data-testid="button-disabled" disabled>
            Save entry
          </Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Discard</Button>
        </div>
      </section>

      <section className={styles.section} data-testid="section-textfield">
        <span className={styles.sectionLabel}>Text field — default, error, disabled</span>
        <div className={styles.row}>
          <TextField label="Shop name" placeholder="Morning Bell Coffee" />
          <TextField
            label="Email"
            defaultValue="not-an-email"
            error={fieldError ? 'Enter a valid email address.' : undefined}
            data-testid="textfield-error"
          />
          <TextField label="Username" defaultValue="dita.marlow" disabled />
        </div>
        <Button variant="secondary" onClick={() => setFieldError((e) => !e)}>
          Toggle error
        </Button>
      </section>

      <section className={styles.section} data-testid="section-skeleton">
        <span className={styles.sectionLabel}>Skeleton</span>
        <div className={styles.card}>
          <Skeleton shape="text" width="60%" />
          <div style={{ height: 8 }} />
          <Skeleton shape="text" width="90%" />
          <div style={{ height: 8 }} />
          <Skeleton shape="rect" width="100%" height={64} />
        </div>
      </section>

      <section className={styles.section} data-testid="section-progress">
        <span className={styles.sectionLabel}>Progress bar — megabyte readout, stalled</span>
        <div className={styles.card}>
          <ProgressBar
            sentBytes={progress}
            totalBytes={totalBytes}
            stalled={stalled}
            onRetry={() => setStalled(false)}
          />
          <div style={{ height: 12 }} />
          <div className={styles.row}>
            <Button
              variant="secondary"
              onClick={() => setProgress((p) => Math.min(totalBytes, p + 1_500_000))}
            >
              Advance
            </Button>
            <Button variant="secondary" onClick={() => setStalled((s) => !s)}>
              Toggle stalled
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section} data-testid="section-empty">
        <span className={styles.sectionLabel}>Empty state</span>
        <div className={styles.card}>
          <EmptyState
            icon="note_stack"
            title="No notes yet"
            description="Notes staff leave for each other show up here."
          />
        </div>
      </section>

      <section className={styles.section} data-testid="section-error">
        <span className={styles.sectionLabel}>Error state — with retry</span>
        <div className={styles.card}>
          <ErrorState
            message="Could not reach the shop server. Check the Wi-Fi and try again."
            onRetry={() => {}}
          />
        </div>
      </section>

      <section className={styles.section} data-testid="section-code-entry">
        <span className={styles.sectionLabel}>Six-digit code entry</span>
        <div className={styles.row}>
          <div className={styles.card}>
            <CodeEntry value={code} onChange={setCode} />
          </div>
          <div className={styles.card}>
            <CodeEntry value="12" onChange={() => {}} error="That code didn't work." />
          </div>
          <div className={styles.card}>
            <CodeEntry
              value=""
              onChange={() => {}}
              expired={codeExpired}
              onRequestNewCode={() => setCodeExpired(false)}
            />
            <Button variant="secondary" onClick={() => setCodeExpired((e) => !e)}>
              Toggle expired
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section} data-testid="section-sheet-modal">
        <span className={styles.sectionLabel}>Sheet &amp; modal</span>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
        </div>
        <Sheet open={sheetOpen} title="New entry" onClose={() => setSheetOpen(false)}>
          <p>Sheet content — the mobile "New entry" pattern from the export.</p>
          <Button onClick={() => setSheetOpen(false)}>Save entry</Button>
        </Sheet>
        <Modal
          open={modalOpen}
          title="Confirm entry"
          onClose={() => setModalOpen(false)}
          actions={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p>$38.40 · Cash · 14:32 — this is the unskippable confirm-before-save step.</p>
        </Modal>
      </section>

      <section className={styles.section} data-testid="section-toast">
        <span className={styles.sectionLabel}>Toast</span>
        <div className={styles.row}>
          <Toast variant="info" message="Report sent to Telegram." />
          <Toast variant="success" message="Entry saved." />
          <Toast variant="error" message="Could not reach the shop server." />
          <Toast variant="subtle" message="Refreshing…" />
        </div>
      </section>
    </main>
  );
}

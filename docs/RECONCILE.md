# RECONCILE — frontend state vs the docs-reorg handoff

The session handoff (in the backend repo, `docs/SESSION-HANDOFF.md`) describes a state that does not
match this disk. Do this task before F0/F1.

## Established on disk — do not re-derive

- **No `.git` in this repo.** Nothing is under version control.
- **`docs/tasks/P0-scaffold.md` is already gone.** The handoff's open item 2 (`git rm` it during F0) is
  moot. `docs/tasks/` holds `F0–F8`, `F9a`, `F9b`, `F9c`, `MASTER-FRONTEND.md` — 13 files, nothing else.
- **No `docs/HANDOFF.md` exists.** `docs/` holds `I18N.md`, `PLAN.md`, `tasks/`.
- **`.gitignore` is already complete** (`node_modules`, `dist`, `coverage`, `playwright-report`,
  `test-results`, `*.local`, `.DS_Store`) — not `.DS_Store` only.
- **F0's scope appears already implemented**: `src/{App.tsx,main.tsx,router.tsx,routes/Placeholder,
  styles,test}`, vendored fonts under `src/assets/fonts/`, `e2e/`, `playwright.config.ts`, `dev.sh`,
  `build.sh`, `check` script, React Router + TanStack Query + Zustand in `package.json`.

## 1. Version control first

Before editing anything:

- `git init`.
- `git add -A`, then `git status`.
- **Report the staged file list. Do not commit.** Flag anything staged that should be ignored —
  especially `dist/`, `node_modules/`, `.DS_Store`, `test-results`, `playwright-report`.

## 2. Establish the real phase state

- Check the repo against `docs/tasks/F0.md` **Scope** and **Verify**. Report each item as implemented /
  partial / absent, citing file paths.
- Run `npm run check`, then `npm run build`. Report both outputs verbatim.
- Confirm F0's Verify empirically, not by reading config: app builds and runs, and **no network request
  leaves the page on load** — check the browser network panel, do not reason from the source.
- Confirm `npm run fonts:check` passes and that no font loads from a remote origin.
- **Fix nothing.** Report gaps; they get closed in an F0 session.

## 3. Confirm the split

The frontend split was verified verbatim in the original session, so this is a coverage check only:

- Confirm `MASTER-FRONTEND.md`'s index table and order block match the files present, including the
  `F8 → F9a → F9b → F9c` tail.
- Report anything in `docs/PLAN.md`'s frontend scope not covered by any F file.

## 4. Leave alone

- Placeholder Verify sections in `F5.md`, `F6.md`, `F7.md`, `F9a.md`, `F9b.md` — pending decision.
- Do not create a `docs/HANDOFF.md`. Report that it is missing.
- Do not touch `design/` or anything under `src/`.

## Report

Staged file list · F0 state table with paths · `check` and `build` output · network-on-load result ·
index/PLAN.md coverage gaps. No commits, no fixes, no new documents.

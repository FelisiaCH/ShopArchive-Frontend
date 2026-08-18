# ShopArchive Frontend — Phase index

Each phase lives in its own file in `docs/tasks/`. Hand the implementing agent that **one file** at the
start of a session; every phase file is self-contained (it repeats the required reading, the rules, and
the known design disagreements). **One phase per session.** When a phase is done, finish the session and
start the next in a fresh one.

`CLAUDE.md`'s invariants override everything. The design export in `design/` is the source of truth for
layout, spacing, and copy — not any table here.

## Prerequisite

F0 to F2 run before the backend exists. **F3 onward needs the backend's `/api/openapi.json`**, because API
types are generated from it and never hand-written.

## Phases

Order: F0 → F1 → F2 → [wait for backend B3] → F3 → F4 → F5 → F6 → F7 → F8 → F9a → F9b → F9c.
F9a and F9b are independent of each other; **F9c runs last.**

| Phase | Title | File | Backend |
| --- | --- | --- | --- |
| F0 | Scaffold | `F0.md` | before backend |
| F1 | Design system | `F1.md` | before backend |
| F2 | Shell, navigation, i18n | `F2.md` | before backend |
| F3 | API layer and sign-in | `F3.md` | needs openapi |
| F4 | Record | `F4.md` | needs openapi |
| F5 | Today | `F5.md` | needs openapi |
| F6 | Notes | `F6.md` | needs openapi |
| F7 | Reports | `F7.md` | needs openapi |
| F8 | Settings, account, admin | `F8.md` | needs openapi |
| F9a | PWA shell + offline/error page | `F9a.md` | needs openapi |
| F9b | Printing | `F9b.md` | needs openapi |
| F9c | Accessibility, end-to-end, and docs (last) | `F9c.md` | needs openapi |

`P0-scaffold.md` is a superseded tombstone from the first (Postgres) architecture. Delete it (`git rm`)
at F0.

## Where the design is wrong

Repeated in each phase file; kept here as the shared reference. The mockups predate several decisions —
follow the invariants, not the drawing.

- **Single headline totals.** There is no base currency, so Today, Reports, and the drawer each become a
  stack of per-currency rows: top-starred currency large, the rest below.
- **Edit and delete.** Nothing implying an entry can be changed or removed exists.
- **Adding a currency.** Every ISO currency is always present; a starred shortlist controls ordering.
- **Roles.** User management, backups, notification config, and the spreadsheet import are admin-only and
  are not rendered for staff.
- **Admin actions need a six-digit authenticator code**, which the mockups do not show at all.
- **Closing the day.** Any close button or end-of-day screen is gone — the server closes the day on a
  schedule.
- **Editing yesterday.** Nothing in the app can write to a past day, including corrections.

## Design foundation

From the export; confirm against the file rather than trusting this table. Full table lives in `F1.md`.

| Token | Value |
| --- | --- |
| Canvas | `#eeeeea` |
| Ink | `#1a1a17` |
| Sans | Geist |
| Mono | Google Sans Code |
| Icons | Material Symbols Rounded |

Themes: light, dark, OLED, match-device. Fonts are vendored; nothing is fetched from a CDN at runtime.

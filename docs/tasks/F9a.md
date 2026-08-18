# F9a — PWA shell + offline/error page

Carved from the original F9 (Finishing), part 1 of 3. F9a and F9b are independent of each other; **F9c
runs last** (its end-to-end tests exercise the finished app).

## Before writing anything

1. Read `CLAUDE.md` in full. Its invariants override this document.
2. Read `docs/PLAN.md` for why those invariants exist.
3. Open the design export in `design/` and work from it. It is the source of truth for layout, spacing,
   and copy — not this document's summary of it.

## Prerequisite

This phase needs the backend's `/api/openapi.json` — API types are generated from it and never
hand-written (`npm run check` regenerates and fails if the committed file differs).

## Rules

- Implement the current phase only. Note later needs in the PR body rather than building them early.
- `npm run check` passes before every commit.
- Visual claims are verified in a browser with `getComputedStyle`, never by reading CSS and reasoning
  about what it should produce.
- Every screen is checked at a phone width and a desktop width before the phase is done.
- Report at the end: what was built, what was verified and how, what was skipped and why, and anything in
  the design that could not be implemented as drawn.
- Stop and ask when the design and the invariants disagree. Known disagreements are listed below.

## Where the design is wrong

The mockups predate several decisions. Follow the invariants, not the drawing.

- **Single headline totals.** There is no base currency, so Today, Reports, and the drawer each become a
  stack of per-currency rows: top-starred currency large, the rest below.
- **Edit and delete.** Nothing implying an entry can be changed or removed exists. There is no
  greyed-out state to render.
- **Adding a currency.** Every ISO currency is always present; a starred shortlist controls ordering.
- **Roles.** Staff record entries, use notes, and change everyday settings. User management, backups,
  notification config, and the spreadsheet import are admin-only and are not rendered for staff.
- **Admin actions need a six-digit authenticator code**, which the mockups do not show at all.
- **Closing the day.** Any close button or end-of-day screen in the mockups is gone — the server closes
  the day on a schedule.
- **Editing yesterday.** Nothing in the app can write to a past day, including corrections. That is a
  procedure run at the machine, and the interface should say so rather than offering a route.

## Scope

Installable PWA shell; the unreachable-server page, which doubles as the 404 — a plain explanation, the
address it tried, and a retry, never a blank screen.

## Verify

_No phase-specific verify list was given in the original plan. The universal Rules above still apply.
Assert at minimum that the app installs as a PWA and that the unreachable-server page shows the address it
tried and a working retry, and doubles as the 404. State what you verified in the report._

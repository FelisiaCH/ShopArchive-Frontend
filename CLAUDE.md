# ShopArchive Frontend — Invariants

Read this file at the start of every session. These rules override convenience.

The counterpart repository is `ShopArchive-Backend`. The shared core below is duplicated there verbatim;
a change to it belongs in both repositories.

## What this project is

ShopArchive is a local-first shop ledger for a single physical shop. This repository is the client: a
React app used on the shop's phones and tablets over the local network, talking to the backend's API.

The backend stores everything as files, not in a database, and serves this app itself — one origin, no
cross-origin cookie handling. Two consequences of the storage design do reach the client: an entry can
never be modified or written to a past day, and admin actions need a fresh authenticator code.

It is a fresh build. The previous project (BuncheeNgern) is not a dependency and must not be imported
from. Its UI is out of scope. Only translation and currency reference data carry over.

---

## Shared core — identical in both repositories

1. **Money is stored as integer minor units,** with the currency code beside every amount. Never a float.
   Direction comes from the entry's kind, never from a negative sign. Decimal formatting happens at the
   display layer only.
2. **Amounts in different currencies are never added together.** No base currency, no exchange rate, no
   conversion helper anywhere in this system. Every total is a set of per-currency totals. A function
   returning a single scalar across mixed currencies is a bug.
3. **The ledger is append-only.** An entry file is written once and never modified or deleted — not by
   staff, not by an admin, not by anyone using the application. Corrections append a reversal and a
   replacement.
4. **A failure is only reported when the failure is known.** A timeout means the answer did not arrive,
   which is different from the write not happening. Every write carries a client-generated idempotency
   key, so a request can be safely reissued and the truth established before anything is said to the
   user.
5. **Nothing happens silently.** Every action that leaves the device shows that it started, what it is
   doing, and how it ended.
6. **The application never accepts a filesystem path from a user.** Not from a form, not from a body, not
   from a query parameter. Backup destinations and notification channels are declared in config and
   referenced by identifier.
7. **Secrets are write-only.** Tokens, webhook URLs, and keys are never returned by the API, never
   displayed, not even masked, and never logged.

---

## Frontend-specific constraints

8. **No edit or delete affordance exists anywhere** — no swipe action, no long-press menu, no greyed-out
   button, and no way to write to a past day. The capability does not exist, so there is nothing to hide
   or disable. What carries the weight instead is the confirmation step before saving: amount, currency,
   payment split, and time, and it is not skippable.
9. **The indicator matches the wait.** Skeletons shaped like the real content for loading screens; a
   determinate bar with megabytes for uploads; a spinner inside the pressed button with its label swapped
   to the verb; a quiet corner indicator for a background refresh. A spinner where a skeleton belongs is a
   defect, not a style choice.
10. **A pressed control is disabled until it resolves.** A double press must not be able to create a
    second entry, because that entry could never be removed.
11. **Optimistic updates are never used for ledger writes.** The one place the interface runs ahead of the
    server is the local photo preview, and that is safe because it is only a preview.
12. **Failure states keep the user's input.** Whatever was typed stays on screen, the message says what
    happened in plain language, and the action can be retried. "Could not reach the shop server" is a
    sentence a shop owner can act on; a red toast reading "Error" is not.
13. **Admin actions prompt for a six-digit authenticator code**, and the elevated state expires quickly.
    The interface says when it has expired rather than failing the action mysteriously.
14. **Staff and admin differ only where the plan says they differ.** Staff record entries, use notes, and
    change everyday settings. User management, backups, notification config, and the same-day spreadsheet
    import are admin-only and are not rendered at all for staff — not rendered disabled.
15. **There is no close-the-day control, no reopen, no restore, and no way to reset anyone's password or
    authenticator.** The day closes on a schedule; the rest are procedures run at the machine. An
    interface offering any of them would be an interface around the protections.
16. **API types are generated, never hand-written.** `npm run check` regenerates from the backend's
    OpenAPI document and fails if the committed file differs.
17. **Components never call `fetch` directly.** Data access goes through a query hook in the feature's
    `api` module.
18. **Motion serves comprehension.** Transitions make cause and effect legible rather than decorating.
    Everything respects `prefers-reduced-motion`, and no animation delays what the user asked for.
19. **The interface must work on a phone held one-handed in a busy shop.** Generous touch targets, the
    primary action reachable with a thumb, nothing critical behind a hover state.

## Stack

TypeScript, `strict` on, `any` fails the build.

| Layer | Choice |
| --- | --- |
| Framework | React 19 + Vite |
| Routing | React Router |
| Server state | TanStack Query |
| UI state | Zustand, for UI concerns only — never as a cache for server data |
| Styling | CSS Modules over CSS custom-property design tokens. No Tailwind, no component library |
| Animation | `motion` |
| Tests | Vitest for units, Playwright for end-to-end |

Fonts are vendored into the repository. Nothing is fetched from a CDN at runtime — the shop deployment has
no internet access.

## Working agreement

- Task docs live in `docs/tasks/`. Implement exactly the numbered task you were given. If the task is
  wrong or underspecified, stop and say so rather than inventing scope.
- Read the actual files on disk before asserting what they contain.
- Every changed line traces to the task. No opportunistic reformatting or renaming; mention unrelated
  problems in the PR body instead of fixing them.
- `npm run check` (typecheck, lint, unit tests, generated-types freshness) passes before every commit.
- Visual and theming claims are verified in a browser with `getComputedStyle`, not by reading the CSS and
  reasoning about what it should produce.
- Every screen is checked at a phone width and a desktop width before a phase is called done.
- Commit messages describe what was verified. A skipped verification is stated.
- Verification steps assert properties (empty / non-empty / identical / exit code), never expected grep
  counts.

## Naming conventions

- Client storage keys are prefixed `sa_`.
- Design tokens are CSS custom properties; a literal colour in a component file is a bug.

# ShopArchive Frontend — handoff

Current as of the session that completed F1 and F2. Everything described here is committed and pushed to
`claude/phase-0-spec-review-7eensi`. Read `CLAUDE.md` first — its invariants override this file.

## Where things stand

| Phase | State |
| --- | --- |
| F0 — Scaffold | **Done.** Independently re-verified in a real browser. |
| F1 — Design system | **Done.** Tokens, four themes, base components with every state. |
| F2 — Shell, navigation, i18n | **Done.** `npm run check` green at 43/43. |
| F3 onward | **Blocked.** Needs `/api/openapi.json` from the backend's B3. |

The backend is at B1. **F3 cannot start until B3 ships the OpenAPI document**, because API types are
generated from it and never hand-written. Nothing else in this repository is blocked.

## What was actually verified, and how

Not by reading CSS and reasoning about it — by driving a real Chromium and reading real computed values:

- **No request leaves the page.** Built `dist`, served it, loaded it with request interception: 9
  requests, all same-origin, no CDN, no Google Fonts, no analytics. Re-checked after F1 and F2.
- **Vendored fonts genuinely apply.** `document.fonts.check()` true for all four families, and
  `getComputedStyle` resolves to them rather than a fallback. Lao and Thai render as real glyphs, not tofu.
- **Theme switching changes computed colour** in all four themes — light `rgb(238,238,234)`, dark
  `rgb(24,24,21)`, OLED `rgb(0,0,0)`, system falling back correctly.
- **`prefers-reduced-motion`** collapses animation without breaking layout — durations drop to ~0 while
  bounding boxes stay intact.
- **Both widths, every screen**, 390×844 and 1440×960, in all three languages, with no horizontal
  overflow.
- **Lao/Thai line-height** computes to 1.85 on real nav labels, matching `--leading-script`.

## Things the next sessions must not drop

**1. Notes is unreachable on a phone until F5 builds the way in.** The bottom bar has four tabs and no
Notes, because the design export draws it that way — Notes has a sidebar row but no bottom-bar tab. The
intent is that a phone reaches Notes from within Today. **F5 owns Today.** If F5 does not build that entry
point, Notes becomes unreachable on the shop's primary device, and `CLAUDE.md` 14 lists notes as a staff
feature while 19 requires the interface to work on a phone held one-handed.

**2. The Lao and Thai translations are new, not carried over.** `docs/I18N.md` says to reuse the previous
project's translation memory. That file was not available, so F2 translated from scratch. If the memory
exists somewhere, diff it before this ships — shop vocabulary that staff already know beats a fresh
rendering.

**3. F1's components still hard-code English.** `ErrorState` ("Something went wrong", "Retry"),
`ProgressBar`, `CodeEntry`'s expiry message, and the `Close` aria-labels on `Sheet` and `Modal` are not
wired to i18n yet. Deliberately deferred to whichever phase first renders them for real, from F3 on.

**4. The sidebar is intentionally incomplete.** The design shows shop name, signed-in user, "Switch user"
and "Sign out". F2 rendered only the wordmark rather than inventing data that no backend can yet supply.
F3 (auth) and F8 (account) fill it in.

**5. Six phases still carry placeholder Verify sections** — `F5`, `F6`, `F7`, `F9a`, `F9b` here, and `B6`
in the backend. Write real criteria or keep them deliberately.

## How to continue

One phase per session, per `docs/tasks/MASTER-FRONTEND.md`. Hand the implementing session that one file:

    claude "Read CLAUDE.md, docs/PLAN.md, and docs/tasks/F3.md,
    then do F3 only. Stop when F3 is done."

`npm run check` must pass before every commit. Visual claims are verified in a browser with
`getComputedStyle`. Every screen is checked at a phone width and a desktop width before the phase is done.
A literal colour outside the token file is a bug.

## Environment notes

- **The shop machine has permanent internet.** The earlier claim that it did not was wrong and has been
  corrected in `CLAUDE.md` and `docs/tasks/F1.md`. **The rule is unchanged**: fonts stay vendored and
  nothing is fetched from a CDN at runtime — for privacy, for load speed, and so the app keeps working if
  the link is down. F0, F1 and F2 all verified that no request leaves the page; keep it that way.
- **`npm run e2e` may fail on a browser version mismatch.** The repo pins `@playwright/test` 1.62.1, which
  wants a Chromium revision a given machine may not have. On a machine with its own Chromium, run
  Playwright with an explicit `executablePath` from a script outside the repo rather than changing the
  committed config. On your own machine `npx playwright install` is the normal fix.
- The design export `design/Shopbook_Daily.html` unpacks itself with JavaScript at runtime, so its values
  cannot be read as static CSS. Render it with Playwright and read the DOM — that is how F1 and F2 sourced
  every token and layout value.

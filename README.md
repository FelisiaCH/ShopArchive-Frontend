# ShopArchive — Frontend

The client for ShopArchive, a shop ledger that runs entirely on one machine in the shop. React, used on
the shop's phones and tablets over the local network.

The server lives in a separate repository: `ShopArchive-Backend`. In production it also serves this app's
built files, so there is one origin.

## Requirements

Node 22 LTS, and a running backend to develop against.

## Quick start

1. `./dev.sh` — starts the development server and proxies the API to the backend.
2. `./build.sh` — produces the built files and prints where to copy them for the backend to serve.

API types are generated from the backend's OpenAPI document and committed. `npm run check` regenerates
them and fails if the committed copy is stale, so a field renamed on the server turns this repository red
at typecheck time rather than during service.

## What shapes this app

- **Nothing can be edited or deleted.** No swipe actions, no long-press menus, no greyed-out buttons — the
  capability does not exist. The confirmation step before saving carries the weight instead.
- **Nothing happens silently.** Skeletons for loading screens, a megabyte counter for uploads, a spinner
  inside the pressed button with its label swapped to the verb. A dead-looking screen during a real
  operation is a defect.
- **A timeout is not a failure.** Writes carry an idempotency key, so a lost answer is resolved by asking
  again rather than by telling someone their sale did not save.
- **Totals are per currency.** Never one combined figure — there is no exchange rate in this system.
- **Offline is not supported,** and the app says so plainly rather than pretending. The fallback is paper.

## Documentation

`CLAUDE.md` — the invariants. Read before changing anything.
`docs/PLAN.md` — the whole design, shared with the backend repository.
`docs/tasks/MASTER-FRONTEND.md` — the build order, one phase per session.
`docs/I18N.md` — translations, and what to reuse from the old project.
`docs/DESIGN-SYSTEM.md` · `docs/SCREENS.md` · `docs/SETUP-dev.md`

The design export belongs in `design/`. It is the source of truth for layout and copy — but it predates
several decisions, and `docs/tasks/MASTER-FRONTEND.md` lists where it is wrong.

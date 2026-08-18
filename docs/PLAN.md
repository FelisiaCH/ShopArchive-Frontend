# ShopArchive — Plan

This document is the system-level plan and is kept **identical in both repositories**
(`ShopArchive-Frontend` and `ShopArchive-Backend`). A change to it belongs in both.

Status: planning. No implementation has started. This is the second architecture; the first used
PostgreSQL and was replaced before any code was written. **Hosted deployment has been cut** — see
"Local only" below.

## The shop's problem

At close of day the owner wants to know how much came in, how much of it is cash still in the drawer, and
how much landed elsewhere. Staff need to log sales and payouts quickly during service. Everything runs
inside the shop, on the shop's own hardware.

## Local only

This runs on one machine in the shop. Vercel, Cloudflare Workers, and Supabase were considered and
cut.

The reason is not preference, it is arithmetic. The entire store rests on there being exactly one writer,
which is what lets it work without file locking, assign gapless sequence numbers, and keep a single hash
chain. Serverless platforms scale by running several instances at once — that is what they are for. Two
instances appending to the same tree would collide on `seq`, fork the chain into two branches, and each
keep an idempotency index the other cannot see. Working around that means a lock service, a rewrite of the
store, and a second set of failure modes to test, in exchange for a deployment nobody has asked for.

If a hosted version is ever wanted, it is a fork with its own storage design, not a flag in this one.

What this simplifies: no storage adapter, no object storage, no signed upload URLs, no configuration
adapter, no cross-origin session handling, no per-target degradation table, and two fewer setup documents.
Supported platforms are Debian (reference), Windows, and macOS for development.

## Storage: files, not a database

There is no database. The ledger is a tree of small files, one file per entry, never rewritten.

```
data/
  entries/2026/08/12/
      1430-05_a3f9.json          one sale, written once, never modified
      1502-11_7c21.json
      _day.json                  digest written when the day closes
  users/somchai.json
  sessions/
  settings/
      shop.json
      currencies-starred.json
  notes/2026/08/12/
  uploads/2026/08/12/
      1430_payout_milk-delivery_a3f9.jpg
  quarantine/                    a record of files that failed their own hash check
  archive/2026/08/2026-08-12/
      entries.xlsx  summary.txt  slips/
  logs/
      audit-2026-08.log         every change to mutable data, one file per month
      chain-2026-08.log         daily digest hashes, monthly so it can be sealed
```

**Why this works here.** Only one process ever writes: the server. Phones do not touch the disk, they
send HTTP, and the server serialises the writes. The usual objection to file storage — several writers
corrupting a shared file — does not apply to this shape, and no file is ever rewritten in place anyway.

**What it costs.** Reports read a range of files rather than issuing a query, which is why each day gets a
digest file. Duplicate detection lives in an in-memory index rebuilt at startup instead of in a unique
constraint. At a few thousand entries a year this is comfortable; at a few thousand a day it would not be,
and that is the point at which this decision would have to be revisited.

**What it buys.** Every file opens in a text editor over SFTP. Backup is copying a folder. Restore is
copying it back. There is no database to install, tune, or explain in the setup document.

## Security: what replaces database grants

The previous design leaned on Postgres refusing `UPDATE` to the application's role. Files have no such
mechanism, so the protection is rebuilt from three independent parts. All three are required; each covers
what the others cannot.

### 1. The filesystem refuses modification

Two mechanisms are needed, and confusing them is the mistake this section exists to prevent.

**The directory attribute stops deletion.** `chattr +a` on `data/entries/`, `data/uploads/`, and
`data/logs/` means files can be created but not removed or renamed. That is all it does. **It does not
stop an existing file's contents being overwritten** — a directory attribute governs the directory, not
the bytes inside its files. Anyone with shell access could redirect output over yesterday's entry and the
directory attribute would not object.

**Sealing stops modification.** Each file gets `chattr +i` once the day it belongs to has closed. An
immutable file cannot be opened for writing at all.

Sealing needs `CAP_LINUX_IMMUTABLE`, which the server deliberately does not have — it runs as an ordinary
user. So sealing is a separate one-purpose program run by a timer as root, shortly after each day closes.
It takes a date, seals that day's files, and does nothing else. The server can write history and cannot
seal it; the sealer can seal and cannot write.

Two rules the sealer must respect, both learned by tracing what `+i` actually forbids:

- **Never seal a file that is still being appended to.** A day's entries are finished once the day has
  closed, so they can be sealed. The monthly audit and chain logs are not finished until the month ends —
  sealing the current month's file would make the next line impossible to write and stop the system dead.
  A day with no digest yet is also left alone, since it still needs to be closed.
- **Build the archive before sealing.** An immutable file cannot have a new hard link made to it, and the
  archive folder links to the day's slips. Archive first, seal second. The correction procedure reverses
  this and unseals first.

The residual window is the current day and the current month: those files are protected from deletion but
not from overwriting until they are sealed. That window is covered by the chain and by the digest already
sent off the machine, which is why neither is optional.

**On Windows the single mechanism does both.** An NTFS rule that permits create-and-append while denying
write and delete on existing files controls file contents directly, because NTFS separates those
permissions. No sealing step is needed. An administrator can still take ownership and rewrite the rule,
so Windows remains weaker against a determined attacker with admin rights — but stronger than a Linux
box where only the directory attribute was set, which is exactly the misconfiguration to avoid.

None of this is optional. A deployment with neither mechanism is one where anyone with shell access can
rewrite the record silently, which is the thing this project was asked to prevent. `start.sh` checks for
both and says which one is missing.

### 2. The chain makes tampering evident

Entries are chained **within a day, not across all time.** Each entry records its position in the day, the
hash of the previous entry in that same day, and its own hash. The day's last hash becomes the
`day_hash` in `_day.json`, and the month's chain log records one line per day. Editing an entry breaks the
rest of that day, its `day_hash`, and therefore its line in the chain log.

**Per-day chaining is a deliberate choice and the reason corrections stay possible.** A single chain
spanning all history would mean that fixing a mistyped amount from March requires rewriting every entry
file written since — tens of thousands of them — which both destroys the property that files are never
modified and gets worse every month the shop stays open. Confining the chain to the day means a
correction rewrites one day's folder and appends one line to the chain log.

What this gives up, and why it does not matter: a whole day's folder could be deleted without breaking any
chain. But the chain log lists every day that has ever closed, so a missing folder is detected by
comparing the log against the tree — which `verify-chain` does. The log is monthly precisely so that it
can be sealed once its month ends; a single ever-growing chain log could never be made immutable, and the
one record proving which days exist would stay overwritable forever.

- `verify-chain` reports the first day whose entries, digest, or chain-log line disagree. It runs
  nightly in full, and at startup over the open day and the tail of the current month's log only — a full
  scan at every restart would grow without bound as the shop accumulates years of files.
- The daily digest is appended to the chain log **and included in the nightly notification**. Once that
  hash has reached the owner's phone, no later edit on the machine can make the files agree with it
  again.

**Photos are checked separately, because they cost differently.** An entry names its photo's hash, so a
swapped or missing file is detectable — but only if something looks.

| Check | What it does | When |
| --- | --- | --- |
| `verify-chain` | Reads every entry file, recomputes the chain | Startup, nightly |
| `verify-photos --exists` | Confirms every referenced photo is present | Nightly — cheap, no file is read |
| `verify-photos --hash` | Rehashes every photo and compares | Weekly — expensive, reads tens of gigabytes |

A missing or altered photo raises the same alarm as a broken chain: the health endpoint, the log, and a
notification.

Tamper-evidence is weaker than tamper-prevention, and it is deliberately the second layer rather than the
first. Together they mean an attacker must both defeat the filesystem protection and forge a hash already
sent off the machine.

### 3. Everything mutable is audited

Users, settings, and note status are ordinary files that change. Every change appends a line to the
month's audit file — who, when, what changed, and the hashes before and after. Those files live in an
append-only directory, so the record of a change cannot be removed along with its effect.

**Sessions are exempt**, and the exemption is load-bearing rather than a shortcut: a session's last-seen
time moves on every request, so auditing it would write two files per API call and bury the interesting
lines under millions of dull ones. Session creation, revocation, and elevation are audited; the last-seen
timestamp is not, and is written at most once every few minutes rather than on every request.

### Who may do what

| | Staff | Admin |
| --- | --- | --- |
| Record entries | Yes | Yes |
| Edit or delete an entry | No | No — see corrections below |
| Notes: write, edit own, mark done | Yes | Yes |
| Everyday settings (language, receipt language, theme, starred currencies) | Yes | Yes |
| Categories and payment methods | No | Yes |
| User management, backups, notification and printer config, spreadsheet import, anything about the machine | No | Yes |

Admin actions require a **TOTP code** — six digits from an authenticator app — in addition to the session.
Losing the phone is covered by single-use recovery codes issued at enrolment and meant to be printed; if
those are gone too, the fix is deleting the `totp` block from the user's file.

The one thing nobody can do from a browser is modify a written entry. Corrections append.

## Correcting a mistake

Nothing in the running system can alter a written entry, and nothing appends to a past day either. A
reversal is a write, and writes only ever land in the current day — so a correction to yesterday cannot be
made from the app at all, by anyone, at any privilege level.

That leaves one path, and it is deliberate: **an administrator at the machine, as root, with the app
stopped.**

1. Stop the server.
2. Unseal the affected day and clear the directory attribute — both, in that order.
3. Export the day, edit it in a spreadsheet, and re-import it — or edit the files directly; both are
   documented.
4. Re-chain **that day only**, and write its corrected digest as a new file beside the original. The
   original `_day.json` is never renamed or removed; the corrected digest carries a timestamp in its
   name, and the newest one wins.
5. Rebuild that day's archive folder, since its links point at files that have just changed.
6. `verify-chain` and `verify-photos --hash`.
7. Re-seal the day, restore the directory attribute, and start the server.

**The digest that was already sent will no longer match, and that is correct behaviour, not a bug.**
The chain log keeps the original line and appends the corrected one with a reason between them, so the
history shows that a day was rewritten, when, and by whom. A shop that never sees this is a shop where
nothing was rewritten; a shop that sees it once knows exactly what happened. Hiding the mismatch would
throw away the only property that makes the chain worth having.

This is written up in `docs/RECOVERY.md`, not in the app's help, because it is not something the app can
do.

### Same-day corrections

Within the current day the ordinary path still works and needs no root: export the day to an editable
working copy, fix it in a spreadsheet, and import it. The importer appends a reversal for each changed or
removed row and a fresh entry for each changed or added one, in today's folder, where writes are allowed.
Originals stay exactly as written.

The admin upload in the app takes the same path and requires a fresh authenticator code. Every import
records the source file's hash, the operator, and the time.

## Time and closing the day

- Entries may be back-dated **within the current shop day only**. Yesterday cannot be written to, by
  anyone, from the app. This covers the real case — the network dropped for a few hours and the paper
  notes go in that evening — without opening a route to rewriting history.
- The shop day ends at a time set per shop in `config/shop.toml`. Not hardcoded, because not every shop
  closes at the same hour.
- **Which day that close applies to depends on the hour.** A close time in the afternoon or evening wraps
  up the day it falls in. A close time before midday wraps up **the previous calendar day** — a bar that
  closes at 02:00 is finishing yesterday's trading, not today's. Getting this wrong closes a day two
  hours old and leaves the real one open forever, so it is stated here rather than left to be inferred.
- **The day closes itself.** There is no close button and no closing screen. At the configured time the
  server writes `_day.json`, builds the archive folder, appends the digest to the month's chain log, and
  sends the notification. Nothing depends on a tired staff member remembering to press something at the
  end of a shift. The sealer runs after that, never before — archive links cannot be made to sealed files.
- If the server was off at that moment, it closes any unclosed past day at startup, using the entries it
  finds. A day is never left without a digest.
- **The drawer count is an entry**, of kind `count`, appended like everything else — one entry per
  currency counted, since an entry carries a single currency. Counting can happen any number of times a
  day; the close records the latest for each currency. Making it an entry avoids inventing a mutable file
  inside a directory where files cannot be rewritten.
- After a day closes, it accepts nothing further. Reopening is not an app feature — it is the root
  procedure described under corrections.

## Money

- Integer minor units, always with a currency code beside them. Never a float.
- **Amounts in different currencies are never added.** Every total is a set of per-currency totals. Today,
  Reports, and the drawer show the top-starred currency large and the others stacked below. There is no
  base currency and no exchange rate anywhere in this system.
- Every ISO currency is always available; a starred shortlist controls the picker's order.

## Online only

No offline queue, no local mirror, no sync. The fallback for an outage is paper, entered the same day.
What that requires: loss of the server is stated plainly without discarding a filled-in form; a save is
confirmed only after the server acknowledges it.

## An error must be a real error

The costly failure is a write that **succeeded while the client reported failure** — the staff member
types the sale again and the duplicate cannot be removed. So a timeout is not a failure; it means the
answer did not arrive.

Every write carries a client-generated idempotency key. The server keeps an index of keys **for the
current and previous shop day**, refuses a second file for one that already exists, and returns the
original instead. The window is bounded on purpose: a client retries within seconds, so keeping every key
ever issued would grow an index forever to defend against nothing. On a timeout the client reissues the
same request with the same key and learns the truth before saying anything. Only a server that answers
and says the entry does not exist produces an error message.

## Nothing happens silently

Every action that leaves the device shows that it started, what it is doing, and how it ended.

| Situation | Indicator |
| --- | --- |
| Dashboard, reports, entry list | Skeleton shaped like the real content |
| Photo upload | Determinate bar: megabytes sent of total, plus percentage |
| Pressed button awaiting the server | Spinner inside the button, label swapped to the verb, disabled |
| Background refresh | Quiet corner indicator; existing numbers stay readable |

A pressed control cannot be pressed twice. Failures keep the user's input and say what happened in plain
language. Optimistic updates are never used for ledger writes.

**The photo appears immediately** — drawn from the local file the instant it is chosen, rotated correctly
from its EXIF data, while the upload runs underneath with the progress bar over it. The megabyte counter
is what stops a staff member on slow Wi-Fi concluding the shot failed and taking it again. A stalled
upload says the connection has gone quiet and offers retry. This is the only place the interface runs
ahead of the server, and it is safe because it is only a preview.

## Photos

PNG and JPEG only, 10 MB ceiling. Screenshots arrive as PNG and are stored byte-for-byte. Camera photos
are stored as high-quality JPEG at full resolution — a photo re-encoded as PNG is eight times larger and
not one pixel clearer. HEIC converts to JPEG. Scaling happens only if a file is still over the ceiling
after conversion.

Roughly 25–35 GB a year at twenty slips a day. The health endpoint reports free disk space.

Photos are viewed in the app, served behind a session check; `data/` is never a static file tree. The
file's location is shown as copyable text, not a link, because a phone cannot open a path on the server.

**Two details that will bite:** EXIF orientation is discarded when an image is drawn to a canvas, so
receipts photographed in portrait get stored sideways unless the rotation is applied before encoding. And
no desktop browser decodes HEIC, so that case uploads the original and converts server-side.

## Notifications

Telegram and Discord, independent, both off until switched on.

- **Channels are declared in `config/notifications.toml`** — identifier, type, where the secret comes
  from. Plain text with comments, editable over SFTP.
- **Behaviour lives in `settings/` and is edited in the app** by an admin: which channels are on, which
  events fire, quiet hours, message language.
- Tokens are **write-only**. The app never displays one, not even masked, and never returns one from the
  API. The screen says connected or not configured. Confirmation comes from a test-send that reports
  delivered, rejected, or unreachable.

Events: the day closed and its digest hash; a payout above a configured threshold; a note flagged for the
owner; a failed backup; a broken chain or a missing photo.

## Backups

Optional, off until switched on, admin-only. A backup is a copy of `data/` — no dump step. Destinations
are declared in `config/backup-targets.toml` and referenced by identifier; the app never accepts a path
and never displays a credential. **Restore is a root procedure**, documented in `docs/RECOVERY.md`, never
in the app — it writes into a protected tree, and an interface that can do that is an interface that can
overwrite the ledger.

## Deployment

One machine in the shop. Debian is the reference; Windows is supported; macOS is for development.

| | Linux | Windows | macOS (dev) |
| --- | --- | --- | --- |
| Stops deletion | `chattr +a` on the directory | NTFS deny delete | None — startup warns |
| Stops modification | `chattr +i` per file, sealed nightly by a root timer | NTFS deny write on existing files | None — startup warns |
| Directory flush | Yes | Not supported | Yes |
| Service | systemd | Startup service | None |

The two rows above are separate mechanisms on Linux and a single rule on Windows. Setting only the
directory attribute on Linux leaves every file editable while appearing protected — the misconfiguration
most likely to happen and least likely to be noticed.

On Windows an administrator can take ownership and rewrite the access rule, so the protection is weaker
than a correctly sealed Linux install. The chain and the off-machine digest carry more weight there, and
`docs/SETUP-windows.md` says so rather than implying parity.

## Root procedures

Two things cannot be done from the app by design, and each is a documented procedure run as root at the
machine with the server stopped. Both live in `docs/RECOVERY.md`.

| Situation | Why it cannot be automated |
| --- | --- |
| Correcting a past day | Requires unsealing the day, clearing the directory attribute, and re-chaining |
| Restoring a backup | Writing into a protected tree; an automated restore is an automated way to overwrite the ledger |

Both end the same way: `verify-chain`, `verify-photos --hash`, restore the protection, start the server.

A forgotten password and a lost authenticator are **not** root procedures and need neither root nor a
stopped server — they are edits to the user's own file in `data/users/`, which is ordinary mutable
storage. What matters is that the app still offers neither: a route that resets an administrator's second
factor is a route around the second factor, whoever is holding it.

## Repositories

| Repository | Owns |
| --- | --- |
| `ShopArchive-Frontend` | React app, design tokens, screens, i18n, client-side image conversion |
| `ShopArchive-Backend` | Hono API, the file store, chain and audit, import/export, notifications, printing, backups |

Neither imports source from the other. The backend publishes an OpenAPI document generated from the Zod
schemas its routes validate against; the frontend generates its types from it and `npm run check` fails if
the committed output is stale. The backend also serves the built frontend, so there is one origin and no
cross-origin cookie handling to get wrong.

## Starting and stopping

Running this should not require knowing what a process manager is. The logic lives in one place — a small
command-line tool the server ships with — and each platform gets a thin wrapper that calls it. Two full
sets of scripts would drift apart; a wrapper cannot.

| Command | What it does |
| --- | --- |
| start | Checks config exists, checks both protections and warns separately about each, starts the server, records the process id, and prints the LAN address to open on a phone |
| stop | Graceful stop, waits for the current write to finish, confirms it stopped |
| restart | Stop then start |
| status | Running or not, for how long, LAN address, free disk space, both protections, last chain verification result |
| logs | Follows the log |

Wrappers: `start.sh` and friends on Linux and macOS, `start.cmd` on Windows, plus double-clickable
versions for whichever machine the shop uses. The frontend repository ships `dev` and `build` the same
way.

The details that make these safe rather than decorative:

- **Starting refuses to start a second copy.** Two servers writing the same tree is the one way to
  corrupt a store that otherwise has a single writer. It checks the recorded process id and the port
  before doing anything.
- **When a service is installed — systemd or a Windows service — the command delegates to it** instead of
  starting a second, unsupervised process beside it.
- **Failures are explained, not just returned.** A missing config file, a taken port, or an unwritable
  data directory each produce a sentence saying what to fix, not a stack trace.
- **Starting warns separately about each missing protection** — deletion protection on the directories,
  and sealing on closed days — and asks for confirmation. Reporting "protected" when only the directory
  attribute is set is the failure this check exists to catch. Running unprotected is a valid choice on a
  development machine and a serious problem on the shop's.
- Double-clickable wrappers keep the window open, so someone who double-clicks and sees a flash of black
  still gets to read what happened.

## Running on Windows

Debian is the reference and the documented recommendation, but nothing here should require Linux, and a
shop running Windows must be able to install this. It works, with three differences that are real and
must be handled in code rather than in a footnote.

**1. There is no `chattr` equivalent that behaves the same way.** Windows has no immutable attribute; the
nearest thing is an NTFS access rule that permits creating files and appending while denying write and
delete on existing ones — separate permissions on NTFS, which is what makes it possible. One rule does
what two mechanisms do on Linux, and no sealer is needed. It is weaker in one respect: an administrator
can take ownership and rewrite the rule. So the hash chain and the nightly digest sent off the machine
matter more there, not less, and `docs/SETUP-windows.md` says so plainly rather than implying parity.

**2. Directories cannot be flushed.** The durability step on Linux is to flush the file and then its
directory. Windows offers no directory flush, and calling for one fails. The store module handles this per
platform — file flush everywhere, directory flush where the platform supports it — and that difference
lives in one place, not scattered through the code.

**3. Filenames are more restricted.** Windows rejects `:` in a name, treats names case-insensitively, and
reserves a handful of words like `CON` and `NUL`. Every generated filename must therefore avoid colons
entirely, normalise usernames to lowercase, and reject reserved words — rules that cost nothing on Linux
and prevent a store written on one platform from being unreadable on another. A tree copied from a Linux
machine to a Windows one must open cleanly, and the test suite checks the generator against these rules on
every platform.

Also worth knowing: antivirus software briefly locks newly written files, so a write that fails as busy is
retried rather than reported as an error. Service installation uses Task Scheduler at startup or a service
wrapper; the setup document covers one path, not five.

## Accounts and getting in

Password first, always. Every account has one, and platform sign-in is a shortcut layered on top rather
than a replacement. The reason is the deployment: the shop's own network can be perfectly healthy while
the outside line is down, and an account reachable only through GitHub or Discord would be locked out by
an outage that never touched the shop. Paper is the fallback for the server being down, not for an
identity provider being unreachable while everything local is fine.

- One account can carry several linked identities. Linking happens from inside an account that is already
  signed in — "add a way to sign in". An unrecognised platform identity **never creates an account**, it
  is simply refused.
- Identities bind to the platform's numeric id, never to its username, because names on those platforms
  can be changed and reclaimed by someone else.
- Sessions last thirty days and renew with use, so the counter tablet is signed in once and stays that
  way. This, not the choice of identity provider, is what keeps the outside line off the daily path.
- A lock button covers stepping away: the screen locks, a short PIN unlocks it, the session survives. It
  is not a sign-out.
- Admin actions still require a fresh authenticator code, and that elevation expires quickly, so a tablet
  left on the counter is never still privileged.
- The account screen lists every session with its device and last-seen time, and any of them can be
  revoked from another device. That is the answer to a lost phone.

**There is no setup wizard and no create-admin command.** The first admin is a JSON file written into
`data/users/`, which is ordinary editable storage. A `password_plain` field is hashed and stripped the
first time the server reads the file, so nobody has to produce a hash by hand — and the same field is how
a forgotten password is fixed. Removing the `totp` block restarts authenticator enrolment. Two things
that would otherwise need root procedures are just file edits.

## Details settled in review

**Categories** are labels for grouping and nothing else. The list lives under Admin, separate from the
everyday settings staff can change. Entries store the category's identifier rather than its text, so
renaming one does not split last year's reports in two.

**Payment methods** are configured, not hardcoded, because wallets differ by country and by shop. Each
method carries a flag for whether it is physical cash, and that flag — not its name — is what the drawer
calculation uses. Adding "BCEL One" must never require a code change; miscategorising it as cash must
never be possible by accident.

**Refund and reversal both reference the entry they act on, and are never summed together.** A refund is
money that went back to the customer. A reversal is an entry that was typed wrong, where no money moved.
A reversal is not a quiet fix: the original stays exactly where it is, the pair is flagged in the entry
list and on the dashboard, and reports keep the two apart — "takings fell" and "someone mistyped an
amount" are different facts, and blending them hides both.

**Drawer counts are entries** of kind `count` — one per currency, since an entry carries a single
currency. Counting moves no money, but making it an entry avoids inventing mutable storage inside a
directory whose files cannot be rewritten. Counting again appends another; the close takes the latest per
currency, and the opening float carries over from the previous day's last count.

**A day is a calendar day** in the machine's timezone, midnight to midnight, and that is the folder it
lands in. The close time in `config/shop.toml` is when the day gets wrapped up and its digest written —
not the boundary between folders. A sale rung up after the close time belongs to tomorrow, and the
interface says so rather than silently filing it.

**Logs are monthly files** — `audit-2026-08.log` and `chain-2026-08.log`. Ordinary rotation renames files,
and these directories forbid renaming, so the month has to be in the name from the very first line
written. The chain log is monthly for a second reason: a single ever-growing file could never be sealed,
leaving the one record that proves which days exist overwritable forever.

**Nothing is ever deleted.** There is no retention policy and no cleanup job. Disk is the limit, the
health endpoint reports it, and the setup documents state what a year costs.

**Printing goes through the browser** by default, with a print stylesheet for the day summary and for a
single entry. The receipt language is its own setting, separate from the interface language, since the
person reading a receipt is often not the person using the app.

**Thermal printers are supported as an option, off unless configured.** A shop that has one gets a real
receipt; a shop that does not never sees the feature. The printer is declared in
`config/printers.toml` — name, connection, width in columns — and referenced by identifier, the same
pattern as backup destinations and notification channels, for the same reason: the app must never accept
a device path or an address typed into a browser.

Three things this has to get right, because thermal printing is where naive implementations break:

- **The server prints, not the browser.** A phone cannot reach a USB or network printer sitting behind the
  counter, and asking each device to pair with it would be a support problem in every shop. The client
  asks the server to print; the server owns the connection.
- **Lao and Thai are the hard part.** Most thermal printers render these scripts badly or not at all from
  raw text, so a receipt is rendered to an image at the printer's column width and sent as a bitmap. It
  is slower and it is the only approach that reliably prints the shop's own language.
- **A failed print is never a failed sale.** The entry is already written; printing is a separate step
  that reports its own outcome and can be retried from the entry. Paper jamming must not produce an error
  that looks like the takings were lost.

What is deliberately not in scope: cash drawer kick, barcode scanning, and printer discovery. A printer
that is not declared does not exist.

**API errors use one envelope** — a stable machine-readable code, a human sentence, and optional field
detail — so the client never has to parse prose to decide what happened. Long ranges page by day folder
rather than by offset, which matches how the store is laid out.

## Milestones

**M1 — log a day's takings.** Scaffold; the file store with chain and index; auth with TOTP; entries; the
client shell; the Record screen.

**M2 — read the day.** Today; the drawer count; the automatic close, digest, and archive folder.

**M3 — the rest.** Notes; Reports and export; settings and user management.

**M4 — production.** Notifications; backups; the same-day spreadsheet round-trip; `verify-chain` and
`verify-photos`; append-only protection and service installation on Linux and Windows; the root
procedures in `docs/RECOVERY.md`.

Documentation ships with each milestone, not at the end.

## Documentation set

Both repositories: `CLAUDE.md`, `docs/PLAN.md`, `README.md`.

`ShopArchive-Backend`: `docs/ARCHITECTURE.md`, `docs/FILE-FORMAT.md` (every file's shape, the chain, the
audit log), `docs/API.md`, `docs/SETUP-dev-macos.md`, `docs/SETUP-debian.md`, `docs/SETUP-windows.md`,
`docs/USAGE.md`, `docs/RECOVERY.md` (the two root procedures, the user-file fixes, and what a broken chain
means).

`ShopArchive-Frontend`: `docs/DESIGN-SYSTEM.md`, `docs/SCREENS.md`, `docs/I18N.md`, `docs/SETUP-dev.md`.

## Carried over from BuncheeNgern

From `Buncheengern/.claude/worktrees/v2-phase3.4c-responsive-nav/i18n/`: `currencies.js` as seed data,
`lang_meta.js` for the language picker, and the eighteen `lang_*.js` files as a translation memory mapped
by hand onto the new key set. Lao, Thai, and English complete from the first release. Everything else from
that project stays behind.

## Next step

Backend task documents first, since the frontend's types are generated from its routes: backend P0
scaffold, backend P1 the file store, then frontend P0.

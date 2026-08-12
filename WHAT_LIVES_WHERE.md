# What lives where, and what happens where

**smbX.ai · the map · 12 August 2026**

Written because two repos, one empty folder and one stray snapshot had become
four things that all looked like "the repo," and the wrong one kept getting
opened. This is the single answer. If something below stops being true, fix
this file first and the thing second.

---

## The one-sentence version

There are **two** repositories. One deploys the website and holds the engine
that builds collateral; the other is the practice's private research workspace
and deploys nothing. Everything else on the disk with "SMBx" in its name is
debris.

---

## The two repositories

| | **ENGINE + WEBSITE** | **WORKSPACE** |
|---|---|---|
| **Local path** | `~/Documents/GitHubRepos/SMBx-live/SMBx` | `~/Documents/smbx-studio` |
| **Remote** | `paulbryantbaker-art/SMBx` | `smbx-ai/smbx-studio` |
| **Visibility** | public site; repo private | **private, and must stay private** |
| **Deploys** | **YES — Railway builds smbx.ai on every push to `main`** | no |
| **Tracked files** | ≈1,720 | ≈700 |
| **Push when** | the website must change | freely, it costs nothing |

### What is in the ENGINE repo

```
house/            18 files   the design language — tokens, deck.ts, audit.ts
scripts/studio/   59 files   the builders and the guards (see the table below)
studio-kit/       12 files   the render harness the builders drive
vite-plugins/      1 file    report-markdown.ts — turns a report .md into a web page
client/          400 files   the smbx.ai front end
server/          370 files   the API, Yulia, the report gate
shared/            8 files   reports.ts — the published-report registry
content/studio/   14 files   copies of the workspace method docs, + sync.mjs
scripts/studio/reports/      the .md of each PUBLISHED report + its cover art
```

### What is in the WORKSPACE repo

```
markets/<market>/            research/ · master.md · versions/ · documents/
                             screen/ · specs/ · media/ · collateral/ · decks/
assets/                      the shared house image library
CLAUDE.md  PLAYBOOK.md  RESEARCH.md  DESIGN.md  FORMATS.md  REPORT_TEMPLATE.md
clients/  deals/             the confidential practice record
```

Markets built so far: `commercial-mep` · `elevator` · `fire-safety` ·
`home-services`.

---

## The debris — do not run against these, do not push to them

| Path | What it actually is | Do |
|---|---|---|
| `GitHubRepos/SMBx-main` | **empty folder.** No `.git`, no `package.json`. `CLAUDE.md` pointed `REPO` here from 27 July until 12 August, so every documented command aimed at nothing. | delete |
| `GitHubRepos/smbx-engine` | remote `smbx-ai/smbx-engine`. Two commits, **unrelated history** — a snapshot of the website repo uploaded whole. Deploys nothing. 13 files it has that SMBx does not are backups and two orphan scripts. | salvage `art-normalize.mts`, then delete |
| `GitHubRepos/Git` | a GitHub **issue export** (JSON dumps of issues, PRs, comments). Not a repo. | archive off the working disk |
| `GitHubRepos/SMBx-live/` | a wrapper folder holding one thing — the real repo. Harmless, but it is why the path has "SMBx" twice and reads as two repos. | flatten one day, low priority |
| `_to_delete/` | 95 MB in the workspace, 124 KB in GitHubRepos. The bridge cannot delete, so retired files are moved here. | empty it by hand |

---

## What happens where

### Research and writing → **workspace**, cloud session

Six passes, in the workspace, on the workspace's own copy. The cloud session
does the thinking; nothing needs the engine until there is a document.

```
research/ gather → master.md synthesize → audit → verify against primary sources
```

The audit is pure computation and runs anywhere:

```bash
export REPO=~/Documents/GitHubRepos/SMBx-live/SMBx
cd ~/Documents/smbx-studio
npx tsx $REPO/scripts/studio/audit.mts markets/<market>
```

### Rendering collateral → **engine**, on the Mac

The builders drive a headless Chrome. Chrome is on the Mac; it is not in the
device sandbox. This is a local Terminal command and needs no session at all:

```bash
export REPO=~/Documents/GitHubRepos/SMBx-live/SMBx
cd ~/Documents/smbx-studio
npx tsx $REPO/scripts/studio/build-deck.mts markets/<m>/specs/<name>.deck.mts \
  --media markets/<m>/media --out markets/<m>/collateral/<slug>/$(date +%F)
```

Output lands in the **workspace**, under that market. It never goes near the
website repo unless it is being published.

### Publishing a report to smbx.ai → **engine**

Three steps, and the third is the one that gets forgotten:

1. Put the report `.md` in `SMBx/scripts/studio/reports/`.
2. Build the gated PDF and the link-preview card
   (`build-report.mts`, `build-og-card.mts`).
3. Add an entry to **`shared/reports.ts`** *and* one line in
   **`client/src/practice/reports/registry.ts`**. A file in `reports/` that is
   in neither is invisible — `home-services-master-assessment.md` and
   `the-quiet-repricing.md` sit there today, orphaned.

Push `main`. Railway builds and deploys automatically.

---

## The rule that keeps being broken

> **A report published on the website is a COPY of a workspace document. Copies
> drift. The copy is not allowed to be edited.**

On 12 August the two live home-services reports were found carrying band labels
the workspace master had corrected: 307 establishments published as the 10–249
band when it is the 20–249 band, and platform share published as 8.5% of a band
where it is 4.3%. The workspace was right and had been right for a day. The
website was wrong and was live.

The fix was not to patch the website copy. It was to **replace the body
wholesale from the workspace document**, so the two are the same text again.
That is the only maintenance rule that survives contact with a correction:

```
markets/<m>/documents/<doc>.md    ──copy──▶    SMBx/scripts/studio/reports/<slug>.md
        (source of truth)                              (never edited in place)
```

Only the `<!--cover-->` block differs, because the website has its own art set
(`hs-*.jpg`, `fs-*.jpg`, `mep-*.jpg`) while the workspace uses `cover-*.jpg` and
`band-*.jpg`. Everything below the first `---` must be identical. Check it:

```bash
strip(){ awk 'BEGIN{i=0} /^-->$/{if(!i){i=1;next}} i' "$1"; }
diff <(strip ~/Documents/smbx-studio/markets/home-services/documents/market-assessment.md) \
     <(strip $REPO/scripts/studio/reports/home-services-state-of-market.md) && echo "in sync"
```

`content/studio/` in the engine repo is the same pattern for the method docs,
and `content/studio/sync.mjs` exists to keep both ends fresh. **It is not
installed in the workspace** — there is no `sync.mjs` and no `.smbx-repo` there
— so nothing is currently pulling either end down automatically.

---

## The guards, and what each one catches

All in `$REPO/scripts/studio/` unless noted.

| Guard | Catches |
|---|---|
| `house/audit.ts` + `audit.mts` | a figure in the master that appears in no research file |
| `house/__tests__/audit.test.mts` | the auditor itself going blind (`npm run test:audit`) |
| `sourcing-protection.mts` | sources citing each other — SELF, OPAQUE, MONOCULTURE, SYNDICATION, NO INSTRUMENT |
| `carta-guard.mts` | anything still building in the retired Ledger design language |
| `verify-spec.mts` | a spec figure that is not in the master it claims to render |
| `voice-check.mts` | house-voice violations in captions and body |
| `design-check.mts` | slot and layout violations against `FORMATS.md` |
| `art-prompt.mts` | art briefs that do not match their slots |
| `retired-check.mjs` | a retired figure creeping back in |

Order that matters: **sourcing and citation work comes before any Carta
rebuild.** Rendering a beautiful deck off unverified research is the expensive
mistake, not the ugly one.

---

## Push order

The workspace and the engine are independent. There is no ordering constraint
between them *except* the copy rule above:

1. Correct the **workspace** document first. Push `smbx-studio` freely.
2. Only then copy into `SMBx/scripts/studio/reports/` and push `SMBx`.

Pushing SMBx deploys. Pushing SMBx with a stale copy publishes the stale copy —
which is exactly what happened on 12 August.

**Never push from a cloud session.** There is no credential helper on the
device and GitHub is signed in with Google. Commit through the bridge if
necessary, then press Push in GitHub Desktop.

---

## Known open items

- `home-services/master.md` — 124 figures still unexplained by the audit.
- Sourcing pass not finished on `hs-buybox`, `mep-comp-basis`,
  `fire-safety-teardown`.
- All carousels and one-pagers still to be rebuilt in Carta.
- `build-icons.mts` and `build-og-card.mts` — carta-guard's last two findings;
  convert or retire.
- `LEDGER` still exported from `house/tokens.ts`. Deleting it is the permanent
  fix — a guard catches a mistake, an absent symbol prevents it.
- Elevator: 8 images to generate, then render the collateral.
- `_to_delete/` — 95 MB, needs emptying by hand.

---

*If a future session reads only one thing in this practice, read this file and
`CLAUDE.md`. Between them they say where everything is and what may be run
against it.*

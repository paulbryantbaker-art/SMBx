# THE WEEKLY SWEEP — the standing job for the Saturday agent

> **ONE CLONE (2026-08-18) — read before acting on any path in this document.**
> This workspace now lives at **`studio/` inside the SMBx repo** — the one
> clone at `~/Documents/GitHubRepos/smbx-prod`; the engine is `..`. The old
> `~/Documents/smbx-studio` folder and its remote `smbx-ai/smbx-studio` are
> history. Where this document says `$REPO`, that is now the parent of this
> folder; where it says "the workspace repo" or "the engine repo", they are
> the same repo. **Nobody commits to `main`** — branch (`cowork/<topic>` ·
> `claude/<topic>`), PR, Paul merges; a cloud session cannot push. Full
> statement: the ONE CLONE section at the top of `CLAUDE.md` in this folder.
> Everything below is otherwise unchanged and still binding.


> Paul, 2026-08-10: *"why can we not have a series of agents that automate some
> of these processes where the agent goes out and does the industry research
> every week for the verticals that we use, and brings back an update the docs
> and maintains other collateral"* → *"All markets should update weekly starting
> in Saturday and Email me the delta of what's new or changed on Sunday."*

This is the prompt. A session that opens on this workspace on a Saturday reads
this file and runs it. `CLAUDE.md`, `PLAYBOOK.md`, `FORMATS.md` and `DESIGN.md`
sit beside it and still govern — **nothing here relaxes them.** If this file and
the citation law disagree, the citation law wins.

---

## The four rules that make this safe to run unattended

**1. You may WRITE. You may not PUBLISH.**
Fold research into masters, update documents, rebuild collateral, open a pull
request. Never post to LinkedIn, never email a client or a counterparty, never
send anything to a third party, never touch the app's CRM or outreach queue.
Same law the outreach machine already runs on: *one touch, one press, one
human.* You assemble; Paul releases.

**2. Every change lands in a pull request, never straight on the main branch.**
The branch is `weekly/<iso-date>`. The PR is the review gate — it is the entire
reason this arrangement is safe, because it is the one place Paul can say no.
A master rewritten in place with no diff to read is a liability.

**And the PR is not the finish line — Paul's Mac is** (2026-08-10: *"the only
thing that I want to be sure that happens is that the Docs.MTS and the
collateral all get updated on the Mac on disk. Where the work is processed I
don't care."*). **Git is a transport, not a destination.** A merged PR puts
nothing on that machine; until something pulls, every builder there renders from
a stale master, silently and with no error. `sync.mjs` in the workspace closes
it — hourly via launchd, `--ff-only` so it can never eat an uncommitted edit.
So: commit the collateral you build, not just the masters. A PDF left
uncommitted in `collateral/` never reaches him.

**3. One market a week, and a quiet week is allowed.**
Masters get a QUARTERLY refresh; the weeks are just how the verticals queue.
`weekly.mts due` names whose turn it is and exits `0` when nobody's is — that
means stop, not "find something to do". An agent that must produce a change
every week will eventually produce one that isn't there.

**4. When you are unsure, write it down and leave it alone.**
An honest "the sources disagree and I did not resolve it" in the digest is worth
more than a smoothed number. Two sources with different figures is a FINDING —
keep both values, cite both, never invent the midpoint.

---

## Saturday — ONE market, in order

Run these from the workspace root. `<repo>` is wherever the SMBx repo is cloned.

### 0. Whose turn is it?

```
npx tsx <repo>/scripts/studio/weekly.mts due
npx tsx <repo>/scripts/studio/weekly.mts status
```

**A market assessment does not need refreshing every week** (Paul, 2026-08-10:
*"once the market assessment is in place, it probably really only needs to be
updated quarterly for each vertical (so 1 per week)"*). Markets do not move
week to week; a weekly re-read of every one of them would mostly re-find what
the master already says, and would burn the rate limit doing it.

So the weeks are a **ROTATION**. `due` names the ONE market whose master is
furthest past its quarterly cycle. Its first line is `DUE: <slug>` or
`DUE: none`, and its exit code is the instruction:

| Exit | Meaning |
|---|---|
| `0` | **Nothing is due. Stop — do not do the research steps.** Go to Sunday's digest; a quiet week is a correct week. |
| `1` | Work the market it named. **That one, not the others.** |
| `2` | Either the workspace is not in git (so nothing can be dated), or there are more markets than a one-per-week rotation can hold. Report it in the digest; do not silently pick something. |

`status` then gives the detail on that market — what research is sitting
unfolded, which theses have gone stale.

**A market with NO master is not in the rotation.** Building a first master is
the full hunt in `RESEARCH.md` — roughly 20 runs over several hours, spanning
more than one session. That is Paul's decision to start, not a Saturday cron's.
`due` lists them separately; name them in the digest and leave them.

### 1. Refresh that market — a quarterly review

`RESEARCH.md` is the method and is not restated here: the run discipline, the
frame file, one file per run, the coverage log, the stop condition. This is hunt
**B**, and all of it applies.

**Scope it to a quarter's worth of movement, not a rebuild.** The master is
already good; you are asking what has changed in three months. That is deeper
than a weekly skim and much shallower than a first build — expect several runs,
not twenty, and not two.

What you are looking for, in priority order:

- **New primary data** — a regulator, a licensing board, a census release, a
  trade association's own numbers, a company's own filing or site.
- **Movement in the consolidator set** — an acquisition, a new platform, a fund
  raising for the space. A quarter is long enough that this genuinely moves, and
  a stale `screen/consolidators.md` is how a franchise location gets screened as
  independent.
- **Anything that CONTRADICTS the master.** A contradiction is the single most
  valuable thing you can bring back. Do not quietly drop it because it is
  inconvenient — a master that only ever accretes agreeing evidence is not
  research, and reporting one is the best week this job can have.

If a quarter genuinely turned up nothing that moves the master, that is a
legitimate result. Say so and change nothing. **Do not manufacture an update to
justify the week.**

### 2. Fold it into the master

Follow `CLAUDE.md`'s synthesis law exactly. Write the new master to
`markets/<m>/versions/master-v<N+1>.md`, then copy it to `master.md`. Never edit
`master.md` alone — the versions folder is the history, and `thesis.mts` reads it
to decide what is stale.

### 3. Audit it — this is not optional

```
npx tsx <repo>/scripts/studio/audit.mts
```

Exit `0` clean · `1` not clean · `2` **not audited** (no machine-readable
source). Treat 2 as seriously as 1: a clean bill that ignored half the sources
is worse than none.

If it exits 1, fix the named figures and re-run. If you cannot fix one, **keep
the version, mark it in the digest, and say which figure is unexplained.** Never
delete the `## Derivations` section to make the audit pass — that is cheating a
check that exists to protect a client document.

**The honest limit, and you must carry it into the digest:** the audit checks
NUMBERS, not prose. A fabricated qualitative claim carries no figure and passes
clean. So any master you changed goes in the digest as *"read this before
quoting it"*, every time, no exceptions.

### 4. Check what the change broke

```
npx tsx <repo>/scripts/studio/thesis.mts check
```

Exits 1 if an ACTIVE thesis is now behind its master. **Do not rewrite the
thesis** — a thesis is a position Paul holds, not a document to regenerate. Name
it in the digest and leave it.

### 5. Collateral — rebuild, do not redesign

Only rebuild what the master's change actually invalidated. If a figure on a
carousel page moved, re-run the builder. If nothing a piece of collateral says
has changed, leave it alone.

Never hand-roll HTML or CSS. The three builders are deterministic; an output
that looks wrong means a wrong SPEC, not a wrong renderer (`FORMATS.md` §1).

### 6. Commit and open the PR

One commit per market, so the diff reads. Then one PR for the week, titled
`Weekly sweep — <date>`, whose body is the digest from Sunday's step. If nothing
changed — a quiet week, or `due` exited `0` — **open no PR at all.** An empty
weekly PR trains Paul to stop reading them, and the whole design rests on him
reading them.

**Commit the collateral you build, not only the masters.** A PDF left
uncommitted in `collateral/` never reaches his Mac, and that failure looks
exactly like the builder never having run.

**Except video — never commit a `.mov` or `.mp4`** (2026-08-14). A screen
recording of the MACHINE element runs to hundreds of MB, and **one file over
100MB permanently blocks pushing this repo**: the blob enters the history at
commit time, so removing it in a later commit does not undo it. `.gitignore`
already excludes them; do not `git add -f` past it. Commit the `machine.html`
beside the render instead — that is the regenerable source, and it is what
MACHINE.md treats as the artifact.

---

## Sunday — the email

```
npx tsx <repo>/scripts/studio/weekly.mts digest --out digest.md
```

Reads the delta out of **git**, so it is exact rather than remembered. Summary
first, because this gets read on a phone. Then send it to Paul with the PR link.

Add, in your own words, three things the tool cannot compute:

1. **What you found that mattered** — one line per market, in plain English. Not
   a file list; the tool already did that.
2. **What contradicted the master**, if anything. Lead with it.
3. **What you could not resolve** — sources that disagree, a figure you could
   not source, a market where the search turned up nothing.

Then stop. Do not summarise what you plan to do next week; do not offer to
publish anything.

---

## What this job never does

- Post to LinkedIn or any social account.
- Email anyone except Paul.
- Touch the app — no CRM writes, no outreach queue, no deal rows. The bridge
  (`push-crm.mts`) is a thing Paul runs, not a thing that runs on a timer.
- Contact a counterparty, a seller, a broker or an advisor in any way.
- Quote a fee, or write anything about pricing (`THE LINE`).
- Build a target map from a market master. A market master contains no target
  list, and inventing one invents companies — the worst failure this practice
  has. Targets come from `screen.mts` and a real register.
- Delete a master version. The history is the point.

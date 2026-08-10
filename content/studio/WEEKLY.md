# THE WEEKLY SWEEP — the standing job for the Saturday agent

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

## The three rules that make this safe to run unattended

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

**3. When you are unsure, write it down and leave it alone.**
An honest "the sources disagree and I did not resolve it" in the digest is worth
more than a smoothed number. Two sources with different figures is a FINDING —
keep both values, cite both, never invent the midpoint.

---

## Saturday — per market, in order

Run these from the workspace root. `<repo>` is wherever the SMBx repo is cloned.

### 0. Pre-flight — read the board before touching it

```
npx tsx <repo>/scripts/studio/weekly.mts status
```

Every market, what version its master is on, what research is sitting unfolded,
which theses have gone stale. **Free, no model, no network.** Do this first; it
tells you which markets actually need work and stops you re-researching one that
was updated on Thursday.

### 1. Research the vertical — a REFRESH, not a hunt

**`RESEARCH.md` is the method and it is not restated here.** Read it: the run
discipline, the frame file, one file per run, the coverage log, the stop
condition. This step is hunt **B** (how a market works), and everything
`RESEARCH.md` says about it applies unchanged.

**The one thing that IS different, and it is the important one: a full hunt B is
~20 runs over several hours, spanning more than one session. A weekly sweep is
not that.** Attempting a full hunt every Saturday across every market would
burn hours, hammer the rate limit, and mostly re-find what the master already
says. The weekly job is a DELTA pass — typically two to five runs per market,
looking only for what has moved since the master's last version:

- **New primary data** — a regulator, a licensing board, a census release, a
  trade association's own numbers, a company's own filing or site.
- **Movement in the consolidator set** — an acquisition, a new platform, a fund
  raising for the space. This is what makes `screen/consolidators.md` go stale,
  and a stale register is how a franchise location gets screened as independent.
- **Anything that CONTRADICTS the master.** A contradiction is the single most
  valuable thing you can bring back. Do not quietly drop it because it is
  inconvenient — a master that only ever accretes agreeing evidence is not
  research, and reporting one is the best week this job can have.

A full re-hunt is a decision Paul makes, not something a Saturday cron starts.
If a market looks like it needs one — the master is many months stale, or the
delta pass keeps turning up contradictions — **say so in the digest and let him
call it.**

If a week turns up nothing new for a market, that is a legitimate result. Say so
and move on. **Do not manufacture an update.**

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
changed in any market, **open no PR at all** — an empty weekly PR trains you to
stop reading them.

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

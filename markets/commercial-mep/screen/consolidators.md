# Consolidator register — commercial MEP

**What this file is for.** `house/screen.ts` calls a candidate *independent* when
it is **not in here**, and nothing more. This register is the thing standing
between an already-owned business and the top of a draft board. Its completeness
is the ceiling on every affiliation verdict downstream.

**Seeded 2026-08-03** from `markets/home-services/master.md` §4.3 and Part XI
§11.3 — named entities only, nothing invented. Every parent below holds a
**verified Dallas–Fort Worth operating location**, established by a
parent-by-parent check of published rosters and recorded in that market's
correction A.0.4.

### What this register is NOT, yet

> **Every `domains:` line is empty.** No domain was verified in the DFW pass, and
> none is guessed here — an invented domain is worse than a missing one, because
> a missing one is visibly a gap and an invented one is silently wrong. The
> doctor reports this as a blocker. **That is correct.** Do not run a screen
> against this register until a domain pass has been done: domain matching is
> what catches a location whose sign name changed after the close, and a
> name-only register misses every post-close rebrand silently.

> **This is a Dallas–Fort Worth seed, not a national register.** PremiStar
> (Partners Group; 52 branches, 16 states, ≈2,400 employees) is in the
> home-services master §4.3 with no DFW location recorded and belongs here the
> moment this market goes national. The electrical side — NAICS 238210 — has
> never been screened at all.

> **"Independent" in any output derived from this file means "unmatched," not
> "confirmed independent."** Paul's standing instruction, 2026-08-01. It applies
> here with more force than in home services, because this register is one metro
> deep.

The shape the parser reads — lines that are not `backer:`, `brands:` or
`domains:` are ignored, so `dfw:`, `note:` and `source:` are for the reader:

```
## Parent Name
backer: Sponsor
brands: Brand One, Brand Two
domains: parent.com, brandone.com
```

---

# Commercial-mechanical platforms with a verified DFW location

## Comfort Systems USA
backer: Public — NYSE: FIX
brands: DynaTen
domains:
dfw: DynaTen, Fort Worth.
note: FY2025 mix 73.3% mechanical / 26.7% electrical. The widely quoted 78.7% is FY2024 — corrected in home-services A.0.3 §D.
source: markets/home-services/master.md §4.3, §11.3

## EMCOR Group
backer: Public — NYSE: EME
brands: Dallas Mechanical Group
domains:
dfw: Dallas Mechanical Group, reporting more than 150 employees.
note: "≈21–23x" is defensible on P/E (23.47x) and about seven turns too high on EV/EBITDA (16.34x). Label the basis or do not use the number.
source: markets/home-services/master.md §4.3, §11.3

## Modigent
backer:
brands: Infinity Contractors, Evolution Mechanical, Southland
domains:
dfw: Infinity Contractors (Fort Worth); Evolution Mechanical (Irving).
source: markets/home-services/master.md §11.3

## Crete United
backer:
brands: CBS, CUES
domains:
dfw: CBS (Mesquite); CUES (Dallas).
note: HQ Charlotte. "CBS" and "CUES" are both under five characters and will be DISCARDED by the name matcher — these two can only be caught by domain.
source: markets/home-services/master.md §11.3

## Service Logic
backer: Bain Capital + Mubadala, closed December 2025
brands: Air Texas Mechanical
domains:
dfw: Air Texas Mechanical, Addison.
note: No enterprise value was ever disclosed by any party. The "$3.1B" in circulation is a debt financing package (Bloomberg, 2025-11-04); "$4.1B" has no source at all.
source: markets/home-services/master.md §4.3, §11.3

## Astra
backer:
brands: Texas Chiller Systems
domains:
dfw: Texas Chiller Systems, Farmers Branch.
note: "Astra" is a generic word and a false-affiliated verdict suppresses a genuine target, which is the more expensive error in a buy-side screen. Catch by domain.
source: markets/home-services/master.md §11.3

## United Building Solutions
backer:
brands: DFW Mechanical Group
domains:
dfw: DFW Mechanical Group, Wylie.
note: Entered the metro on 2026-01-20 by acquiring DFW Mechanical Group — one of only two recorded 2026 moves in DFW, both in the same direction.
source: markets/home-services/master.md §11.3

## FirstCall Mechanical
backer:
brands:
domains:
dfw: A DFW branch. No brand nameplate recorded.
source: markets/home-services/master.md §11.3

---

# Known gaps in this register

- **Every domain.** See the block at the top. This is the first job.
- **PremiStar** — in the home-services master, no DFW location recorded.
- **All of NAICS 238210**, the electrical side. Never screened.
- **Commercial plumbing.** The claim that no national pure-play consolidator
  exists there is **unverified** — it comes from the CDaaS strategy document in
  `research/_meta/` and is the first hypothesis this market should test. If it
  is true, the emptiness of this section is the thesis. If it is false, this
  section is simply incomplete. Right now we cannot tell those two apart, and
  that distinction is the whole market.

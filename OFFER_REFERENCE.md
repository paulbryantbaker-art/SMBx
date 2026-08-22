# smbX offer reference — names and the fee schedule

**For updating offer collateral. 2026-08-22.**
Every figure below is read from `house/engagement.ts` or computed from its
constants — none is quoted from memory or from a prior document.

---

## 1. The offerings

| Name | We… | For a buyer who… | Status |
|---|---|---|---|
| **smbx Run** | run the deal, through close | has no corp-dev function, or no capacity | Renamed from smbx Run |
| **smbx Run Pro** | the same, continuing through integration (PMI0–PMI3) | wants the value-creation phase covered | Renamed from Premium |
| **smbx Build** | make your team better at running it | has a team that needs a sharper method | NEW |
| **smbx Go** | fill the seats on your team | has the mandate and is short a body | NEW |

**smbXDefinitive** is the process behind all four. 🟡 **Open:** does it become
**smbx Definitive** for consistency, or stay camel-case because it names the
method rather than a product? It is the only name in the set still undecided.

**These are ENGAGEMENT names, not app products.** The app is never sold.

### smbx Go — the six seats
Not a list: these are the seats along the engagement track the site already
publishes, one per phase.

| # | Seat | Owns | Phase |
|---|---|---|---|
| 1 | CD Project Manager | The calendar, workstream owners, the close checklist | B3–B5 |
| 2 | CD Analyst | Valuation, LBO, the model build, QoE support | B2 |
| 3 | Diligence Manager | The DDQ, the data room, the issues log, specialist coordination | B3 |
| 4 | Sourcing Associate | Target list, outreach cadence, owner conversations | B1 |
| 5 | Integration Manager | Day 0 → 100 days, workstreams, synergy tracking | PMI0–3 |
| 6 | Interim Head of Corp Dev | Thesis, IC and board reporting, leading the negotiation | B0 + all |

Do not add a seat named *counsel*, *tax* or *appraisal* — THE LINE says we
coordinate those specialists, we do not seat them.

---

## 2. smbx Run — the fee schedule (LAW, unchanged)

**ONE schedule, every client, no negotiated pricing.** The no-negotiation
posture is itself a loyalty statement: the fee cannot grow by talking a client
into a bigger deal.

### Retainer
**$15,000 per quarter, paid up front.** The first quarter IS the engagement;
each renewal is another $15,000 quarter up front; step away at any quarter's end.

> A monthly cadence was shipped and reversed inside an hour on 2026-08-17. The
> arithmetic that caused it: **$15,000 a quarter IS $5,000 a month.** A request
> to "make it $5K monthly" is already satisfied on the money and asks only about
> the BILLING UNIT — and the unit is the deliberate part, because a quarter
> commits three months where a month lets a client leave after thirty. Do not
> redo this.

### Success fee — banded like tax brackets, no cliffs
Each dollar of enterprise value is priced in its own band.

| Band | Rate |
|---|---|
| First $1M | **5%** |
| $1M – $5M | **4%** |
| $5M – $10M | **3%** |
| Above $10M | **2%** |

**Minimum $100,000.** The floor binds below **$2.25M** EV — at exactly $2.25M the
banded total equals the floor, so nothing is lifted.

### Worked anchors — computed from the constants, safe to publish in the brochure

| Enterprise value | Success fee | Effective |
|---|---|---|
| $1.80M | $100,000 | 5.56% — floor |
| $2.25M | $100,000 | 4.44% — floor stops binding |
| $3.46M | $148,400 | 4.29% |
| $5.00M | $210,000 | 4.20% |
| $10.00M | $360,000 | 3.60% |
| $15.00M | $460,000 | 3.07% |
| $32.58M | $811,600 | 2.49% |
| $50.00M | $1,160,000 | 2.32% |

> CLAUDE.md records the $32.58M anchor as "$811.5K". Computed from the constants
> it is **$811,600**. Use the computed figure; the constants are the truth.

### The credit
**Every retainer dollar is credited against the success fee at close.** It is
prepayment, not a refundable deposit:
- Credit caps at the fee — a long mandate on a floor deal owes $0 at close, and
  the excess is **not** refunded.
- **No close, no credit.** Retainers are earned as the work runs.

### smbx Run Pro
**Adds no second formula.** The retainer simply continues through integration.
Add-on acquisitions run the same schedule; one retainer covers the platform.

---

## 3. smbx Build and smbx Go — NO FIGURES EXIST YET

🔴 **Do not put a number for these in any collateral.** None has been set, and
nothing in the repo carries one. The SHAPE is decided; the figures are yours.

- **smbx Build** — quarterly retainer, paid up front, **no success fee ever**.
  Same unit as the mandate. Must sit meaningfully below $15,000/quarter or it
  cannibalises: a buyer who would pay mandate money for coaching buys the mandate.
- **smbx Go** — per seat, per month, minimum one quarter. The seat is smbX's
  person, not the client's hire. Needs a **convert-to-hire fee** in the contract
  from day one, or smbX is a free recruiter.

**Never attach a success fee to a Coach or Crew engagement.** It re-creates the
exact structure the perimeter exists to prevent — contingent money out of a
transaction — without the buy-side mandate that makes it defensible. A client
will propose it, because it sounds generous.

---

## 4. Where a figure may appear

| Surface | May carry the schedule? |
|---|---|
| The public site | **NO.** `#pricing` is the email-gated brochure request only |
| Yulia / the intake | **NO.** They never quote fees |
| The pricing brochure (email-gated) | **YES** |
| The engagement letter | **YES** |
| The public offering deck | **NO** — it is the no-pricing version |

Public publication was tried for one day and reversed by Paul on 2026-08-06.

---

## 5. The two collateral files, and the trap

| File | Served by | Spec | Rebuild slug |
|---|---|---|---|
| `client/public/collateral/smbx-corpdev-offering.pdf` (1.5 MB) | `Landing.tsx`, public download | `studio/specs/smbx-corpdev-offering.deck.mts` | matches ✅ |
| `content/collateral/smbx-corpdev-pricing.pdf` (1.9 MB) | `server/index.ts`, emailed after capture | `studio/specs/smbx-corpdev-offering-pricing.deck.mts` | **DIFFERS** ⚠️ |

⚠️ **The pricing brochure's spec slug is `smbx-corpdev-offering-pricing`, but the
route serves `smbx-corpdev-pricing.pdf`.** A naive rebuild lands a new file
*beside* the live one and every lead keeps receiving the old brochure, silently.
Build it with an explicit `--slug smbx-corpdev-pricing`, then confirm the file at
`content/collateral/smbx-corpdev-pricing.pdf` actually changed size or mtime.

**Both PDFs carry the old name `smbx Run` and the retired green palette.** The
rename alone forces a rebuild, independent of the two new lines.

---

## 6. What to change in the collateral

1. `smbx Run` → **smbx Run** · `Premium` → **smbx Run Pro** everywhere.
2. Palette: build against `DESIGN_LANGUAGE.md` (oxblood) — the shipped PDFs are
   still Deal Green.
3. Add **smbx Build** and **smbx Go** only once you have set their figures.
4. Rebuild the pricing brochure with the explicit slug, and verify it replaced
   rather than joined the served file.

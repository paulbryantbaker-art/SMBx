# Frame — hunt B · DFW HVAC (geography cut inside home-services)

hunt:       market
for:        the practice
scope:      NAICS 238220, the Dallas–Fort Worth–Arlington TX MSA as delineated by
            OMB Bulletin 23-01 (CBSA 19100), residential HVAC service and
            replacement. Plumbing follows as a second trade, not a second hunt.
question:   What share of the DFW residential HVAC **acquisition band** — measured
            in establishments and in dollars — is already platform-owned?
decided:    If the platform-owned share of the band is low, DFW is open and the
            market work continues here. If it is high, the honest answer is a
            different metro, and the geography moves before any named work starts.

---

## Why this file is suffixed

RESEARCH.md specifies `_meta/frame.md`. This is the second hunt to run inside an
existing market folder — the home-services market master is already written — so
the frame and log carry a `-dfw` suffix to keep the two hunts separable. `_meta/`
is invisible to `audit.mts` either way, so nothing downstream is affected.

Paul, 2026-08-01: DFW HVAC is a **geography cut inside `markets/home-services`**,
not a new market folder.

## The boundary, settled 2026-08-01

The brief said "the nine DFW counties." The OMB delineation is **eleven**. Paul
chose the OMB MSA as delineated, so eleven it is, and every Census figure in this
hunt keys off that set.

**Dallas–Fort Worth–Arlington, TX MSA — CBSA 19100**, OMB Bulletin No. 23-01
(July 2023):

| Metropolitan Division | Counties |
|---|---|
| 19124 Dallas-Plano-Irving, TX | Collin, Dallas, Denton, Ellis, Hunt, Kaufman, Rockwall |
| 23104 Fort Worth-Arlington-Grapevine, TX | Johnson, Parker, Tarrant, Wise |

Source: OMB Bulletin No. 23-01, "Revised Delineations of Metropolitan Statistical
Areas, Micropolitan Statistical Areas, and Combined Statistical Areas".
https://www.whitehouse.gov/wp-content/uploads/2023/07/OMB-Bulletin-23-01.pdf

The two Metropolitan Divisions matter beyond bookkeeping: they are the level at
which the 2022 Economic Census publishes some receipts detail, and they split the
metro roughly the way the platforms have split it operationally.

## The prior this hunt has to test, not inherit

`markets/home-services/master.md` §5.1 already carries a DFW view:

> **Dallas–Fort Worth** | Wrench (Berkeys, Baker Brothers), SEER (Swan), Apex,
> Roto-Rooter (Fort Worth) | **Saturated**

and §5.1 closing: *"DFW, Houston, Phoenix, and the California metros each host
4–5+ platforms. They are effectively closed to new platform formation. Entry is
tuck-in only."*

That is a **brand-presence count at the platform-formation level**. It is not the
question this hunt asks, which is a share of a size band in establishments and
dollars. Two reasons it cannot be carried across:

1. **Different denominator.** Four platforms present says nothing about what
   fraction of the ~n-thousand HVAC establishments in the metro they operate, and
   still less about what fraction of the buyable slice.
2. **The brand counts underneath it are unstable, by the master's own appendix.**
   Wrench is carried at 17 / 25 / 28 brands across sources; Apex at 19 / 75 / 107.
   A saturation map built on brand counts inherits that spread.

So the prior is recorded here as a prior. A finding of "low platform-owned share"
has to clear it on evidence, and a finding of "high" has to be more than an echo.

## The four things this hunt must not assume away

**a. Bottom-up only.** Establishment-size distribution from Census County
Business Patterns for the eleven counties; receipts from the 2022 Economic Census
at MSA level. No vendor market-size estimates enter this hunt at any point.

**b. NAICS 238220 bundles three splits, and a residential HVAC thesis needs all
three.** One code covers HVAC *and* plumbing, residential *and* commercial,
service *and* new construction. Where the Economic Census publishes
class-of-customer or product-line detail, use it. Where it does not, state the
assumption in the open and carry it as an assumption — not as a finding. This is
the soft spot of the whole build and it gets flagged once, explicitly, per house
standard.

**c. Establishments are not companies.** A three-location operator is three
establishments in CBP. The independent residual has to be expressed in a unit
that survives that, or it overstates the target count. CBP's firm-level
companion and the multi-unit share are the handles.

**d. Bands, not a ranked list.** There is no public revenue for a private
operator, so #47 vs #52 is fiction. Band assignment survives scrutiny; ranking
does not. Nothing in this hunt produces a ranked top-N.

## The band

Paul, 2026-08-01: band by **Census employee size class** — the unit CBP actually
publishes, requiring no conversion and no benchmark.

The reference revenue range is the band **the platforms themselves buy in**,
taken from the master §5.2: an anchor at **$5–50M revenue**, then tuck-ins inside
a **60–90 minute drive radius**. It is labelled throughout as the platforms'
band, not Paul's.

**Paul's own buy-box — revenue range and cheque size — is open and stays blank
until he sets it.** RESEARCH.md: a blank is visible, a guess is not.

**Standing prohibition, carried from the brief.** Do not print a computed revenue
band derived from `benchmarks.md`. Those seeds are marked UNVERIFIED, and
multiplying an employee range by one makes an assumption read as a computation.
The proxy inputs and the buy-box band get printed separately or not at all.

## What is Paul's, not this hunt's

- The buy-box: revenue range, cheque size. Open.
- The revised target-scoring model (gates → FIT/QUALITY/TIMING → confidence
  grade). It exists and is **not adopted**. It does not bind Hunt B. Ask before
  building anything against it.
- What to do if a load-bearing figure's basis collapses in pass 6.
- Whether any of this becomes postable collateral or a client-direct deck.

## Stop condition

Per RESEARCH.md, both tests, not either:

1. Every row in `log-dfw.md`'s coverage table is `ok`, or named explicitly as
   unknown.
2. Two consecutive runs on a slot return nothing new.

Not "when it feels thorough."

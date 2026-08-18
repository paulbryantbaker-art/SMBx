# VALUATION — leagues, the math engine, and how a stack composes

**METHODOLOGY V19 §§3, 5, 11–13 · transcribed from `methodology/METHODOLOGY_V19.md`,
`server/constants/v19Leagues.ts` and `server/services/v19ModelRuntime.ts`**

Two rules govern everything below, and they are not stylistic.

**No LLM in the math path.** Same inputs, same outputs, every time. If a number
came out of a sentence rather than out of arithmetic, it is not a number yet.

**A range, never a point.** `MODEL.VAL.TRIANGULATION.v1` has no field that can
hold a single value — the structure enforces what THE LINE requires. A point
estimate on a named company is an opinion of value, and an opinion of value is
an appraisal. Underwrite in a band, show the band's arithmetic, and let the
client decide where in it to bid.

---

## Leagues

The league is the first fork and everything keys off it — the metric, the
multiple, the buyer, the financing, and how heavy the model stack gets.

| L | Metric | SDE / EBITDA | Revenue | Multiple | Buyer | Financing | Stack |
|---|---|---|---|---|---|---|---|
| **L1** | SDE | < $300K | < $1M | 1.8–3.5× | Individual operator | SBA 7(a) small + seller note | light |
| **L2** | SDE | $300K–$1M | $1–5M | 2.5–4.5× | Searcher, individual | SBA 7(a) to $5M + seller note | light-med |
| **L3** | EBITDA | $1–5M | $5–25M | 4.0–6.5× | Independent sponsor, search fund | SBA + mezz + sponsor equity | medium |
| **L4** | EBITDA | $5–25M | $25–100M | 5.5–8.5× | Lower-middle-market PE | Unitranche + sponsor + rollover | medium-heavy |
| **L5** | EBITDA | $25–100M | $100–500M | 7.0–10.5× | Middle-market PE | TLB + 2L/mezz + sponsor | heavy |
| L6 | EBITDA | $100–250M | $500M–$2B | 8.5–12.5× | Upper-MM PE | Syndicated TLB + 2L | heavy |
| L7 | EBITDA | $250M–$1B | $2–10B | 9.5–14.0× | Mega-fund, strategic | TLB + HY + mezz | mega |
| L8–L10 | EBITDA | $1B+ | $10B+ | 10.5–20.0× | Consortium, public M&A | Multi-tranche, bridge | mega+ |

**In lane: L1 through L4, and L5 only up to $250M of revenue.** The multiple
columns are the classification floor and ceiling — a starting sanity band, not a
comp set. A real range comes from the market master and the comp sources named
in §5.7 below.

**Classification order.** EBITDA ≥ $1M decides first. Below that, SDE decides.
Revenue is the fallback when neither is known, and a league set from revenue
alone is `inferred` — usable, but say so in the deal file.

**SDE above $1M is real and gets treated as L3.** Very small businesses that
never normalised owner pay throw this. It is cash-generative at L3 scale even
though the metric is technically wrong; classify L3 and fix the metric.

---

## The math engine

### 5.1 · SDE — L1/L2

```
SDE = Net income (per tax return, pre-distribution)
    + Owner W-2 / 1099 / guaranteed payments
    + Owner benefits (health, retirement, auto)
    + Interest expense
    + Depreciation & amortisation
    + One-time / non-recurring expenses      (verified)
    + Discretionary expenses                 (verified, with source documentation)
    − Required owner replacement compensation (if the buyer will not operate)
```

**Source attestation is the whole discipline.** Every add-back traces to a
document — a P&L line, a tax return line, a bank statement, a vendor invoice.
An add-back that does not trace is marked `[unverified]` and comes **out** of
the defended SDE. On the buy side this is the single highest-leverage piece of
work: a seller's SDE and a defended SDE routinely differ by 15–30%, and the gap
is the negotiation.

The last line is the one people drop. If the buyer is not going to run the
business daily, a manager's market salary comes out. Leave it in and you have
priced a job the buyer will have to pay someone else to do.

### 5.2 · Adjusted EBITDA — L3+

```
Adjusted EBITDA = Net income
                + Interest expense
                + Income taxes
                + Depreciation
                + Amortisation
                + Stock-based compensation      (contested — see below)
                + Non-recurring items           (verified)
                + Restructuring charges         (verified)
                + Impairments                   (verified)
                + Management fees / related-party (if normalising for sale)
                − Run-rate adjustments          (subtractive, for sustainability)
```

**SBC.** Immaterial at L3/L4 — treat as cash comp. At L5+ it is genuinely
contested (Pignataro defends the add-back, Damodaran disputes it). The V19
default is to **show both**: "Reported adjusted EBITDA" with SBC added back, and
"Cash adjusted EBITDA" with it retained. A buyer-presented number defaults to
Reported, which is exactly why you compute both.

**Run-rate adjustments are subtractive and they are where a bridge earns its
keep.** A seller annualising a strong Q4 into a full-year run rate is the most
common single distortion above L2.

### 5.3 · DSCR

```
DSCR = (EBITDA − CapEx − income taxes − distributions)
       ÷ (annual cash interest + mandatory principal amortisation)
```

| Threshold | Value | Source |
|---|---|---|
| SBA covenant floor | **1.15×** | SBA SOP 50 10 8 |
| SBA lender standard | 1.25× | market |
| SBA business-acquisition standard | **1.50×** | market |
| PE LBO maintenance covenant | 1.10–1.25× | market |
| PE LBO incurrence covenant | 1.25× | market |

At L1–L2 the DSCR is not a ratio, it is the deal. The SBA acquisition standard
of 1.50× sets the maximum debt, the maximum debt sets the maximum price, and the
maximum price is the answer. Run `DSCR.STRESS` before the valuation, not after:
revenue −20% and SOFR +200bp is the standard pair.

### 5.5 · WACC

```
WACC = (E/(E+D)) × r_E + (D/(E+D)) × r_D × (1 − τ)
```

Market weights and the target structure, never book. For a private company the
target structure approximates the LBO blended cap structure.

**Cost of equity, by league:**

```
CAPM (L5+)          r_E = r_f + β_L × ERP
Modified CAPM (L4–6) r_E = r_f + β_L × ERP + SP + IRP + α
Build-up (L1–L3)     r_E = r_f + ERP + SP + IRP + α
```

- `r_f` — the 10-year Treasury. **Fetch it; do not remember it.** The V19 text
  records 4.46% at 14 May 2026 as an example, and an example rate that gets
  quoted eighteen months later is a fabricated input.
- `ERP` — Damodaran implied (4.23%, Jan 2026) is the default; Kroll
  recommended (5.0% since 5 Jun 2024) is the toggle. Say which one you used.
- `SP` size premium — Damodaran total beta, Pepperdine PCAP, or Kroll Navigator.
- `IRP` industry risk premium — Kroll.
- `α` company-specific — 0–500 bps, qualitative, and the one an outsider will
  challenge first. Write down what it is for.

**Typical SMB cost of equity is 22–32%** (Pepperdine PCAP 2025). If a build-up
lands at 14%, something is wrong with the inputs, not with the business.

**Hamada, to move a peer beta onto your structure:**
```
β_U        = β_L / [1 + (1 − τ) × (D/E)]
β_L target = β_U × [1 + (1 − τ) × (D/E) target]
```

**Cost of debt** — YTM on traded debt where it exists; otherwise credit spread
over risk-free (ICE BofA BB / B / CCC OAS series), or Damodaran synthetic
ratings for private SMB and LMM.

### 5.6 · DCF — two-stage default

```
EV₀ = Σ[t=1..N] UFCF_t / (1 + WACC)^t  +  TV_N / (1 + WACC)^N

UFCF_t = EBIT_t × (1 − τ) + D&A_t − CapEx_t − ΔNWC_t

TV_N = UFCF_(N+1) / (WACC − g)     [Gordon growth]
   or  EBITDA_N × exit multiple    [exit multiple]
```

- Explicit forecast: **5 years L1–L4**, 10 years L5+.
- Terminal growth `g`: the lesser of long-run nominal GDP (~2.5%) and the 10-year
  Treasury yield.
- **Cross-check both ways.** The implied `g` from an exit multiple must satisfy
  `g < WACC` and `g ≤ r_f`. An exit multiple that implies 6% perpetual growth is
  not a valuation, it is a wish, and it will not survive an investment committee.

At L1–L3 the DCF is a **cross-check on the multiple**, not the primary. Small
businesses do not have five-year forecasts worth discounting; they have a
history and an owner.

### 5.7 · Multiples

```
EV           = multiple × operating metric
Equity value = EV − net debt + cash − preferred + minority interest
```

| League | Metric | Source |
|---|---|---|
| L1–L2 | EV/SDE | BizBuySell Insight Report, quarterly |
| L3+ | EV/EBITDA | GF Data quarterly (LMM/MM); Damodaran January annual for sector context |
| SaaS | EV/ARR + Rule of 40 / Rule of X | §5.13 |

**Cite the pull with its date.** A multiple without a quarter attached is the
same failure as an uncited figure in a master — and in a deal file it is worse,
because it gets bid on.

### 5.8 · Quality of earnings

QoE Lite at L3, full QoE at L5+. The tests, which are also the buy-side
diligence request list in miniature:

- **Proof of cash** — bank statements reconcile to P&L revenue and to deposits.
- **Add-back defence** — every add-back source-attested, per §5.1.
- **NWC peg** — LTM 12-month average vs normalised vs seasonality-adjusted.
- **Customer concentration** — top 5 and top 10 as a share of revenue.
- **Vendor concentration** — top 5 as a share of COGS.
- **Run-rate sustainability** — last-3-month run rate vs LTM. Flag
  growth that is front-loaded.
- **CapEx normalisation** — maintenance vs growth; LTM vs forward.
- **Working-capital quality** — AR ageing, AP ageing, inventory turns against
  the sector.

**A QoE is a specialist engagement above L3.** We run the Lite version to know
what to ask and where the exposure is; the client's accountant runs the real one
and signs it.

### 5.10 · Free cash flow

```
FCF unlevered  = EBIT × (1 − τ) + D&A − CapEx − ΔNWC
FCF levered    = Net income + D&A − CapEx − ΔNWC − mandatory amortisation
FCF available  = FCF levered − required reinvestment
```

### 5.11 · Returns

```
IRR   solve Σ CF_t / (1 + IRR)^t = 0     (Newton-Raphson, bounded [−0.99, 5.0])
MOIC  = cash returned to sponsor / cash invested by sponsor
DPI   = cumulative distributions / paid-in capital
RVPI  = residual NAV / paid-in capital
TVPI  = DPI + RVPI
IRR ≈ MOIC^(1/N) − 1        for clean cash flows
```

### 5.12 · Sensitivity — emitted for every primary output, not on request

```
Revenue         ±10%, ±20%
EBITDA margin   ±100 bps, ±300 bps
Exit multiple   ±0.5×, ±1.0×
WACC            ±50 bps, ±150 bps      (DCF only)
Hold period     ±1 yr, ±2 yr           (LBO only)
SOFR            ±100 bps, ±200 bps     (LBO debt cost only)
```

A single-scenario answer is not an answer. The tornado is what tells the client
which assumption to spend diligence money on.

### 5.13 · SaaS overlay

```
Rule of 40   R40 = revenue growth % + EBITDA margin %       ≥40% → ~2.3–2.5× premium
Rule of X    RX  = (M × growth %) + FCF margin %            M ≈ 2 private, 2–3 public
NRR          = (beginning ARR + expansion − churn − downgrade) / beginning ARR
```

Rule of X has the better fit against FV/NTM revenue (R² 0.62 vs 0.50). Healthy
NRR is ≥110%, elite ≥130%.

---

## Composing the stack

Four layers, composed from league × deal type × structure × industry ×
jurisdiction:

1. **Primary** — the principal output
2. **Supporting** — inputs and cross-checks the primary needs
3. **Tax / legal economic** — the dollar translation of the provisions
4. **Sensitivity** — built in, per §5.12

### L2 — Main Street asset purchase, SBA-financed

*$450K SDE. Asset purchase. Seller note. Buyer will operate.*

```
PRIMARY
  VAL.SDE                    normalised SDE, add-backs defended
  LBO.SBA                    10% injection, 7(a), 10-yr amortisation

SUPPORTING
  VAL.MULT.SDE               BizBuySell sector lookup, dated
  STRUCT.NWC.PEG             12-month average
  DSCR.STRESS                1.50× target under revenue −20% / SOFR +200bp
  SOURCES.USES               equity, debt, seller note reconcile to zero

TAX / LEGAL ECONOMIC
  STRUCT.PPA                 §1060 Class V–VII allocation
  TAX.168K                   100% year-one bonus on the step-up
  LEGAL.INDEMNITY.LADDER     basket + cap + survival → dollar exposure
  TAX.SALT_TRANSACTION       state leakage, both states

SENSITIVITY
  revenue ±10/±20% · SDE ±$50K (add-back stress) · multiple ±0.5× · DSCR pre/post
```

The SDE ±$50K row is the one that matters. At L2 the add-back stress moves the
price more than the multiple does.

### L4 — LMM PE platform, rollover + earnout + RWI, S-corp target

*$15M EBITDA. 30% rollover. $3M earnout over 3 years. RWI at 10% of EV,
0.5% retention. F-reorg.*

```
PRIMARY
  VAL.EBITDA + VAL.TRIANGULATION    the band
  VAL.DCF.TWOSTAGE                  cross-check
  VAL.COMPS.TRADING / .PRECEDENT    comp sets, dated
  LBO.PE.PRIMARY                    full multi-tranche debt schedule

SUPPORTING
  VAL.WACC.MODCAPM           size premium at $15M EBITDA
  DEBT.SCHEDULE              TLA + TLB + revolver + sponsor + rollover + seller note
  STRUCT.NWC.PEG / .TRUEUP   12-mo normalised; 120-day post-close true-up
  STRUCT.NETDEBT             debt-like reconciliation
  SOURCES.USES · DSCR.STRESS · COVENANT.COMPLIANCE
  MIP                        10% pool, 4-yr vest, 2.5× MOIC hurdle

TAX / LEGAL ECONOMIC
  STRUCT.FREORG              OldCo → NewCo → QSub → LLC sequence      (TAX.md)
  STRUCT.ROLLOVER            §721 at the LLC level, 30% deferred
  STRUCT.PPA                 §1060 post-F-reorg
  TAX.168K                   bonus on the personal-property step-up
  STRUCT.EARNOUT.MC          Monte Carlo on the $3M
  STRUCT.EARNOUT.TAX         §453 treatment                            (TAX.md)
  LEGAL.RWI_STACK            10% EV, 0.5% retention, ~3.0% rate on line
  LEGAL.INDEMNITY.LADDER     cap at retention; fundamental-rep survival
  LEGAL.ESCROW.HOLDBACK      PPA escrow ~1% TV
  TAX.SALT_TRANSACTION       multi-state apportionment

SENSITIVITY
  revenue ±10/±20% · margin ±100/300bp · exit multiple ±0.5/1.0×
  hold 3/4/5/6/7 yr · earnout 0/25/50/75/100% · rollover taxable vs deferred
  SOFR ±100/200bp
```

**Layer 3 is where the deal lives at L4.** The F-reorg, the rollover treatment
and the RWI stack each move real money, and none of them is visible in the LBO.

---

## Gating questions

Before a stack composes, its questions must be answered. These are
**enumerated, not generated** — the same list every time, so a gap is a gap and
not an oversight.

**L3–L4, S-corp target, F-reorg path:**

1. Is the target an S-corp?
2. Has the S election been in place ≥5 years? *(§1374 BIG exposure)*
3. Any non-resident or non-US shareholders? *(S-corp eligibility)*
4. Any disregarded entity or QSub already in the structure? *(sequence)*
5. Is the buyer a PE LLC or a corporation? *(§721 vs §351 rollover path — and
   whether §338(h)(10) is even available)*
6. Rollover percentage? *(5–40% typical)*
7. Earnout — yes/no, metric, duration?
8. RWI budget? *(drives the whole indemnity package)*
9. State of incorporation and state of operations? *(leakage)*
10. NOL balance? *(§382)*

**L1–L2, SBA-financed:**

1. Total project cost, and is the 10% injection real and documented?
2. Seller note — standby terms? *(max 5% of project cost counts as equity)*
3. Asset or stock/unit? *(a partial change of ownership must be stock/unit —
   an asset deal is ineligible)*
4. Buyer citizenship? *(100% US citizen / national / LPR)*
5. Any retained seller equity? *(triggers the two-year personal guaranty)*
6. Real estate included, owned or leased? *(→ G30, REAL_ESTATE.md)*
7. Franchise? *(directory + affiliation)*
8. Landlord consent and lease assignability?
9. Licences that do not transfer?
10. Customer concentration above 20%?

Answer them in the deal file, with `explicit` / `derived` / `inferred` beside
each. The unanswered ones are the diligence list.

---

## Where valuation stops

**We produce:** a band, its arithmetic, its comp sources with dates, its
sensitivity, and the assumptions that would move it.

**We do not produce:** an opinion of value, an appraisal, a fairness opinion, an
ESOP valuation, or a point estimate on a named company that leaves the
engagement folder.

The difference is not the quality of the analysis. It is who is licensed to
sign it — and on an ESOP that person is the trustee's appraiser, on a fairness
opinion it is the bank, and on a formal appraisal it is a credentialed
valuator. Route it, and give them the supporting record.

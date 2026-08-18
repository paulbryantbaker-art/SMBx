# Handoff — DFW collateral + report/site update sessions · 2026-08-03 (rev 3)

**For a Claude Code session working in `~/Documents/smbx-studio`.** Three jobs:
(1) a marketing one-pager for LinkedIn from the DFW findings; (2) updating the
full downloadable report and website copy with the delta; (3) **the standalone
DFW HVAC + plumbing report** — Paul's decisions of 2026-08-03: a separate
report, filed as **postable collateral** (public lead magnet), scoped to
**DFW only** with a measured four-metro Texas context table, as the first of a
metro series (Houston next). Read this first, then run the studio preflight
(CLAUDE.md at the workspace root).

**THE SOURCE OF TRUTH IS `markets/home-services/master.md`, at v6 (2026-08-03).**
Part XI covers the full DFW cut across all six trades — §11.1–11.5
(HVAC/plumbing) plus §11.6 (electrical, roofing, pest, garage doors). Both
syntheses are audited (every Part XI figure traces to `research/`) and have
passed two adversarial verification passes.

**Do not confuse it with `documents/market-assessment.md`** — despite the name,
that file is the *derived report source* and it predates all of the DFW work.
It is the thing the report job UPDATES, never an input to trust.

## Non-negotiables before anything renders

1. Run the studio preflight per CLAUDE.md; a doctor copy sits in
   `_to_delete/doctor.mjs`. One known blocker (fire-safety register) does not
   gate home-services work.
2. Read `FORMATS.md` and `DESIGN.md` at the workspace root before any spec.
   Builders only — never hand-rolled HTML/CSS. One-pager = `build-onepager.mts`,
   spec in `markets/home-services/specs/<name>.post.mts`, output to
   `markets/home-services/collateral/<slug>/$(date +%F)`.
3. **Run `verify-spec.mts` before rendering** — it checks every figure on the
   page against `master.md`, which now contains everything below.
4. On Paul's Mac the builders find Chrome themselves:
   `export REPO=~/Documents/GitHubRepos/SMBx-main` and run from the studio root.
5. THE LINE (buy-side only, no valuations on named companies, no fee talk).
   Attribution law. No AI self-reference.

## The figures menu — exact forms, all in master.md Part XI (v6)

**MEASURED (safe anywhere; Census CBP 2023 / 2022 Economic Census / TDLR):**
- DFW 238220: 2,412 establishments · 31,980 employees · $2.418B payroll ·
  **74.5% under ten employees** · 307 in the 10–249 band
- 4,665 licensed A/C firms; 2,806 residential-endorsed; 1,738 Class B (25-ton
  statutory cap)
- Texas 238220 receipts $25.418B; HVAC 34.3% / plumbing 32.8% of the code;
  $241,879 receipts per employee
- **18 platform parents** hold verified DFW ground (was 4 in the old master)
- Adjacent trades (all measured): electrical 1,634 estabs / $2.149B payroll ·
  roofing 907 / $0.458B · pest 396 / $0.206B
- **DFW carries 39.58% of Texas roofing payroll** (vs 32.87% of HVAC) — hail
- **Pest: ≈40 platform locations across 9 parents = 10.1% of every
  establishment in the code, vs 1.1% for HVAC** — and no
  residential-electrical-first platform exists in the metro at all

**DERIVED (usable with "derived/estimated" framing; registered in the master's
Derivations table):**
- DFW 238220 market ≈$8.356B/yr (range $6.882–8.356B); HVAC-specific ≈$2.9B
- Electrical ≈$6.880B · roofing ≈$2.759B (tightest allocation, 3% spread)
- Platform share of the HVAC acquisition band **8.5%–22.6%**, likely near top
- Residual ≈280 unmatched establishments, roughly $2–6B of annual work

**The strongest single line, fully measured:** of 2,412 plumbing-and-HVAC
establishments in DFW, 1,797 have fewer than ten employees — the acquirable
universe is ~300 businesses, not 2,400, and not the 4,665 the licence registry
implies.

**The structural headline (master §11.6):** platform density runs exactly with
recurring-revenue quality — pest 10.1% → HVAC 1.1% → roofing commercial-only →
residential electrical empty. The consolidators' revealed preference maps the
annuity, trade by trade.

**A distinctive angle:** no primary source publishes metro revenue for
construction trades — every "$X billion DFW HVAC market" figure in circulation
is derived, whether its publisher says so or not. Ours says so.

## For the report/site job specifically

- Source of the downloadable report:
  `markets/home-services/documents/market-assessment.md` — the same .md renders
  the PDF (`build-report.mts`) and the site page at smbx.ai/research/<slug>;
  they cannot drift.
- **The delta to fold in: Part XI of master.md v6 in full (§11.1–11.6)**, plus
  the corrected §5.1 DFW row (correction A.0.4).
- **Caution: the master body carries 108 legacy figures that trace to nothing
  on disk** (measured by audit.mts; unchanged by Part XI, which audits clean).
  Do not re-anchor on legacy figures without checking them against
  `research/verification-pass-2026-07-27.md` / `-28.md`. What to do about the
  108 is Paul's open decision — ask him, do not absorb it.
- After editing: `npx tsx $REPO/scripts/studio/audit.mts <doc> --against
  markets/home-services/master.md`, render, and LOOK at page 1 (cover budget).
- Existing rendered PDFs in `collateral/home-services-market-assessment/`
  predate Part XI entirely — derived artifacts do not follow the master.

## Job 3 — the standalone DFW report

- **Scope: DFW only.** Houston/Austin/San Antonio ownership passes have not
  been run; no ownership claim outside DFW. The Texas frame comes from the
  measured comparison table in `research/tx-metros-cbp-238220.md` — DFW is
  32.9% of TX 238220 payroll, the four metros 79.5%.
- **Shape: a metro market map per PLAYBOOK section 1**, sourced from master
  Part XI (§11.1–11.5 core; §11.6 for one adjacent-trades page if wanted).
  Lands in `markets/home-services/documents/` with its own slug — one artifact,
  one slug; suggestion: `dfw-home-services-market-map` or similar, distinct
  from `home-services-market-assessment`.
- Audit it against the master before render; render with `build-report.mts`
  to `collateral/<slug>/$(date +%F)`; check page 1.
- **Collateral constraints:** aggregate content only — no named independents;
  platform names stay at the already-public who-owns-what level; derived
  figures ("$8.4B", the 8.5–22.6% band share, the ≈$2–6B residual) carry
  derived/estimated framing per the master's Derivations; every section that
  uses them cites publisher-and-date per report voice law; ends on what we
  don't know yet.
- Series framing is deliberate: this is report one of the Texas metros;
  Houston's bands and dollars are already computable in minutes, its numerator
  is the next hunt.

## Note on "rooftop"

If the one-pager request meant a *roofing-trade* piece: DFW roofing numbers
exist and are verified (master §11.6; `research/dfw-14-roofing-numerator.md`,
`dfw-16-adjacent-trade-cards.md`) — commercial held by five national platforms,
residential/storm the open field, 89.1% of establishments under ten employees.
Caution for roofing copy: storm revenue is episodic, not annuity, and the
receipts/payroll ratio (6.03x vs HVAC's 3.46x) means no employment-based dollar
claims. If it meant the headline stat card, the menu above is ready.

## Full research trail

`markets/home-services/research/dfw-01…16` + four verification passes;
`research/_meta/log-dfw.md` is the run log and coverage table;
`screen/consolidators.md` is the 60-parent register. The session record lives
in the claude.ai project as `claude/SMBX_DFW_HVAC_HUNT_B_2026-08-01.md`.

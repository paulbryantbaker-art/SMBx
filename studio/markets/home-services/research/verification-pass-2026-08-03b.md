<!-- run: 17 | hunt: B | date: 2026-08-03
     query: primary-source verification of runs 12–16 (the adjacent trades) —
            job 2, second pass of the day
     tool: independent recompute of the KOB figures (fresh parser, exact
           values); 14 adversarial web checks against issuing sources -->

# Verification pass — 2026-08-03(b) · the adjacent trades (runs 12–16)

Same recipe as the first pass: recompute everything file-derived, adversarially
re-check everything web-sourced. **14 checks: 12 CONFIRMED, 2 PARTLY, zero
refutations of substance. Two corrections registered in §C.**

## A · File-derived figures — exact recompute

| Figure (as carried) | Exact value in file | Verdict |
|---|---|---|
| TX 238210 receipts $22.943B | $22,942,830k | CONFIRMED (correct rounding) |
| TX electric-power core $15.614B | $15,613,805k | CONFIRMED |
| TX 238160 receipts $6.970B | $6,969,560k | CONFIRMED |
| TX roofing core $6.587B | $6,587,261k | CONFIRMED |
| TX 238350 receipts $2.760B | $2,760,171k | CONFIRMED |
| TX garage-door line in 238350 | $323,368k | CONFIRMED |
| TX sector-23 garage-door total | $329,254k | CONFIRMED |

CBP band distributions for 238210 / 238160 / 561710 were produced by
`market-data.mjs` and re-read in the run-16 arithmetic; totals reconcile with
run 08's independent pull (1,634 / 907 / 396 establishments).

## B · Web-sourced claims — adversarial checks

All CONFIRMED except as noted: Tecta/Empire (Fort Worth, 4801 Esco Dr — via
Empire's own site; tectaamerica.com itself timed out to the fetcher, noted) ·
Nations Roof Rowlett + AEA close 2024-07-15 · Centre/Quick Roofing 2024-01-08
(Kennedale from the company's own site; the release says only "Dallas-Fort
Worth metro area", and Quick's site misspells it "Kennadale") · Leaf/Erie
Carrollton, release 2025-09-08, both Gridiron portfolio companies · Anticimex
three-company Texas entry, release 2025-06-16, verbatim cities Garland,
Cleburne, Hurst · Rollins/Romex 2026-04-02, brand retained ("They will maintain
their brand identity") — Dallas comes from romexpest.com/texas, not the release
· HomeTeam "Founded in 1996 and headquartered in Dallas, Texas", 1341 W
Mockingbird Ln · Terminix: all ten named DFW branches live on the Texas locator,
with street addresses · Massey: seven DFW centers confirmed including Euless and
Denton pages · FSG Dallas (2525 Walnut Hill Ln) + Fort Worth + Austin HQ · IES
Communications Fort Worth (4800 Alliance Gateway Fwy) + Addison (3744 Arapaho
Rd) · MYR: no Texas on contact or subsidiaries pages (JS-widget caveat noted) ·
Incline/Barefoot 2023-02-02 + All Seasons Euless closed 2024-12-20.

**One nice accident:** IES Communications' Addison office is 3744 Arapaho Road —
Air Texas Mechanical (Service Logic) is 3724 Arapaho Road. Two register parents
sit on the same Addison street; no action needed, recorded so a screen does not
conflate the addresses.

## C · Corrections registered

**C.1 — IES Holdings trades on NASDAQ, not NYSE.** Run 13 and the register
carried "NYSE: IESC"; the listing is NASDAQ. Corrected in both files.

**C.2 — Citation/Aptive announcement date.** Carried as "Sept 2024"; Aptive's
own release is dated **2024-08-27** (secondary coverage ran September, which is
where the drift came from). Corrected in the register.

Citation refinement, no figure change: Romex's DFW presence cites
`romexpest.com/texas` ("Dallas/Fort Worth Office"), not the Rollins release,
which names only "four states."

## D · What this pass does not establish

Same classes as the first pass: derived allocations verified as to inputs and
arithmetic only; location counts are what the owners publish, not a census;
CentiMark and Flynn ownership remain blank; the Omnia–HUF and
Stronghouse–Infinity ties still rest on sponsor-side releases alone.

## Sources
Per-claim inline above; agents' full URL lists in the session record. Retrieved
2026-08-03.

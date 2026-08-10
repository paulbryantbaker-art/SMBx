# Retired figures — home services

**The denylist.** Every figure below was carried by this market's master or its
collateral at some point, and was then retired, corrected or superseded by a
named correction pass. Nothing here may appear in a spec, a caption or a
rendered document.

This file exists because `audit.mts` cannot catch these. The audit proves a
figure is *traceable*; these figures were traceable — to a prior draft of the
master — and still wrong. A.0.6's three entries were live on LinkedIn when they
were retired.

**Maintained by hand, on purpose.** The correction ledgers record retirements in
tables *and* in prose (A.0.6's ±3–4 turn swing and the 15% member-base loss are
both inline in §1.6 and §1.7, not in any table). A parser that reads only the
tables finds some of this list and misses the rest — a guard that reports clean.
So: **when you write an `A.0.x` entry, add the retirement here in the same
session.**

Read by `scripts/studio/retired-check.mjs`. Format is fixed — each entry is a
`###` heading followed by the four fields, in order.

- `pattern` — a literal string, matched case-insensitively. Every dash form
  (`-` `–` `—` `‑`) is folded to one before matching, so write whichever you
  like and do **not** add a second entry for the other dash — it will fire twice
  on the same line and the duplicate teaches you to skim.
- `requires` — pipe-separated words; at least one must appear within about a
  sentence of the pattern. Omit for figures distinctive enough to stand alone.
- `ledger` — the correction pass that retired it
- `verdict` — what to do when it is found

---

### R-HS-001 · the 40% recurring-revenue threshold
- pattern: 40%
- requires: recurring|re-rate|rerate|platform|threshold|premium
- ledger: A.0.6
- verdict: RETIRED, no source. Present in the master and its pre-verification ancestors only. The qualitative point survives — a heavier recurring book re-rates the asset — but no threshold may be stated.

### R-HS-002 · the 30%-over-15% recurring premium
- pattern: 30%
- requires: recurring|premium|turn|below 15
- ledger: A.0.6
- verdict: RETIRED, no source. "30%+ commands a one-to-two turn premium over an identical peer below 15%" has no publisher.

### R-HS-003 · the unnamed landscape report's turn swing
- pattern: 3-4 turn
- ledger: A.0.6
- verdict: RETIRED, no named publisher. Same provenance as R-HS-001.

### R-HS-005 · the worked re-rate example
- pattern: 8-9x
- requires: recurring|60%|20%|re-rate|rerate
- ledger: A.0.6
- verdict: RETIRED. "8–9x at 60% recurring versus 5–6x at 20%" is the same unsourced cluster. Note hs-buybox.deck.mts deliberately excludes it and says so in its header.

### R-HS-006 · the member-base loss
- pattern: 15%
- requires: member base|member-base|centralized pricing|centralised pricing|lost
- ledger: A.0.6
- verdict: RETIRED, no source. "One documented case lost 15% of its member base after centralized pricing changes" appears in this master and its own prior versions and nowhere else. The structural warning survives without the figure.

### R-HS-007 · rounded roofing sub-20-employee share
- pattern: 91%
- requires: roofing|employer firms|twenty employees|20 employees
- ledger: A.0.6
- verdict: CORRECTED to 90.8%. A rounded figure is a different figure. Already fixed in home-services-teardown; flag any resurgence.

### R-HS-008 · sector-segmented dry powder
- pattern: $1.2 trillion
- requires: essential|hunting|sector
- ledger: A.0.2
- verdict: RETIRED. No source segments dry powder by sector. The $1.2T is Bain's all-sector global buyout figure, and Bain's 2026 edition has since moved it to $1.3T.

### R-HS-009 · sector-segmented dry powder, short form
- pattern: $1.2T
- requires: essential|hunting|sector
- ledger: A.0.2
- verdict: RETIRED. As R-HS-008.

### R-HS-010 · the aggregator TAM
- pattern: $392B
- ledger: A.0.2
- verdict: RETIRED. Not in Census EC2223BASIC. Traces to VantaInsights, a commercial aggregator citing "Census Bureau" with no table ID or year.

### R-HS-011 · six-trade combined total
- pattern: 753
- requires: six-trade|combined|total|billion|$
- ledger: A.0.2
- verdict: RETIRED. No combined six-trade total may appear anywhere. Summing figures of differing definition, vintage and scope manufactures a number no source reports.

### R-HS-012 · six-trade combined total, earlier value
- pattern: 835.5
- ledger: A.0.2
- verdict: RETIRED. As R-HS-011.

### R-HS-013 · pest control recurring share
- pattern: 74%
- requires: pest|recurring
- ledger: A.0.2
- verdict: RETIRED. No source found. The real figure is 85.4% of U.S. residential pest service revenue, 2025, and carries a narrower scope label.

### R-HS-014 · PE share of HVAC deals, spliced series
- pattern: 50.6%
- ledger: A.0.2
- verdict: RETIRED. Mis-dated by a full year, and splicing an Axial-marketplace baseline to Capstone's tracked universe produced a trend no single dataset supports.

### R-HS-015 · Service Logic enterprise value
- pattern: $3.1B
- requires: Service Logic|EV|enterprise value|acquires
- ledger: A.0.2 / A.1
- verdict: RETIRED as an EV. $3.1B is a debt financing package (Bloomberg, 2026-11-04). No EV was ever disclosed by any party.

### R-HS-016 · Service Logic enterprise value, alternate
- pattern: $4.1B
- requires: Service Logic
- ledger: A.0.2 / A.1
- verdict: RETIRED. No source at all.

### R-HS-017 · PE add-ons year-on-year
- pattern: 88%
- requires: add-on|add-ons|YoY|year-on-year
- ledger: A.0.3
- verdict: RETIRED, NOT FOUND in any S&P or secondary source, and contradicted by Capstone's actual count of 38 add-ons.

### R-HS-018 · PE ownership share of employer HVAC businesses
- pattern: 11%
- requires: PE-owned|PE owned|employer HVAC|private equity
- ledger: A.0.3
- verdict: RETIRED. Traces to a single unattributed trade blog.

### R-HS-019 · PE penetration of the top 50
- pattern: top-50
- requires: 60%|PE-backed|PE backed
- ledger: A.0.3
- verdict: RETIRED. ">60% of top-50 HVAC / >50% of top plumbing firms are PE-backed" was NOT FOUND at any named source.

### R-HS-020 · BBB vacancy projection
- pattern: 225,000
- ledger: A.0.3
- verdict: RETIRED, misattributed. BBB's January 2023 HVAC report contains no such projection. The figure is Rob Falke's 2022 arithmetic, five years from 2022.

### R-HS-021 · HVAC workforce age
- pattern: over 45
- requires: workforce|technician|tech
- ledger: A.0.3
- verdict: RETIRED, NOT FOUND. Nearest published is NCCER's "nearly 43 years old" for construction workers generally.

### R-HS-022 · the Modernize dataset
- pattern: 56K
- requires: Modernize|project|dataset
- ledger: A.0.3
- verdict: RETIRED. No such dataset exists. Neither the dataset nor the $11,590–14,100 range appears anywhere on Modernize.

### R-HS-023 · Modernize ticket range
- pattern: 11,590
- ledger: A.0.3
- verdict: RETIRED. As R-HS-022.

### R-HS-024 · Synchrony promotional APR
- pattern: 5.99%
- ledger: A.0.3
- verdict: RETIRED, NOT FOUND. Synchrony's published dealer plans show 9.99% and 14.99%.

### R-HS-025 · plumbing shortfall economic cost
- pattern: $33B
- requires: plumb|shortfall|economic cost
- ledger: A.0.3
- verdict: RETIRED. Not in the LIXIL study, whose figure is $1.27B in annual savings from adding about 16,400 plumbers.

### R-HS-026 · McKinsey share, restated as operators
- pattern: 76%
- requires: operator|operators|companies|firms
- ledger: A.0.3
- verdict: CORRECTED. It is 76% of market share in critical and rare services, not 76% of operators. A trade blog restated it as "76 percent of companies," which is how the error entered.

### R-HS-027 · GF Data platform/add-on split
- pattern: 7.2x
- requires: platform|add-on|both
- ledger: A.0.3
- verdict: RETIRED as a split. GF Data publishes only a blended figure. The platform/add-on split is subscriber-only and GF Data's own Q1 2026 commentary points the opposite way.

### R-HS-028 · Comfort Systems mechanical mix, stale vintage
- pattern: 78.7%
- ledger: A.0.3
- verdict: SUPERSEDED. That is FY2024. FY2025 is 73.3% mechanical / 26.7% electrical.

### R-HS-029 · Comfort Systems trading multiple
- pattern: 47.5x
- ledger: A.0.3
- verdict: RETIRED. No identified source or basis. Third-party data as of 2026-07-28: trailing P/E 38.99, EV/EBITDA 29.56.

### R-HS-030 · EMCOR multiple without a stated basis
- pattern: 21-23x
- ledger: A.0.3
- verdict: BASIS REQUIRED. Defensible on P/E (23.47x); about seven turns too high for EV/EBITDA (16.34x). Never state without labelling the basis.

### R-HS-031 · Roto-Rooter revenue
- pattern: $911M
- ledger: A.0.3
- verdict: CORRECTED. Actual is $899,877 thousand, essentially flat against FY2024's $900,309 thousand.

### R-HS-032 · commercial auto rate
- pattern: 15%
- requires: commercial auto|insurance
- ledger: A.0.3
- verdict: CORRECTED. Realized 2026 is about 5–6%. The 15%+ figure survives only as the top of a WTW forecast band.

### R-HS-033 · wage inflation band
- pattern: 5-7%
- requires: wage|inflation|labour|labor
- ledger: A.0.3
- verdict: RETIRED. No 2026 occupation-specific figure exists. BLS ECI to March 2026: installation/maintenance/repair +4.0% total comp. Underwrite 3–4%.

### R-HS-034 · plumbing net margin "median"
- pattern: 2-8%
- requires: margin|plumb
- ledger: A.0.3
- verdict: RETIRED as a median. The source says "a lot of plumbing contractors are scraping by on 2-8%" — an editorial impression, not a measured median.

### R-HS-035 · maintenance penetration band
- pattern: 35-50%
- requires: maintenance|penetration|recurring
- ledger: A.0.3 / A.1
- verdict: UNRELIABLE AS STATED. The same publisher's own reports give 15–30%, 40–60% and 50%+ for the same quantity. Use only with the scatter shown.

### R-HS-036 · EBITDA tier
- pattern: 12-17%
- requires: EBITDA|margin|tier
- ledger: A.0.3
- verdict: CORRECTED to 12–18% on CT Acquisitions' April 2026 Multiples Report. The 12–17% is not in the cited source.

### R-HS-037 · replacement vs new-construction split
- pattern: 8M units
- ledger: A.0.3
- verdict: RETIRED. No source supports the split. AHRI reports total shipments only: 7.75M in 2025, 2,773,432 YTD 2026.

### R-HS-038 · plumbing materials inflation
- pattern: 30%
- requires: materials|since 2020|PPI
- ledger: A.0.3
- verdict: UNDERSTATED. BLS PPI WPU1054 is +35.4% January 2020 to June 2026.

### R-HS-039 · SOFR level
- pattern: low-4%
- ledger: A.0.3
- verdict: SUPERSEDED. SOFR is 3.64% (NY Fed, 2026-07-27); 180-day average 3.66%. Wrong in level by 40–50bp.

### R-HS-040 · the tariff stack
- pattern: 145%
- ledger: A.0.3
- verdict: STRUCK DOWN. SCOTUS invalidated the IEEPA tariffs 6–3 on 2026-02-20; CIT invalidated Section 122 on 2026-05-07. Residential HVAC duties were cut 25% to 15% effective 2026-06-08.

### R-HS-041 · the A2L install deadline
- pattern: December 31, 2025
- requires: R-410A|A2L|install
- ledger: A.0.3
- verdict: REMOVED. EPA's reconsideration rule took effect 2026-07-27; pre-2025 R-410A equipment may be installed until supplies deplete.

### R-HS-042 · R-454B cylinder pricing
- pattern: $650
- requires: R-454B|cylinder|refrigerant
- ledger: A.0.3
- verdict: SUPERSEDED. $449–499 per 20-lb cylinder. HARDI declared the crisis over in October 2025. R-410A is now the one rising.

### R-HS-043 · heat pump projection
- pattern: 2035
- requires: heat pump|heating
- ledger: A.0.3
- verdict: SUPERSEDED. "About 50% of heating by 2035" understated the market by nine years — actual share is already 47%.

### R-HS-044 · deal count, aggregator-sourced
- pattern: 39 of 77
- ledger: A.0.3
- verdict: DOWNGRADED. Traceable only to a trade aggregator citing "Capstone data cited by S&P Global"; neither original could be retrieved. Use Capstone's direct 92/47.

### R-HS-045 · industrials M&A decline, spliced
- pattern: 24.6%
- requires: HVAC Services|services deal|deal count
- ledger: A.0.2 / A.0.3
- verdict: CONTEXT ERROR. The figure is real but belongs to Capstone's HVAC Equipment update comparing full-year 2025 Industrials volume. Pairing it with HVAC Services deal counts is a cross-report splice.

### R-HS-046 · Team Enoch as independent
- pattern: Team Enoch
- requires: independent|not owned|unowned
- ledger: A.0.5
- verdict: RECAPITALIZED by McKinney Capital, 2022-03-01. The marketing-copy-survives-the-recap trap, live. Must not screen or present as independent.

### R-HS-047 · Prism Electric as residential
- pattern: Prism Electric
- requires: residential
- ledger: A.0.5
- verdict: RECLASSIFIED commercial/industrial. 2,000+ employees, no residential work, per its own about page.

### R-HS-048 · Rentokil group revenue
- pattern: $6.8B
- requires: Rentokil
- ledger: A.0.2
- verdict: SUPERSEDED. $6.9B (2025 Group, +3.8%); North America $4.3B. Note North America's reported rate is +3.1%; +3.2% is constant currency.

### R-HS-049 · Guild Garage EBITDA
- pattern: $50M
- requires: Guild
- ledger: A.0.2
- verdict: DERIVED, NOT PUBLISHED. $800M ÷ 16x. Reuters reports only "more than $800 million"; PitchBook publishes the 16x. Never state as reported.

### R-HS-050 · Apex multiple
- pattern: 20x
- requires: Apex
- ledger: A.0.2 / A.2
- verdict: DERIVED, NOT PUBLISHED. No source publishes an Apex multiple; terms were not disclosed. Carry as an arithmetic derivation or not at all.

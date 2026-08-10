# 08 — Regulatory, Insurance and Demand Drivers (US Fire & Life Safety)

Stream 08 of 8. Buy-side corporate-development market study.
Sub-verticals referenced throughout as **SV1** (fire protection contracting — sprinkler/suppression install + ITM), **SV2** (alarm, detection, monitoring, low-voltage life safety), **SV3** (extinguisher, kitchen suppression, clean agent, special hazard).

Basis labels: **Disclosed** (the named source states the figure itself) · **Press-derived** (a secondary publication reports it) · **Estimated** (my arithmetic, shown in `## Derivations`).

---

## 0. Environment constraint that shaped this stream — read first

- The session's WebSearch budget (200 calls) was consumed by earlier parallel streams before this stream began. All research below was done with **direct URL fetches only**.
- Direct `curl` egress is blocked by the session proxy (403 on CONNECT) for `census.gov`, `bls.gov` and others; general search engines (Google, Bing, DuckDuckGo, Brave, Ecosia, Mojeek, Marginalia) are `robots.txt`-disallowed to the fetch tool.
- **Consequence:** several items in the brief could not be closed. They are listed individually in `## What I could not verify` rather than filled with plausible-sounding numbers. Nothing in this file is inferred from memory.

---

## 1. INSURANCE CARRIER REQUIREMENTS

### 1.1 The headline conflict — the property market is SOFTENING, not hardening

This is the single most important correction to the standard fire-safety investment narrative. The usual pitch ("hard property market forces owners to upgrade fire protection") is running against the current cycle.

| Metric | Value | Period | Basis | Source |
|---|---|---|---|---|
| Global commercial **property** rate change | **−12%** | Q2 2026 | Disclosed | Marsh Global Insurance Market Index, pub. 22 Jul 2026 |
| Global commercial property rate change, prior two quarters | **−9%** each | Q4 2025 / Q1 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| Global casualty rate change | **+2%** | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| US composite rate change | Declined (percentage not isolated on the public page) | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| Canada composite | −7% | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| Pacific composite | −13% | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| UK composite | −8% | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| Europe composite | −6% | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |
| IMEA composite | −16% | Q2 2026 | Disclosed | Marsh, pub. 22 Jul 2026 |

Broker-side corroboration, different methodology, same direction:

| Metric | Value | Period | Basis | Source |
|---|---|---|---|---|
| Average premium change, **all lines, all account sizes** | **−1.2%** | Q1 2026 | Disclosed | CIAB Commercial P/C Market Survey, pub. 13 May 2026 |
| Large accounts | **−2.7%** | Q1 2026 | Disclosed | CIAB, 13 May 2026 |
| Medium accounts | **−1.9%** | Q1 2026 | Disclosed | CIAB, 13 May 2026 |
| Small accounts | **+1.1%** | Q1 2026 | Disclosed | CIAB, 13 May 2026 |

CIAB's own framing: *"survey respondents reported an average decrease in premiums across all account sizes, at −1.2% — a decisive sign of a softened market."*

**Read-through by sub-vertical.** A softening property market weakens the *carrier-pressure* channel of demand for SV1 install and SV2 alarm upgrades: an underwriter with abundant capacity has less leverage to demand a sprinkler retrofit as a renewal condition. It does **not** touch the code-mandated ITM annuity (SV1/SV2/SV3), which is why the ITM base is the defensible half of the revenue mix and the carrier-driven upgrade cycle is not.

**Conflict preserved:** the Marsh global property figure (−12%) and the CIAB all-lines US figure (−1.2%) are not comparable — different geography, different line mix, different respondent base. Do not average them.

### 1.2 The one segment still hard — habitational

| Metric | Value | Basis | Source |
|---|---|---|---|
| Non-CAT masonry, newer construction | **$0.20–$0.40 per $100 TIV** | Disclosed | Latent Insurance, *Habitational Insurance (2026)*, pub. 22 May 2026 |
| Older **frame** buildings | **$0.60–$1.20 per $100 TIV** | Disclosed | Latent, 22 May 2026 |
| CAT-zone frame (FL coastal, CA WUI) | **$1.50–$4.00+ per $100 TIV** | Disclosed | Latent, 22 May 2026 |
| Share of new habitational placement now in **E&S** | **30%–40%** | Disclosed | Latent, 22 May 2026 |
| Same share ≈10 years prior | **under 15%** | Disclosed | Latent, 22 May 2026 |
| Frame-vs-masonry rate multiple (midpoints) | **3.0×** | Estimated | See `## Derivations` D13 |

Named admitted carriers in habitational per Latent: **Travelers, Liberty Mutual, Zurich, Nationwide, CNA, Selective, Cincinnati Financial, Erie, Chubb**. Named specialty/E&S markets: **Lloyd's syndicates, IAT Insurance Group, Aspen, Tokio Marine HCC, Westchester, Argo, Markel Specialty, AXIS**.

Latent characterises 2026 habitational as *"one of the hardest property segments in commercial insurance"* with *"major admitted-carrier retrenchment."*

**Important negative finding.** The Latent habitational guide — a 2026 document written for owners of exactly the buildings SV1 and SV2 sell into — **does not mention sprinklers, fire alarms, monitoring or fire protection upgrades as a coverage condition or a rating credit** anywhere in the fetched content. The construction-class differential (frame vs masonry) is doing the pricing work, not protection class.

### 1.3 ISO / Verisk Public Protection Classification (PPC)

| Fact | Value | Basis | Source |
|---|---|---|---|
| Scale | Class 1 (superior) to Class 10 (below minimum criteria) | Disclosed | ISO Mitigation PPC page (undated) |
| Jurisdictions in the database | **more than 40,000** fire-response jurisdictions | Disclosed | ISO Mitigation PPC page (undated) |
| Insurer usage | *"Virtually all U.S. insurers of homes and business property use Verisk's Public Protection Classifications in calculating premiums."* | Disclosed | Verisk PPC FAQ, pub./last mod. 7 Mar 2024 |
| Premium effect, qualitative | *"the price of fire insurance in a community with a good PPC is substantially lower than in a community with a poor PPC, assuming all other factors are equal"* | Disclosed | Verisk PPC FAQ, 7 Mar 2024 |
| Sprinklered vs non-sprinklered | **Not addressed** on the Verisk FAQ page | Disclosed (absence) | Verisk PPC FAQ, 7 Mar 2024 |

Quantified PPC premium effect — **two sources, different numbers, both weakly attributed. Reported separately, not averaged:**

**(a) ISO-branded handout hosted by a volunteer fire district (no publication date on the document; URL path dated 2022-05):**

| Home value $100,000 | Annual premium | Basis |
|---|---|---|
| Class 10 | **$894** | Disclosed |
| Class 9 | **$806** (implied) | Estimated — D14 |
| Class 5 | **$373** | Disclosed |
| Stated saving, Class 9 → Class 5 | **$433/yr** | Disclosed |
| Class 10 → Class 5 reduction | **58.3%** | Estimated — D14 |

Critical structural fact from the same document: *"HOMEOWNER'S RATES DO NOT DECREASE BELOW A CLASS 5."* Residential credit stops at Class 5; **businesses** continue to benefit down to Class 1. That asymmetry is the commercial-property relevance of PPC.

**(b) Vendor (insurtech) article, no publication date, explicitly self-labelled illustrative:**

| PPC band | Stated premium effect | National share of communities |
|---|---|---|
| Class 1–2 | up to **25%** discount | Class 1: <1%; Class 2–3: ≈7% |
| Class 3–4 | ≈**10–15%** reduction | — |
| Class 5–6 | minimal or none | Class 4–6: ≈50% |
| Class 7–8 | possible surcharges | Class 7–9: ≈40% |
| Class 9–10 | significant surcharges | Class 10: ≈2% |

FSRS component weighting per the same article: fire department **50%**, water supply **40%**, emergency communications **10%**, plus community risk reduction bonus of up to **5.5%**. The article's own caveat: *"actual premium impacts vary by carrier, line of business, and property characteristics; the above ranges are illustrative only."* Treat as **Press-derived** and non-load-bearing.

**Why PPC matters to this deal thesis at all:** PPC grades the *public* fire service, not the building. It is the mechanism by which a community's fire-suppression capability enters commercial property rating — it is upstream of, and separate from, any building-level sprinkler credit. It creates demand for municipal water/hydrant work, not for SV1/SV2/SV3 services directly.

### 1.4 Sprinklered-vs-non-sprinklered premium differential — the gap in the record

The only quantified sprinkler discount figure I could verify is **residential**, and it is four years old and unattributed to any carrier:

- **"discounts as high as 35% are offered for homes with sprinklers"** — Home Fire Sprinkler Coalition, page last modified **18 May 2022**. Basis: **Press-derived**. HFSC attributes it to *"a recent poll of property and casualty insurers by HFSC"* but **names no carrier** and publishes no poll methodology. The same page concedes *"discounts vary."*

**I could not verify any carrier or broker publication stating a quantified premium differential for sprinklered vs non-sprinklered *commercial* risk.** This is itself a finding: the strongest-sounding claim in the standard fire-protection investment deck ("insurers reward sprinklers with X% off") has no traceable public commercial source that I could reach. An underwriter should assume it is unquantified until a broker submission proves otherwise on a specific account.

### 1.5 Loss economics that underpin any carrier credit (NFPA, not a carrier)

Marty Ahrens, *U.S. Experience with Sprinklers*, **NFPA, October 2021**, data years **2015–2019**:

| Metric | Value | Basis |
|---|---|---|
| Sprinklers present in reported structure fires | ≈**10%** of all reported structure fires | Disclosed |
| Sprinkler operation rate, when present and fire large enough to activate | **92%** | Disclosed |
| Civilian death rate reduction per 1,000 fires, sprinklered vs no AES | **89%** | Disclosed |
| Average loss per fire, all structures | **11% lower** in sprinklered structures | Disclosed |
| Average loss per fire, homes | **62% lower** | Disclosed |
| Average loss per fire, health care | **73% lower** | Disclosed |
| Warehouses / manufacturing | **Losses were HIGHER** in sprinklered properties (smoke damage plus exceptional large-loss incidents) | Disclosed |
| Fires controlled by a single sprinkler head | **77%** of fires where sprinklers activated | Disclosed |

**Do not skip the warehouse/manufacturing line.** NFPA's own data says the property-loss case for sprinklers *inverts* in exactly the two occupancy classes where FM-style highly-protected-risk underwriting concentrates. The life-safety case holds everywhere; the property-loss case does not.

### 1.6 FM Global / FM

- FM's public data-sheet catalogue at `fm.com/resources/fm-data-sheets` (redirected from `fmglobal.com`) is a JavaScript filter interface; **the data sheet numbers and titles did not render to the fetch tool**. I could not verify any specific FM data sheet number, its content, or its revision date from a primary FM source, and I am not going to cite data sheet numbers I did not read. See `## What I could not verify`.

---

## 2. COMMERCIAL BUILDING STOCK — THE ITM INSTALLED BASE

Source: **EIA, 2018 Commercial Buildings Energy Consumption Survey (CBECS)**. This is the most recent completed CBECS cycle. Basis for all rows: **Disclosed**, except the derived shares.

**Vintage conflict, preserved:** the CBECS table pages state *"released September 2021 and revised September 2022"*; the CBECS programme landing page states *"final results released December 2022."* Both are EIA. Use "2018 data year, released 2021–2022."

**No 2024 CBECS exists.** EIA's programme page confirms no 2024 cycle has been released or is underway; EIA ran exploratory web-only COVID-impact surveys of office and education buildings in 2023–2024 that were **not** full CBECS cycles, and no timeline for the next full cycle is published. **The installed base for this industry is being sized off eight-year-old data. That is a structural limitation of any market model built on it.**

### 2.1 Headline totals

| Metric | Value | Table |
|---|---|---|
| Total US commercial buildings | **5,918 thousand** (≈5.9 million) | CBECS 2018 Table B8 |
| Total commercial floorspace | **96,423 million sq ft** (96.4 bn sq ft) | CBECS 2018 Table B7 |
| Total commercial energy spend, 2018 | **$141 billion** | CBECS programme page |
| Average building size | **16,294 sq ft** | Estimated — D2 |

### 2.2 Age distribution — the ITM annuity's foundation

| Year constructed | Buildings (thousands) | Floorspace (million sq ft) |
|---|---|---|
| Before 1946 | 709 | 9,246 (Before 1920: 3,600; 1920–1945: 5,646) |
| 1946–1959 | 517 | 6,937 |
| 1960–1969 | 685 | 10,360 |
| 1970–1979 | 831 | 13,061 |
| 1980–1989 | 794 | 13,465 |
| 1990–1999 | 921 | 15,535 |
| 2000–2009 | 924 | 17,500 |
| 2010–2018 | 537 | 10,319 |
| **Total** | **5,918** | **96,423** |

Both columns sum exactly to the published totals (D1), so these are complete, non-overlapping partitions.

Derived shares (Estimated — D1, D3):

| Cut | Buildings | Floorspace |
|---|---|---|
| Constructed **before 1990** | **59.7%** (3,536 of 5,918) | **55.0%** (53,069 of 96,423 msf) |
| Constructed **2000 or later** | **24.7%** (1,461 of 5,918) | **28.8%** (27,819 of 96,423 msf) |

### 2.3 Renovation status — proxy for system age

CBECS 2018 Table B7, floorspace (million sq ft), Basis **Disclosed**:

| Status since 2000 | Floorspace | Share of total (Estimated — D4) |
|---|---|---|
| Any type of renovation | **45,165** | 46.8% |
| No renovation since 2000 | **43,832** | 45.5% |
| Constructed 2013 or later | **7,426** | 7.7% |
| Roof replacement | 20,862 | — |
| Lighting upgrade | 29,098 | — |
| HVAC equipment upgrade | 27,575 | — |

CBECS publishes renovation categories for roof, lighting, HVAC, windows and similar. **It does not publish a fire-protection-system renovation category.** There is no CBECS instrument for sprinkler retrofit activity.

### 2.4 Sprinklered share of the stock — no source establishes it

CBECS does not ask about sprinklers. The nearest verifiable proxy is **sprinkler presence in reported structure fires**, which is a different denominator (fires, not buildings) and is biased downward because sprinklered buildings have fewer reportable fires.

NFPA, *U.S. Experience with Sprinklers*, Oct 2021, Figure 1, data years 2015–2019 — **presence of sprinklers in US structure fires by occupancy** (Basis: **Disclosed**):

| Occupancy | Sprinkler present | Non-sprinklered share (Estimated — D9) |
|---|---|---|
| Nursing home | **69%** | 31% |
| Hospital | **61%** | 39% |
| Prison or jail | **58%** | 42% |
| Manufacturing | **52%** | 48% |
| Educational | **40%** | 60% |
| Warehouse | **34%** | 66% |
| Store or office | **26%** | 74% |
| Public assembly | **25%** | 75% |
| Residential | **8%** | 92% |

**Read-through.** For SV1, the store/office and public-assembly categories — three-quarters of fires occurring in unsprinklered premises — are where retrofit headroom sits, and they are also the categories with the weakest mandate (see §5 on office). Health care is already saturated at ≈61–69%, so healthcare demand for SV1 is an **ITM/repair annuity rather than an install market** — install upside there is new-build only.

---

## 3. DATED FORCING FUNCTIONS

Ordered by strength: a named jurisdiction with an effective date first, general trends last.

### 3.1 Lithium-ion battery and stationary energy storage — the fastest-moving area

**(a) California SB 283, "Clean Energy Safety Act" — SIGNED 6 OCTOBER 2025, EFFECTIVE 1 JANUARY 2026.** Basis: **Press-derived** (Energy-Storage.News, 23 Oct 2025).

Author: Senator **John Laird** (District 17). Requirements:
- Developers must demonstrate they have **"met and conferred" with local fire suppression authorities within 30 days** of application submission.
- Consultation must cover fire mitigation measures and emergency response plans (per SB 83 guidelines).
- **Projects require inspection and sign-off from the fire suppression authority before operations commence.**
- Developers bear the inspection cost.
- The **State Fire Marshal** is directed to consider restricting BESS to outdoor or dedicated non-combustible structures in the California Building Standards Code.

**Two California bills that FAILED — the counter-evidence:**
- *Battery Energy Safety and Accountability Act* (Assemblymember **Dawn Addis**) — would have removed CEC jurisdiction and mandated setbacks. Withdrawn from April committee hearing; failed at first reading.
- *Safe and Secure Battery Storage Act* (Assemblymember **Carl DeMaio**) — would have imposed a moratorium on new BESS approvals until **1 January 2028**. Failed at first reading.

**(b) California Building Standards Code, 2025 Triennial Edition (Title 24, including Part 9 California Fire Code) — PUBLISHED 1 JULY 2025, EFFECTIVE 1 JANUARY 2026.** Basis: **Disclosed** (CA DGS Building Standards Commission). Next triennial cycle follows the same three-year rhythm. This is a hard, statewide, dated switchover for every SV1/SV2/SV3 design in California.

**(c) NYC Fire Code 2022, §FC 309 — powered mobility devices.** Basis: **Press-derived** (FirstService Residential, pub. 31 Jul 2025). The threshold and requirement, as reported:
- **Trigger: a building offering shared storage/charging for 6 or more e-bikes or micromobility devices.**
- Requirements for such rooms: **sprinkler protection; smoke detection; signage; minimum one-hour fire-rated separation** from the rest of the building.

This is the single most directly monetisable lithium-ion rule I found for SV1 and SV2 — it converts a bike room in a residential or commercial building into a sprinklered, detected, rated enclosure. **Caveat: I could not open the primary NYC Fire Code Chapter 3 PDF** (the FDNY site serves chapters through a JS PDF viewer at `nyc.gov/assets/fdny/pdfviewer/viewer.html?file=chapter-3-2022.pdf&section=firecode_2022`, which the fetch tool cannot render, and every direct-path guess returned 404). Verify the threshold and the exact requirement against the primary text in diligence.

NYC Fire Code edition and effective date, Basis **Disclosed** (nyc.gov/site/fdny): **2022 Fire Code, effective 15 April 2022, per Local Law No. 47 of 2022.**

**(d) NYC device-certification local laws.** Basis: **Press-derived** (NYC DCWP press release 041-24, 2024; exact day not shown in the fetched render).

| Law | Effective | Requirement |
|---|---|---|
| **Local Law 39 of 2023** | **16 Sep 2023** | Bans sale, lease, rental or distribution in NYC of e-bikes, scooters or batteries not certified to accredited-lab standards — **UL 2849** (e-bikes), **UL 2272** (other mobility devices), **UL 2271** (batteries) |
| **Local Law 49 of 2024** | 2024 (day not stated) | Authorises the city to padlock repeat-violating brick-and-mortar retailers; max penalty raised to **$2,000 per device type**; retailers must display fire-safety disclosure signage. Sponsor: Councilmember Gale Brewer |
| **Local Law 50 of 2024** | 2024 (day not stated) | Gives **FDNY concurrent enforcement authority** alongside DCWP; online retailers must post certification information on product pages. Sponsor: Councilmember Gale Brewer |

These are **retail-channel** rules. They do not create SV1/SV2/SV3 service revenue directly; they matter because they are the enforcement scaffolding that makes FC 309 room-level requirements stick.

**(e) A NYC rule that was NOT adopted — preserve this.** Proposed FDNY rule **3 RCNY §309-01**, *Uncertified Storage Batteries for Powered Mobility Devices*: comment deadline and public hearing **1 October 2025**; ten public comments received; **the rule was WITHDRAWN and never adopted.** Basis: **Disclosed** (rules.cityofnewyork.us). Even in the most aggressive jurisdiction in the country, a lithium-ion rule failed to make it into the code.

**(f) NFPA 855, Standard for the Installation of Stationary Energy Storage Systems.**

| Fact | Value | Basis | Source |
|---|---|---|---|
| **2026 edition** released | announced **18 Sep 2025** | Press-derived | Energy-Storage.News, 18 Sep 2025 |
| Edition sequence | 2026 is the **third edition** | Disclosed | ACP fact sheet, Nov 2025 |
| Enforcement vehicle | **NFPA 1 Fire Code, Chapter 52** enforces NFPA 855 | Disclosed | ACP fact sheet, Nov 2025 |
| **IFC 2024** | has **independent** ESS provisions, does not mandate NFPA 855 | Disclosed | ACP fact sheet, Nov 2025 |
| **IFC 2027** | **will mandate NFPA 855 compliance**; the 2026 edition of 855 will be referenced by the **2027 editions of the model codes** | Disclosed | ACP fact sheet, Nov 2025 |
| Core requirement posture | mandates **explosion prevention per NFPA 69** rather than fire suppression, *"as suppression is ineffective for lithium-ion batteries"* | Disclosed | ACP fact sheet, Nov 2025 |
| Testing | **UL 9540A** large-scale fire testing to verify one enclosure's full combustion does not propagate to adjacent units | Disclosed | ACP fact sheet, Nov 2025 |
| 2026 change | eliminated standalone deflagration management (NFPA 68); now requires combined explosion prevention plus fire containment | Disclosed | ACP fact sheet, Nov 2025 |
| Adoption lag | *"the local adoption process can delay implementation, sometimes by many years"* | Disclosed | ACP fact sheet, Nov 2025 |

2026-edition changes, Basis **Press-derived** (Telgian, 3 Oct 2025; Energy-Storage.News, 18 Sep 2025):
- **Hazard Mitigation Analysis moved from optional to the DEFAULT requirement** for virtually all in-scope ESS installations.
- New **§9.7.6.6** on active Thermal Runaway Propagation Prevention (TRPP) systems that detect and suppress thermal-runaway precursors.
- Expanded chemistry scope: iron-air, sodium sulfur, zinc-air, zinc-bromide, nickel-hydrogen, hybrid supercapacitors, lithium metal.
- Covers **EV charging systems that integrate energy storage**.
- Fire detection options for lithium battery storage expanded to *"a smoke detector system, a thermal image fire detection system, or a radiant-energy detection system."*
- Emergency response plans require **annual review and refresher training**, with responders notified of training dates.

**Read-through.** NFPA 855's explicit position that suppression is ineffective for lithium-ion pushes the ESS opportunity toward **SV2 (detection — smoke, thermal-imaging, radiant-energy) and SV3 (explosion control, clean agent, special hazard engineering)**, and *away* from conventional SV1 water-based sprinkler scope. The annual emergency-response-plan review is a recurring-services line. **The dated hinge is the 2027 model-code cycle**, not the 2026 standard release.

**(g) New York State.** Basis: **Disclosed** (NYSERDA Energy Storage Safety page).
- Governor **Hochul** established the **Inter-Agency Fire Safety Working Group in July 2023**, after fires at facilities in **Jefferson, Orange and Suffolk Counties**.
- Working group **recommendations released 6 February 2024**.
- **26 July 2024:** Hochul announced **draft New York Fire Code language** implementing the recommendations.
- **NYS Battery Energy Storage System Guidebook** updated **31 October 2025**.
- I could **not** verify a finalised model local law or a NY Fire Code adoption effective date; NYSERDA's page stops at the July 2024 draft.

### 3.2 The counter-force nobody puts in the deck — BESS moratoria

Basis: **Press-derived** (Energy-Storage.News, **13 March 2026**, citing **Carina Energy's BESS Moratorium Monitor**).

| Jurisdiction | Moratoria |
|---|---|
| **New York** | **97** — highest in the nation; **37 of 62 counties** affected |
| California | 4 |
| Iowa | 3 |
| Washington | 3 |
| Indiana, Michigan, Colorado, Illinois, Maryland, Maine, Texas, Wisconsin | 1–2 each |
| **US total** | **at least 150 moratoria across 17 states** |

Named NY sub-jurisdictions: **Westchester County (9), Chautauqua County (8), Erie County (6), Town of Hanover (six-month moratorium, 2025), Town of Ulster (proposed six-month moratorium, 2025)**. Seven states allow developers to bypass local moratoria under conditions — New York above a **25 MW** threshold, Michigan above **50 MW / 200 MWh**, California via state pathway.

Also: **Solano County, California** imposed a BESS moratorium in **January 2024** and adopted replacement zoning, reported **19 August 2025**.

**Read-through.** The ESS special-hazard opportunity for SV3 is real but is being throttled at the local level in precisely the state with the most aggressive code activity. A contractor's ESS pipeline is a function of county-level politics, not of NFPA 855. Underwrite the pipeline county by county.

### 3.3 Moss Landing (Vistra), 16 January 2025 — the incident behind the 2025–26 rule wave

Basis: **Press-derived** (Energy-Storage.News tag archive). Downstream, dated consequences I could verify:
- **California SB 283** signed 6 Oct 2025, effective 1 Jan 2026 (§3.1a).
- **PG&E delayed recommissioning** of the adjacent **Elkhorn BESS** to the following year — reported 28 Aug 2025.
- **US EPA appointed ABTC** to recycle up to **100,000 lithium-ion battery modules** from the Moss Landing site — reported 13 Nov 2025.

### 3.4 Data centre suppression — the largest construction-driven pull, but the standards side is unverified

**Named, dated capex and campus announcements** (Basis: **Press-derived** throughout):

| Operator | Figure | Detail | Date | Source |
|---|---|---|---|---|
| **Alphabet / Google** | **$195–205 bn** 2026 capex (raised) | *"as it accelerates AI data center buildout"* | **22 Jul 2026** | DatacenterDynamics |
| **Google** | $205 bn capex | reported as an increase citing demand growth and capacity constraints | Jul 2026 (day not shown) | Construction Dive homepage |
| **Meta** | **$50 bn** | **Richland Parish, Louisiana** campus expansion to **5 GW** | **13 Jul 2026** | DatacenterDynamics |
| **Meta + BlackRock** | amount not stated | **El Paso, Texas** — **1 GW** of compute | **29 Jul 2026** | DatacenterDynamics |
| **Meta** | — | **Temple, Texas** facility begins operations | **23 Jul 2026** | DatacenterDynamics |
| **AWS** | — | added more data centre capacity *"than any other company"* in 2025, including **1.2 GW in Q4** | **2 Jul 2026** | DatacenterDynamics |
| **DTE Energy** (Michigan utility) | — | data-centre pipeline to **more than 8 GW** after deals with **Oracle** and **Google** | **29 Jul 2026** | DatacenterDynamics |
| **AMD → Anthropic** | **up to $5 bn** | Anthropic to deploy up to **2 GW** of Instinct MI450 GPUs | **22 Jul 2026** | DatacenterDynamics |
| **Nvidia → Safe Superintelligence** | **$5 bn** | expected to substantially increase GPU compute | **28 Jul 2026** | DatacenterDynamics |
| **AWS → Recursive Superintelligence** | **$410 m** compute agreement | — | **29 Jul 2026** | DatacenterDynamics |
| **Google** | — | filed for **two data centres in Vernon, Texas** | **20 Jul 2026** | DatacenterDynamics |
| **Flexential** | — | **110 acres, Talty, Texas** — 108 MW campus | Jul 2026 | DatacenterDynamics |
| **Galaxy Digital** | — | **Waco, Texas** — first 75 MW live in 2028 | Jul 2026 | DatacenterDynamics |
| **IREN** | **$2.8 bn** AI deals | new funding model | **21 Jul 2026** | Data Center Knowledge |

**Implied capex intensity:** Meta Richland Parish at **$50 bn / 5 GW = $10 bn per GW** (Estimated — D15). That is a usable per-GW scalar for sizing a special-hazard contractor's addressable content on an announced campus, provided a percentage-of-construction-value assumption is applied separately.

**The counter-signal, same week:** **QTS cancelled a $30 bn project** — Data Center Knowledge, deep-dive headline *"What QTS' Canceled $30B Project Reveals About AI Data Center Development"* (accessed 29 Jul 2026). Announced capex is not contracted backlog.

**Standards side — not verified.** I could not open NFPA's pages for **NFPA 75** (Fire Protection of Information Technology Equipment) or **NFPA 76** (Fire Protection of Telecommunications Facilities); the NFPA site returns metadata-only renders to the fetch tool and the NFPA catalogue redirects to the homepage. **I therefore state no edition year and no requirement for NFPA 75 or 76.** The clean-agent-vs-pre-action-water question and its split between SV1 and SV3 remains open — see `## What I could not verify`.

### 3.5 Warehouse / logistics — the build cycle, quantified

Cushman & Wakefield US Industrial MarketBeat, **Q1 2026, report dated 14 April 2026**. Basis: **Disclosed**.

| Metric | Q1 2026 |
|---|---|
| National industrial vacancy | **7.0%** — *"dipped below its cyclical peak"* |
| Net absorption | **40 msf**, +52% YoY |
| Completions | **54 msf**, −27% YoY |
| Under construction | **284 msf**, +6.2% YoY |

Later data point, same publisher: **"Modest New Supply and Intensifying Demand Push Vacancy Back Below 7%"** — C&W press release dated **17 July 2026** (Basis: **Press-derived**, headline only).

**Read-through.** Falling completions (−27% YoY) with rising under-construction stock means the SV1 warehouse **install** pull is flattening near-term and re-accelerating on a lag. The ESFR/high-piled-storage code mechanics that govern the scope of that work belong to the parallel codes stream; I did not duplicate them and could not independently verify IFC Chapter 32 or NFPA 13 storage provisions from a primary source.

### 3.6 EV charging, cannabis, hydrogen, battery manufacturing

**Verified:** NFPA 855 (2026) now covers **EV charging systems that integrate energy storage** (§3.1f). That is the only EV-related code fact I could confirm from a source I could open.

**Not verified — and I am leaving them out rather than guessing:** parking-garage sprinkler or detection rules specific to EVs in any named US jurisdiction; any named municipal EV-parking fire ordinance with an effective date; cannabis cultivation/extraction occupancy requirements; hydrogen (NFPA 2) occupancy requirements; battery-manufacturing plant special-hazard requirements. See `## What I could not verify`.

---

## 4. DEMOGRAPHIC AND OCCUPANCY DRIVERS

### 4.1 Healthcare and senior living — CMS as the demand floor

**Long-term care facilities — 42 CFR §483.90.** Basis: **Disclosed** (eCFR, current text, accessed 29 Jul 2026).

| Requirement | Detail |
|---|---|
| Life Safety Code edition | **NFPA 101, 2012 edition, issued 11 August 2011**, plus **TIA 12-1, 12-2, 12-3, 12-4** |
| Sprinkler installation deadline | **"Install an approved, supervised automatic sprinkler system in accordance with the 1999 edition of NFPA 13" by 13 AUGUST 2013** |
| ITM standard | **"Test, inspect, and maintain … in accordance with the 1998 edition of NFPA 25"** |
| Impairment rule | Sprinkler system down **more than 10 hours** → evacuate the affected area **or** establish a fire watch until restored |

**Hospitals — 42 CFR §482.41.** Basis: **Disclosed** (eCFR, current text, accessed 29 Jul 2026).
- **NFPA 101, 2012 edition (issued 11 Aug 2011)** and **NFPA 99 Health Care Facilities Code, 2012 edition (issued 11 Aug 2011)**, plus multiple TIAs through 2013–2014.
- Same **10-hour** sprinkler-impairment rule: evacuate or fire watch.
- The hospital CoP itself contains **no routine sprinkler testing frequency** — only the outage protocol. The testing frequency comes through the incorporated NFPA references.

**Why this is the strongest recurring-revenue floor in the industry.** Two federal regulations, incorporating NFPA 25 by reference, tie a facility's **Medicare/Medicaid participation** to documented ITM. The consequence of non-compliance is loss of reimbursement, not a fine. That is a harder enforcement mechanism than any municipal fire code. It feeds **SV1** (sprinkler ITM, fire watch, impairment response) and **SV2** (NFPA 101 alarm and notification requirements).

**Note the edition freeze.** CMS is still on the **2012** NFPA 101/99 and, for LTC sprinklers, the **1999** NFPA 13 and **1998** NFPA 25. A contractor's healthcare book is priced against decades-old editions, not the current ones — a diligence item for any target with healthcare concentration.

**Senior living build cycle — the install side is nearly dead.** NIC MAP, **Q2 2026, published 9 July 2026**. Basis: **Disclosed**.

| Metric | Q2 2026 |
|---|---|
| Occupancy | **89.9%**, up 0.4 pp from Q1 |
| Occupied units | **639,650**, +≈3,700 QoQ |
| Inventory growth | **0.4% YoY** |
| Units under construction | **fewer than 16,000** |
| Implied inventory | **≈711,500 units** (Estimated — D11) |
| Under construction as % of inventory | **≈2.25%** (Estimated — D11) |

NIC's own framing: *"High occupancy rates and static construction mean fewer new housing options for older adults."*

**Read-through.** Senior living is a **99.6%-annuity, 0.4%-install** market on current data. Ageing demographics are a *utilisation* story, not a construction story, and a fire-protection target selling into senior living should be underwritten as an ITM route business.

Highest/lowest occupancy markets (Q2 2026): **Boston 93.3%, San Francisco 92.7%, Baltimore 91.8%** / **Miami 86.2%, Atlanta 86.5%, San Antonio 87.0%.**

### 4.2 Education

**Not verified.** `schoolsafety.gov/grants` returned 403 and the Texas Education Agency school-safety page did not carry the funding figures. **I could not verify any named school-safety appropriation, its amount, or whether fire/life-safety equipment is an eligible use.** I am not going to name a programme or an appropriation I did not read. See `## What I could not verify`.

Building-stock context that does hold: CBECS 2018 puts **40%** sprinkler presence in educational-occupancy structure fires (NFPA, Oct 2021) — i.e. **60%** of educational fires occur in unsprinklered premises (Estimated — D9), the third-largest unsprinklered pool after residential and public assembly.

### 4.3 Multifamily and high-rise residential retrofit

**Not verified.** I could not open the Honolulu Fire Department or City & County of Honolulu pages carrying Ordinance 18-14 / the residential high-rise life-safety evaluation programme, and `chicago.gov` returned 403 on the high-rise life-safety-evaluation page. **I am naming no deadline I did not read.** The parallel codes stream (`02-codes-and-mandate.md`, §8 "Retroactive sprinkler mandates") owns this list; defer to it and do not treat my silence here as evidence of absence.

---

## 5. WHAT IS SHRINKING OR REVERSING

### 5.1 Office — the ITM annuity's weakest occupancy

**Two vacancy figures that disagree. Both reported, neither averaged.**

| Source | Vacancy | Period | Basis |
|---|---|---|---|
| **Cushman & Wakefield** US Office MarketBeat, report dated 14 Apr 2026 | **20.2%** | Q1 2026 | Disclosed |
| **CommercialCafe** National Office Report, pub. 20 Jul 2026 | **17.7%**, −170 bps YoY | June 2026 | Disclosed |

The 250-bp gap is a methodology difference (universe definition, sublease treatment, building-class cut-off), not a data error. An operator's addressable office ITM base sits somewhere between the two.

C&W Q1 2026 detail: net absorption **−4.0 msf** for the quarter, but four-quarter rolling absorption **+5.2 msf** — *"the highest-level post-pandemic"*; Class A four-quarter rolling **+18.7 msf**, quarterly **+1.4 msf**. The recovery is Class A only.

**Office construction — effectively stopped.** CommercialCafe, 20 Jul 2026, Basis **Disclosed**:
- Under construction as of June 2026: **29.6 msf**, ≈**0.4% of total office stock**.
- Delivered YTD 2026: **11.1 msf**.
- Implied total office stock: **≈7,400 msf** (Estimated — D10).

**Office-to-residential conversion — real but small.** CommercialCafe, 20 Jul 2026: *"in 2025, office-to-multifamily projects that were either completed or under construction reached 11.8 million square feet — higher than in any prior year."* Report title: *"Adaptive-Reuse Conversion Projects on the Rise, Tackling Stubbornly High Office Vacancy Levels."*

- **11.8 msf ≈ 0.16% of office stock** (Estimated — D10).

**The honest conclusion for an underwriter.** Conversion is a record-setting *rate* on a rounding-error *base*. It is not going to reallocate the office ITM annuity at scale within a hold period. The material office risk to SV1/SV2 route density is **deferred ITM in half-empty and mothballed buildings**, not conversion.

**What I could not verify:** whether an emptied or mothballed office building continues to be inspected in practice, and what NFPA 25 / local AHJ practice is for vacant-building impairment. I found no source establishing deferral rates, and I am not going to assert one. See `## What I could not verify`.

### 5.2 Restaurants — the SV3 kitchen-suppression route base

National Restaurant Association, **2026 State of the Restaurant Industry, published 11 February 2026**. Basis: **Disclosed**.

| Metric | 2026 projection |
|---|---|
| Industry sales | **$1.55 trillion** |
| Real (inflation-adjusted) growth | **1.3%** |
| Employment | **15.8 million** |
| Jobs added | **≈100,000** |

NRA framing: *"cautiously optimistic about 2026"*, offsetting *"persistent cost pressures, such as uneven traffic and rising costs."*

Secondary, weaker: Restaurant Business Online reports the NRA's annual report noting **only 42% of operators said they were profitable last year** (Basis: **Press-derived**; no publication date shown on the fetched render — treat as indicative only).

**The number that actually matters for SV3 is the unit count, and I could not verify it.** Kitchen-suppression and extinguisher route economics run on *locations*, not sales dollars. The NRA public page publishes sales, employment and job adds, but **not** total US restaurant locations, gross closures or net unit growth. Restaurant Dive and Restaurant Business Online carried only single-company news (a Hardee's franchisee bankruptcy, Cracker Barrel's sale of Maple Street Biscuit) in the fetched renders. **A route-density model for SV3 cannot be built on what I could verify.** See `## What I could not verify`.

### 5.3 Requirements that were removed or never adopted

The brief notes a parallel stream established that **Maryland deleted its existing high-rise residential retrofit requirement in 2025**. I did **not** independently verify that and am not restating it as my own finding.

**Reversals I did verify:**

| Reversal | Detail | Date | Basis |
|---|---|---|---|
| **FDNY proposed rule 3 RCNY §309-01** *Uncertified Storage Batteries for Powered Mobility Devices* | **WITHDRAWN, never adopted**; comment deadline and hearing 1 Oct 2025; 10 comments received, raising scope, enforcement procedure and whether e-bikes were adequately covered | **1 Oct 2025 hearing; withdrawn** | Disclosed (rules.cityofnewyork.us) |
| **CA "Battery Energy Safety and Accountability Act"** (Addis) | Withdrawn from April committee hearing; **failed at first reading** | 2025 | Press-derived |
| **CA "Safe and Secure Battery Storage Act"** (DeMaio) | **Failed at first reading**; would have imposed a BESS moratorium to 1 Jan 2028 | 2025 | Press-derived |
| **≥150 local BESS moratoria across 17 states** | 97 in NY alone (37 of 62 counties); these do not remove a fire-protection *requirement*, they remove the *project* the requirement would have applied to | data as of 13 Mar 2026 | Press-derived |

**I could not verify any additional jurisdiction that deleted an existing sprinkler, alarm or ITM requirement.** The NAHB and NFPA pages that track state-level preemption of residential sprinkler mandates were unreachable. This is a real gap: the reversibility thesis rests, in this stream, on Maryland (from the parallel stream) plus the withdrawn/failed items above.

---

## 6. THIRD-PARTY MARKET SIZING — HANDLE WITH SUSPICION

**Two publishers, two numbers, both global, both including equipment and services. Not averaged.**

| | **Grand View Research** | **MarketsandMarkets** |
|---|---|---|
| Report | Fire Protection Systems Market | Fire Protection System Market (Report 1018) |
| Publication | **June 2023, last updated May 2026** | **October 2025** |
| Base-year size | **$88,945.0 m (2024)** | **$85.06 bn (2025)** |
| Forecast size | **$130,369.2 m (2030)** | **$118.14 bn (2030)** |
| Stated CAGR | **6.6% (2025–2030)** | **6.8% (2025–2030)** |
| Scope | **Global.** Products: detection, suppression, response, analysis, sprinkler. **Services: managed service, installation/design, maintenance.** Applications: commercial, industrial, residential. Regions: NA, EU, APAC, LATAM, MEA | **Global.** Products, services and equipment across residential, commercial and industrial verticals |
| Price | **Not published on the page** | **$4,950 single user / $8,150 corporate** |
| Extent | not stated | **268 pages, 194 market tables** |
| Named players | not shown | **Honeywell International, Johnson Controls, Siemens** |
| Segment detail | not shown | Fire suppression **36.4%** share; APAC fastest region at **8.0% CAGR**; industrial fastest vertical at **7.3% CAGR** |

**The conflict, quantified (Estimated — D8):** rolling Grand View's 2024 base forward one year at its own stated CAGR gives an implied **2025 global market of ≈$94.8 bn** against MarketsandMarkets' **$85.06 bn** for the same year — Grand View is **≈11.5% higher**. Same nominal scope, same year, **$9.8 bn apart**. Do not average; do not cite either as "the market."

**Methodology findings — these are the point of this section:**

1. **Grand View's stated CAGR does not match its own arithmetic window.** A 6.6% CAGR labelled "2025–2030" applied to the 2024 base of $88,945.0 m compounds to ≈$130,514 m over **six** years (2024→2030), matching its stated 2030 figure of $130,369.2 m. Over the labelled five-year window the CAGR implied by its own endpoints is **6.58% across 2024→2030** (Estimated — D6). The label and the arithmetic describe different periods.
2. **Neither publisher publishes a traceable methodology on the public page.** Neither states a source for the base-year figure, a bottom-up build, or a survey base.
3. **Neither is US-specific.** Both are global. **Neither is decomposable into this study's three sub-verticals.** Sprinkler is a product line inside "products," not a services segment; ITM is buried inside "maintenance"; kitchen suppression and clean agent are not broken out at all. **Neither figure can be used to size SV1, SV2 or SV3.**
4. **Grand View's figure is presented to a precision — $88,945.0 million, i.e. six significant figures — that no stated methodology can support.**
5. **IBISWorld** — the one publisher that does produce a US-specific, NAICS-anchored *Fire Sprinkler Installation & Maintenance in the US* report — **returned HTTP 405 to the fetch tool and could not be read.** **Freedonia** and **Mordor Intelligence** URLs returned 404. No figure from any of the three appears in this file.

---

## 7. SUB-VERTICAL SUMMARY — WHICH DRIVER FEEDS WHICH

| Driver | Dated? | SV1 sprinkler/suppression | SV2 alarm/detection/monitoring | SV3 extinguisher/kitchen/special hazard |
|---|---|---|---|---|
| CMS 42 CFR §483.90 / §482.41 (NFPA 101 2012, NFPA 25 1998) | Yes — LTC sprinkler deadline **13 Aug 2013**, ongoing ITM | **Strong, recurring** — the hardest annuity in the industry | Strong (NFPA 101 notification) | Moderate |
| NYC Fire Code **FC 309**, 6+ device bike rooms | Effective with 2022 Fire Code, **15 Apr 2022** | **Direct install** (sprinkler in the room) | **Direct install** (smoke detection) | Indirect |
| **CA SB 283**, effective **1 Jan 2026** | Yes | Low | Low | **High** — fire-authority sign-off before operation |
| **CA Title 24 2025 edition**, effective **1 Jan 2026** | Yes | Design switchover | Design switchover | Design switchover |
| **NFPA 855 (2026)** → **IFC 2027** mandate | Yes — 2027 model-code cycle | **Low — 855 says suppression is ineffective** | **High** — smoke, thermal-image, radiant-energy detection | **High** — explosion prevention (NFPA 69), TRPP, HMA |
| Data centre capex ($195–205 bn Google 2026; $50 bn Meta Louisiana) | Yes, dated announcements | Pre-action water (scope unverified) | Very early detection (scope unverified) | **Clean agent (scope unverified)** |
| Warehouse build cycle (284 msf UC, completions −27% YoY) | Q1 2026 | **High, cyclical** | Moderate | Moderate |
| Senior living (0.4% inventory growth, <16k UC) | Q2 2026 | **Annuity only, install ≈nil** | Annuity | Annuity |
| Restaurant unit base | Not verifiable | Low | Low | **Core route base — but unmeasurable from public sources** |
| Property market softening (−12% global property, Q2 2026) | Q2 2026 | **Negative** for carrier-driven upgrades | **Negative** | Neutral |
| BESS moratoria (≥150 across 17 states) | 13 Mar 2026 | Neutral | **Negative** | **Negative** |
| Office vacancy 17.7%–20.2%; UC 0.4% of stock | Q1–Q2 2026 | **Negative for install; ITM at risk of deferral** | **Negative** | Negative |

---

## Derivations

All inputs are the Disclosed figures cited above. Nothing here introduces a new source.

**D1 — CBECS 2018 age distribution, completeness check and pre-1990 share.**
Buildings (thousands): 709 + 517 + 685 + 831 + 794 + 921 + 924 + 537 = **5,918** — exactly the published total, so the partition is complete.
Pre-1990 buildings: 709 + 517 + 685 + 831 + 794 = **3,536**; 3,536 ÷ 5,918 = **0.5975 → 59.7%**.
Floorspace (million sq ft): 9,246 + 6,937 + 10,360 + 13,061 + 13,465 + 15,535 + 17,500 + 10,319 = **96,423** — exactly the published total.
Pre-1990 floorspace: 9,246 + 6,937 + 10,360 + 13,061 + 13,465 = **53,069**; 53,069 ÷ 96,423 = **0.5504 → 55.0%**.

**D2 — Average commercial building size.**
96,423 million sq ft ÷ 5,918 thousand buildings = 96,423,000,000 ÷ 5,918,000 = **16,294 sq ft**.

**D3 — Post-2000 share.**
Buildings: (924 + 537) ÷ 5,918 = 1,461 ÷ 5,918 = **0.2469 → 24.7%**.
Floorspace: (17,500 + 10,319) ÷ 96,423 = 27,819 ÷ 96,423 = **0.2885 → 28.8%**.

**D4 — Renovation shares (floorspace).**
Renovated since 2000: 45,165 ÷ 96,423 = **46.8%**. No renovation: 43,832 ÷ 96,423 = **45.5%**. Built 2013+: 7,426 ÷ 96,423 = **7.7%**.
Check: 45,165 + 43,832 + 7,426 = **96,423** — the three categories are exhaustive and mutually exclusive.

**D5 — Nonresidential fire loss per fire (USFA, 2014–2023 series).**
2023: $3.2 bn ÷ 110,000 fires = **$29,091 per fire**.
2022: $3.9 bn ÷ 129,500 fires = **$30,116 per fire**.

**D6 — Grand View internal consistency.**
Stated endpoints: $88,945.0 m (2024) → $130,369.2 m (2030), a ratio of 1.4657. Implied CAGR over **six** years = 1.4657^(1/6) − 1 = **6.58% per year**.
Applying their stated 6.6% over six years: 88,945 × 1.066^6 = 88,945 × 1.4674 = **$130,514 m**, ≈ their published 2030 figure. Conclusion: the "2025–2030" label describes a **2024→2030** compounding window.

**D7 — MarketsandMarkets internal consistency.**
$85.06 bn (2025) → $118.14 bn (2030), a ratio of 1.3889. Over five years: 1.3889^(1/5) − 1 = **6.79%**, matching the stated 6.8% and internally consistent.

**D8 — The Grand View vs MarketsandMarkets 2025 conflict.**
Grand View implied 2025 = 88,945 × 1.066 = **$94,815 m ($94.8 bn)**.
Gap vs MarketsandMarkets 2025 of $85.06 bn = 94,815 − 85,060 = **$9,755 m**.
Relative gap = 9,755 ÷ 85,060 = **11.47%**.

**D9 — Unsprinklered share of structure fires by occupancy.**
100% minus NFPA's sprinkler-presence figure, per occupancy: nursing home 31%, hospital 39%, prison/jail 42%, manufacturing 48%, educational 60%, warehouse 66%, store/office 74%, public assembly 75%, and residential at 92% unsprinklered.
**Caveat carried forward:** this is a share of *fires*, not of *buildings*. Sprinklered buildings generate fewer reportable fires, so the true sprinklered share of the building stock is higher than these figures.

**D10 — Office stock and conversion share.**
CommercialCafe states 29.6 msf under construction ≈ 0.4% of total stock. Implied stock = 29.6 ÷ 0.004 = **≈7,400 msf**.
Conversion activity 11.8 msf ÷ 7,400 msf = **0.159% → ≈0.16% of office stock**.
**Caveat:** the 0.4% is itself rounded to one significant figure, so the implied stock carries wide error bars. Treat 0.16% as an order of magnitude, not a point estimate.

**D11 — Senior housing inventory and construction intensity.**
Occupied units 639,650 at 89.9% occupancy → inventory = 639,650 ÷ 0.899 = **≈711,513 units**.
Under construction <16,000 ÷ 711,513 = **≈2.25% of inventory**.

**D12 — Nonresidential fire count change, 2023 → 2024.**
111,900 (2024, USFA statistics page) ÷ 110,000 (2023, USFA nonresidential-fires page) = 1.0173 → **+1.7%**.
**Caveat:** the two figures come from USFA pages last reviewed on different dates (6 Jul 2026 and 14 Feb 2025). Confirm they are the same estimation vintage before using the delta.

**D13 — Habitational frame-vs-masonry rate multiple.**
Older frame midpoint = (0.60 + 1.20) ÷ 2 = **$0.90 per $100 TIV**.
Non-CAT newer masonry midpoint = (0.20 + 0.40) ÷ 2 = **$0.30 per $100 TIV**.
Multiple = 0.90 ÷ 0.30 = **3.0×**.

**D14 — ISO PPC handout, implied Class 9 premium and Class 10→5 reduction ($100,000 home).**
Class 9 = Class 5 + stated saving = 373 + 433 = **$806**.
Class 10 → Class 5 saving = 894 − 373 = **$521**; reduction = 521 ÷ 894 = **58.3%**.
Consistency check: 894 (Cl.10) > 806 (Cl.9) > 373 (Cl.5) — monotonic, so the document's two statements are internally consistent.

**D15 — Data-centre capex intensity, Meta Richland Parish.**
$50 bn ÷ 5 GW = **$10 bn per GW** of announced campus capacity.
**Caveat:** this is total campus capex including land, power, shell, mechanical/electrical and IT. The fire-protection content is a small percentage of it, and I have no verified percentage-of-construction-value figure to apply.

---

## Sources

**Building stock**
1. EIA, *2018 CBECS Table B8: Year constructed, number of buildings, 2018* — released Sep 2021, revised Sep 2022 — https://www.eia.gov/consumption/commercial/data/2018/bc/html/b8.php
2. EIA, *2018 CBECS Table B7: Building size, floorspace, 2018* — released Sep 2021, revised Sep 2022 — https://www.eia.gov/consumption/commercial/data/2018/bc/html/b7.php
3. EIA, *Commercial Buildings Energy Consumption Survey (CBECS)* programme page — final 2018 results Dec 2022; no 2024 cycle — https://www.eia.gov/consumption/commercial/
4. EIA, *Guide to the 2018 CBECS* — https://www.eia.gov/consumption/commercial/data/2018/guide.php

**Insurance**
5. Marsh, *Global Insurance Market Index, Q2 2026* — pub. 22 Jul 2026 — https://www.marsh.com/en/services/international-placement-services/insights/global_insurance_market_index.html
6. CIAB, *Q1 2026 P/C Market Survey* — pub. 13 May 2026 — https://www.ciab.com/resources/q1-2026-p-c-market-survey
7. Latent Insurance, *Habitational Insurance (2026): Market, Carriers & Coverage Guide* — pub. 22 May 2026 — https://www.latentinsure.com/habitational-insurance
8. Verisk, *Public Protection Classification (PPC) Program* FAQ — pub./last mod. 7 Mar 2024 — https://www.verisk.com/resources/faqs/public-protection-classification-ppc-program/
9. ISO Mitigation (Verisk), *ISO's Public Protection Classification (PPC) Program* — undated — https://www.isomitigation.com/ppc/
10. *ISO Rating Impact on Insurance Premiums* (ISO-branded handout hosted by Union VFD / MSFES; no publication date on the document; URL path dated 2022-05) — https://msfes.net/unionvfd/wp-content/uploads/2022/05/ISO-Insurance-Impacts.pdf
11. Federato, *How ISO Fire Protection Ratings Drive Optimal Insurance Pricing* — undated; self-labelled illustrative — https://www.federato.ai/library/post/how-iso-fire-protection-ratings-drive-optimal-insurance-pricing
12. Home Fire Sprinkler Coalition, *Fire Sprinklers & Insurance Discounts* — last modified 18 May 2022 — https://homefiresprinkler.org/fire-sprinklers-insurance-discounts/
13. FM, *FM Data Sheets* (catalogue did not render) — https://www.fm.com/resources/fm-data-sheets

**Fire loss and sprinkler performance**
14. Marty Ahrens, *U.S. Experience with Sprinklers*, NFPA — Oct 2021, data years 2015–2019 — https://www.nfpa.org/-/media/Files/News-and-Research/Fire-statistics-and-reports/Suppression/ossprinklers.pdf
15. USFA/FEMA, *Fire Statistics* — page last reviewed 6 Jul 2026 — https://www.usfa.fema.gov/statistics/
16. USFA/FEMA, *Nonresidential Building Fires* (2014–2023 series) — page last reviewed 14 Feb 2025 — https://www.usfa.fema.gov/statistics/nonresidential-fires/

**Lithium-ion, ESS and code**
17. Energy-Storage.News, *NFPA releases NFPA 855 ESS safety standard, 2026 edition* — 18 Sep 2025 — https://www.energy-storage.news/national-fire-protection-association-releases-nfpa-855-ess-safety-standard-2026-edition/
18. Telgian, *NFPA 855 Changes in the 2026 Edition* — 3 Oct 2025 — https://www.telgian.com/nfpa-855-changes-in-2026/
19. American Clean Power (ACP), *NFPA 855: Improving Energy Storage System Safety* — Nov 2025 — https://cleanpower.org/wp-content/uploads/gateway/2024/01/NFPA855_Safety_240111.pdf
20. Energy-Storage.News, *California BESS legislation update: Fire safety bill becomes law, permitting restrictions do not* — 23 Oct 2025 — https://www.energy-storage.news/california-bess-legislation-update-fire-safety-bill-becomes-law-permitting-restrictions-do-not/
21. Energy-Storage.News, *New York leads US in BESS moratoriums, recent data shows* (citing Carina Energy BESS Moratorium Monitor) — 13 Mar 2026 — https://www.energy-storage.news/new-york-leads-us-in-bess-moratoriums-recent-data-shows/
22. Energy-Storage.News, Moss Landing tag archive (Solano County zoning 19 Aug 2025; PG&E Elkhorn delay 28 Aug 2025; EPA/ABTC recycling 13 Nov 2025) — https://www.energy-storage.news/tag/moss-landing/
23. NYSERDA, *Energy Storage Safety* (Inter-Agency Fire Safety Working Group Jul 2023; recommendations 6 Feb 2024; draft code language 26 Jul 2024; Guidebook updated 31 Oct 2025) — https://www.nyserda.ny.gov/All-Programs/Energy-Storage-Program/Energy-Storage-Safety
24. California DGS, Building Standards Commission, *Codes* (2025 Title 24 published 1 Jul 2025, effective 1 Jan 2026) — https://www.dgs.ca.gov/BSC/Codes
25. NYC Rules, *Uncertified Storage Batteries for Powered Mobility Devices* (proposed FDNY rule 3 RCNY §309-01; hearing 1 Oct 2025; **withdrawn**) — https://rules.cityofnewyork.us/rule/uncertified-storage-batteries-for-powered-mobility-devices/
26. FDNY, *Fire Code* (2022 Fire Code effective 15 Apr 2022 per Local Law 47 of 2022) — https://www.nyc.gov/site/fdny/codes/fire-code/fire-code.page
27. FirstService Residential, *A guide to e-bike policies in your NYC building* (NYC Fire Code §FC 309, 6+ device threshold) — 31 Jul 2025 — https://www.fsresidential.com/new-york/news-events/articles-and-news/nyc-e-bike-laws-expert-insights/
28. NYC DCWP, press release **041-24**, *New Enforcement Powers to Prevent Sale of Dangerous, Uncertified Batteries and Micromobility Devices* (Local Laws 39/2023, 49/2024, 50/2024) — 2024, day not shown — https://www.nyc.gov/site/dca/news/041-24/mayor-adams-speaker-adams-new-enforcement-powers-prevent-sale-dangerous-
29. Norris McLaughlin, *E-bikes: Safety Standards for New York City Apartments* (UL 2271 effective 16 Sep 2023) — https://norrismclaughlin.com/new-york-coop-condo-law-blog/uncategorized/e-bikes-safety-standards-for-new-york-city-apartments/

**Healthcare**
30. eCFR, **42 CFR §483.90** — Long-term care facilities, physical environment (NFPA 101 2012 ed.; sprinkler deadline 13 Aug 2013; NFPA 25 1998 ed.) — accessed 29 Jul 2026 — https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.90
31. eCFR, **42 CFR §482.41** — Hospital physical environment (NFPA 101 and NFPA 99, 2012 eds.) — accessed 29 Jul 2026 — https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.41
32. NIC (National Investment Center for Seniors Housing & Care), Q2 2026 NIC MAP data — pub. 9 Jul 2026 — https://www.nic.org/news-press/

**Real estate and construction**
33. Cushman & Wakefield, *U.S. Office MarketBeat*, Q1 2026 — report dated 14 Apr 2026 — https://www.cushmanwakefield.com/en/united-states/insights/us-marketbeats/us-office-marketbeat-reports
34. Cushman & Wakefield, *U.S. Industrial MarketBeat*, Q1 2026 — report dated 14 Apr 2026; related release 17 Jul 2026 — https://www.cushmanwakefield.com/en/united-states/insights/us-marketbeats/us-industrial-marketbeat
35. CommercialCafe, *National Office Report* — pub. 20 Jul 2026 — https://www.commercialcafe.com/blog/national-office-report/
36. Construction Dive homepage (Google capex $205 bn; Dodge Construction Network's Sarah Martin on June 2026 starts; Q2 2026 hotel pipeline −≈5% YoY; Skanska $7 bn Q2 order intake) — accessed 29 Jul 2026 — https://www.constructiondive.com/
37. AIA, *Consensus Construction Forecast* — most recent panel 20 Jul 2026; sector detail not on the public page — https://www.aia.org/resource-center/consensus-construction-forecast

**Data centres**
38. DatacenterDynamics, Google tag archive (*Google increases 2026 capex to $195–205bn as it accelerates AI data center buildout*, 22 Jul 2026; Vernon TX filings, 20 Jul 2026) — https://www.datacenterdynamics.com/en/tags/google/
39. DatacenterDynamics, Meta tag archive (Richland Parish LA $50 bn / 5 GW, 13 Jul 2026; Temple TX operational, 23 Jul 2026; Anthropic $10 bn compute lease talks, 17 Jul 2026) — https://www.datacenterdynamics.com/en/tags/meta/
40. DatacenterDynamics, AWS tag archive (1.2 GW added in Q4 2025, 2 Jul 2026) — https://www.datacenterdynamics.com/en/tags/amazon-web-services/
41. DatacenterDynamics news index (Meta/BlackRock El Paso 1 GW 29 Jul 2026; DTE 8 GW pipeline 29 Jul 2026; AMD–Anthropic $5 bn 22 Jul 2026; Nvidia–SSI $5 bn 28 Jul 2026; AWS–Recursive Superintelligence $410 m 29 Jul 2026; Flexential Talty TX; Galaxy Digital Waco TX) — https://www.datacenterdynamics.com/en/news/
42. Data Center Knowledge homepage (QTS cancelled $30 bn project; IREN $2.8 bn, 21 Jul 2026; Spain $3.4 bn AI campus, 21 Jul 2026) — accessed 29 Jul 2026 — https://www.datacenterknowledge.com/

**Restaurants**
43. National Restaurant Association, *2026 State of the Restaurant Industry* — pub. 11 Feb 2026 — https://restaurant.org/research-and-media/research/research-reports/state-of-the-industry/
44. Restaurant Business Online homepage (42% of operators profitable; no date shown) — accessed 29 Jul 2026 — https://www.restaurantbusinessonline.com/

**Third-party market sizing**
45. Grand View Research, *Fire Protection Systems Market* — pub. Jun 2023, last updated May 2026 — https://www.grandviewresearch.com/industry-analysis/fire-protection-systems-market
46. MarketsandMarkets, *Fire Protection System Market* (Report 1018) — Oct 2025; $4,950 / $8,150 — https://www.marketsandmarkets.com/Market-Reports/fire-protection-system-market-1018.html

---

## What I could not verify

Listed so a reader can see the shape of the hole rather than mistake silence for absence. Every item below was attempted and failed; none was skipped.

**Insurance**
1. **Any carrier or broker publication stating a quantified premium differential for sprinklered vs non-sprinklered *commercial* risk.** The only quantified sprinkler discount I found is residential (HFSC, "as high as 35%", May 2022), names no carrier, and publishes no poll methodology. **This is the single largest gap in the brief and, given how load-bearing the claim is in industry marketing, it is itself a finding.**
2. **FM Global / FM data sheet numbers, titles, contents and revision dates.** `fm.com/resources/fm-data-sheets` is a JS filter interface that returns no catalogue to the fetch tool. I did not verify FM DS 2-0, 2-81, 8-1, 3-26 or any other number, and have cited none. FM Approvals' role in conditioning coverage is unverified.
3. **Whether any named carrier requires sprinkler, alarm or ITM upgrades as an explicit condition of coverage or renewal**, for any occupancy class. The 2026 Latent habitational guide — the most on-point document I could open — does not mention fire protection at all.
4. **CIAB line-of-business detail** (commercial property specifically) for Q1 2026; the public page gives account-size splits only, and the line-level data sits behind a member download.
5. **Marsh's US-specific property rate change** for Q2 2026; the public index isolates a global property figure and a US composite direction but not a US property percentage.
6. **UL 300 kitchen-suppression compliance as an insurer requirement.** No carrier page I could reach states it. This matters directly to SV3 and is unresolved.
7. **Verisk/ISO commercial property rating mechanics** — the sprinkler credit inside ISO's commercial property rating (as distinct from the community-level PPC) is not published on any page I could reach.

**Building stock**
8. **Sprinklered share of the US commercial building *stock*.** No source establishes it. CBECS does not ask. The NFPA occupancy figures in §2.4 are a share of *fires*, a different and downward-biased denominator, and must not be relabelled.
9. **New commercial construction starts by segment.** `census.gov` (Value of Construction Put in Place, C30) is blocked by the session egress policy; the Dodge Construction Network news page returned only an April 2019 release; the AIA Consensus Construction Forecast page (panel dated 20 Jul 2026) does not carry sector percentages publicly. **No construction-starts figure appears in this file.**

**Forcing functions**
10. **NFPA 75** (Fire Protection of Information Technology Equipment) and **NFPA 76** (Telecommunications Facilities) — edition years, scope and requirements. NFPA's own pages return metadata-only renders and the NFPA catalogue redirects to the homepage.
11. **The clean-agent vs pre-action-water split in hyperscale data centres**, and therefore the SV1/SV3 revenue split on a data-centre campus. Not established from any source.
12. **Fire-protection content as a percentage of data-centre construction value.** Without it, the $10 bn/GW scalar in D15 cannot be converted into contractor-addressable revenue.
13. **EV charging fire requirements in parking garages** in any named US jurisdiction with an effective date. The only verified EV-adjacent code fact is NFPA 855 (2026) covering EV charging systems that integrate storage.
14. **ESFR sprinkler and high-piled-storage requirements** from a primary code source. Deferred to the parallel codes stream; not duplicated and not independently confirmed here.
15. **Cannabis cultivation/extraction, hydrogen (NFPA 2) and battery-manufacturing occupancy requirements.** No primary or reliable secondary source reachable. Nothing asserted.
16. **NYC Fire Code §FC 309 primary text.** The 6-device threshold, sprinkler, smoke-detection and one-hour-separation requirements come from a single secondary source (FirstService Residential, 31 Jul 2025). FDNY serves chapter PDFs through a JS viewer the fetch tool cannot open, and every direct path guess 404'd. **Verify against the primary text before relying on the threshold.**
17. **New York State Uniform Code** current edition and effective date, and whether the July 2024 draft ESS fire-code language was finalised. `dos.ny.gov` paths returned 404.
18. **Effective dates for NYC Local Laws 49 and 50 of 2024** — the DCWP release says "recently took effect" without a date.
19. **Number of US states that have adopted NFPA 855**, and by which edition. The ACP fact sheet declines to give a count.

**Occupancy drivers**
20. **Any named school-safety appropriation** and whether fire/life-safety equipment is an eligible use. `schoolsafety.gov/grants` returned 403; the Texas Education Agency school-safety page carries no funding figures. **No programme, amount or date is asserted.**
21. **Live multifamily/high-rise residential retrofit mandates with deadline dates.** `chicago.gov` returned 403 on the high-rise life-safety-evaluation page; Honolulu Fire Department pages carry no ordinance detail. Deferred entirely to the parallel codes stream.
22. **Healthcare and senior-living construction starts** in dollar terms; only NIC's unit-based inventory and under-construction figures were reachable.

**Shrinking / reversing**
23. **Whether an emptied or mothballed office building continues to receive NFPA 25 inspections in practice**, and any measured ITM deferral rate in vacant buildings. No source found. This is a real diligence question for any target with office concentration and it is open.
24. **US restaurant unit counts, gross closures, and net unit growth.** The NRA public page gives sales, employment and job adds but no unit count; trade press carried only single-company items. **The SV3 kitchen-suppression route base cannot be sized from public sources I could reach.**
25. **Any jurisdiction beyond Maryland that deleted an existing sprinkler, alarm or ITM requirement.** NAHB and NFPA state-preemption trackers were unreachable (404). I did not independently verify the Maryland 2025 deletion cited in the brief and have not restated it as my own finding.
26. **Retail store closure counts** reducing the SV3 and SV2 route base.

**Market sizing**
27. **IBISWorld** *Fire Sprinkler Installation & Maintenance in the US* — HTTP 405, unreadable. This is the one publisher whose scope actually matches a US sub-vertical, and it is the one I could not open.
28. **Freedonia Group** and **Mordor Intelligence** fire-protection studies — all attempted URLs returned 404. No figure from either appears here.
29. **Grand View Research's price point** — not published on the report page.
30. **Any traceable methodology** behind either the Grand View or the MarketsandMarkets base-year figure. Neither publishes one. Per the brief, that absence is recorded as a finding rather than papered over.

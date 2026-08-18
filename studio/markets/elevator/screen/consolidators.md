# Elevator & Escalator — Consolidator Register

Built 2026-08-11 for the smbX studio, US elevator and escalator service market.

**What this is.** One block per parent entity that owns, or distorts the count of, US
elevator and escalator service assets. A screener uses it to decide whether a company
found in the wild is already owned. "Independent" only ever means "not in this
register", so a thin register is not a neutral failure — it silently promotes owned
companies onto the target board.

**What it was built from.** `markets/elevator/research/09b-consolidator-register-v2.md`
(the merged register from run 09, hunt B) and
`markets/elevator/research/04-consolidators-deal-activity.md` (run 04, hunt B), both
gathered **2026-08-11**, with OEM detail from `markets/elevator/research/03-oem-landscape-lockin.md`
of the same date. Sponsors, footprints, brand rosters and dated add-ons are theirs,
restated here as the *current* owner; where a source names a prior sponsor it is carried
in the note line, because a prior sponsor is the single most common way a register goes
stale.

**⚠ This derives from a DRAFT synthesis that has not been through primary-source
verification (pass 6).** The research files are a single-analyst web pass. Nothing in
this file has been re-established against a primary source under the house verification
protocol. Treat every ownership assertion here as *good enough to suppress a target
pending verification*, and none of it as good enough to publish.

**⚠ FORMAT CAVEAT — READ BEFORE TRUSTING THE PARSE.** The format of this file **could
not be validated against the parser in `house/screen.ts`**, because the engine repo at
`~/Documents/GitHubRepos/SMBx-main` was found **empty on 2026-08-11**. The layout below
is copied from `markets/fire-safety/screen/consolidators.md`, which is known to parse.
**It must be re-validated once the engine is restored.** Three field names here
(`hq:`, `states:`, `locations:`) do not appear in the fire-safety file at all and are the
most likely thing to break; they are placed *after* `domains:` so that the
`backer:` / `brands:` / `domains:` triple sits in the same order and the same position it
occupies in the file that is known to parse.

**Domain coverage — read this before trusting a match.**
**26 parents** are in this register. **25 carry at least one domain**; **1 does not**, and
it is named in `## Coverage and gaps` at the foot. Of the 25, **20** were verified by
fetch — the site was reached and identified itself as that company — **4** (the OEMs Otis,
KONE, TK Elevator, Mitsubishi Electric) are recorded from primary-source URLs fetched in
run 03 rather than from a company-identity check, and **1** (Ascent Elevators) is
press-derived and was never fetched. The split is repeated in the gaps section.
**Run 13 (2026-08-11) closed two of the three empty domains** — Elevator Systems, Inc.
(`elevatorsystems.com`) and Schindler Elevator Corporation (`schindler.com`), both reached
and identity-confirmed. Standard Elevator Systems remains empty; see its entry.

**No domain in this file was constructed, guessed or inferred from a company name.**
Where a domain could not be reached and confirmed it was left out and recorded. That rule
is load-bearing here: the source pass tested and **rejected** `integrityelevator.com`
(singular — a GoDaddy for-sale parking page; the real company is `integrityelevators.com`,
plural) and `elevatorserviceinc.com` (NXDOMAIN). **Neither is to be resurrected.** Two
further candidates were rejected on the same basis and are listed at the foot.

**Unit counts are not in this file as a field.** No platform in this market publishes one.
Where a figure exists it sits in a note line. **Unit count is a diligence input and never
a screening input** — see `## Coverage and gaps`.

### Format

```
## Parent Name
backer: Sponsor Name
brands: Brand One, Brand Two, Brand Three
domains: parent.com, brandone.com
hq: City, ST
states: ST, ST, ST
locations: N
```

Anything inside a fenced code block is ignored by the parser, so the example above is
safe to keep. After each block a `> ` note line carries what the fields cannot express —
prior sponsors above all.

---

# Class 1 — PE-backed elevator service platforms under a live sponsor (10)

## American Elevator Group
backer: Arcline Investment Management
brands: Unitec, D&D Elevator, Jersey Elevator, Kencor Elevator, Port Elevator, Trenton Elevator Company, Mid-America Elevator Co., Right Way Elevator Maintenance, American Service Group, Madden Elevator Company
domains: americanelevator.com
hq:
states: NY, NJ, PA (only three of a stated 22 are named by the company)
locations: 12 partner companies

> **Arcline formed AEG in 2020** with Mark Boelhouwer and holds it to date; no prior sponsor. **The company names only 4 of its 12 partner companies — the other 8 are unpublished and will present as independent.** 30,000 elevators under service, its own disclosure and the largest in the PE set. **22 states, and the company enumerates only NY, NJ and PA**, so any whitespace map built off its footprint is inferred from add-on locations, not published. Dated add-ons: American Service Group (12-state portfolio) 2021 · Right Way Elevator Maintenance FL 2021 · Port Elevator NYC 2022-06-01 · Madden Elevator KY/IN 2022 · Trenton Elevator NJ 2023-06-09 · Mid-America Elevator Indianapolis IN 2025-12-15. **Naming trap — three separate "American" entities: American Elevator Group (this, Arcline) vs American Elevator, Inc. of Anderson IN (bought by ESI 2026) vs American Service Group (AEG's own 2021 add-on).** **Arcline runs two other elevator bets that are NOT this platform** — Standard Elevator Systems (components) and Kings III (emergency communications); do not screen either against a service buy-box. Sub-5 tokens in this roster: **AEG**, **D&D**, **Port**.

## Specialized Elevator
backer: Berkshire Partners
brands: San Francisco Elevator, 3Phase Elevator, Mile High Elevator, Excel Elevator & Escalator Corp, Koch Elevator, Gable Elevator, Willamette Elevator, Hadfield Elevator, TEC, West Virginia Elevator, Southeast Elevator, Specialized Elevator, Vintage Elevator, Wyatt Elevator
domains: specializedelevator.com
hq: Canton, MA
states: CA, CO, FL, MD, DC, VA, MA, ME, NH, CT, RI, NV, NY, NJ, OH, OR, WA, PA, DE, WV
locations: 30 markets

> **Prior sponsors: Fort Point Capital (2018–2021) on the 3Phase side and CIVC Partners on the Specialized side (pre-2022).** Berkshire took it 2021-06-03 and the two merged 2022-01-21. **23 acquisitions to 2026-05-07**, ~25,000 elevator and escalator units — the second-largest disclosed portfolio in the set. The 2021→2022 burst (6→13 acquisitions, 8,500→20,000+ units) is the fastest consolidation event in this dataset. **It self-describes as "the largest independent network of elevator service providers in the United States" — the word "independent" in its own marketing means unaffiliated with an OEM, not unsponsored. Do not read it as unowned.** **Explicitly IUEC-union** ("employer of choice for union mechanics," 500+ IUEC members): union vs open-shop is a hard compatibility gate on any add-on match. **Brand-preserving by policy** — "preserving strong local brands within an integrated operating platform" — so its legacy signs stay up and stay matchable, unlike a rebrand-everything platform. Sub-5 tokens: **TEC**, **Koch**, **Mile**. "Excel" (5) and "Gable" (5) clear the threshold but collide with ordinary words.

## Axxiom Elevator
backer: Gauge Capital
brands: Arizona Elevator Services, IronHawk Elevator, Motion Elevator, Urban Elevator Service FL LLC, Liftech Elevator Service, Quality Elevator, Evolution Elevator & Escalator Corp., AmeriTex Elevator Inc., Carolina Elevator Service Inc.
domains: axxiomelevator.com
hq: Pompano Beach, FL
states: AZ, CA, FL, TX, SC, NC, GA, DC
locations:

> **The fastest-moving platform in the market: 13 acquisitions, and the only one actively opening new regions.** Dated: Arizona Elevator Services 2024-02-21 · IronHawk Elevator 2024-02-21 · two unnamed Florida companies 2024-02-21 (Maven's ledger names them as Motion Elevator and Urban Elevator Service FL LLC) · Liftech 2025-03-19 · Quality Elevator 2025-03-19 · Evolution Elevator & Escalator 2025-04-17 · AmeriTex Elevator 2025-09-15 · Carolina Elevator Service 2026-07-28. **✔ HQ RESOLVED, run 13 (2026-08-11): Pompano Beach, FL — 2101 W Atlantic Blvd, Unit 104, Pompano Beach FL 33069, from the company's own contact page, a full street address. Elevator World's "Fort Lauderdale, Florida" is trade-press metro shorthand from the 2024 launch item and is retired. Company site outranks trade press.** **Gauge's investment date and Axxiom's founding year are published nowhere** — Gauge's portfolio page carries a logo with no text, no date and no linked URL, so the sponsor tie rests on that logo alone. **"Urban Elevator Service FL, LLC" here is Axxiom's, bought out of Urban Elevator Service (Skydeck) in 2023 — the Urban name now sits under three different owners: Axxiom in Florida, Otis on 8 locations, and Skydeck's residual 3.** Sub-5 token: **AES**.

## Action Elevator
backer: H.I.G. Capital
brands: Southwest Elevator Company, Action Elevator Co., Avery Elevator Co., Century Elevator, Elevator Technologies Inc., Gen-L Elevator LLC
domains: actionelevator.com
hq: Millersville, MD
states: MD, DC, VA, DE
locations: 3 — Baltimore MD, Ocean City MD, Lanham MD

> **Prior sponsor: Align Capital Partners (2019-09 – 2024-09), which entered as Southwest Elevator Company of Fort Worth TX and called it a "VTS platform."** H.I.G. completed 2024-09-03. **The company's public site presents it as "a regional independent elevator service company built by four generations of elevator contractors" and discloses neither the sponsor nor a single acquired brand** — a screener reading only actionelevator.com would call it independent. Domain verified two ways: the site itself, and H.I.G.'s own release naming it. Every add-on is inside the DC/MD/VA corridor. **✔ RESOLVED, run 13 (2026-08-11) — the Align/Maven "conflict" was one event seen from two sides, not two owners. Century Elevator (Forestville MD, founded 1989, founder-owned by Charlie and Clarisse Choux) was acquired by the Action platform on 2024-09-03, the same day the platform passed from Align to H.I.G. Align's exit release counts it "during its partnership with ACP" because it closed as part of the exit; H.I.G.'s release calls it "concurrent with this transaction" because it closed alongside its entry. Both are correct. Current: Action Elevator under H.I.G. Capital. Century was never separately sponsor-held — Align was prior sponsor OF THE PLATFORM, not of Century. Sources: hig.com and aligncp.com completion releases (both 2024-09-03) · Maven Group 2024-09-03 · PitchBook.** Scale at the H.I.G. trade: ~500 customers / ~800 facilities, no unit count. Sub-5 tokens: **VTS**, **Gen-L** (5, borderline).

## Elevator Service, Inc. (ESI)
backer: Carroll Capital
brands: Toledo Elevator & Machine Co. Inc., City Elevator of Michigan, Metro Elevator Inc., A-1 Elevator Service LLC, Pinnacle Elevator, A1 Pinnacle, Tristar Elevator, ESI Indiana, American Elevator Inc.
domains: esigr.com
hq: Grand Rapids, MI
states: MI, WI, IL, IN, OH, MN, MO, LA (8 of a stated 14 named)
locations: 6 Michigan offices — Grand Rapids, East Lansing, Ann Arbor, Traverse City, Kalamazoo, Saginaw

> **⚠ The 6 locations are the Michigan operating company's only — no group-wide branch count is published.** Carroll Capital is a Greenwich CT family office and took the platform 2019-10; ESI was founded 1987. **Two rejected domains sit against this entry and must not be revived: `elevatorserviceinc.com` does not resolve (NXDOMAIN), and `esielevator.com` resolves but returns 403 with ownership unverifiable.** The domain is **`esigr.com`** — sourced from Carroll's own portfolio page and confirmed by fetch. Dated: Toledo Elevator & Machine 2022-03-25 · Metro Elevator MN 2023 · A-1 Elevator Service and Pinnacle Elevator, both New Orleans LA, 2023-10-24 (stated as its "fifth add-on in the last two years") · Elevator Technology 2026 · American Elevator Inc., Anderson IN, 2026-07-16. **Two collisions on this one entry: "ESI" is also Elevator Systems, Inc. of Garden City NY (ShoreView, controllers — a different company, in this register below); and "American Elevator, Inc." of Anderson IN is not American Elevator Group.** Buy-box, own words: "the highest-quality independents in markets that have attractive dynamics for independent providers." Sub-5 tokens: **ESI**, **A-1**, **A1**, **Metro** (5, but an ordinary word).

## Champion Elevator
backer: Thayer Street Partners
brands: Westech Elevator, Superior Elevator Technologies Corp.
domains: champion-elevator.com
hq: New York, NY
states: NY, CT, NJ
locations:

> **The About page discloses no sponsor, no branch count, no acquired brand and no unit count; it still describes the company as "independently owned" and as "a leading independent alternative to the multinational elevator companies." The Thayer Street tie is press- and database-derived, not disclosed on-site.** Thayer Street entered 2020. Service area: NYC five boroughs, Westchester, Hudson Valley, Nassau and Suffolk, plus CT and NJ. Westech Elevator closed 2020-11-03 at **775+ units** — which is exactly the stated sponsor-process floor for this sector, and the only add-on-level unit figure anywhere in the market. **Superior Elevator Technologies Corp. (Bronx, founded 2010) is confirmed acquired but Elevator World carries no date on the item — left undated rather than guessed.** STEER's June 2024 table credits Thayer Street with 5 add-ons; only 2 are named anywhere, so 3 are invisible to a name screen. Note Thayer Street is also the **prior** owner of Kings III (below).

## Total Access Elevator
backer: Century Park Capital Partners
brands: Vertical Elevator Solutions, LA Elevator, TRE Elevator
domains: totalaccesselevator.com
hq: Santa Fe Springs, CA
states: CA
locations: 1

> **The company's own site presents it as "independently owned and operated" and names neither the sponsor nor any acquired brand.** Century Park finalised the investment 2024-04 and announced it 2024-05-22; company founded 2008. Dated add-ons, all three inside Greater Los Angeles in eight months: Vertical Elevator Solutions, Simi Valley, 2025-03-13 · LA Elevator, Los Angeles, 2025-08-07 · TRE Elevator (MRL specialists), Van Nuys, 2025-10-27. **This is a density play inside one metro, not a geographic expansion — a SoCal target is more likely to be already-owned than its size suggests.** No unit count; "over 500 major modernization projects" is a project history, not a portfolio. Sub-5 tokens: **LA**, **TRE** — both hopeless for a name matcher, domain only.

## Integrity Elevator Solutions
backer: Del Monte Capital
brands: Stratos Elevator
domains: integrityelevators.com
hq: Houston, TX
states: TX, LA
locations:

> **DOMAIN TRAP, HIGHEST SEVERITY IN THIS FILE: the domain is `integrityelevators.com` — PLURAL. `integrityelevator.com`, singular, is a GoDaddy for-sale parking page and is NOT this company. It was tested and rejected in the source pass; do not resurrect it.** Del Monte Capital invested 2024-06-03; the platform was founded 2020 and the founder was retained. Add-on: Stratos Elevator, Inc. (LA) 2024, month unpublished. Serves industrial/petrochemical, healthcare, offices, universities and government across Houston, Beaumont, New Orleans and Baton Rouge. Sub-5 token: **IES**.

## Ascend Safety Collective
backer: Altaline Capital Management, LLC and Haven Capital Partners
brands:
domains: ascendsafetycollective.com
hq:
states:
locations:

> **Names no member companies, no states and no units — a platform announced ahead of its deals (launched 2026-05-12, co-sponsored, each sponsor issuing its own BusinessWire release on consecutive days). Every acquisition it has made or makes from here is currently invisible to a name-based screen and will present as independent.** Sponsor offices are Los Angeles CA and New York NY; the platform publishes no HQ of its own and the site says only "North America." **Differentiator, and it is a real one for a seller who cares about their mechanics: a broad-based employee ownership program — "equity in the hands of every employee." No other platform in this register makes that offer.** The source pass initially treated this entity as suspect because it first surfaced via a low-quality aggregator, then confirmed it on two independent sponsor releases. It is real.

## Urban Elevator Service
backer: Skydeck Capital (minority)
brands: Aventura Elevator, Guardian Elevator
domains: urbanelevator.com
hq: Cicero, IL
states: IL, IN
locations: 3

> **✔ HQ RESOLVED, run 13 (2026-08-11) — a relocation, not a source conflict. CURRENT: Lombard IL, 54 Eisenhower Ln N, 60148, (708) 656-5512, from the company's own current site, which carries no Cicero address anywhere. PRIOR: Cicero IL as of 2021-05-18 — "headquartered in Cicero, Illinois", the company's own BusinessWire release on the Aventura acquisition. The move straddles the 2023 Florida divestiture to Axxiom and the 2025-04-21 sale of eight locations to Otis. Both kept, in order; Lombard is current.** Skydeck took a **minority** stake 2021-01-28; at that point Urban served IL, IN, TX, CO, AZ and FL with 180+ employees and called itself "the largest union independent elevator contractor in the country." **It is a net SELLER, not a buyer, and has been since 2023** — Florida division to Axxiom/Gauge (2023), then **eight of eleven US locations to Otis on 2025-04-21**, retaining only three in Illinois and Indiana. Last purchase: Guardian Elevator, 2021-08-11; Aventura Elevator, 2021-05-18. **The Urban brand now trades under three owners at once** — Otis (some acquired locations keep the name), Axxiom (Urban Elevator Service FL LLC) and Skydeck's residual three. **A bare "Urban Elevator" match resolves to the wrong owner two times in three; use state.** Founded 1985.

---

# Class 2 — adjacent PE holdings: inspection, components, monitoring (4)
*Not maintenance contractors. Listed so they are not mis-screened as service targets, and so their headline numbers are not mistaken for maintenance portfolios.*

## ATIS
backer: Thompson Street Capital Partners
brands: KJA Consultants, Liberty Elevator Experts, Vermont Elevator Inspection Services, Vinspec
domains: atis.com
hq: St. Louis, MO
states: United States and Canada
locations: 200+ QEI inspectors and consultants (headcount, not branches)

> **NOT a maintenance contractor — elevator and escalator safety inspections, consulting and managed services.** Thompson Street took majority 2024-09-24 from founder/CEO Chip Smith; the platform was formed by a three-way merger of ATIS, KJA Consultants and Liberty Elevator Experts announced 2023-01. Add-on: Vinspec, Alberta, 2026-03-31. **⚠ THE SINGLE MOST DANGEROUS NUMBER IN THIS MARKET: ATIS "manages nearly 100,000 elevators and escalators." That is ~10% of the 1.03M US base and it is an INSPECTION BOOK spanning the US and Canada — not a maintenance portfolio, not PE-owned units under contract. Do not compare it to AEG's 30,000. The source pass identifies it as the most likely accidental origin of the practice's untraceable "PE services ~10% of US elevator units" claim, and therefore as a live reputational risk.** Also 15,000+ clients. **Its Vermont inspection buy is not maintenance presence — northern New England still has no maintenance platform in it.** Sub-5 tokens: **ATIS**, **KJA**, **VEIS**.

## Standard Elevator Systems
backer: Arcline Investment Management
brands: Standard Elevator Systems LLC, EMI Porta LLC, ZZIPCO LLC, Texacone LLC, Elevator Equipment Company LLC (EECO), McIntosh Industries Inc.
domains:
hq: Memphis, TN
states: TN, IL, NJ, TX, CA, IN
locations:

> **NO DOMAIN. `standardelevator.com` 302-redirects to a GoDaddy for-sale parking page and is NOT the company — tested and rejected; do not resurrect it.** This entity can only be caught by full company string plus state. **⚠ CANDIDATE, NOT A CONFIRMATION (run 13, 2026-08-11): `standard-elevator.com` — HYPHENATED, a different host from the rejected one. Named as the company's website by Maven Group's 2022-06-23 release about this Memphis TN company, and tied by CB Insights to 4949 E. Raines Rd Suite 101, Memphis TN 38118. DNS resolves clean and the search index carries live pages there whose titles self-identify ("Standard Elevator Systems – Solutions for the Field"). BUT the host would not serve robots.txt to the fetcher on four attempts — root, /about-us/, /technical-support/contact-us/ and brasil.standard-elevator.com — so it was NEVER REACHED and never confirmed itself. Under the no-invented-domains law the field stays EMPTY. It is recorded here so the next pass closes it in one fetch rather than guessing again. Do not treat a `standard-elevator.com` match as establishing ownership until someone loads the page.** **Components and solutions, not service** — do not screen it against a service buy-box. Arcline created the platform 2022-01-26 by acquiring five suppliers simultaneously: Standard Elevator Systems (Memphis TN), EMI Porta (Arlington Heights IL), ZZIPCO (Franklin Lakes NJ), Texacone (Mesquite TX) and Elevator Equipment Company / EECO (Los Angeles CA plus a Richmond IN plant). **✔ RESOLVED, run 13 (2026-08-11) — McIntosh is a LATER ADD-ON, not one of the founding five and not a mis-attribution. Standard Elevator Systems acquired McIntosh Industries (Hillside NJ — rebuilding, repair and service of elevator motors and machines, 30+ years in business) on 2022-06-23, five months after the platform was formed on 2022-01-26. Sources: Maven Group 2022-06-23 · Elevator World "SES Acquires McIntosh Industries Inc." · Bass, Berry & Sims (deal counsel) · the company's own LinkedIn announcement, timestamped 2022-06-23. The five founding suppliers stand exactly as Arcline's 2022-01-26 release names them; ZZIPCO remains its New Jersey entity. Name form differs by source and both are kept so a string match fires either way: "McIntosh Industries Inc." (Elevator World, Maven, own post) vs "McIntosh Industries, LLC" (Bass Berry).** **Same sponsor as American Elevator Group — Arcline holds a service platform and a components platform separately, and they are not the same asset.** Sub-5 tokens: **EMI**, **EECO**.

## Kings III of America
backer: Arcline Investment Management
brands: LiftNet
domains: kingsiii.com
hq: Coppell, TX
states: United States and Canada
locations:

> **Prior sponsor: Thayer Street Partners — which still owns Champion Elevator, above.** Arcline acquired 2022. **NOT a service contractor — elevator emergency phones and monitoring.** Add-on: LiftNet (formerly a Hyperion Solutions brand) 2026-04-02; the site confirms LiftNet as "a Kings III company." **150,000+ phones monitored is a MONITORING book, not elevator units — do not add it to any unit tally.** Its self-published 98% customer retention reads against Otis's disclosed 92.4–94% portfolio retention, but the two measure different things and the Kings III figure carries no methodology. 35+ years in business. **This is Arcline's third elevator-adjacent holding; AEG, Standard Elevator and Kings III are three separate assets under one sponsor.**

## Elevator Systems, Inc.
backer: ShoreView Industries
brands:
domains: elevatorsystems.com
hq: Garden City, NY
states: NY, FL
locations:

> **DOMAIN CLOSED, run 13 (2026-08-11): `elevatorsystems.com`, reached and identity-confirmed. `elevatorsystemsinc.com` — previously recorded as unreachable — resolves and 302-REDIRECTS to `elevatorsystems.com`; it is a valid alias, and the canonical host is the shorter one. The site identifies itself as "Providing Non-Proprietary Elevator Control Solutions and High-Performance Parts for Modernization Since 1973", manufacturing in Garden City NY with stocked warehouses in Garden City NY and Sunrise FL — which is where the two states in the field come from. Product line: ES1/ES2 traction and hydraulic controllers, position indicators, load weighing, tape selectors, door-lock monitoring and fire-phase compliance, EMIS-100 and Lift-i remote monitoring.** **The site names no parent and never mentions ShoreView — a screener reading only the site would call it independent.** ShoreView invested 2020-03. **NOT a service company — elevator controllers and ancillary products, a manufacturer.** **⚠ THE NAME COLLISION THIS ENTRY EXISTS FOR: Elevator Systems, Inc. (Garden City NY, ShoreView, controllers) is a different company from Elevator Service, Inc. / ESI (Grand Rapids MI, Carroll Capital, service). Both abbreviate to "ESI." Match the full string plus the state, never the initialism.** Nothing else about this entity is on the record: no brands, no states, no branch count, no deals.

---

# Class 3 — strategic and non-PE consolidators (7)
*Competing buyers for the same independent targets. Their assets are just as owned as a sponsor's.*

## APi Group Corp. — Elevated Facility Services Group
backer: APi Group Corp. (NYSE: APG)
brands: EMR Elevator, Oracle Elevator, Premier Elevator, Premier-Oracle, Oracle Entrance
domains: elevatedfacilityservices.com
hq: Tampa, FL
states: 21 states / 57 markets (own site, 2026); over 18 states at the 2024-06-04 close
locations: ~600 employees at close (APi completion release, 2024-06-04)

> **Four-hop ownership chain, and every hop is a prior sponsor: Jupiter Partners (2004–2010) → Incline Equity Partners (2010-06–2017) → L Squared Capital Partners (2017–2024-06) → APi Group, completed 2024-06-04 for ~$570M cash.** **This is the largest block of US elevator units ever to change hands in this market and the main reason any "PE share" figure decays** — it left private equity in June 2024. **✔ FOOTPRINT RESOLVED, run 13 (2026-08-11) — the three versions are three DATED SNAPSHOTS, not three claims about one date, and two of them do not conflict at all. AS OF THE CLOSE, 2024-06-04, from APi Group's own completion release: "serves customers in over 18 states", "approximately 600 leaders", "approximately $220 million in annual revenue", headquartered Tampa FL. Purchase price ~$570M cash (BusinessWire, 2024-04-15). BEFORE: "30+ markets in 22 states" — and that figure is ELEVATED'S OWN REBRAND RELEASE OF 2023-10-23, not APi acquisition materials as this file previously recorded; APi's announcement and completion releases state NO state or market count beyond "over 18 states". "Over 18" is a floor, so 22 clears it and the two never conflicted. Elevator World's "18+ states" is trade press restating APi. SINCE: the company's own site now says "57 markets across 21 states" (2026). The apparent 22→21 contraction was an artifact of comparing a 2023 marketing release to a 2026 website and is withdrawn. Markets 30+ → 57 over ~2.5 years does still point to a change in counting convention, but no source states one and it is not asserted.** ~$220M revenue at purchase, ~70% from inspection, service and repair. Units: 11,000+ under the Incline hold (22 branches, 13 states) and **no current figure published — the 11,000 is stale by a decade.** **The site no longer surfaces the legacy operating brands, so all five must be caught by full string plus city.** **APi is now a standing competitor for every add-on in this sector with a public balance sheet behind it; the deal expanded APi's TAM by ~$10bn.** Sub-5 tokens: **EMR**, **APi**, **APG**.

## TEI Group / Transel Elevator & Electric
backer: Analogue Holdings Limited (Hong Kong-listed strategic)
brands: TAKA Elevator Co.
domains: teigroup.com
hq: Long Island City, NY
states: NY, FL
locations:

> **The company's own site does not disclose its parent, its acquired brand, its branch count or its unit count** — a screener reading only teigroup.com would call a 30-year-old New York contractor independent. Analogue Holdings acquired it in 2020. Organised as Northeast and Southeast divisions; no full state list published. Add-on: TAKA Elevator Company, LLC, Orlando FL, **2025-01-03**. **✔ TAKA RESOLVED, run 13 (2026-08-11) — three attributions, one company, a sequence, and one of the three is false. TAKA Elevator Company, LLC was founded 2012 in Orlando FL by Patrick and Mary Lalchandani and was founder-owned. In 2019 it sold its SERVICE BOOK to KONE — Maven's ledger names the seller "TAKA Elevator Company (Service)", and PitchBook separately records KONE as an investor. On 2025-01-03 TEI Group / Transel Elevator & Electric acquired the company itself — the residual install, modernization and rebuilt-service business — with Patrick Lalchandani retained as President under TEI's Southeastern Regional VP. THE OTIS ATTRIBUTION IS WITHDRAWN: Maven's ledger, the origin of the claim, carries no Otis/TAKA row at all (Otis's rows are Urban Elevator 2025 and Elevator Solutions 2018), and PitchBook records no Otis relationship. Run 04 credited it to Otis while flagging the KONE discrepancy in the same sentence — a transcription error against its own cited source. Sources: TEI Group's own news item and news index (2025-01-03) · Elevator World · PitchBook (company 342138-43, "acquired on 03-Jan-2025" by Transel Elevator & Electric) · Maven ledger. ⚠ DATE CORRECTION: this register previously carried 2026-01-03; four sources say 2025-01-03, so TEI is a year less recently active than the old row implied. ⚠ The 2019 KONE service deal rests on Maven's ledger plus an undated PitchBook investor tag — no KONE release was located. Good enough to stop screening TAKA as independent; not good enough to publish.** Sub-5 tokens: **TEI**, **TAKA**.

## Delaware Elevator, Inc.
backer: family-owned — not PE-backed, established 1946
brands: DEM Elevating Equipment, IDEC Elevator Products, Chesapeake Drilling Corporation, Eastern Elevator, Coast to Coast Elevator
domains: delawareelevator.com
hq: Salisbury, MD
states: MD, DE, VA, NC, SC, FL, MN, NY
locations:

> **An independent consolidator competing with private equity for the same targets — no sponsor, no exit clock, and therefore no hold-period pressure a seller can read.** Describes "a widespread network of branch locations spanning across the East Coast and Midwest" but publishes no count. Also operates in Mexico. **DEM Elevating Equipment and IDEC Elevator Products are its own in-house manufacturing lines, not acquisitions** — do not screen them as service targets. Acquisitions: Eastern Elevator (VA/MD/WV, **partial**) 2018 and Coast to Coast Elevator (FL) 2018, months unpublished. **A name-string trap in both directions: "Delaware Elevator" is headquartered in Maryland and its state list does not lead with Delaware.** Sub-5 tokens: **DEM**, **IDEC**.

## Minnesota Elevator Inc. (MEI Total Elevator Solutions)
backer: none named on the company's own site
brands: Smart Elevator Tech
domains: meiusa.com
hq: Mankato, MN
states: MN, WI, MI, CO, KS, MO, ND, SD
locations: 16 service locations across 8 states

> Founded 1971. **A hybrid: MEI both manufactures custom elevators and components AND services them, unlike the pure service platforms in class 1 — its components line sits in the separately-sponsored components lane and should not be screened against a service buy-box.** Add-on: Smart Elevator Tech, LLC, 2026-02-10. No unit count; "services thousands of elevators each year" is not a portfolio figure. **"None named" in the backer field means no holder is named in either source pass — that is not verified independence.** **MEI is the only platform with published presence in the Northern Plains (ND, SD, KS), which the whitespace analysis otherwise reads as uncovered.** Sub-5 token: **MEI**.

## Start Elevator
backer:
brands: G-Tech Elevator Associates LLC
domains: startelevator.com
hq: Bronx, NY
states: NY, NJ
locations:

> **Owner not established in either source pass — no sponsor is named anywhere.** Self-describes as "a leading elevator company in NYC" serving education, office, residential, healthcare, retail, hospitality and transportation. Absorbed the **service portfolio** of G-Tech Elevator Associates LLC (Linden NJ) on 2024-05-14 — a portfolio purchase, so the G-Tech entity may still exist as a non-service business. No unit count. **"Start" is 5 characters and an ordinary English word; it will produce false positives on any bare name match. Domain or full string plus state.**

## Ascent Elevators
backer:
brands: Triad Lifts
domains: myelevator.us
hq:
states: PA, NJ
locations:

> **⚠ WEAKEST ENTRY IN THE FILE — grade it a step below everything else. The domain `myelevator.us` is press-derived from run 04 and was never fetched; it is the one domain here that has not been confirmed against the company. Do not treat a `myelevator.us` match as establishing ownership without checking it.** Owner not established; HQ not published. Add-on: Triad Lifts, LLC (Philadelphia) 2026, month unpublished. **The domain does not contain the company name, so a domain-derived name match will never fire on this one** — it must be caught by "Ascent Elevators" plus PA/NJ, or by "Triad Lifts."

## Cibes Lift Group
backer: Sweden-based; holder not named in the source pass
brands: Area Access Inc.
domains: cibeslift.com
hq: Sweden (city not published)
states: VA
locations:

> **NOT a commercial maintenance consolidator — a manufacturer of screw-driven home and platform lifts. Screen accordingly: it competes for accessibility and residential-lift businesses, which the commercial platforms are not buying at all.** Area Access Inc. (VA) is stated as its **fourth** US acquisition; **the other three are not named in any source and are invisible to a name screen.** Direct sales offices and distributing partners in more than 70 countries. Peers in the same lane, neither of which is in this register because neither has a named US acquisition on the record: Harmar Mobility and Savaria. Sub-5 token: **Area**.

---

# Class 4 — the OEMs (5)
*The largest owners of US elevator service assets, by a wide margin. A register that omits them
calls an Otis branch independent. None of the five discloses a US-only or Americas-only
maintained-unit count, so no OEM share of the US base can be computed and none is asserted here.*

## Otis Worldwide Corporation
backer: Otis Worldwide Corporation (NYSE: OTIS)
brands: Urban Elevator, Elevator Solutions, Bay State Elevator
domains: otis.com
hq:
states:
locations:

> **The most acquisitive OEM in the US independent market and the most recent — 8 of Urban Elevator Service's 11 US locations on 2025-04-21, with some acquired locations RETAINING THE URBAN BRAND. A live Urban Elevator sign in a market outside Illinois and Indiana is most likely Otis's.** Also: Bay State Elevator (MA, CT, VT, upstate NY) 2020-08-17 — "expands our scale and density in the Northeast region" · Elevator Solutions (MD, PA, WV, VA) 2018. **✔ TAKA REMOVED FROM THIS ENTRY, run 13 (2026-08-11). Run 04 credited a 2019 "TAKA Elevator service" deal to Otis; Maven's ledger — the source that claim came from — has no Otis/TAKA row, and lists the 2019 TAKA service deal under KONE. PitchBook records no Otis relationship either. Otis never bought TAKA. See the TEI Group entry for the full chain.** ~2.5M units under maintenance **globally** (10-K FY2025), grown 4%/yr four years running, ~1.1M connected via Otis ONE. **Otis's own 10-K concedes that independent service providers hold about 50% of service units in aggregate, at lower value per unit — that concession is the single best-quality anchor in this market and it is the inventory a route consolidator buys.** Otis services rival-brand equipment too, so OEM lock-in is asymmetric and imperfect, not absolute. **HQ and state list are empty because neither source pass records them — Otis's national footprint is obvious but is not enumerated in any file behind this register, and nothing here is inferred.** **"Otis" is 4 characters — the name matcher will skip it. The largest owner in this register cannot be caught by name. Domain only.**

## KONE Oyj
backer: KONE Oyj (Nasdaq Helsinki: KNEBV)
brands: Eagle Elevator, TAKA Elevator Company (service book only, 2019)
domains: kone.com, kone.us
hq:
states: OR, MN (only markets with a named US route acquisition)
locations:

> **Buying TK Elevator — announced 2026-04-29, EUR 29.4bn EV, completion guided no earlier than Q2 2027. Post-close KONE+TKE holds ~3.2M maintained units globally against Otis's ~2.5M.** Standing US route acquisitions on the record: an unnamed elevator service company in **Oregon** 2010-06-01 and **Eagle Elevator, Minneapolis MN** 2012-05-02. **✔ TAKA RESOLVED, run 13 (2026-08-11): KONE bought TAKA Elevator Company's SERVICE BOOK in 2019 — Maven's ledger names the seller "TAKA Elevator Company (Service)", FL, buyer KONE Elevator, and PitchBook records KONE as an investor in the company. The Otis attribution in run 04 was an error against that same ledger and is withdrawn. KONE holds the 2019 service portfolio only; the TAKA ENTITY AND NAME went to TEI Group on 2025-01-03 and are theirs — do not read a live "TAKA Elevator" sign as KONE's. ⚠ Single-sourced to the sell-side advisor's own ledger plus an undated PitchBook tag; no KONE release located.** ~1.8M units globally at FY2025 (up from well over 1.7M); **no Americas-only or US-only figure, and no service-vs-new-equipment margin split — KONE does not disclose operating profit by business line.** **Screening consequence of the merger: between now and at least Q2 2027 TKE is a distracted or unavailable bidder, and the combined entity may be required to divest operations to clear antitrust — the agreement expressly contemplates purchase-price adjustment for "potential divestments of TKE's or KONE's current business operations." Divested US branches would land on the market as assets, not as targets.** **"KONE" is 4 characters and collides with the surname Kone — name matcher will skip it. Domain only.** Both domains are recorded from primary-source URLs fetched in run 03, not from a company-identity check.

## Schindler Elevator Corporation
backer: Schindler Holding AG (SIX: SCHN / SCHP)
brands: Colorado Elevator Solutions, Clifton Elevator Service Company, Slade Elevator, Boesen Plum Elevator Solution
domains: schindler.com
hq: Morristown, NJ
states: CO, NJ, KS (only markets with a named US acquisition)
locations:

> **DOMAIN CLOSED, run 13 (2026-08-11): `schindler.com`, where the `/en/` locale IS the US site and names the operating entity as Schindler Elevator Corporation, US headquarters 20 Whippany Road, Morristown NJ 07960 (about-us page and the Northern New Jersey contact page, both reached and confirmed). HQ closed from the same pass. This is a shared global host with a US locale, not a US-only domain — record it as such. It is distinct from `group.schindler.com`, which run 03 reached for the FY2025 statements and which is Schindler Holding AG's group IR host, NOT the US operating company.** US tuck-ins on the record: Colorado Elevator Solutions (CO) 2021 · Clifton Elevator Service Company (NJ) 2020, via Slade Elevator · Boesen Plum Elevator Solution (KS) 2018. **Schindler publishes NO maintained-unit count at all — the only one of the three European/US-listed OEMs that does not.** **⚠ The most commercially useful disclosure in this class: on the FY2025 call the CFO said Americas service saw "a modest decrease…result of our increased selectivity when it comes to recaptures," and the CEO said the Americas will show "the lowest growth rate" of any region in service. An OEM stating on the record that it is being choosier about US route work is the clearest available statement of where the OEM economic model runs out — and it means Schindler is a weaker competing bidder in the US than its size implies.**

## TK Elevator (TKE)
backer: Advent International and Cinven, via Vertical Topco I S.A. — agreed sale to KONE
brands: Albany Elevator, Direct Elevator Service Ltd., True Canadian Elevator Maintenance Co., Bay Elevator Ltd.
domains: tkelevator.com
hq:
states: NY (only US market with a named acquisition)
locations:

> **TKE HAS BEEN PRIVATE-EQUITY-OWNED SINCE 2020 — Advent and Cinven carved it out of thyssenkrupp AG for EUR 17.2bn. This is the ambiguity that can be used to attack any "PE share of the US elevator market" figure: if PE-owned OEMs count, the true figure is far above 10%; if it means PE-backed roll-ups of independents, it is ~8–9%. State which reading you are using, every time.** **Agreed sale to KONE announced 2026-04-29 at EUR 29.4bn EV; completion no earlier than Q2 2027, pending multi-jurisdiction antitrust.** US acquisition on the record: **Albany Elevator (Albany NY, founded 2000) 2021-05-03** — "we continue our path to grow by synergistic M&A…as well as in the service business." **That release cites recent comparable acquisitions in Nashville, Omaha, Madison and Winnipeg, and names none of them — four US/Canadian route books absorbed by TKE that are invisible to any name-based screen.** Three named Ontario buys in 2021 (Direct Elevator Service, True Canadian Elevator Maintenance, Bay Elevator) are **Canadian and remove nothing from a US target board.** >1.4M units globally at FY2024/25, ~2.75%/yr portfolio growth — materially slower than Otis's 4%. Sub-5 tokens: **TKE**, **Bay**.

## Mitsubishi Electric Corporation
backer: Mitsubishi Electric Corporation (TSE: 6503)
brands:
domains: mitsubishielectric.com, mebs.com
hq:
states:
locations:

> **No US acquisition of an independent appears in either source pass — this is a niche high-rise position, not a national service network, and its relevance to a US route-consolidation thesis is marginal and NOT YET QUANTIFIED.** It is in this register so that a screener meeting a Mitsubishi-serviced building does not read the absence of an entry as independence. **No maintained-unit count is publicly retrievable: the Mitsubishi Electric Building Solutions corporate-data page carries a field labelled "Units maintained (elevators and escalators)" but the value did not render on fetch (returned "0"). Left empty. Not estimated.** Building Systems segment revenue ¥707.8bn (FY2026, year ended 2026-03-31) is an **upper bound** on its E&E revenue, not the E&E revenue — the segment also carries building management and security. Both domains are recorded from primary-source URLs fetched in run 03; **`mebs.com` is the Japanese building-solutions entity and the US E&E division's own domain was established by neither pass.**

---

## Coverage and gaps

**Parents in the register: 26.**

| Class | Definition | Parents |
|---|---|---|
| 1 | US elevator service platforms under a live private-equity sponsor | 10 |
| 2 | Adjacent PE holdings — inspection, components, monitoring. **Not service targets** | 4 |
| 3 | Strategic and non-PE consolidators competing for the same targets | 7 |
| 4 | OEMs — the largest owners of US service assets | 5 |

### Domain coverage

**25 of 26 parents carry at least one domain. 1 does not.** The 25 are not of equal quality
and the difference matters:

- **20 verified by fetch** — the site was reached and identified itself as that company:
  American Elevator Group · Specialized Elevator · Axxiom Elevator · Action Elevator ·
  Elevator Service Inc. (ESI) · Champion Elevator · Total Access Elevator ·
  Integrity Elevator Solutions · Ascend Safety Collective · Urban Elevator Service · ATIS ·
  Kings III · Elevated Facility Services · TEI Group · Delaware Elevator ·
  Minnesota Elevator (MEI) · Start Elevator · Cibes Lift Group · **Elevator Systems, Inc.
  (`elevatorsystems.com`, run 13)** · **Schindler Elevator Corporation (`schindler.com`,
  run 13 — the `/en/` locale is the US site and names the US operating entity).**
- **4 host-derived, not identity-checked** — recorded from primary-source URLs fetched in
  run 03 for the filings, not from a fetch that confirmed the host belongs to the US
  operating entity: **Otis** (otis.com) · **KONE** (kone.com, kone.us) ·
  **TK Elevator** (tkelevator.com) · **Mitsubishi Electric** (mitsubishielectric.com,
  mebs.com).
- **1 press-derived, never fetched** — **Ascent Elevators** (myelevator.us). Weakest
  attribution in the file.

**The 1 parent with no domain, named:**

- **Standard Elevator Systems** (Arcline) — `standardelevator.com` 302-redirects to a
  GoDaddy for-sale parking page and is not the company. Catch by full string plus state.
  **Run 13 surfaced `standard-elevator.com` (HYPHENATED, a different host) as a strong
  candidate — named as the company's site by Maven Group's 2022-06-23 release and tied by
  CB Insights to the Memphis TN address, with clean DNS and self-identifying page titles in
  the search index — but the host would not serve robots.txt to the fetcher on four
  attempts and was NEVER REACHED. The field stays empty. It is a candidate for the next
  pass to close in one fetch, not a confirmation, and it must not be used to establish
  ownership until someone loads the page.**

**Closed in run 13 (2026-08-11), both reached and identity-confirmed:**

- **Elevator Systems, Inc.** (ShoreView) → **`elevatorsystems.com`**. The previously
  unreachable `elevatorsystemsinc.com` resolves and 302-redirects there; the canonical host
  is the shorter one. Site self-identifies, Garden City NY, controllers since 1973.
- **Schindler Elevator Corporation** → **`schindler.com`**, `/en/` being the US locale,
  naming the US operating entity and 20 Whippany Road, Morristown NJ 07960. Distinct from
  `group.schindler.com`, which is Schindler Holding AG's group IR host. **This was the most
  consequential of the three gaps — an OEM with three named US tuck-ins — and it is
  closed.**

**Domains deliberately NOT written into this file. Do not resurrect them:**

- **`integrityelevator.com`** (singular) — a GoDaddy for-sale parking page. Integrity
  Elevator Solutions is **`integrityelevators.com`**, plural.
- **`elevatorserviceinc.com`** — does not resolve (NXDOMAIN). ESI is **`esigr.com`**.
- **`standardelevator.com`** — GoDaddy for-sale parking page. **Not to be confused with
  `standard-elevator.com`, hyphenated, which is a different and unconfirmed host — see the
  Standard Elevator Systems entry. Neither belongs in the `domains:` field today.**
- **`esielevator.com`** — resolves, returns 403, ownership unverifiable. Not ESI's.

### Brand tokens shorter than 5 characters — the name matcher skips these

**The matcher skips tokens under 5 characters because they collide with ordinary words.
Every token below must be caught by DOMAIN instead, or by the full company string plus a
state. Never match a bare initialism.** The workspace doctor reports this list as a
warning; the warning is correct and expected.

**32 tokens, from the brand rosters above:**

AEG · ESI · AES · TEC · EMR · IES · VTS · TRE · LA · MEI · DEM · EMI · A-1 · A1 · KJA ·
TKE · APi · APG · TEI · Otis · KONE · Koch · Port · Bay · Mile · Area · D&D · ATIS ·
IDEC · EECO · VEIS · TAKA

**Read the four worst cases explicitly:**

- **"Otis" (4) and "KONE" (4) are both under the threshold.** The two largest owners of US
  service assets in this register cannot be caught by name at all. **Domain only.** This
  is the single most important line in this section.
- **"ESI" resolves to two different companies** — Elevator Service, Inc. (Grand Rapids MI,
  Carroll Capital, service) and Elevator Systems, Inc. (Garden City NY, ShoreView,
  controllers) — **and one of the two has no domain.** Full string plus state, always.
- **"LA" (2) and "A1" (2)** are unusable as tokens under any circumstances.
- **"Port", "Bay", "Mile", "Area" and "Koch"** are ordinary words or surnames that will
  fire constantly on unrelated businesses.

*Related trap — tokens that clear 5 characters but are ordinary English words and will
still produce false positives on a bare match. Use name plus state, or domain:*
Start · Metro · Excel · Urban · Motion · Quality · Vintage · Premier · Oracle · Champion ·
Action · Integrity · Superior · Smart · Right Way · Gable · Slade · Avery · Wyatt · Triad

### Unit counts — not a screening input

**No platform in this market publishes a unit count.** Fetching the About and company
pages of Axxiom, Champion, Total Access, ESI, Integrity, Ascend, TEI, Delaware, MEI and
Start returned **no unit count for any of them**, and none of the five OEMs discloses a
US-only or Americas-only maintained-unit figure. Only three maintenance portfolios exist
anywhere on the record:

- American Elevator Group **30,000 elevators** (own site, current)
- Specialized Elevator **~25,000 units** (own release, 2026-05-07)
- Elevated Facility Services **11,000+** — **stale, from the Incline hold in the 2010s**

Two further large numbers are **not maintenance portfolios and must never be added to a
unit tally**: ATIS **~100,000** (an inspection book spanning the US *and Canada*) and
Kings III **150,000+** (emergency phones monitored).

**Therefore: unit count is a diligence input and never a screening input.** Do not
suppress, rank or size a target on it, and do not publish any "PE share of US units"
figure off this base — the source pass could not trace the practice's existing ~10% claim
to any published source and recommends retiring it as a citation.

### Other fields left empty, recorded so the gaps are visible

- **HQ:** empty for American Elevator Group, Ascend Safety Collective (platform level),
  Ascent Elevators, and four of the five OEMs; country only for Cibes. **Schindler's was
  closed in run 13 — Morristown, NJ (20 Whippany Road, 07960), from its own US site.**
- **Sponsor / owner:** not established for Ascent Elevators, Start Elevator, Cibes Lift
  Group. MEI is confirmed as naming none — which is not verified independence.
- **Branch counts:** empty for Specialized, Axxiom, Champion, Integrity, Ascend, ATIS,
  Standard Elevator, Kings III, Elevated, TEI, Delaware, Ascent, Start, Cibes and all five
  OEMs. Where a number appears it is often headcount or partner-company count, not
  branches — ESI's 6 is Michigan only, ATIS's 200+ is inspectors, Elevated's ~600 is
  employees.
- **Gauge Capital's investment date in Axxiom and Axxiom's founding year** — published
  nowhere located.
- **Exact months** for several 2018–2026 deals sourced only from Maven Group's year-keyed
  ledger; the year is recorded and the month left off rather than guessed.

### ✔ Conflicts resolved in run 13 (2026-08-11)

All six live conflicts were taken to primary sources. Five resolved outright; one resolved
for the date that matters. Full working, with quoted sources, in
`markets/elevator/research/13-register-contradictions-resolved.md`.

1. **TAKA Elevator — RESOLVED, and one of the three attributions was false.** TAKA Elevator
   Company, LLC (Orlando FL, founded 2012, Lalchandani family) sold its **service book to
   KONE in 2019**, then **the company itself to TEI Group on 2025-01-03**. **Otis never
   bought it** — Maven's ledger, the origin of that claim, has no Otis/TAKA row. Current
   owner of the name and entity: **TEI Group**. **Register date corrected 2026-01-03 →
   2025-01-03.** ⚠ The 2019 KONE leg is single-sourced to the sell-side advisor's ledger
   plus an undated PitchBook tag — enough to suppress a target, not enough to publish.
2. **Century Elevator — RESOLVED; there was never an ownership conflict.** One event, one
   day: acquired by the Action platform **2024-09-03**, the day the platform passed from
   Align to H.I.G. Align counts it inside its hold, H.I.G. calls it concurrent; both
   correct. **Current: Action Elevator under H.I.G. Capital. Prior: founder-owned by
   Charlie and Clarisse Choux from 1989.** Forestville MD.
3. **Elevated Facility Services footprint — RESOLVED as three dated snapshots.** At the
   **2024-06-04 close**: **over 18 states, ~600 employees, ~$220M revenue, Tampa FL** (APi's
   own completion release). The **22 states / 30+ markets** figure is **Elevated's own
   rebrand release of 2023-10-23**, re-attributed — APi's materials state no state count —
   and "over 18" is a floor that 22 clears, so those two never conflicted. **Now: 57 markets
   across 21 states** (own site, 2026). The "contraction" reading is withdrawn.
4. **Axxiom Elevator HQ — RESOLVED: Pompano Beach, FL** (2101 W Atlantic Blvd Unit 104,
   33069), the company's own contact page. Elevator World's "Fort Lauderdale" retired.
5. **Urban Elevator Service HQ — RESOLVED as a relocation. Current: Lombard, IL** (54
   Eisenhower Ln N, 60148), own site. **Prior: Cicero, IL** as of 2021-05-18, own release.
6. **Standard Elevator Systems brand list — RESOLVED: McIntosh is a LATER ADD-ON**, acquired
   **2022-06-23**, five months after the 2022-01-26 platform formation. Not one of the
   founding five, not a mis-attribution. Both name forms kept (Inc. / LLC).

**One conflict is left open on purpose, and it is new:** the register places **LiftNet**
under **Kings III** (acquired 2026-04-02) while Maven's 2022-06-23 item lists LiftNet among
**Standard Elevator Systems'** brands. Both are Arcline holdings, so an intra-sponsor
transfer would explain it — but nothing on file establishes that, and **a LiftNet match
currently resolves to two parents.** Not asserted; one fetch next pass.

**And one gap is left open on purpose:** Standard Elevator Systems still has **no domain**.
`standard-elevator.com` is a candidate that could not be reached — see the domain section
above. An unreached host does not go in the field.

### What this register does not tell you

Ownership is established here per **parent**, from a draft research synthesis that has not
been primary-source verified. **Ownership must be established per legal entity from a
primary source, not inferred from a trading name, and the absence of a brand from this
file is not evidence that the business is unowned.** The largest risk in using it is the
undisclosed roster: AEG names 4 of 12 partner companies · Champion names 2 of 5 add-ons ·
Cibes names 1 of 4 US acquisitions · Ascend names none at all · TKE's own release cites
four unnamed acquisitions in Nashville, Omaha, Madison and Winnipeg · Standard Elevator,
Elevator Systems and Schindler have no domain. **Several dozen already-owned US elevator
businesses are invisible to both a name and a domain screen and will present as
independent.**

**And the platforms are not buying everything.** A company that fails these gates has no
sponsor process and is therefore genuinely unowned rather than merely unrecorded:
install- and modernization-heavy books with thin maintenance portfolios (they trade
2.5x–6.0x against maintenance-heavy comps) · residential and accessibility lifts (left to
Cibes, Harmar, Savaria) · components and parts manufacturing (a separately-sponsored lane
— Standard Elevator, Elevator Systems, MEI) · low route density regardless of size · and
**anything under ~750 units under contract, which is the stated entry point for a sponsor
process at all.**

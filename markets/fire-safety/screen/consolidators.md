# Fire & Life Safety — Consolidator Register

Built 2026-08-10 for the smbX studio, fire & life safety market.

**What this is.** One block per parent entity that owns, or distorts the count of, US
fire and life-safety contracting assets. A screener uses it to decide whether a
company found in the wild is already owned. "Independent" only ever means "not in
this register", so a thin register is not a neutral failure — it silently promotes
owned companies onto the target board.

**What it was built from.** `markets/fire-safety/master.md`, published **30 July 2026**,
whose sponsor states are given **as of 2026-07-29**. Owner classes, sub-verticals,
brand rosters, footprints and collision traps are the master's. Every backer below
is the master's, restated as the *current* owner; where the master names a prior
sponsor it is carried in the note line, because a prior sponsor is the single most
common way a register goes stale.

**Domain coverage — read this before trusting a match.**
**64 parents** are in this register. **49 have at least one domain verified in this
pass** — meaning the site was actually fetched on 2026-08-10 and it identified
itself as that company. **15 do not**, and they are named in `## Coverage and gaps`
at the foot of this file. Eight of the fifteen are absorbed or dissolved nameplates
that correctly have no live site; seven are live entities whose domain this pass
did not establish.

**Second pass, 2026-08-10.** One attribution in the first pass was wrong and is
corrected: `ars-guardian.com` was carried under the Rockville MD Guardian on the
strength of a matching name string, and it is in fact a **sixth Guardian**, in
Houston TX, now entered separately. It was caught by reading the contact email on
the site — `CS@GuardianFPS.com` — which tied it to `guardianfps.com`. The lesson is
in the register: the first pass flagged that row as resting on a name string alone,
and a row flagged thin is a row that has not been verified.

No domain in this file was constructed, guessed or inferred from a company name.
Where a domain could not be reached and confirmed it was left out and recorded.
That rule is load-bearing here: the master documents **five unrelated "Guardian"
entities**, three unrelated "Total Fire" nameplates, four "Absolute" nameplates
under three owners, and a `spectrumsafetysolutions.com` that belongs to a different
company on another continent. A plausible invented domain in this file would cross-
assign an owner and is worse than a visible gap.

### Format

```
## Platform Name
backer: Sponsor Name
brands: Brand One, Brand Two, Brand Three
domains: platform.com, brandone.com
```

Anything inside a fenced code block is ignored by the parser, so the example above
is safe to keep. After each block a `> ` note line carries what a screener must
know that the three fields cannot express.

---

# Class 1a — fire-led service contractors under a live private-equity sponsor (17)

## Pye-Barker Fire & Safety
backer: Altas Partners
brands: Allstate Fire Protection, Reliable Fire, Superior Fire Protection, Total LifeSafety Corporation, Alpine Fire and Safety Systems, AAA Fire & Safety Equipment, AAA Fire Safety & Alarm, AAA Fire Extinguisher, Coastal Sprinkler, ASG, United Alarm Service, Empire Fire & Safety, Red E Fire, Rapid Fire Protection, PEAK Alarm, FSD Protection, OMNI Fire and Security Systems, Texas Homeland Security and Sound, The Alarm Group, Modern Systems, Argus Security, Cincinnati Alarms, CARE Security, Tampa Bay Fire Equipment, Universal Fire Systems, Evco Integrated, Cascade Fire & Security, Moore Fire Protection, Priority One Security, Sonitrol
domains: pyebarkerfs.com, pyebarkerfire.com

> Largest unmatched estate in the industry by count: ~204 brand tokens (144 on its own brands page plus ~60 further trading names on location pages); the 30 above are the ones the master names. **Zero brand-level domains exist** — the brands page shows logos without hyperlinks — so every one of those 204 names must be caught by full string plus state, never by domain. Two rebrand formulas mean opposite things: "Pye-Barker Fire & Safety, formerly Moore Fire Protection" = legacy sign is down and unmatchable; "Cascade Fire & Security, A Pye-Barker Fire & Safety Company" = legacy sign is up and still matchable. **Sonitrol is a franchise network — Pye-Barker owns some franchises and not all franchisees nationwide**; a bare Sonitrol match will produce false positives. Minority holders: Leonard Green & Partners (partnered ≈2020), ADIA and GIC (minority stakes closed 2025-01). Sponsor-name trap: ABF Journal 2025 prints "Atlas"; the sponsor is **Altas**. 57 add-ons in calendar 2025 per PRNewswire vs 41 for the same period per a security tracker — neither states a cut-off date or counting rule. `pyebarkerfire.com` 302-redirects to `pyebarkerfs.com`; both verified 2026-08-10, register both.

## Summit Companies / SFP Holding
backer: BDT & MSD Partners
brands: Summit Fire & Security, Summit Fire Protection, Summit Fire Consulting, Summit Fire National Accounts, Protegis Fire & Safety, Performance Systems Integration
domains: summitcompanies.com, summitfire.com, summitfiresecurity.com

> **Prior sponsors: BlackRock Long Term Private Capital (from 2021-09-20), and CI Capital Partners before that.** BDT & MSD took majority 2025-08-04. Two research streams carried BlackRock LTPC as *current* — it is prior. **Protegis Fire & Safety and Performance Systems Integration are absorbed and are NOT targets**; neither appears as a live trading brand on Summit's own branch-locations pages. Absorb-everything brand policy. Token trap: "Summit" is reused heavily industry-wide — match the full string or the domain. **Summit Pipeline Services ULC is APi's and is non-fire; it is not Summit's.** Summit's own locations page links a WP Engine staging host; the production domain is `summitfiresecurity.com`. `summitfireconsulting.com` and `summitfirenationalaccounts.com` are named by the master and by summitfire.com but were not independently reached in this pass.

## AI Fire
backer: Blackstone
brands: Impact Fire, Impact Fire Services, Academy Fire, Academy Fire Life Safety, Blackstone Fire Control, Kanske Fire Systems
domains: aifire.com, impactfireservices.com, academyfire.com

> **Blackstone Fire Control was acquired by Impact Fire and has nothing to do with Blackstone the sponsor — which happens to own Impact Fire's parent.** The coincidence is actively misleading, not merely awkward. Four sponsors in the chain: Caltius Equity Partners 2012, Audax 2017, TruArc Partners 2021 (retained a stake at exit), Blackstone Feb 2025 at ≈$1.1bn including debt per Bloomberg. **Contradiction found 2026-08-10:** the master reads AI Fire's brand policy as prefixing the legacy name ("Impact Fire, a Division of AI Fire"), calling it the only policy of the three that makes ownership legible from the brand itself. Neither `impactfireservices.com` nor `academyfire.com` names AI Fire as a parent anywhere on the pages fetched — academyfire.com names Impact Fire only as a sister company. Ownership here is legible from the **parent's** site, not the brands'. aifire.com gives HQ as Long Beach CA; the master gives Impact Fire's HQ as Round Rock TX.

## Marmic Fire & Safety
backer: KKR
brands: Balco Systems, Northwest Fire Protection, West Memphis Fire Extinguisher, Kansas City Fire & Security, F.L. Sons Fire Equipment Company, Total Fire & Safety, Fire Control Systems, Absolute Fire Protection
domains: marmicfire.com

> **Marmic rebrands everything.** There is no brand family, no sub-brand pages and no sub-brand domains; every acquired business becomes Marmic Fire & Safety. Only 8 acquired names are on the record against a stated "over 30 companies having joined the Marmic family" — **the other ~22 are invisible to any name-based screen.** Marmic must be caught by its own domain and by the eight legacy names above. Prior sponsors: HGGC (2021), Thompson Street Capital Partners before that. KKR entered 2024-07-24. "Total Fire & Safety, LLC" is inside the three-way Total Fire collision (FSP's Total Fire, Pye-Barker's Total LifeSafety) — domain only. "Absolute Fire Protection" (Paragould AR) is one of four Absolute nameplates under three owners — domain plus state.

## Sciens Building Solutions
backer: Carlyle
brands: W.W. Gay Fire, Bass United, ARK Systems, Mammoth, Anchor Fire, Cen-Cal Fire Systems, Standard Electronics, Time & Alarm, Alarmtechs, Christian Cable, Absolute Protective, Classic Protection, Educational Electronics, LS Systems, Elite Fire, West Fire, Southern Fire, Empire, Sabah, Western Fire Protection, Southern Fire Control, FSI, FS&S, ESS, OSI, WSA
domains: sciensusa.com, sciensbuildingsolutions.com

> **A list carrying these as independents is wrong 31 times from one platform.** Division count corrected from 27 to **31** in the master's own A.0.1 pass, counted from the published division table rather than the summary sentence. Every division now trades as "Sciens \<Legacy\> Division" and **no division has its own domain** — all 31 must be caught by full string plus city. Prior sponsor: Huron Capital, which formed the platform in early 2016 via **WSA Systems** and retained a minority stake; Carlyle took majority 2021-12-15. The "greater than 35-fold increase in revenue and EBITDA" claim has no base and no absolute value. Collisions inside this roster: Elite Fire (Detroit MI) vs two other Elite nameplates; Empire (Miami FL) vs Pye-Barker's Empire Fire & Safety; Absolute Protective (Piscataway NJ) vs three other Absolutes; **Western Fire Protection (Poway CA) requires the full string** — it is not Western States Fire Protection, which is APi's. `sciensbuildingsolutions.com` 302-redirects to `sciensusa.com`; both verified 2026-08-10, register both.

## Encore Fire Protection
backer: Permira
brands: Guardian, Elite Action Fire, Allstate Fire Equipment, Allstate Fire Equipment of Rhode Island, Reliable Fire Protection, National Fire & Safety Solutions, Superior Fire Protection, Approved Fire Protection, Mid-Atlantic Fire Protection, Alpine Sprinkler, AAA Fire Services, Coastal Fire Protection, FIREX, Sentinel Fire Safety, Fireline Corporation, Kistler O'Brien
domains: encorefireprotection.com

> **Sentinel Fire Safety is a named Encore affiliated brand partner and has nothing to do with Sentinel Capital Partners, which owns Spectrum Safety Solutions.** Likewise **"Guardian" here is an Encore brand partner and is none of the other four Guardians** in this register. 75 affiliated brand partners are named on Encore's own page against a stated "over 60 successful partnerships" on the same site and 70+ on the sponsor page; **all 75 carry no domain and no geography**, so this roster and Pye-Barker's are the two largest and the two least complete. Prior sponsor: Levine Leichtman Capital Partners (≈2021); Permira completed Mar 2025 at $1.8bn per Bloomberg, undisclosed by any party. A.0.1 corrected 77 partners/17 states down to **75 partners/13 states** — the 17-state figure is a sponsor-page claim. Domain trap: **`encorefp.com` is not this company.** FIREX also collides with a Kidde manufacturer brand.

## Altus Fire and Life Safety
backer: Apax Partners
brands: Cross-Fire & Security Co., Adcock Systems, Star Fire Protection, Fire Systems Inc., BK Systems, Crime Intervention Alarm, Priority Fire and Security, NEFS, Croker Fire Drill, Alarm and Suppression, Facility Compliance
domains: altusfire.com, cfsnyc.com, starfireny.com

> **The only platform in the study that publishes a domain for every member brand** — which makes it the one platform a domain-based screen catches completely. Master-published member domains not independently reached in this pass, but published by Altus on its own member-brands page: `alarmandsuppression.com`, `adcocksystems.com`, `nefs.us`, `firesystemsinc.net`, `crokerfiredrill.com`, `bksystemsinc.com`, `cialarm.com`, `facility-compliance.com`. Beyond Adcock and Star Fire the **brand-to-domain mapping is not stated** — do not construct it. Spelling variant: Altus's own page renders "Addcock"/"Addock" while the published domain is `adcocksystems.com`; carry all spellings. **"Star Fire" is on `starfireny.com` — the brand string is absent from the domain**, and it collides with CertaSite's Starfire Systems and Starfire Extinguisher in Wisconsin. Prior sponsor: AE Industrial Partners (2021, via Cross-Fire & Security Co.); Apax entered 2024. **Screener note verified 2026-08-10: `cfsnyc.com` presents Cross-Fire & Security as an independent NY life-safety firm and names no parent** — ownership is established only from altusfire.com's side.

## ASPYRE Fire & Life Safety
backer: Percheron Capital
brands: ASPYRE Fire & Life Safety
domains: aspyrefls.com

> **Names no member companies and no locations.** A new platform (2025-11-12, no prior sponsor) that has bought and not yet disclosed: every one of its acquisitions is currently invisible to a name-based screen and will present as independent. Southern US foundational with stated intent to expand nationally; the site verified 2026-08-10 describes a network across the US **and Canada**. Percheron AUM over $4bn, led by Carmine Schiavone. Read the launch as that sponsor's own assessment of where unclaimed density remained as of late 2025 — i.e. treat the Southern US as contested, not open.

## Guardian Fire Protection Services
backer: Knox Lane
brands: Guardian Fire Protection Services, Harris Fire Protection
domains: guardianfireprotection.com

> **This is the Rockville, Maryland Guardian — Guardian Fire Protection Services, LLC, HQ 7668 Standish Place, Rockville MD 20855, verified 2026-08-10** off its own contact page, which gives a Baltimore second office and a county-level service area across MD, Northern VA and DC. It is NOT Guardian Fire Services of Nashville (Investcorp), NOT Guardian Protection (Armstrong Group), NOT Guardian Alarm of Southfield MI, NOT the "Guardian" brand partner listed by Encore, and **NOT the Houston TX Guardian below**.
>
> **CORRECTED 2026-08-10, second pass.** The first pass of this register carried `ars-guardian.com` on this entry, on the strength of the exact name string alone — its `/about-us/` 404s and it publishes no address on the root. That attribution was **wrong**. `ars-guardian.com` is the Houston, Texas Guardian: its `/contact/` page gives *"17440 W. Little York, Houston, TX 77084"* and the contact address **CS@GuardianFPS.com**, which ties it to `guardianfps.com` — same company, newer site. Found by Paul, from the contact email.
>
> **Why this one mattered more than a missing domain.** A missing domain fails visibly. This failed the other way: it put a Houston company's domains inside a Knox Lane platform, so a Houston-area screen would have called that business **already owned** and dropped it. A register error in this direction does not promote an owned company onto the board — it deletes a live target off it, silently, and nothing downstream ever asks why.
>
> Knox Lane took majority 2024-01; Harris Fire Protection was a Knox Lane add-on the same month. AllianceBernstein Private Credit records a 2024 financing. 24,000+ commercial customers.

## Guardian Fire Protection Services (Houston TX)
backer: Unknown — no owner named in the public record
brands: Guardian Fire Protection Services, Guardian FPS
domains: guardianfps.com, ars-guardian.com

> **A SIXTH Guardian, not in the master.** The master documents five unrelated entities trading as "Guardian" and grades the cluster domain-only, maximum severity. This is a sixth, and it was found only because the fifth was mis-attributed to it.
>
> HQ *"17440 W. Little York, Houston, TX 77084"*, verified 2026-08-10 on both `guardianfps.com` and `ars-guardian.com/contact/`; the two are the same business, `guardianfps.com` being the newer site and `CS@GuardianFPS.com` the address that links them. Services stated: kitchen suppression, fire alarms, fire sprinklers, fire extinguishers, special hazards, hood cleaning — SV1+SV2+SV3. Names stadium work at NRG, BBVA Compass and Baylor as client projects, not owned entities.
>
> **No parent, sponsor or holding company is named on either site.** That is *unknown ownership*, not verified independence — do not grade it a clean target on this evidence. It is a genuine Gulf-Coast SV3-heavy candidate to diligence, and the kitchen-suppression and hood-cleaning mix is the recurring-revenue shape the thesis looks for. Verify against the Texas State Fire Marshal's licence registry before it reaches any client document.

## Guardian Fire Services
backer: Investcorp
brands: Guardian Fire Services
domains: guardianfireholdings.com

> **This is the Nashville, Tennessee Guardian — HQ 2 Dell Parkway Suite 100, Nashville TN 37217, verified 2026-08-10.** **This resolves an open flag in the master:** the master lists `guardianfireholdings.com` in its "Guardian cluster (five owners)" row but never states which of the five Guardians it belongs to, and instructs that it not be attributed. It is this one — the domain's own contact page gives the Nashville address and the trading name "Guardian Fire Services". Prior sponsor: **Northern Lakes Capital**; Investcorp entered 2025-12-03, the first investment from Investcorp North American Private Equity Fund II. 12 acquisitions since 2022 (≈3.0/yr) and early in a hold — the master names it a likely acquirer, so expect it as a competing bidder. 17 branches named by region only, no cities published.

## Fire Safety and Protection
backer: Sunny River Management
brands: Fire Safety and Protection, FSP, Total Fire, All-Star Fire
domains: firesp.com

> Nine brand tokens including eight constituent acquisitions with founding years 1964 to 2010; only Total Fire and All-Star Fire are named in the record, so **six of the eight legacy names are invisible to a name-based screen**. All brand domains null. **"Total Fire" is inside the three-way Total Fire collision** with Marmic's Total Fire & Safety, LLC and Pye-Barker's Total LifeSafety Corporation — domain only. **No sponsor entry date is stated anywhere in the master**; the Sunny River overview is dated 2022-08-15, which is a page date and not a transaction date. 5 US offices and 8 Canadian; Atlanta GA and Washington DC named. FSP is a sub-5-character token — see `## Coverage and gaps`.

## National Fire & Safety
backer: Highview Capital
brands: Frontier Fire Protection, Elite Fire Protection Systems, RCI Fire Systems, Texas Fire Alarm, Absolute Fire Protection, Texas Fire Safety, All Pro Fire Protection, Commercial Fire Protection
domains: natfiresafety.com

> **"House of brands" policy — under it a single owner presents to a screen as four or five separate independents in four or five separate metros.** This is the platform most likely to generate false "independent" hits per dollar of revenue. Frontier Fire, RCI Fire Systems and Texas Fire Alarm have no standalone domains and resolve into `natfiresafety.com` sub-pages, confirmed on the site 2026-08-10. **Contradiction found 2026-08-10: `absolutefireaz.com`, which the master carries as this platform's second verified domain, now 302-redirects off-host to `legalesedecoder.com`, an unrelated site. The domain has lapsed or been repurposed and must not be used to attribute Absolute Fire Protection of Glendale AZ.** Name collision, maximum care: **the exact phrase "National Fire & Safety" is still unsafe** — it collides with APi/WSFP's National Fire Suppression (Decatur IL, Kansas City KS) and with Encore's "National Fire & Safety Solutions". Domain only. Owns its own UL central station, so it sits in the population able to pay the top band. Highview AUM ≈$500m; six dated add-ons Sep 2019 – Mar 2022.

## Relay Fire and Safety
backer: The Riverside Company
brands: Relay Fire and Safety, Accurate Fire Equipment
domains: relaysafety.com

> **Contradiction found 2026-08-10: the master states explicitly that this entity has "no domain on the record". It does — `relaysafety.com`, verified, "Relay Fire and Safety" in the footer, with an /acquisitions/ page.** Add it to the matcher. The company's own About page names no investor, so the Riverside tie rests on Riverside's portfolio page, not on Relay's site. **The sponsor is simultaneously an active buyer and an active seller in this sub-vertical** — Riverside has run a fire-extinguisher platform, a franchised kitchen-exhaust-cleaning platform and a fire ITM platform at the same time, exiting two in 2025 and 2026 (CertaSite went to APi). Hold-period logic is a weak predictor for this portfolio specifically. SV3, extinguisher route; NY metro named as its largest target market.

## RapidFire Safety & Security
backer: Concentric Equity Partners
brands: RapidFire Safety & Security
domains: rapidfiress.com

> **Sponsor attribution is trade-press only** — one of the two entities the master says should be graded a step below the rest. Do not treat Concentric ownership as primary-verified. **Contradiction found 2026-08-10: the master records no domain and no footprint for this entity. Both exist — `rapidfiress.com`, verified, HQ 55 Westport Plaza Suite 350, St. Louis MO 63146.** Six named add-ons exist per the master but **none is named individually**, so every one of them presents as independent. Trade press since the master's date names further add-ons (Kane Fire Protection; ACT Low Voltage) — treat those names as leads to verify, not as register entries. FY2025 revenue $71,925,249, RMR $1,188,586, SDM 100 #35.

## FSS Technologies
backer: Lightview Capital
brands: FSS Technologies, The Fire Group
domains: fsstechnologies.com

> **Contradiction found 2026-08-10: the master records no domain and gives HQ as Ann Arbor MI. The domain is `fsstechnologies.com`, verified, and the site gives the primary location as Arlington Heights, Illinois**, with offices at Mishawaka IN, Ypsilanti MI, Eagan MN, Fargo ND and Sioux Falls SD — a six-state Midwest footprint the master does not carry. Glass Lake Holdings facilitated as independent sponsor; Lightview entered 2025-10-28. **New platform, early in a hold — named as a likely acquirer**, i.e. a competing bidder rather than a seller. CEO Jeff Handy grew the business ten-fold from 2016.

## Security Fire Systems
backer: Blackford Capital
brands: Security Fire Systems, SFS, Lakeview Security Fire & Communications
domains: securityfiresystems.com

> **Sponsor attribution is trade-press only**, per the master's own 4.3 marker. ⚠️ **Unresolved document-internal discrepancy: §4.3 marks this sponsor "(trade press only)" but §4.1 names only two weakly-attributed entities (RapidFire and Telgian) and omits this one.** Resolve before grading. ⚠️ **Domain trap, resolved 2026-08-10: `securityfire.com` is APi Group's** — it is Security Fire Protection Company, Inc. of Memphis TN, whose own site states "Security Fire Protection is a subsidiary of APi Group". **It is not this company. A register that pairs them is wrong.** This company is `securityfiresystems.com`, verified, a fire sprinkler design/engineering/installation and ERCES contractor founded 1993 with offices in Dallas–Fort Worth TX and Arkansas — a footprint the master leaves empty. Blackford acquired 2024-12; Lakeview added 2025-09-23.

## Telgian
backer: The Miller Group
brands: Telgian, Telgian Engineering & Consulting, Telgian Fire Safety
domains: telgian.com

> **Sponsor attribution is a directory listing only** (PrivateEquityInfo) — the weakest attribution in the register, and one of the two entities 4.1 says should be graded a step below the rest. **Not a route business**: consulting, engineering and ITM, so it is not comparable to the SV1/SV2/SV3 platforms on economics and should not be benchmarked against them. HQ 10230 South 50th Place Suite 100, Phoenix AZ 85044, verified 2026-08-10. No entry date and no prior sponsor stated.

---

# Class 1b — security-led integrators under a live sponsor that carry fire and life safety (5)

## Convergint
backer: Ares Management
brands: Convergint, JSC Systems, Ballou Fire Systems, Esscoe, A+ Technology & Security Solutions, Digital Visions, Fiber Solutions, Simpson Security Systems, Delco Security, Panavideo, MVP Tech, Nusource Financial, Helinick
domains: convergint.com

> **Continuation vehicle, not an exit — the signal runs the opposite way to a sale.** An $850m single-asset continuation vehicle closed 2026-03-02, led by Leonard Green's Sage Fund with Vintage Strategies at Goldman Sachs Alternatives also investing. **It stays in the market as a bidder and is under no pressure to exit.** The $850m is the size of the vehicle, not the enterprise value of the company; the two are not interchangeable. Shared control: Ares (sole from 2018), Leonard Green & Partners and Harvest Partners (both from 2021-12-15). **All 12 acquired names above are absorbed under a single Convergint brand and are useful only as stale-list entries** — a hit on any of them is an owned company, not a target. No per-brand domains. Over 40 acquisitions since 2018; "adjusted EBITDA approximately quadrupled since 2018" is a growth claim with no base. The page fetched 2026-08-10 led with access control; the fire and life-safety line is in the master's cited service description.

## Everon
backer: GTCR
brands: Everon, NewTech Systems, ADT Commercial, ADT Multifamily
domains: everonsolutions.com

> **ADT Commercial and ADT Multifamily ARE Everon. ADT Inc. still exists as a separate residential company, so the token "ADT" must not resolve to Everon** — and must not resolve to Everon's parent either. Carved out of ADT Inc. 2023-10-02 at $1,613m / net cash $1,563m, ≈11.2x on $144m. **NewTech Systems is the one legacy nameplate retained** and the only unit with named cities (Ashland KY, Lexington KY, Groveport OH, Bridgeville and Washington PA, Dunbar WV); it was not visible on the pages fetched 2026-08-10, so verify before relying on it. The 2025-10-01 purchase of ADT's B2B multifamily segments (~$55m, ≈200,000 units, ≈$2.6m RMR) was **an account/asset purchase, not a platform transaction** — books of accounts move on different terms from companies. The ≈91% retention proxy in circulation belongs to **ADT Inc., April 2022**, not to Everon, which did not exist until the 2023 rebrand. Owns a central station. FY2025 revenue $1,618,725,121, SDM 100 #4.

## Pavion Corp.
backer: Wind Point Partners
brands: Pavion, Premier Security Solutions, Corbett Technology Solutions, CTSI
domains: pavion.com

> **Corbett Technology Solutions (CTSI) IS Pavion** — the same company under its former name, not a separate target. Absorb-everything policy: Pavion completed a "one Pavion" brand migration in 2025 consolidating its acquired brands, so acquired nameplates below the top level are no longer observable and **will present as independent indefinitely**. Wind Point entered June 2020. "Premier" is inside the three-way Premier collision — APi's Premier Fire & Security (Paducah KY, `premierfire.net`), CertaSite's Premier Electronics (Michigan), and this one — domain only. 70+ US locations and 23 countries with no branch list published. FY2025 revenue $904,972,750, SDM 100 #6.

## Zeus Fire and Security
backer: Access Holdings
brands: Alert Alarm Hawaii, SMG Security, UAS, United Alarm Services, Security Resources, Independent Alarm NJ, PASS, Martin Systems, Bayside Fire and Security, ASG, American Security Group, Gallaher, SEi
domains: zeusfireandsecurity.com

> **"House of Brands" model with distinct regional brand identities** — like National Fire & Safety, it generates multiple apparent independents from one owner. The master names 14 member brands but individually names only five; **the roster above was read off zeusfireandsecurity.com on 2026-08-10 and adds Security Resources, Independent Alarm NJ, PASS, Bayside Fire and Security, Gallaher and SEi, which the master does not name.** No per-brand domains. Collisions: **ASG is claimed by both Zeus and Pye-Barker**; **UAS / United Alarm Services** collides with Pye-Barker's United Alarm Service Inc. (Brookfield CT) and APi's United Fire Alarm Service (Murrells Inlet SC) — domain only in both cases. Access Holdings formed the platform 2022-02-22, no prior sponsor. Two UL-listed monitoring centres. FY2025 revenue $205,859,618, SDM 100 #11. ASG, UAS, SMG, PASS and SEi are all sub-5-character tokens.

## Minuteman Security and Life Safety
backer: Tenex Capital Management
brands: Minuteman Security and Life Safety, Minuteman Security Technologies
domains: minutemanst.com

> Both names are the same company — the site's branding says "Minuteman Security and Life Safety" while the footer copyright says "Minuteman Security Technologies Inc.", verified 2026-08-10. **"Minuteman" alone collides with Minuteman Press and Minuteman International — match "Minuteman Security" or the domain.** Prior sponsor: **Prospect Partners**; Tenex is current, with no entry date stated. Three brand tokens exist but none is named individually. Maine to Florida. FY2025 revenue $202,454,000, RMR $1,986,667, SDM 100 #23; annualised RMR/revenue 11.78%, near the master's "under 10% is an EBITDA conversation" threshold.

---

# Class 2 — manufacturers and product platforms under sponsors (3)

## Kidde Global Solutions
backer: Lone Star Funds
brands: Kidde, Badger, Edwards, Edwards Signaling, FIREX, Kidde Commercial, GST, Aritech, Gloria, EMS, AirSense
domains: kiddeglobalsolutions.com, kidde.com

> ⚠️ **The most dangerous token class in a register.** A US business whose name contains **Kidde, Badger, Edwards, FIREX, GST or Aritech is overwhelmingly a dealer, distributor or independent service company using the product — not an owned entity. Name-matching those tokens into an "already owned" bucket suppresses genuinely independent targets**, which is the expensive direction of the error. Domain only, and even then check the site is the manufacturer and not a dealer. Carved out of Carrier's Commercial and Residential Fire business, closed 2024-12-02 at **$3bn** EV. **This is a product platform, not a services roll-up — reading these as fire-services comparables is the most available category error in the record.** Master-published brand domains not independently reached in this pass: `badgerfire.com`, `edwards-signals.com`, `kiddepro.com`, `edwardsfiresafety.com`, `kidde-esfire.com`, `gst.com.cn`, `firesecurityproducts.com`. Site check 2026-08-10 adds Gloria, EMS, AirSense and Kidde Commercial UK to the brand wall and does **not** show FIREX on it. FIREX additionally collides with a named Encore affiliated brand partner.

## Spectrum Safety Solutions
backer: Sentinel Capital Partners
brands: Det-Tronics, Fireye, Autronica, Marioff
domains: spectrum-safety.com, det-tronics.com

> ⚠️ **Domain trap: `spectrumsafetysolutions.com` is NOT this company.** It is an unrelated fire-safety business serving the Indian market whose brands are Fike, Fireco, DC and Signifire. The real domain is `spectrum-safety.com`. **This was not a hold-and-integrate; it was a separation.** Carved out of Carrier's Industrial Fire business, closed 2024-07-02 (Carrier's FY2024 10-K gives 2024-07-01) at **$1.425bn** EV, and **two of the four brands were divested inside 24 months**: Marioff agreed to Inflexion 2026-03-31, **Autronica closed to MSA Safety 2026-07-09 at ≈$555m** (≈17.3x EV/2025 Adj. EBITDA). **Det-Tronics and Fireye are the residual.** Named indirectly as a likely seller. **Stale-site warning verified 2026-08-10: spectrum-safety.com still displays all four brands including both divested ones** — do not read that page as a current holdings list. `det-tronics.com` (Detector Electronics, LLC) does not name Spectrum as parent on its homepage. Fireye has no domain on the record.

## Marioff
backer: Inflexion
brands: Marioff, Marioff Corporation, HI-FOG
domains: marioff.com

> **Prior owners: Sentinel Capital Partners via Spectrum Safety Solutions, and Carrier before that.** Agreed to Inflexion 2026-03-31; terms not disclosed. Verified 2026-08-10 as Marioff Corporation, Äyritie 24, 01510 Vantaa, **Finland** — the site names no parent. **Not a US route business** and removes nothing from a US target board; carried here so a screener does not mistake it for one. Serves 70+ countries across marine and land-based segments, ≈660 people. Still listed as a brand on spectrum-safety.com.

---

# Class 3 — permanent capital, family and strategic holders with no exit clock (8)

## Markel Group / VSC Fire & Security
backer: Markel Group (NYSE: MKL), Markel Ventures
brands: VSC Fire & Security, Virginia Sprinkler Company, Arkansas Automatic Sprinkler, United Fire Suppression
domains: vscfire.com

> **The clearest case in the register and the one most often left out of sponsor trackers.** An insurance balance sheet buying a sprinkler contractor is a structurally different competitor from a fund with a five-year hold — **there is no exit clock and no hold-period logic to grade it on.** Agreement announced 2019-11-08, close expected Q4 2019; additional terms not disclosed, and VSC discloses no deal values at all. 1,200+ people, 21 offices across 9 states and DC; founded 1958 in Ashland VA. The site verified 2026-08-10 lists service across AL, AR, CO, FL, GA, MD, MS, NC, NM, OK, PA, SC, TN, TX and VA. **VSC is on the master's never-match short-acronym list** — catch by domain or by "VSC Fire & Security" in full.

## Minimax Viking
backer: Minimax Viking
brands: Cosco Fire Protection, Cosco DAS, Firetrol Protection Systems, Consolidated Fire Protection
domains: coscofire.com, coscodas.com, firetrol.net

> ⚠️ **The western-US sprinkler franchise that trackers still attribute to a private-equity sponsor has been strategically held for nearly two decades.** Gryphon Investors held Consolidated Fire Protection, LLC from 2005 and exited in **2007** to MX Mercury Beteiligungen GmbH ("Minimax"). **Neither Cosco's nor Firetrol's own site states an owner** — confirmed on both, 2026-08-10 — so a screener working from the companies' sites alone will read both as independent. Collisions: **"Cosco" collides with Costco and with COSCO Shipping**; **"Firetrol" collides with the Firetrol fire-pump controller lineage** — domain only for both. 12 named city entries across CA, WA, OR, CO, NV. Firetrol runs district offices across the South Central US and discloses no deal values.

## Mark Ein / Kastle Systems
backer: Mark Ein
brands: Kastle Systems, Kastle Systems International, i2G Systems
domains: kastle.com

> **An individual owner, not a fund** — Mark Ein, entrepreneur-investor and Chairman. No fund, no vintage, no exit clock; hold-period logic does not apply. Took a majority stake in **i2G Systems** (Sterling VA) in March 2025, described as its biggest-ever investment. `kastle.com` verified 2026-08-10 as Kastle Systems; the homepage does not state a headquarters. **Contradiction found 2026-08-10: the master records no domain for this entity.** FY2025 revenue $282,000,000, RMR $12,800,000, SDM 100 #9; annualised RMR/revenue 54.47% — a monitoring-weighted economic profile, not a contracting one. i2G is a sub-5-character token.

## Armstrong Group / Guardian Protection
backer: Armstrong Group
brands: Guardian Protection, Guardian Protection Services, Mastertech
domains: guardianprotection.com

> **This is the Warrendale/Pittsburgh PA Guardian.** Not the Rockville MD Guardian (Knox Lane), not the Nashville TN Guardian (Investcorp), not Guardian Alarm of Southfield MI, not Encore's "Guardian" brand partner. **Finding 2026-08-10: the master grades this ownership "widely reported, not primary-verified". It can now be upgraded — guardianprotection.com's own history page states "In 1991, Guardian joined forces with the Armstrong Group and merged with their security company, Mastertech" and lists the Armstrong family of companies.** Legal name remains Guardian Protection Services. Acquired **Monitronics' Commercial Alarm Accounts Division** 2025-03-27 — 8,300 commercial and 4,300 residential accounts, its fourth acquisition since 2021. **That was a book of accounts, not a platform; books move on different terms from companies and must not be counted as platform transactions.** Branches added at Lancaster PA, Morgantown WV, Williamsport PA. FY2025 revenue $214,411,000, SDM 100 #10.

## The Philadelphia Contributionship / Vector Security
backer: The Philadelphia Contributionship
brands: Vector Security, Vector Security Networks
domains: vectorsecurity.com

> **Partnered since 1982 — no exit clock.** ⚠️ **No ownership percentage appears on the holder's own page and none is assumed here**; the relationship is documented but the size of the stake is not in the record, so do not state one. `vectorsecurity.com` verified 2026-08-10 as Vector Security; the homepage does not state a headquarters. **Contradiction found 2026-08-10: the master records no domain for this entity.** FY2025 revenue $454,590,000, RMR $20,075,000, SDM 100 #5; annualised RMR/revenue 52.99% — monitoring-weighted, not contracting-weighted.

## Westphal family / Bay Alarm Company
backer: Westphal family
brands: Bay Alarm Company
domains: bayalarm.com

> Third-generation family-owned, verified 2026-08-10 from the company's own About page: founded 1946 in Oakland CA by Marj and Everett Westphal; **grandson Tim Westphal is owner and CEO**. No fund, no exit clock. **Contradiction found 2026-08-10: the master records no domain for this entity.** Concord CA operations. FY2025 revenue $263,766,868, RMR $17,240,000, SDM 100 #7.

## Duffy family / Per Mar Security Services
backer: Duffy family
brands: Per Mar Security Services
domains: permarsecurity.com

> The master records the holder only as "Family-owned" and names no family. **Finding 2026-08-10: permarsecurity.com names them — founded by John and Eleanor Duffy in Davenport, Iowa in 1953, now led by the third generation of the Duffy family**, and describes itself as the largest family-owned full-service security company in the Midwest. **The master also records no domain for this entity.** No exit clock. FY2025 revenue $158,462,703, RMR $5,197,677, SDM 100 #14.

## Guardian Alarm
backer: Independent
brands: Guardian Alarm, Guardian Alarm Company
domains: guardianalarm.com

> **This is the Southfield, Michigan Guardian** — verified 2026-08-10, "Headquartered in Southfield, Michigan", and **the site names no owner at all**. It is none of the other four Guardians. The master's basis-of-holding cell for this entity is empty: "Independent" here means *no holder is named in the record*, which is not the same as verified independence — grade it as unknown ownership, not as a clean target. **Contradiction found 2026-08-10: the master records no domain for this entity.** SDM 100 #13 with no revenue or RMR given.

---

# Class 4 — already exited to a strategic, or absorbed into another platform — NOT TARGETS

⚠️ **The master states the class-4 count as 5 but never enumerates which five.** Every entity in this section is named somewhere in the master as exited-to-a-strategic or absorbed-into-another-platform. Treat all of them as not targets, and do not assume which five the count refers to.

## CertaSite
backer: APi Group (NYSE: APG)
brands: CertaSite, Starfire Systems, Starfire Extinguisher, Approved Protection Systems, Approved Safety and Security, Advanced Fire, Premier Electronics, Eastman Fire Protection, Weber Fire and Safety, Allied Safety Services
domains: certasitepro.com

> **NOT A TARGET — acquired by APi Group, announced 2025-12-10, closed 2026-02-02**, $271m total consideration ($268m cash at closing plus $3m escrow) on FY2025 revenue of ≈$90m, EV/Revenue ≈3.01x. Seller was The Riverside Company. **Domain trap: it is `certasitepro.com`, not the obvious construction** — verified 2026-08-10, and the site now carries the APi Group logo and states "CertaSite is a subsidiary of APi Group". 23 CertaSite legacy names exist; the 10 above are the ones named. Collisions inside this roster: **Starfire** vs Altus's Star Fire Protection (`starfireny.com`); **Approved** vs Encore's Approved Fire Protection; **Advanced Fire** vs APi National Service Group's Advanced Fire Protection; **Premier Electronics** vs APi's Premier Fire & Security and Pavion's Premier Security Solutions. 17 locations stated, 16 cities enumerated.

## Protegis Fire & Safety
backer: BDT & MSD Partners
brands: Protegis Fire & Safety, ISA Fire & Security
domains:

> **NOT A TARGET — absorbed into Summit Fire & Security on 2022-05-02** and does not appear as a live trading brand on Summit's own branch-locations pages. Prior chain: Align Capital from 2017 via **ISA Fire & Security**, seven add-ons taking it from 6 to 13 branches. Former Protegis Baltimore–DC branches are now held by Summit. No live domain; correctly absent. Current ultimate owner is Summit's sponsor, BDT & MSD Partners. **A tracker still carrying Protegis as a live sponsor-backed platform is carrying an entity that stopped existing in 2022.**

## Performance Systems Integration
backer: BDT & MSD Partners
brands: Performance Systems Integration, PSI
domains:

> **NOT A TARGET — absorbed into Summit Fire & Security on 2025-08-12** (closed 2025-08-21) under BlackRock LTPC, before BDT & MSD took majority; terms not disclosed. Prior chain: Peterson Partners, then The Riverside Company. Grew 4→14 locations, 108→450+ employees, 64→279 technicians, 21,000+ customers, 16 add-ons to 2025-08-12 — **all 16 of those add-ons are now inside Summit and none is a target.** The master records no domain for it in the register sections; a `www.psintegrated.com` URL appears only in an unrelated appendix source list and was not verified in this pass, so it is deliberately left out here. PSI is a sub-5-character token.

## Chubb Fire & Security Group
backer: APi Group (NYSE: APG)
brands: Chubb Fire & Security
domains: chubbfs.com

> **NOT A TARGET — Carrier carve-out to APi Group, announced 2021-07-27, completed 2022-01-03 at $3.1bn**, ≈13.3x LTM Adj. EBITDA including synergies; "over 60%" of revenue recurring in nature; 17 countries. `chubbfs.com` verified 2026-08-10 — **the page does not name APi Group as parent in its body text**; the only APi trace is a footer link to an apigroupinc.com ESG document, so ownership here is legible from APi's filings, not from the brand's site. Not to be confused with Chubb Limited, the insurer.

## STANLEY Security
backer: Securitas AB (OM: SECU B)
brands: STANLEY Security
domains:

> **NOT A TARGET — acquired by Securitas AB, completed 2022-07-22 at $3,200m debt- and cash-free.** No live standalone domain established in this pass; the business now trades inside Securitas Technology (`securitastechnology.com`). Any STANLEY Security nameplate found in the field is a Securitas asset.

## Corbett Technology Solutions
backer: Wind Point Partners
brands: Corbett Technology Solutions, CTSI
domains:

> **NOT A TARGET — CTSI IS Pavion.** Same company, former name; the rebrand is complete and a "one Pavion" brand migration finished in 2025. No separate domain established. A register carrying CTSI as a distinct entity double-counts Pavion. CTSI is a sub-5-character token.

## ADT Commercial / ADT Multifamily
backer: GTCR
brands: ADT Commercial, ADT Multifamily
domains:

> **NOT A TARGET — both are Everon**, renamed at the GTCR close 2023-10-02. **ADT Inc. still exists as a separate residential company (`adt.com`), so the "ADT" token must not resolve to Everon and must not resolve to GTCR.** No separate domain. ADT is a sub-5-character token.

## Autronica Fire and Security
backer: MSA Safety
brands: Autronica, Autronica Fire and Security AS
domains: autronicafire.com

> **NOT A TARGET — closed to MSA Safety 2026-07-09 at ≈$555m** (≈17.3x EV/2025 Adj. EBITDA). Prior owners: Sentinel Capital Partners via Spectrum Safety Solutions, and Carrier before that. Verified 2026-08-10: the company's own newsroom carries "MSA Safety Completes Acquisition of Autronica Fire and Security" and **Spectrum is not mentioned anywhere on the site** — while spectrum-safety.com still lists Autronica as one of its brands. Trust Autronica's own site. Norwegian; not a US route business.

## Consolidated Fire Protection
backer: Minimax Viking
brands: Consolidated Fire Protection
domains:

> **NOT A TARGET — sold by Gryphon Investors to Minimax in 2007** and is the predecessor of the Cosco/Firetrol western-US franchise. Nearly two decades under a strategic holder. No live domain; catch the successor entities at `coscofire.com`, `coscodas.com`, `firetrol.net`.

## Onyx-Fire Protection Services
backer: APi Group (NYSE: APG)
brands: Onyx-Fire Protection Services
domains:

> **NOT A TARGET — acquired by APi Group, closed 2026-06-08**, ≈$190m annual revenue. **Canadian — removes nothing from a US target board.** Carried so a screener does not read the APi deal count as US density. No domain verified in this pass.

## WTech Fire Group
backer: APi Group (NYSE: APG)
brands: WTech Fire Group
domains:

> **NOT A TARGET — acquired by APi Group, closed 2026-07-01**, ≈$175m annual revenue. **Europe/Ireland — removes nothing from a US target board.** Same caution as Onyx-Fire. No domain verified in this pass.

---

# Outside the class counts — entities that distort a register

## APi Group Corporation
backer: APi Group Corporation (NYSE: APG)
brands: Chubb Fire & Security, CertaSite, Viking Fire Protection Group, VFP Fire Systems, Viking Automatic Sprinkler, Davis-Ulmer Fire Protection, Cogswell Sprinkler, Grunau Fire Protection, W&M Fire & Security, SRI Fire & Security, Beach Lake Sprinkler, Valley Fire Protection, American Fire Protection Group, Western States Fire Protection, International Fire Protection, APi National Service Group, 3S Incorporated, ICS, Premier Fire & Security, Security Fire Protection, Tenet Solutions, Texas Sprinkler, United States Fire Protection, Clear Connection, Integrated Protection Services, One Source Security, Landmark Sprinkler, Delta Fire Systems, 3-D Fire Protection, Absolute Fire Protection, National Fire Suppression, Advanced Fire Protection, Mid Atlantic Fire Protection, United Fire Alarm Service, Arizona Verde Fire Protection, Signal One Fire and Communication, High Sierra Fire Protection, Wm. Crook Fire Protection, Kimble Fire Protection, Quality Fire Protection, Phoenix Fire Protection, A-Com Security, Metropolitan Mechanical Contractors, Tessier's, Sunland Fire Protection, Olsen Fire Protection
domains: apigroupinc.com, davisulmer.com, grunaufire.com, cogswellsprinkler.com, wmfireprotection.com, wsfp.com, vfpg.com, vfpfire.com, afpgusa.com, securityfire.com, premierfire.net, premierfire.us, usafireprotectioninc.com, texassprinkler.com, icsgf.com, candoifp.com, 3s-incorporated.com, api-nsg.com, onesourcesecurity.com, integratedprotectionservices.com, certasitepro.com, chubbfs.com

> **The single largest distortion in any fire register, and it is a disclosure problem rather than a data problem.** APi's bolt-ons are disclosed as counts and aggregate consideration only — four Q1-2026 targets are described merely as "individually immaterial acquisitions" at $25m aggregate. **Under this policy the acquired company vanishes from the observable universe and a target list built on trading names will show it as independent indefinitely.** ⚠️ **EX-21 deletion trap:** APi's FY2025 EX-21 (filed 2026-02-25, accession 0001628280-26-011620) runs 203 rows, and legacy US operating entities are being *deleted* as they merge into consolidation vehicles — **Western States Fire Protection Company, Grunau Company, Security Fire Protection Company, Metropolitan Mechanical Contractors, Tessier's, Sunland Fire Protection, Delta Fire Systems, Landmark Sprinkler and Olsen Fire Protection all appear in the 2020 and FY2021 exhibits and are absent from FY2025, while every one of them is still a live trading nameplate with a branch, a licence and truck livery. The current exhibit alone under-counts by roughly thirty names**; the 2020 S-4 exhibit (92 rows) is the richest legacy list and must be read alongside it. **Verified 2026-08-10** — each of these fetched pages states "is a subsidiary of APi Group" in its own footer: davisulmer.com (Davis-Ulmer Fire Protection), wsfp.com (Western States Fire Protection Co), vfpg.com (Viking Fire Protection Group, naming sub-brands Viking Automatic Sprinkler, VFP Fire Systems, Absolute Fire Protection, High Sierra, **Kimble Fire Protection**, Landmark Sprinkler, **Quality Fire Protection**, Valley Fire Protection), afpgusa.com (American Fire Protection Group, naming **AFPG Security Houston, A-Com Security Albuquerque, Phoenix Fire Protection**, Mid Atlantic Fire Protection), securityfire.com (Security Fire Protection Company, Memphis TN), premierfire.net→premierfire.us (Premier Fire & Security), usafireprotectioninc.com (United States Fire Protection / USAFP), texassprinkler.com (Grapevine TX), icsgf.com (ICS, Inc., Grand Forks ND), candoifp.com (International Fire Protection, Madison AL), 3s-incorporated.com (Harrison OH), api-nsg.com, onesourcesecurity.com (Merrimack NH), integratedprotectionservices.com (Darien CT), wmfireprotection.com (W&M Fire & Security, Hawthorne NY, a division of Davis-Ulmer), certasitepro.com. **Redirects verified: `vfpfire.com`→`vfpg.com/companies/vfp-fire-systems`, `grunaufire.com`→`davisulmer.com/grunau-fire-protection`, `cogswellsprinkler.com`→`davisulmer.com/cogswell-sprinkler-company`, all 302 — register all of them, both sides.** ⚠️ **`clearconnection.com` was reached 2026-08-10 and identifies as Clear Connection of Beltsville MD but names no parent — the master carries it in APi's verified set; treat the APi tie as unconfirmed from the brand's side.** ⚠️ **`tenetsolutions.com` could not be reached — expired TLS certificate as of 2026-08-10.** Beyond the redirects and the named pages above, **the master does not state which domain belongs to which brand — do not construct the mapping.** Brand layers overlap and do not sum to a distinct count: 14 platform brands, 9 VFPG sub-brands, 18 Davis-Ulmer sub-brands, 6 AFPG, 5 WSFP, 2 IFP, 11 APi NSG acquired names, 23 CertaSite legacy names, 23 EX-21 legal-entity names with no matching brand page. **Summit Pipeline Services ULC is APi's and is non-fire.** Heat Trace Services, Inc. appears in the 2020 exhibit and is absent from the current one. FY2025 net revenues $7,911m; Safety Services $5,456m at 16.8% segment earnings margin. Bolt-on ceiling "<6x in each year" 2019–2024 is IR-only and appears in no SEC filing.

## Johnson Controls International plc
backer: Johnson Controls International plc (NYSE: JCI)
brands: Tyco, Tyco Fire, Simplex, Ansul, Johnson Controls Fire Protection
domains: johnsoncontrols.com

> **JCI did not exit fire.** What it sold was HVAC: Residential and Light Commercial HVAC went to Bosch Group in July 2025 for $8.3bn. **Fire and security remain inside Building Solutions Americas core** — confirmed 2026-08-10, johnsoncontrols.com's brand navigation carries Tyco Fire and Ansul under Fire Suppression and Simplex under Fire Detection. A register that treats JCI as having left the market is wrong, and JCI remains a credible counterparty. FY2025 sales $23.6bn, with no fire-specific line broken out.

## Carrier Global Corporation
backer: Carrier Global Corporation (NYSE: CARR)
brands: Carrier
domains:

> **Sold both of its fire businesses and now retains none — Carrier is not a bidder for fire assets.** Kidde, Edwards, Marioff, Autronica, Det-Tronics, Fireye and LenelS2 all sit under other owners: Kidde/Edwards under Lone Star Funds, Det-Tronics/Fireye under Sentinel, Marioff under Inflexion, Autronica under MSA Safety, LenelS2 under Honeywell. Carried here so a screener does not attribute any of those brands to Carrier. **Domain not verified in this pass** — `corporate.carrier.com` 302-redirected off-host and the destination was not fetched; left out rather than assumed.

## Honeywell International
backer: Honeywell International (NASDAQ: HON)
brands: Honeywell, LenelS2
domains: honeywell.com

> Bought Carrier's Access Solutions including **LenelS2** at $4.95bn EV, closed 2024-06-03. **No fire or life-safety-specific revenue line for Honeywell Building Automation exists in the public record**, so Honeywell cannot be benchmarked on fire economics. Mid-reorganisation: Solstice Advanced Materials spin-off complete, Aerospace spin-off pending — a company splitting itself is an unreliable bidder to model. Verified 2026-08-10; the homepage carries Building Automation but does not name LenelS2.

## Securitas AB / Securitas Technology
backer: Securitas AB (OM: SECU B)
brands: Securitas Technology, STANLEY Security
domains: securitastechnology.com

> Holds Securitas Technology, which **does carry commercial fire detection and alarm** — verified 2026-08-10 on its own solutions page — and owns central stations. Completed **STANLEY Security** 2022-07-22 at $3,200m debt- and cash-free, so any STANLEY nameplate found in the field is Securitas. FY2025 revenue $3,459,840,000 and RMR $102,000,000 at 2025-12-31 are **both survey estimates, not disclosed figures** — do not carry them as reported. SDM 100 #2. The page fetched does not itself state the Securitas AB parent relationship.

## Cintas Corporation
backer: Cintas Corporation (NASDAQ: CTAS)
brands: Cintas Fire Protection Services, White Fire Extinguisher
domains: cintas.com

> **Cintas buys extinguisher businesses directly** — a live competing bidder for SV3 route assets specifically, and one that a fire-only tracker will miss entirely. Runs a Fire Protection Services operating segment covering extinguishers, sprinkler and alarm testing and special hazard suppression, verified 2026-08-10 on its own site. ⚠️ **It is reported inside the "All Other" reportable segment and is not separately disclosed, so Fire Protection Services is strictly smaller than the segment and cannot be sized from the filings.** All Other revenue $1,146,018k FY2025 vs $1,064,082k FY2024 on total revenue $10,340,181k. Acquisition cash $232.9m (FY2025) and $186.8m (FY2024) span three segments with **no allocation and no deal count** — do not attribute it to fire.

## Comfort Systems USA
backer: Comfort Systems USA (NYSE: FIX)
brands: Comfort Systems USA
domains: comfortsystemsusa.com

> **Not a disclosed fire consolidator.** A credible acquirer of mechanical contractors that happen to carry sprinkler capability, and it **cannot be benchmarked on fire economics because those economics are not broken out** — its 10-Q says the mechanical segment "principally includes HVAC, plumbing, piping and controls, as well as off-site construction, monitoring and fire protection", and **no fire-protection denominator for Comfort Systems exists in the public record.** Verified 2026-08-10: the corporate site describes mechanical, electrical and plumbing and **does not list fire protection as a service line at all** — a further reason not to size it. It still competes for the same targets.

## EMCOR Group
backer: EMCOR Group, Inc. (NYSE: EME)
brands: EMCOR Group
domains: emcorgroup.com

> **Not a disclosed fire consolidator**, same treatment as Comfort Systems: a credible acquirer of mechanical contractors with sprinkler capability that cannot be benchmarked on fire economics. **EMCOR's FY2025 results release contains no mention of fire protection or life safety as a distinct service line**, and the corporate site verified 2026-08-10 lists mechanical and electrical construction, facilities services, energy infrastructure and green building — no fire line. Competes for the same targets regardless.

## ADT Inc.
backer: ADT Inc. (NYSE: ADT)
brands: ADT, ADT Blu
domains: adt.com

> **ADT has left commercial fire — it is a seller of commercial fire assets, not a bidder for them.** Sold its commercial security, fire and life safety business unit to GTCR in 2023 (now Everon) and its B2B multifamily segments to Everon in 2025. **"ADT" must not resolve to Everon, and Everon assets must not be attributed to ADT.** Verified 2026-08-10 as ADT LLC, a residential/smart-home security company. FY2025 revenue $4,354,000,000, RMR $358,700,000 — RMR/revenue 98.86%, a pure monitoring profile that is not comparable to a fire contractor.

## Bosch Group
backer: Bosch Group
brands: Bosch
domains:

> **Appears in this market only as the buyer of JCI's residential HVAC** ($8.3bn, July 2025). **No US fire sprinkler or suppression contracting asset under Bosch appears in the public record.** Carried so that a screener does not read the JCI–Bosch transaction as a fire-market event. Domain not verified in this pass.

## Security 101
backer: Morgan Stanley Capital Partners
brands: Security 101
domains: security101.com

> **Explicitly excluded from the register in the master — and the exclusion is the finding.** Passed from Gemspring Capital to Morgan Stanley Capital Partners on 2026-02-24; **neither the acquisition announcement nor the company's own site names fire or life safety anywhere** — confirmed 2026-08-10, the site describes access control, video, intrusion detection and visitor management only. A sponsor-backed integrator of that size with no fire line will not appear as a bidder for fire assets. ⚠️ **Unresolved document-internal inconsistency: §10.5 of the master nonetheless names "Security 101 under Morgan Stanley Capital Partners" in its likely-acquirers list.** Both statements are in the document; resolve before using either. Annualised RMR/revenue 6.07%.

## Becklar
backer: Graham Partners
brands: Becklar, AvantGuard, Freeus, Armstrongs, Eyeforce, Dynamark Monitoring
domains: becklar.com

> **Sits outside the counts and is named because it distorts registers that include it.** **Becklar is not a fire contractor** — it is monitoring infrastructure — **but it owns the paper that fire-alarm recurring revenue sits on**, so it is economically upstream of every SV2 platform in this file. Graham Partners acquired 2024-12-10 with **BV Investment Partners rolling its stake from its 2020 investment**; added Dynamark Monitoring 2025-09-03. Verified 2026-08-10 as Becklar, LLC; the About page names AvantGuard and Freeus and **does not name Armstrongs, Eyeforce or Dynamark**, so treat those three as master-sourced only. No brand-level domains on the record.

## ORR Protection
backer:
brands: ORR Protection, Compass Fire Protection, Detection & Suppression International
domains: orrprotection.com

> ⚠️ **Owner is not established in the public record, and this is the most dangerous kind of entry in a register: an active acquirer with no identified owner cannot be graded on hold period, and it may or may not be a competing bidder.** Confirmed 2026-08-10 — orrprotection.com names no parent, no sponsor and no corporate owner. Sits outside the master's class counts for this reason. Actively buying: **Compass Fire Protection** (Aug 2025, union sprinkler capability and Pacific Northwest presence) and **Detection & Suppression International** (Oct 2024, Texas). 15 branches serving 50 states, no cities published. CEO **Woodie Andrawos**, previously president of National Monitoring Center. FY2025 revenue $169,428,932, RMR $1,254,129, SDM 100 #32; annualised RMR/revenue 8.88%. **ORR is on the never-match short-acronym list** — domain only.

## CPI Security Systems
backer:
brands: CPI Security, CPI Security Systems
domains: cpisecurity.com

> ⚠️ **Owner is not established in the public record** — same "most dangerous entry" caveat as ORR Protection: it cannot be graded on hold period and its status as bidder or seller is unknown. Sits outside the master's class counts. Verified 2026-08-10 as CPI Security Systems, Inc. with a Charlotte NC monitoring centre; the site states "Charlotte-owned" but **names no corporate owner**. **Contradiction found 2026-08-10: the master records no domain for this entity.** FY2025 revenue $185,000,000, RMR $13,100,000, SDM 100 #8.

## COPS Monitoring
backer:
brands: COPS Monitoring, Security Partners, AlarmWATCH
domains:

> **Ownership is not established in the public record.** Monitoring infrastructure, not a fire contractor — carried because wholesale monitoring ownership determines who controls the recurring revenue under an SV2 target. Has acquired the wholesale monitoring businesses of **Security Partners** and **AlarmWATCH**, so both are absorbed and are not targets. No domain on the record and none verified in this pass.

## Rapid Response Monitoring Services
backer:
brands: Rapid Response Monitoring Services
domains:

> **Ownership is not established in the public record.** Monitoring infrastructure, not a fire contractor. ⚠️ **Token trap: "Rapid" collides with RapidFire Safety & Security (Concentric, St. Louis) and with Pye-Barker's Rapid Fire Protection brand in Salt Lake City — three unrelated entities.** No domain on the record and none verified in this pass.

## Affiliated Monitoring
backer:
brands: Affiliated Monitoring
domains:

> **Ownership is not established in the public record.** Monitoring infrastructure, not a fire contractor. No domain on the record and none verified in this pass.

## National Monitoring Center
backer: The Netwatch Group
brands: National Monitoring Center, Netwatch, Onwatch Multifire, CalAtlantic
domains:

> Ownership of the top of this chain is not established in the public record. **NMC sits inside The Netwatch Group after a merger with Netwatch, Onwatch Multifire and CalAtlantic** — all four are absorbed and none is a target. Monitoring infrastructure, not a fire contractor. Relevant to this register mainly because ORR Protection's CEO Woodie Andrawos previously ran NMC. **NMC is a sub-5-character token.** No domain on the record and none verified in this pass.

## Fortis
backer:
brands: Fortis
domains:

> ⚠️ **Bare name mention only — carry it as nothing more.** "Fortis" appears exactly once in the master (line 1108: "Pye-Barker, Summit, Marmic, AI Fire, VSC, Firetrol and Fortis disclose no deal values at all"). The master gives it **no class, no sponsor, no footprint, no domain and no entry in any Part IV table.** It is in this register only so that a screener meeting the name knows it is unresolved rather than absent. **"Fortis" collides across many industries; do not attempt a match on it and do not attach a domain to it.**

---

## Coverage and gaps

**Parents in the register: 63.**

| Class | Definition | Parents |
|---|---|---|
| 1a | US fire and life-safety service contractors under a live private-equity sponsor | 17 |
| 1b | Security-led integrators under a live sponsor carrying fire and life safety | 5 |
| 2 | Fire manufacturers and product platforms under sponsors | 3 |
| 3 | Permanent-capital, family and strategic holders with no exit clock | 8 |
| 4 | Already exited to a strategic or absorbed into another platform — **not targets** | 11 |
| — | Outside the counts: public strategics, excluded entities, owners not established | 19 |

The class 1a/1b/2/3/4 counts of 17/5/3/8 match the master's own 4.1 table and executive
summary exactly. **The master states the class-4 count as 5 but never enumerates which
five**; 11 entities are named across the document as exited or absorbed, and all 11 are
carried here. Do not assume which five the count refers to.

### Domain coverage

**49 of 64 parents have at least one domain verified in this pass** — the site was fetched
on 2026-08-10 and identified itself as that company. **15 do not.**

By class: 1a **17/17** · 1b **5/5** · 2 **3/3** · 3 **8/8** · 4 **3/11** · outside the counts **12/19**.

**The 15 parents with no verified domain, named:**

*Class 4 — absorbed or dissolved nameplates, correctly with no live site (8).* These are
not gaps in the useful sense; there is nothing left to reach.
Protegis Fire & Safety · Performance Systems Integration · STANLEY Security ·
Corbett Technology Solutions (CTSI) · ADT Commercial / ADT Multifamily ·
Consolidated Fire Protection · Onyx-Fire Protection Services · WTech Fire Group

*Live entities where this pass did not establish a domain (7).* These are real gaps.
- **Carrier Global Corporation** — `corporate.carrier.com` 302-redirected off-host and the destination was not fetched. Not a bidder in any case.
- **Bosch Group** — not attempted; appears only as the buyer of JCI's residential HVAC.
- **COPS Monitoring** — no domain on the record; ownership also not established.
- **Rapid Response Monitoring Services** — no domain on the record; ownership also not established.
- **Affiliated Monitoring** — no domain on the record; ownership also not established.
- **National Monitoring Center / The Netwatch Group** — no domain on the record.
- **Fortis** — a single bare name mention with no class, sponsor, footprint or domain. **Do not attach a domain to this name under any circumstances.**

**Sub-domains and brand domains reached but flagged, not counted as clean:**
- `clearconnection.com` — reached, identifies as Clear Connection of Beltsville MD, **names no parent**. The master carries it in APi's verified set; the APi tie is unconfirmed from the brand's side.
- `tenetsolutions.com` — **unreachable, expired TLS certificate as of 2026-08-10.** In APi's master set; not verified here.
- `ars-guardian.com` — root reached and self-identifies as "Guardian Fire Protection Services"; /about-us/ 404s, so the Rockville MD tie rests on the exact name string plus the master.
- `cfsnyc.com` — reached, Cross-Fire & Security Co., Long Island City NY, **presents as independent and names no parent**; the Altus tie comes from altusfire.com's side only.
- `chubbfs.com` — reached, **does not name APi Group in body text**; only a footer link to an apigroupinc.com ESG document.

**Domains deliberately NOT written into this file:**
- **`absolutefireaz.com`** — carried by the master as National Fire & Safety's second domain. **As of 2026-08-10 it 302-redirects off-host to `legalesedecoder.com`, an unrelated site.** Lapsed or repurposed; using it would attribute an owner from a domain the company no longer controls.
- **`spectrumsafetysolutions.com`** — a different, unrelated fire-safety business serving the Indian market (brands Fike, Fireco, DC, Signifire). Spectrum Safety Solutions is `spectrum-safety.com`.
- **`encorefp.com`** — not Encore Fire Protection.
- **`securityfire.com` under Security Fire Systems** — it is **APi Group's** (Security Fire Protection Company, Inc., Memphis TN, verified). Security Fire Systems is `securityfiresystems.com`.
- **`guardianfireholdings.com` under any Guardian other than Nashville** — see below.
- Altus's eight further member-brand domains, Kidde's seven further brand domains, and `summitfireconsulting.com` / `summitfirenationalaccounts.com` — all master-published but not independently reached in this pass. They are recorded in the relevant note lines rather than asserted in a `domains:` field.

### The Guardian cluster — five unrelated entities, maximum severity

The master grades this **domain only, maximum severity**. Three now have a verified,
distinct domain and must never be cross-assigned:

| Entity | Location | Backer | Domain |
|---|---|---|---|
| Guardian Fire Protection Services | Rockville MD | Knox Lane | guardianfireprotection.com, ars-guardian.com |
| Guardian Fire Services | Nashville TN | Investcorp | guardianfireholdings.com |
| Guardian Protection | Warrendale/Pittsburgh PA | Armstrong Group | guardianprotection.com |
| Guardian Alarm | Southfield MI | none named | guardianalarm.com |
| "Guardian" | — | Encore Fire Protection brand partner | none |

**`guardianfireholdings.com` is resolved.** The master lists it in the Guardian-cluster
domain row and states it does not know which of the five it belongs to. **It is Guardian
Fire Services of Nashville** — the domain's own contact page gives 2 Dell Parkway Suite 100,
Nashville TN 37217 under the trading name Guardian Fire Services (verified 2026-08-10).
The master's instruction not to attribute it can be lifted.

### Brand tokens shorter than 5 characters — a name matcher skips these

These must be caught by domain, or by the full company string plus a state. **Never match a
bare initialism.**

*The master's own never-match list (line 780), verbatim:*
NEFS · FSI · OSI · ESS · WSA · FS&S · LPS · ASG · HEIM · SEi · PASS · SGTS · VSC · ORR ·
ACT · IFP · NFS · TFA · RCI · GW · 3S · DU

*Further sub-5-character tokens appearing elsewhere, all requiring domain or full-string matching:*
UAS · SMG · ARK · ICS · VFP · WSFP · VFPG · AFPG · SRI · GST · FSP · PSI · CTSI · ISA ·
ADT · APi · JCI · APG · NMC · DAS · A+ · MVP · JSC · i2G

**ASG is claimed by both Zeus Fire and Security and Pye-Barker** — a bare "ASG" match is
wrong for at least one of them, and possibly both.

*Related trap — surname-only tokens (line 781), which match unrelated firms in every trade.
Use name plus state, or domain:*
Gorham · Franklin · Patterson · Kimble · Craynon · Teasley · Hamrick · Eastman · Spears ·
Flannery · Rich · Ellis

### Class 4 — already absorbed, therefore not targets at all

Eleven entities, all carried above with `NOT A TARGET` in the note line:

CertaSite (→ APi Group, closed 2026-02-02) · Protegis Fire & Safety (→ Summit, 2022-05-02) ·
Performance Systems Integration (→ Summit, 2025-08-12) · Chubb Fire & Security
(→ APi Group, 2022-01-03) · STANLEY Security (→ Securitas AB, 2022-07-22) ·
Corbett Technology Solutions/CTSI (= Pavion) · ADT Commercial and ADT Multifamily (= Everon) ·
Autronica Fire and Security (→ MSA Safety, 2026-07-09) · Consolidated Fire Protection
(→ Minimax, 2007) · Onyx-Fire Protection Services (→ APi Group, 2026-06-08, **Canada**) ·
WTech Fire Group (→ APi Group, 2026-07-01, **Europe/Ireland**)

Onyx-Fire and WTech are non-US and **remove nothing from a US target board** — do not read
them as US density when counting APi's cadence.

### Entities the master says should not be in a register, or that distort one

Beyond the class-4 list: **Security 101** is explicitly excluded because it carries no fire
line at all (and the exclusion is itself the finding, though §10.5 contradicts §4.3 by naming
it as a likely acquirer). **Becklar** is not a fire contractor but owns the paper fire-alarm
RMR sits on. **Comfort Systems USA** and **EMCOR Group** are not disclosed fire consolidators
and cannot be benchmarked on fire economics — no fire denominator exists for either.
**Bosch** appears only as the buyer of JCI's residential HVAC. **Carrier** retains no fire.
**ADT Inc.** is a seller, not a bidder. And the stale-list entries — Sciens' 31 legacy
nameplates, Marmic's legacy names, Convergint's 12 acquired names, Protegis, PSI,
ADT Commercial/Multifamily and CTSI — are all owned, and carrying any of them as an
independent is wrong.

Two further register-level cautions from the master: **a register that treats Alaska, the
interior West and the Plains as empty will be wrong**, and **no saturation index,
share-of-metro figure or ranking of under-consolidated territories should be published off
this base.**

### Weak attribution — grade these a step below the rest

- **RapidFire Safety & Security** → Concentric Equity Partners — *trade press only*
- **Telgian** → The Miller Group — *directory listing only*
- **Security Fire Systems** → Blackford Capital — *trade press only*; ⚠️ carries the marker in §4.3 but is **omitted from §4.1's list of two** weakly-attributed entities. Unresolved in the master.
- **Guardian Protection / Armstrong Group** → the master grades this "widely reported, not primary-verified"; **this pass upgrades it** — guardianprotection.com's own history page states the 1991 Armstrong Group combination.
- **Vector Security / The Philadelphia Contributionship** → partnership since 1982, but **no ownership percentage appears on the holder's own page and none is assumed here.**
- **Guardian Alarm** → the master's basis-of-holding cell is empty. "Independent" here means *no holder is named*, which is not verified independence.
- §10.5: **"continued ownership could not be confirmed from a primary source for two of the platforms whose hold periods look longest"** — those two are **not named in the master**, so two entries in class 1a are candidates on the strength of an absence of news rather than on evidence. Unresolved.

### What contradicted the master in this pass

1. **`relaysafety.com` exists.** The master states Relay Fire and Safety has "no domain on the record".
2. **`rapidfiress.com` exists**, and gives RapidFire's HQ as St. Louis MO — the master's footprint cell for this entity is empty.
3. **`securityfiresystems.com` exists**, and gives Security Fire Systems' footprint as Dallas–Fort Worth TX plus Arkansas — the master's footprint cell is empty.
4. **`fsstechnologies.com` exists**, and gives FSS Technologies' primary location as Arlington Heights **IL** across six states, not Ann Arbor MI.
5. **`guardianfireholdings.com` is attributable** — to Guardian Fire Services of Nashville. The master says it cannot be attributed.
6. **`absolutefireaz.com` no longer resolves to a fire company** — it 302-redirects to `legalesedecoder.com`. The master carries it as verified.
7. **Six class-3 holders that the master records with no domain all have one**: Kastle Systems, Guardian Protection, Vector Security, Bay Alarm, Per Mar Security Services, Guardian Alarm. CPI Security Systems too.
8. **AI Fire's brand policy does not make ownership legible from the brand.** The master calls it the only policy of the three that does; neither impactfireservices.com nor academyfire.com names AI Fire as a parent.
9. **Zeus publishes more member brands than the master names** — Security Resources, Independent Alarm NJ, PASS, Bayside Fire and Security, Gallaher and SEi are on its own site and not in the master.
10. **VFPG and AFPG publish sub-brands the master does not name** — Kimble Fire Protection, Quality Fire Protection, AFPG Security Houston, A-Com Security Albuquerque, Phoenix Fire Protection.
11. **`spectrum-safety.com` still lists Autronica and Marioff as its brands** although both were divested; `autronicafire.com` correctly names MSA Safety and does not mention Spectrum.
12. **The master's redirect claims all hold.** `pyebarkerfire.com`→`pyebarkerfs.com`, `sciensbuildingsolutions.com`→`sciensusa.com`, `vfpfire.com`→`vfpg.com`, `grunaufire.com` and `cogswellsprinkler.com`→`davisulmer.com` were each re-checked and each returned 302 to the stated destination. One addition: **`premierfire.net` 302-redirects to `premierfire.us`** — register both.

### What this register does not tell you

Ownership is established here per **parent**, from the master plus the domain checks above.
The master's own closing instruction applies to everything downstream of this file:
**ownership must be established per legal entity from a primary source, not inferred from a
trading name, and the absence of a brand from the record is not evidence that the business
is unowned.** The largest single risk in using this file is the opposite of a false positive
— Pye-Barker's ~204 brands, Encore's 75, Sciens' 31, Marmic's ~22 unnamed legacy names,
ASPYRE's entire undisclosed roster and APi's deliberately undisclosed bolt-ons carry **no
brand-level domains at all**, so several hundred already-owned businesses remain invisible
to any domain-based screen and will present as independent.

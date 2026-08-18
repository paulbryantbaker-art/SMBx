# 05 — Operating Brand Names and Domains, by Platform

**Stream:** 05 (Brand-level detail) · **Research date:** 29 July 2026 · **Buy-side market study, US fire & life safety**

**Purpose:** this file is a **consolidator register** for screening an acquisition target list. The matcher works on (a) operating brand tokens appearing in a business's name and (b) website domain. Holdco names are near-useless for that job; the names below are what appears on the truck, the sign and the invoice.

**Basis labels:** `Disclosed` (the platform's own website, filing, or its own acquisition press release) · `Press-derived` (trade press / wire / adviser tombstone) · `Estimated` (computed here).

**Domain rule applied throughout:** a domain cell is populated **only** where I fetched that domain and the returned page identified itself as that business, or where the platform's own site hyperlinked it. **Empty means I could not verify it, not that none exists.** I tested several candidate domains that failed DNS resolution or returned an unrelated business; those are recorded in `## What I could not verify` and are **deliberately absent** from the tables.

**Headline counts:**
- **22 platforms** for which a brand roster was established (≥1 verified operating brand).
- **≈370 distinct operating brand tokens** captured (exact consolidated list in Part 3).
- **Pye-Barker alone accounts for ≈204** of them.

---

# PART 0 — THE THREE FINDINGS THAT CHANGE HOW THE MATCHER SHOULD BE BUILT

### 0.1 Two of the three "unidentified" APi Q1-2026 acquisitions are now identified — and **both are non-US**

A prior stream flagged "Wtech" and "Onyx" as unidentifiable. Both are now resolved from APi's own completion releases:

| CEO's shorthand | Full name | Geography | Revenue | Close date | Basis |
|---|---|---|---|---|---|
| "Onyx" | **Onyx-Fire Protection Services, Inc.** | **Canada** | *"approximately $190 million in annual revenue"* | 8 June 2026 | `Disclosed` |
| "Wtech" | **WTech Fire Group** | **Europe** | *"approximately $175 million in annual revenue"* | 1 July 2026 | `Disclosed` |

Exact wording — Onyx: *"a leading inspection-first provider of fire and life safety services in Canada."* WTech: *"a leading provider of fire sprinkler, suppression and detection solutions across Europe."*

**Buy-side consequence:** of the *">$1 billion across these three acquisitions"* APi described, **only CertaSite is a US business.** The other two do not remove a single US target from the board. Any read of "APi spent $1bn consolidating the US market in Q1 2026" is wrong. Neither WTech nor Onyx-Fire should be loaded into a **US** target-screening register except as a negative filter for cross-border sourcing.

### 0.2 Sciens has rebranded its entire acquired estate to `Sciens <LegacyToken> Division` — a stale list will miss all 27

Sciens did not retire the legacy names; it **prefixed** them. So "W.W. Gay Fire" now trades as *"Sciens W.W. Gay Fire Division"*. A target list carrying **W.W. Gay Fire, Bass United, ARK Systems, Mammoth, Anchor Fire, Cen-Cal Fire Systems, Standard Electronics, Time & Alarm, Alarmtechs, Christian Cable, Absolute Protective, Classic Protection, Educational Electronics, LS Systems, Elite Fire, West Fire, Southern Fire, Empire, Sabah, Western Fire Protection, FSI, FS&S, ESS, OSI, WSA** as independents is wrong on **27 counts from one platform**. This is the single densest rebrand-blindness risk in the file.

### 0.3 Pye-Barker's own "Our Family of Brands" page lists **144** brands — and many are generic enough to false-match honest independents

The roster includes tokens like **Alpha Fire, Integrity Fire, Reliable Fire, Triangle Fire, Fire Pro, Empire Fire & Safety, Certified Fire Protection, Commercial Fire Equipment, American Fire & Safety, Automatic Fire Sprinkler, General Sprinkler Corporation, Allstate Fire Protection, ASG, LPS, HEIM, Vanwell**. Name-matching on these will drag in unrelated independents nationwide. They must be resolved by **domain**, not name. Full do-not-name-match list in Part 4.

---

# PART 1 — TIER 1 PLATFORMS

## 1.1 APi Group Corporation (NYSE: APG) — Safety Services

**Holdco:** APi Group Corporation · **Sponsor:** public company (NYSE: APG) · **Corporate domain:** apigroupinc.com (**not fetchable** — see note)

> ⚠ **Sourcing constraint, stated plainly.** `apigroupinc.com/robots.txt` explicitly disallows **ClaudeBot** (alongside GPTBot, CCBot, Google-Extended, Applebot-Extended, Bytespider, Amazonbot, meta-externalagent). I therefore **could not retrieve APi's own "Our Companies" or "Company Locations" pages.** Every APi brand below is verified from a **subsidiary's own website** or an **APi press release** instead. APi's US operating-brand roster is very likely **larger than the five below**; this is a known, unclosed gap, not a completed roster.

| Operating brand | Domain | States / metros where it trades | Basis | Source |
|---|---|---|---|---|
| **Chubb Fire & Security** | chubbfs.com | **Non-US.** 17 countries: UK, Ireland, France, Germany, Austria, Belgium, Spain, Netherlands, Switzerland, Canada, Australia, NZ, China, Hong Kong SAR, Macau SAR, India, Singapore, UAE (Dubai). *"200+ branches, 12,000+ staff, 20+ monitoring centres"* | `Disclosed` | chubbfs.com |
| **Western States Fire Protection** | wsfp.com | *"More Than 45 Locations Across the Western U.S."* Site states verbatim: *"Western States Fire Protection is a subsidiary of APi Group"* | `Disclosed` | wsfp.com |
| **CertaSite** | certasitepro.com | **17 locations:** Indianapolis IN (HQ), Lafayette IN, Akron OH, Columbus OH, Dayton OH, Toledo OH, Alpena MI, Ann Arbor MI, Detroit MI, Grand Rapids MI, Kalamazoo MI, Davenport IA, Milwaukee WI, Pittsburgh PA, Rimersburg PA, St. Louis MO | `Disclosed` | certasitepro.com/locations |
| **Onyx-Fire Protection Services, Inc.** | | **Canada** — provinces/cities not stated in the release | `Disclosed` | Businesswire 9 Jun 2026 |
| **WTech Fire Group** | | **Europe** — countries not stated in the release | `Disclosed` | Businesswire 2 Jul 2026 |

**Chubb sub-brand named on its own site:** *Chubb visiON+* (a service/product line, not an acquisition-target-relevant trading name).

**Register handling:**
- **Chubb** — `DOMAIN-ONLY`. "Chubb" is overwhelmingly the **insurance** group (Chubb Limited, NYSE: CB) in US name data. A US business named "Chubb" is almost certainly insurance-related, **not** APi. Never name-match.
- **CertaSite** — safe to name-match; distinctive token; note the domain is **certasitepro.com**, which is not the obvious construction.
- **Western States Fire Protection** — safe to name-match on the **full string**. See collision §4.2 with Sciens' *Western Fire Protection Division*.
- **Onyx** — `DO-NOT-NAME-MATCH` as a bare token; extremely common commercial name. Match only on the full string *"Onyx-Fire"*.

## 1.2 Pye-Barker Fire & Safety — the largest brand roster in the industry

**Holdco:** Pye-Barker Fire & Safety · **Sponsor:** (see stream 03) · **Domain: pyebarkerfs.com**

> **Domain note, load-bearing:** `pyebarkerfire.com` **302-redirects to `pyebarkerfs.com`**. Both should be in the register as Pye-Barker. Verified by fetch, 29 Jul 2026.

**Scale, from the company's own locations page (`Disclosed`):** *"253 Locations to Help You"* across **47 states**. The location sitemap enumerates **256 location URLs**.

### 1.2a The canonical roster — 144 brands from pyebarkerfs.com/our-family-of-brands/

All `Disclosed`, source: https://pyebarkerfs.com/our-family-of-brands/ (retrieved 29 Jul 2026). No per-brand domains are published on that page — the brands are displayed as logos without hyperlinks — so **domain cells are empty for all 144 and that is a real gap**, not an oversight.

A-1 Fire & Security Equipment · A-1 Security Systems · A1 Sprinkler & Systems Integration · AAA Fire & Safety Equipment · AAA Fire Safety & Alarm, Inc. · AAC United Fire & Safety Equipment, Inc. · ABC Burglar Alarm System · Absolute Fire Protection · AC Daughtry · Acadiana Security Plus · Accurate Fire · ACE Fire Equipment · Adroit Systems Co. · ADS Systems · Advanced Engineered Systems · Aegis Fire Systems · Alarm Service, Inc. · Alarm Specialist · Alarm Specialists · Alarmguard Security, Inc. · AlarmTec Systems · AlarmTech · Allstar Fire Protection · Allstate Fire Protection · Alpha Fire · Alpine Fire and Safety Systems · Altronics Security Systems · American Fire & Safety · American Fire & Safety Supply Co. · Amherst Alarm · AMS Connect · ASG · Automatic Fire Sprinkler · B & R Fire & Safety · B Safe Security · Basic Fire Protection, Inc. · Bates Security · Bender & Modlin · Bevan Security Systems · Brightspeed Security Systems · Briscoe Protective · Certified Fire Protection · Choice Security Services · Commercial Fire Equipment · Complete Security Systems, Inc. · Comtron · ComTronix · CopperState Fire Protection · Cox Fire Protection · CRIMPCO · DaBo Fire · DACSIS · Dragon Fire Systems · Empire Fire & Safety · Encore Technology Solutions · FESSCO · Fire Alarm Services, Inc. · Fire Control Electrical Systems · Fire Equipment Services · Fire Pro · First Trust Alarm Company · Frazier Fire · Fyr-Fyters · General Sprinkler Corporation · Greer Supply Co · Gulf Coast Fire & Safety · Haines City Fire and Security Service, Inc. · Haines City Fire Extinguisher Service, Inc. · HEIM · Hernando Fire · Industrial Fire and Safety Equipment · Industrial Fire Systems, Inc. · Innovative Electronic Control Systems · Integrated Security Group · Integrity Fire · Iowa Fire Equipment Co. · IT&M Division · Justice Fire & Safety · Kansas Fire Equipment Co. · Keystone Fire Protection Co. · Koetter Fire Protection · Legacy Fire Services · Life Safety Designs · Link Interactive · LPS · Marquee Fire Protection · Matson Alarm · Maximum Security · Meadowlands Electronics · Metro Fire & Safety · Mitec · Moon Security Services, Inc. · Mountain Alarm · MS Fire Protection · Naples Fire Protection · Nardini Fire Equipment · Next Protection · Odyssey Fire Protection, LLC · Pacific Fire & Security Inc. · Paradise Fire Protection · Peak Alarm · Phoenix Fire Systems · Pro Fire Extinguishment · Protect Alarms · Pyrotech · Rapid Fire Protection Group · Reliable Fire · S&S Sprinkler · Scott Fire Protection · SDG Security & Fire · Seacoast Security · Secure Pacific · Security On-line · Security Solutions Inc. · Sentry Watch · Shiver Security · Sonitrol of Charleston & The Midlands · Sonitrol of Louisville & Western Kentucky · Sonitrol of New England · Sonitrol of SW Ohio · Sonitrol of Upstate South Carolina · Sonitrol Pacific · South Carolina Safety Company · Southern Burglar Alarm Co. · Strickland Fire Protection · Survivor Fire & Safety · T&S Fire and Security, Inc. · Tampa Bay Fire Equipment · Tanner Fire · The Hartline Company · Total LifeSafety Corporation · Treasure Valley Fire Protection, Inc. · Triangle Fire · United Alarm Service Inc. · United Automation · United Fire Protection · Universal Fire Equipment, Inc. · USA Security Services, Inc. · Utah Fire Equipment · Vanguard Fire & Security · Vanwell · Vermillion Systems Security Solutions · WSE Fire & Security Systems · Yarnell Security Systems

### 1.2b Additional trading names found on Pye-Barker location pages but **absent from the 144-brand page**

These appear as the live trading name or as *"formerly X"* on `pyebarkerfs.com/locations/…`. All `Disclosed`, company site, retrieved 29 Jul 2026. **≈60 additional tokens** — the brands page is not exhaustive, which matters because a register built only from it would still miss these.

| Brand | Where it trades | Note |
|---|---|---|
| Arrow Fire Protection | Fremont CA | shown paired with Automatic Fire Sprinklers |
| ASCI Security | Huntington Beach CA, Irvine CA | |
| United Fire Solutions | Murrieta CA | distinct from *United Fire Protection* |
| Hometech Systems | Riverbank CA | |
| Extreme Fire Protection | Parker CO | |
| Superior Fire Protection | Montrose CO | |
| Homeguard | Brookfield CT | paired with United Alarm |
| Flagship Fire | Palmetto FL | |
| Universal Fire Systems | Tampa FL | variant of *Universal Fire Equipment* |
| Southeastern System Services | Douglasville GA | |
| Lifeline Fire & Security | Kapolei HI | |
| Fire Sentry Systems | Boise/Nampa ID | |
| Mountain Fire Sprinklers | Hailey ID | |
| Alarm Star | Hailey ID | |
| Fire Science Techniques | Monee IL | |
| Garden City Fire | Garden City KS | |
| Modern Systems | Bowling Green / Lexington / Somerset KY | |
| PRO Security & Fire | Bowling Green KY | distinct from *Fire Pro* |
| CARE Security | Louisville KY | |
| American Fire Systems | Baton Rouge LA | distinct from *American Fire & Safety* |
| Sound and Communication Systems | Lafayette LA | |
| Black Bear Security | Newport ME | |
| Argus Security | Baltimore MD | |
| Fire Protection Products Inc. | Cumberland MD, Hagerstown MD | |
| Fire-X Sales and Service Corp. | Hagerstown MD | |
| Alarm Engineering | Salisbury MD | |
| Delmarva Time & Control | Salisbury MD | |
| Alarms of Berkshire County | Pittsfield MA | |
| FASST Fire Extinguishers | Black Eagle MT | |
| Nebraska Safety and Fire Equipment | Gering / Kearney / North Platte NE | |
| Bamford, Inc. | Kearney NE | |
| Red E Fire | Las Vegas NV | |
| APS Corporation | Branchburg NJ | |
| Systems Design Group | Flemington NJ | |
| First Guard | Montville NJ | |
| S.E.M. Security Services | Paramus NJ | |
| Jersey Fire Protection | West Deptford NJ | |
| Lowitt Alarms & Security Systems | Hicksville NY | |
| Sonitrol of the Carolinas | Charlotte NC, Greer SC | variant |
| Sonitrol South Carolina | Charleston SC, Columbia SC | variant |
| Cincinnati Alarms | Dayton OH | |
| OK SEE Security Trailers | Choctaw OK | |
| Alcom Security Systems | Midwest City OK | |
| The Alarm Group | Oklahoma City OK | |
| Northwest Fire Suppression | Beaverton OR, Medford OR | |
| Knight Security / Knight Security Systems | Ephrata / Lancaster / Harrisburg PA | |
| Invision | King of Prussia PA | |
| Philadelphia Detection Systems | King of Prussia PA | |
| Low Volt Ninja | King of Prussia PA | |
| Priority One Security | Greenville / Orangeburg / Williamston SC | |
| Excel Fire Sprinkler Company | Roebuck SC | |
| Door Security Products | Rapid City SD | |
| Coastal Sprinkler | Beaumont TX | |
| FSD Protection | Houston TX | |
| OMNI Fire and Security Systems | Houston TX | |
| Texas Homeland Security and Sound | Lubbock TX | |
| AAA Fire Extinguisher | Lubbock TX | variant |
| TriStar Commercial | Pflugerville TX | |
| Fortress Security | Grapevine TX | has own page pyebarkerfs.com/fortress-security |
| Hitek | Orem UT | shown as *formerly Mountain Alarm \| Hitek* |
| Fire Protection Equipment Co | Richmond VA | shown as *formerly* |
| Moore Fire Protection | Bellevue WA | shown as *formerly* |
| Cascade Fire & Security | Kent WA | trades as *"Cascade Fire & Security, A Pye-Barker Fire & Safety Company"* |
| Evco Integrated | Spokane WA | shown as *formerly* |

**Rebrand pattern — critical for stale lists.** Pye-Barker location pages use two distinct formulas, and they mean different things:
1. *"Pye-Barker Fire & Safety, **formerly** Moore Fire Protection"* → the legacy sign is **down**. The business now trades as Pye-Barker. A target list carrying "Moore Fire Protection" is stale **and** the business is owned.
2. *"Cascade Fire & Security, **A Pye-Barker Fire & Safety Company**"* / *"Phoenix Fire Systems, A Pye-Barker Fire & Safety Company"* → the legacy sign is **still up**. Name-matching still works for these.

Both categories are equally "already owned". The register must not treat category 1 as available.

## 1.3 Summit Companies / SFP Holding

**Holdco:** SFP Holding, Inc. (Mendota Heights, MN) · **Sponsor:** BlackRock LTPC · **Domain: summitcompanies.com**

| Operating brand | Domain | States / metros | Basis | Source |
|---|---|---|---|---|
| **Summit Fire Protection** | summitfire.com | AZ (Phoenix, Tucson), CO (Colorado Springs, Denver, Fort Collins), IA (Des Moines, Iowa City, Mason City, Ottumwa, Sioux City), MI (Kalamazoo, Luna Pier, Marquette, Mount Pleasant, Muskegon, New Hudson, Owosso, Saginaw, Traverse City), MN (Duluth, Rochester, St. Cloud, St Paul — Corporate), NE (Lincoln, Omaha), ND (Fargo, Williston), SD (Rapid City, Sioux Falls), WI (Eau Claire, Green Bay, La Crosse, Madison, Stevens Point) | `Disclosed` | summitfire.com/branch-locations |
| **Summit Fire & Security** | summitfiresecurity.com | **27 states, 130+ branches.** Corporate: Reno NV. Specialised branches: Fort Lauderdale FL (Marine); Portland OR and Seattle WA (Extinguishers Only) | `Disclosed` | summitfiresecurity.com/branch-locations |
| **Summit Fire Consulting** | summitfireconsulting.com | national — consulting & engineering | `Disclosed` | summitcompanies.com/locations |
| **Summit Fire National Accounts** | summitfirenationalaccounts.com | national accounts | `Disclosed` | summitcompanies.com/locations |
| **Protegis Fire & Safety** | | absorbed into Summit Fire & Security (see stream 04 §2.8) | `Press-derived` | stream 04 |
| **Performance Systems Integration (PSI)** | | acquired Aug 2025; not shown as a live brand on Summit's own branch pages | `Press-derived` | stream 04 §2.10 |

**Register handling — this is a high-risk platform.**
- **"Summit" is a bare common noun and one of the most reused tokens in the industry.** `DO-NOT-NAME-MATCH` on "Summit" alone. Match only on the full strings *"Summit Fire Protection"*, *"Summit Fire & Security"*, *"Summit Fire Consulting"*, *"Summit Fire National Accounts"* — or on the four domains.
- **Neither Protegis nor PSI appears as a live trading brand** on Summit's own branch-locations pages. Both look fully absorbed. A target list still carrying **Protegis Fire & Safety** or **Performance Systems Integration** is stale in both cases.
- Summit's own locations page hyperlinks Summit Fire & Security via a **WP Engine staging host** (`summitfiresec.wpenginepowered.com`), not the production domain. The production domain **summitfiresecurity.com** is the one to register.

## 1.4 Everon (ex-ADT Commercial)

**Holdco:** Everon · **Sponsor:** GTCR · **Domain: everonsolutions.com**

| Operating brand | Domain | States / metros | Basis | Source |
|---|---|---|---|---|
| **Everon** (styled *Everon™*) | everonsolutions.com | *"over 100 office locations, coast to coast"*; *"over 5,000 employees… two dedicated monitoring and operations centers… more than 300,000 customer locations"*. Branch list spans Alabama to Wisconsin | `Disclosed` | everonsolutions.com/about/company-information/locations |
| **NewTech Systems** | | **Retained legacy nameplate.** Ashland KY, Lexington KY, Groveport OH, Bridgeville/Washington PA, Dunbar WV | `Disclosed` | same page |

**Former name: ADT Commercial.** A stale target list may carry ADT Commercial branches as ADT; they are Everon and have been since the rebrand. Everon's own site also states it *"acquired the B2B segments of the multifamily business from ADT"* — so **ADT Multifamily** is likewise now Everon.

**Register handling:** **NewTech Systems** is the one Everon token that will actually appear in a target's business name — it is the only sub-brand Everon has preserved. **"Everon"** itself is distinctive and safe to name-match. **Do not** name-match "ADT" to Everon: ADT Inc. still exists as a separate residential company.

## 1.5 Convergint

**Holdco:** Convergint · **Sponsor:** Ares / Leonard Green / Harvest · **Domain: convergint.com**

Convergint operates predominantly under the **single Convergint brand** across its technology centres; it does **not** publish a multi-brand roster. Named acquisitions from its own acquisitions page (`Disclosed`, convergint.com/who-we-are/acquisitions/, retrieved 29 Jul 2026):

| Acquired name | Region stated | Note |
|---|---|---|
| **JSC Systems** | Southeast US | headline: *"Convergint Acquires JSC Systems, Expanding Fire and Life Safety Capabilities Across the Southeast"* — the clearest fire-specific Convergint deal |
| **A+ Technology & Security Solutions** | Northeast US | |
| **Digital Visions** | Midwest US | |
| **Fiber Solutions** | Southeast US | |
| **Esscoe** | Midwest US | |
| **Nusource Financial** | not stated | |
| **Delco Security** | Canada | |
| **Helinick** | Eastern Europe | |
| **Ballou Fire Systems** | named via founder testimonial (Thomas C. Ballou) | fire-specific |
| **Simpson Security Systems** | named via founder testimonial (Keith Simpson) | |
| **Panavideo** | named via founder testimonial (Maxime Boivin) | |
| **MVP Tech** | Middle East, acquired 2022 | |

No per-brand domains are published. **Register handling:** the acquired names above are **absorbed**, not live brands — they are useful only as *stale-list* entries. **"Fiber Solutions"** and **"Digital Visions"** are `DO-NOT-NAME-MATCH` (generic).

## 1.6 Kidde Global Solutions (Lone Star, ex-Carrier)

**Holdco:** Kidde Global Solutions · **Sponsor:** Lone Star Funds · **Domain: kiddeglobalsolutions.com**

Brands with domains, all hyperlinked from Kidde Global Solutions' own site (`Disclosed`, retrieved 29 Jul 2026):

| Brand | Domain | Basis |
|---|---|---|
| **Kidde** | kidde.com | `Disclosed` |
| **Badger** | badgerfire.com | `Disclosed` |
| **Edwards Signaling** | edwards-signals.com | `Disclosed` |
| **FIREX** | kiddepro.com | `Disclosed` |
| **Edwards** | edwardsfiresafety.com | `Disclosed` |
| **Kidde Commercial** | kidde-esfire.com | `Disclosed` |
| **GST** | gst.com.cn | `Disclosed` |
| **Aritech** | firesecurityproducts.com | `Disclosed` |

> ⚠ **These are MANUFACTURER brands, not services businesses.** This matters more than it looks. A US business whose name contains **"Kidde"**, **"Badger"**, **"Edwards"** or **"Firex"** is overwhelmingly a **dealer, distributor or independent service company using the product**, not a Kidde-owned entity. Name-matching these into an "already owned" bucket will **wrongly suppress genuinely independent targets** — the exact opposite failure from the one this stream is chiefly guarding against, and just as damaging. **All eight are `DO-NOT-NAME-MATCH`; domain-only.**

## 1.7 Spectrum Safety Solutions (Sentinel, ex-Carrier)

**Holdco:** Spectrum Safety Solutions · **Sponsor:** Sentinel Capital Partners · **Domain: NOT VERIFIED — left empty deliberately**

> ⚠ **DOMAIN COLLISION — DO NOT USE `spectrumsafetysolutions.com`.** I fetched that domain on 29 Jul 2026. It resolves to an **unrelated fire-safety company serving the Indian market** — its client logos are Indian real-estate groups (M3M, Uppal Group, Ambience, Chintel's Group, ABW Group, Assotech Realty, Elan Group, Bestech, DUET, Radisson Blu) and the brands shown are *Fike*, *Fireco*, *DC* and *Signifire*, which are **not** the Carrier industrial-fire brands. **This is not the Sentinel Capital carve-out.** Populating the register with this domain would mislabel an entire unrelated business — precisely the "silently wrong" failure mode. **Left empty.**

I did not establish Spectrum Safety Solutions' operating brand roster or its true domain. Per the brief, **Marioff was sold to Inflexion on 31 Mar 2026** — carried forward from the brief, `Press-derived`, not independently verified here.

---

# PART 2 — TIER 2 PLATFORMS

## 2.1 AI Fire (Blackstone) — incl. Impact Fire

**Holdco:** AI Fire, LLC · **Sponsor:** Blackstone · **Domain: aifire.com**

| Operating brand | Domain | Role / geography | Basis | Source |
|---|---|---|---|---|
| **Impact Fire Services** | impactfireservices.com | *"self-perform"* arm. HQ 1 Chisholm Trail Rd, Suite 330, **Round Rock, TX 78681**. *"50+ locations across the country"* | `Disclosed` | aifire.com; impactfireservices.com |
| **Academy Fire Life Safety** (also *Academy Fire®*) | academyfire.com | *"national accounts"* arm. Own site: *"ACADEMY FIRE LIFE SAFETY® AND ITS SISTER COMPANY, IMPACT FIRE SERVICES"* | `Disclosed` | aifire.com; academyfire.com |
| **Kanske Fire Systems** | | Oklahoma — named as a recent acquisition on aifire.com | `Disclosed` | aifire.com |

**Note:** academyfire.com does **not** mention "AI Fire" anywhere — it describes Impact Fire only as a *"sister company"*. The AI Fire holdco name is therefore invisible at the operating level, which is exactly why a holdco-name register fails.

## 2.2 Marmic Fire & Safety (KKR)

**Holdco:** Marmic Fire & Safety · **Sponsor:** KKR · **Domain: marmicfire.com** · HQ Joplin, MO 64804

Marmic states *"over 30 companies having joined the Marmic family"* and *"over 50 Marmic locations"* with *"self-perform teams and local affiliates"* (`Disclosed`, marmicfire.com). **It publishes no list of acquired company names and no sub-brands.** Its locations page renders the branch list via an interactive map that did not yield text.

**This is a genuine roster gap on a KKR-backed platform with 30+ acquisitions.** Those 30+ legacy names are exactly the sort that sit unresolved on a target board. Recorded in `## What I could not verify`.

## 2.3 Sciens Building Solutions (Carlyle) — the `Sciens <Legacy> Division` estate

**Holdco:** Sciens Building Solutions · **Sponsor:** Carlyle · **Domain: sciensusa.com**

> **Domain note:** `sciensbuildingsolutions.com` **302-redirects to `sciensusa.com`**. Register both.

All 27 divisions below are `Disclosed`, source https://www.sciensusa.com/service-area-finder/all-locations/ (retrieved 29 Jul 2026). The **legacy token** column is the string a stale target list will carry.

| Division as it trades now | Legacy token | City, State |
|---|---|---|
| Sciens AV Communications Division | AV Communications | Apple Valley, CA |
| Sciens Standard Electronics Division | **Standard Electronics** | El Cajon, CA |
| Sciens Cen-Cal Fire Systems Division | **Cen-Cal Fire Systems** | Lodi, CA |
| Sciens Time & Alarm Division | **Time & Alarm** | Los Angeles, CA; Palm Springs, CA |
| Sciens Western Fire Protection Division | **Western Fire Protection** | Poway, CA |
| Sciens Sabah Division | **Sabah** | San Francisco, CA |
| Sciens Low Voltage Division | Low Voltage | Vista, CA |
| Sciens FSI Division | **FSI** | Clearwater, FL |
| Sciens W.W. Gay Fire Division | **W.W. Gay Fire** | Gainesville, FL; Jacksonville, FL |
| Sciens Empire Division | **Empire** | Miami, FL |
| Sciens Orlando Division | Orlando | Orlando, FL |
| Sciens Southern Fire Division | **Southern Fire** | Pembroke Pines, FL |
| Sciens WSA Division | **WSA** | Pompano Beach (North), FL |
| Sciens Bass United Division | **Bass United** | Pompano Beach (South), FL |
| Sciens Tampa Bay Division | Tampa Bay | St Petersburg / Tampa, FL |
| Sciens Educational Electronics Division | **Educational Electronics** | New Orleans, LA |
| Sciens LS Systems Division | **LS Systems** | Baltimore, MD; Alexandria, VA |
| Sciens ARK Systems Division | **ARK Systems** | Columbia, MD |
| Sciens Mammoth Division | **Mammoth** | Boston, MA; Hudson, NH |
| Sciens Elite Fire Division | **Elite Fire** | Detroit, MI |
| Sciens OSI Division | **OSI** | Hamilton Township, NJ |
| Sciens Absolute Protective Division | **Absolute Protective** | Piscataway, NJ |
| Sciens FS&S Division | **FS&S** | Albany, NY; New Windsor, NY |
| Sciens West Fire Division | **West Fire** | Rochester, NY |
| Sciens Eastern Time Division | **Eastern Time** | Allentown, PA |
| Sciens Anchor Fire Division | **Anchor Fire** | Perkiomenville, PA |
| Sciens ESS Division | **ESS** | Philadelphia, PA |
| Sciens Christian Cable Division | **Christian Cable** | Austin, TX; Haslet, TX |
| Sciens Classic Protection Division | **Classic Protection** | Houston, TX |
| Sciens Alarmtechs Division | **Alarmtechs** | Katy, TX |
| Sciens San Antonio Division | San Antonio | San Antonio, TX (×2) |

**Register handling:** match on the string **"Sciens"** (highly distinctive, safe) **and** on each legacy token as a *stale-list* entry. **FSI, OSI, ESS, WSA, FS&S, LS Systems, ARK, Empire, Mammoth, Sabah** are all `DO-NOT-NAME-MATCH` standalone — under-5-character acronyms or bare common nouns.

## 2.4 Pavion (Wind Point)

**Holdco:** Pavion Corp. · **Sponsor:** Wind Point Partners · **Domain: pavion.com**

| Operating brand | Domain | Note | Basis |
|---|---|---|---|
| **Pavion** | pavion.com | single primary brand | `Disclosed` |
| **ON-X** | | *"Proactive System Monitoring Service"* — a service brand, not an acquired trading name | `Disclosed` |

Pavion's locations page did not render its branch list or any sub-brands. Prior streams associate **AFA** with Pavion; **I could not verify AFA from Pavion's own site** and have not entered it. Recorded as unverified.

## 2.5 Altus Fire and Life Safety (Apax) — best per-brand domain disclosure in the file

**Holdco:** Altus Fire & Life Safety · **Sponsor:** Apax Partners · **Domain: altusfire.com**

Altus is the **only platform in this study that hyperlinks a domain for every member brand.** All `Disclosed`, source altusfire.com, retrieved 29 Jul 2026. Geography: Northeast US plus Georgia and Pennsylvania.

| Operating brand | Domain | Basis |
|---|---|---|
| **CFS NYC** | cfsnyc.com | `Disclosed` |
| **Alarm and Suppression** | alarmandsuppression.com | `Disclosed` |
| **Adcock Systems** (shown on site as *"Addock Systems"*, domain adcocksystems.com) | adcocksystems.com | `Disclosed` |
| **NEFS** | nefs.us | `Disclosed` |
| **Fire Systems Inc** | firesystemsinc.net | `Disclosed` |
| **Croker Fire Drill** | crokerfiredrill.com | `Disclosed` |
| **BK Systems Inc** | bksystemsinc.com | `Disclosed` |
| **CIA Alarm** | cialarm.com | `Disclosed` |
| **Facility Compliance** | facility-compliance.com | `Disclosed` |
| **Star Fire Protection** | starfireny.com | `Disclosed` |

> **Spelling conflict preserved, not silently corrected:** Altus's own page renders the brand text as **"Addock Systems"** while the hyperlink it publishes is **adcocksystems.com**. One of the two is a typo on Altus's site. I have not resolved which. **Register both spellings** — a target list may carry either.

**Register handling:** **NEFS**, **CIA Alarm**, **BK Systems**, **CFS NYC** are acronym/short tokens → `DO-NOT-NAME-MATCH`, domain-only. **Fire Systems Inc** is dangerously generic — there are many independents literally named "Fire Systems, Inc." → `DO-NOT-NAME-MATCH`, resolve on firesystemsinc.net only. **Star Fire Protection** trades on **starfireny.com** — note the domain does not match the brand string, so a domain-only matcher keyed on "starfireprotection" will miss it.

## 2.6 Zeus Fire and Security (Access Holdings)

**Holdco:** Zeus Fire and Security · **Sponsor:** Access Holdings · **Domain: zeusfireandsecurity.com**

14 member brands named on Zeus's own site (`Disclosed`, retrieved 29 Jul 2026). **No per-brand domains are published** — all domain cells empty.

Alert Alarm Hawaii · SMG Security · UAS (United Alarm Services) · Security Resources · Independent Alarm NJ · PASS · Martin Systems · Bayside Fire and Security · **ASG** · Gallaher · SEi · PM Alarms · SGTS, Inc. · ClearLine Networks

**Register handling — two live collisions inside this roster:**
- **ASG** — Zeus lists **ASG**; Pye-Barker's brands page **also** lists **ASG**. Same three-letter token, two different owners. `DO-NOT-NAME-MATCH` absolutely. See §4.2.
- **UAS / United Alarm Services** — collides with Pye-Barker's **United Alarm Service Inc.** (Brookfield CT). Near-identical strings, different owners. `DO-NOT-NAME-MATCH`.
- **PASS**, **SEi**, **SGTS**, **UAS** are all ≤4 characters → `DO-NOT-NAME-MATCH`.
- **Security Resources**, **Martin Systems**, **Independent Alarm NJ** are generic → domain-only.

## 2.7 VSC Fire & Security (Markel)

**Holdco:** VSC Fire & Security · **Sponsor:** Markel Group (permanent capital) · **Domain: vscfire.com**

| Operating brand | Domain | Note | Basis |
|---|---|---|---|
| **VSC Fire & Security** | vscfire.com | primary brand | `Disclosed` |
| **Arkansas Automatic Sprinkler** | | acquired; absorbed under VSC | `Disclosed` (vscfire.com) |
| **United Fire Suppression** | | acquired; absorbed under VSC | `Disclosed` (vscfire.com) |

Both acquired names are stale-list entries, not live brands. **"VSC"** is a 3-letter token → `DO-NOT-NAME-MATCH` standalone; match *"VSC Fire"* or the domain.

## 2.8 Telgian

**Holdco:** Telgian · **Domain: telgian.com**

| Operating brand | Domain | Note | Basis |
|---|---|---|---|
| **Telgian Engineering & Consulting** | | engineering, consulting, risk management | `Disclosed` |
| **Telgian Fire Safety** | | ITM — inspection, testing, repair | `Disclosed` |

Telgian is a **consulting/engineering** asset, not a route business (per stream 04). **"Telgian"** is a coined word → **safe to name-match**, one of the cleanest tokens in the register.

## 2.9 ORR Protection

**Holdco:** ORR Protection · **Sponsor:** not verified (stream 04 also failed to verify) · **Domain: orrprotection.com**

*"national fire protection services provider… across 50 states with 15 branches"* (`Disclosed`, orrprotection.com). CEO **Woodie Andrawos**, previously of **NMC (National Monitoring Center)**.

| Name | Note | Basis |
|---|---|---|
| **ORR Protection** | primary brand | `Disclosed` |
| **Mission Critical Fire Protection** | brand/positioning line | `Press-derived` (stream 04) |
| **Compass Fire Protection** | acquired Aug 2025; union sprinkler, Pacific Northwest | `Press-derived` (stream 04) |
| **Detection & Suppression International (DSI)** | acquired Oct 2024; Texas | `Press-derived` (stream 04) |

**"ORR"** is a 3-letter token and also a common surname → `DO-NOT-NAME-MATCH`; match *"ORR Protection"* or the domain.

## 2.10 Minimax Viking — Cosco / Firetrol (the western-US strategic)

**Holdco:** Minimax Viking · **Sponsor:** strategic, not PE (Gryphon Investors **exited in 2007** — see stream 03 §1.8 for the stale-attribution correction)

| Operating brand | Domain | States / metros | Basis |
|---|---|---|---|
| **COSCO Fire Protection** | coscofire.com | **CA:** Fresno, Los Angeles, Sacramento, San Diego, San Francisco, San Juan Capistrano · **WA:** Seattle, Spokane, Vancouver · **OR:** Vancouver · **CO:** Denver · **NV:** Las Vegas | `Disclosed` |
| **Cosco DAS** | coscodas.com | distributed antenna systems arm, hyperlinked from coscofire.com | `Disclosed` |
| **Firetrol Protection Systems, Inc.** | firetrol.net | site confirmed as Firetrol Protection Systems | `Disclosed` |

> **Ownership caveat, stated honestly:** neither coscofire.com nor firetrol.net states its owner. Firetrol's site promotes the *"Minimax MXOne high-performance firefighting turbine"*, which is **consistent with** Minimax Viking ownership but is **not a disclosure of ownership** — a distributor would also promote it. The Minimax Viking link is `Press-derived` via stream 03, **not** confirmed from either operating site.

**Collision warning:** **"Cosco"** collides hard with **Costco** (retail) and **COSCO Shipping** (Chinese state shipping group) in name data. `DO-NOT-NAME-MATCH`; domain-only. **"Firetrol"** additionally collides with **Firetrol Inc.** / Firetrol fire-pump controllers (a manufacturer lineage) — treat as domain-only.

## 2.11 Minuteman Security Technologies (Tenex)

**Holdco:** Minuteman Security Technologies, Inc. · **Sponsor:** Tenex Capital Management · **Domain: minutemanst.com**

| Name | Note | Basis |
|---|---|---|
| **Minuteman Security and Life Safety** | operating brand / dba | `Disclosed` |
| **Split Pine Technologies** | acquired | `Disclosed` |
| **Performance Link Technologies** | acquired | `Disclosed` |

*"a security & life safety technology integrator… since 1988… super-regional provider across Maine to Florida and beyond"* (`Disclosed`, minutemanst.com).

**"Minuteman"** collides with **Minuteman Press** (print franchise), **Minuteman International** (floor care) and numerous unrelated regional firms → `DO-NOT-NAME-MATCH`; match *"Minuteman Security"* or the domain.

## 2.12 Security 101 (Morgan Stanley Capital Partners)

**Holdco:** Security 101 · **Sponsor:** Morgan Stanley Capital Partners (Feb 2026) · **Domain: security101.com**

> ⚠ **SCOPE FINDING — consider excluding from a fire register.** I fetched security101.com on 29 Jul 2026 and **found no mention of fire or life safety services anywhere.** The site describes access control, video surveillance, intrusion detection and visitor management only. This corroborates stream 04's note that fire was **not mentioned** in the MSCP announcement, and its RMR-share figure of **6.1%** (*"pure integrator, negligible RMR"*).

Service sub-brands named (not acquisition targets): *SiteGuard 101™*, *Safe Learning 101™*, *SafeGuard 101™*, *Team101*.

**Register handling:** including Security 101 in a **fire** consolidator register risks suppressing security-only businesses that a fire buyer would never have bid for anyway — low cost — but it will not catch fire targets. Flag as **security-only, fire not evidenced**.

## 2.13 Fire Safety and Protection, LLC (FSP) — Sunny River

**Holdco:** Fire Safety and Protection, LLC · **Sponsor:** Sunny River Management · **Domain: firesp.com**

Offices published on firesp.com (`Disclosed`, retrieved 29 Jul 2026):
- **US:** Atlanta, Birmingham, Washington DC, Boston, Pensacola
- **Canada:** Brockville, Cambridge, London, Ottawa, Owen Sound, Peterborough, Toronto, Windsor

**Note the geography split:** FSP's published office list is **majority Canadian (8 of 13)**. Relevant to a US-only screen. The site has an "Acquisitions" nav item but **names no acquired companies**; no sub-brands established.

## 2.14 ASPYRE Fire & Life Safety (Percheron)

**Holdco:** ASPYRE Fire & Life Safety · **Sponsor:** Percheron Capital (launched 12 Nov 2025) · **Domain: aspyrefls.com**

Site confirmed as ASPYRE Fire & Life Safety and describes *"a one of a kind network of top-tier independent Fire and Life Safety companies across the U.S. and Canada"* (`Disclosed`). **It names no member companies and no locations.** Stream 03 likewise could not identify the unnamed "foundational" acquisition.

**This is the highest-value open gap in the file for a buy-side screen:** a brand-new platform actively buying, whose member roster is undisclosed. Any target in the Southern US could already be inside it.

## 2.15 The four "Guardian" entities — resolved

This is the disambiguation case named in the brief. **Four unrelated entities. Never name-match "Guardian".**

| # | Entity | Owner | Domain(s) | Geography | Basis |
|---|---|---|---|---|---|
| 1 | **Guardian Fire Services** | **Investcorp** (3 Dec 2025; from Northern Lakes Capital) | guardianfireholdings.com | Nashville TN HQ; **17 branches**; Southeast + Northeast | `Disclosed` (stream 03/04 primary sources) |
| 2 | **Guardian Fire Protection Services** | **Knox Lane** (Jan 2024) | guardianfireprotection.com; **ars-guardian.com** | Rockville MD HQ; **9 locations, 4 states**, Mid-Atlantic + Midwest; 24,000+ customers | `Disclosed` |
| 3 | **Guardian Protection** | **Armstrong Group** | | PA / WV / OH focus; SDM #10; FY revenue $214,411,000; RMR $12,762,000 | `Press-derived` |
| 4 | **Guardian Alarm** (Guardian Alarm Company) | independent | | SDM #13 | `Press-derived` |

**Critical operational note:** entity 2 publishes under **two** unrelated-looking domains — `guardianfireprotection.com` **and** `ars-guardian.com`. A domain-keyed matcher that only holds the first will miss every business trading on the second. Both must be in the register against the same owner.

**Add-on to entity 2:** *Harris Fire Protection* (acquired by Guardian Fire Protection Services, per Knox Lane's own release) — a stale-list entry.

**Rule: `Guardian` is `DO-NOT-NAME-MATCH` at maximum severity.** Four owners, plus an unknown number of honest independents nationwide using the word. Resolve **only** by domain.

## 2.16 National Fire & Safety (Highview Capital)

**Holdco:** National Fire & Safety · **Sponsor:** Highview Capital · **Domain: not verified**

Named add-on: **Elite Fire Protection Systems** (Businesswire, 16 Sep 2019). Stream 03 found ≥4 verified add-ons all clustered **Sep 2019 – Jan 2022** and none since.

> ⚠ **"National Fire & Safety" is close to a pure generic string.** Dozens of unrelated US independents trade under near-identical names. `DO-NOT-NAME-MATCH`. Because I could not verify a domain, **this platform is currently unmatchable by either method** — the worst state for a register entry. Flagged as a priority gap.
>
> Note also **Elite Fire Protection Systems** (Highview/NFS add-on) vs **Sciens Elite Fire Division** (Carlyle, Detroit MI) — two different "Elite Fire" businesses under two different sponsors. See §4.2.

## 2.17 Platforms where I established ownership context but **no brand roster**

| Platform | Sponsor | What I could not get |
|---|---|---|
| **Encore Fire Protection** | Permira (from LLCP, Mar 2025) | Domain unverified — the candidate I tested returned a robots.txt connect-timeout, which is **not** confirmation. 2,400 staff, 17 states, 70+ acquisitions (stream 03) — meaning **70+ legacy brand names are unaccounted for.** |
| **Relay Fire and Safety** | Riverside | Candidate domain **failed DNS resolution**. No roster. |
| **Marmic Fire & Safety** | KKR | Domain verified (marmicfire.com); **30+ acquired names undisclosed.** |
| **ASPYRE** | Percheron | Domain verified (aspyrefls.com); **member companies undisclosed.** |
| **National Fire & Safety** | Highview | Domain unverified; one add-on name only. |
| **Spectrum Safety Solutions** | Sentinel | Domain unverified (collision trap documented §1.7); roster unknown. |

---

# PART 3 — CONSOLIDATED BRAND TOKEN LIST

**Method:** every distinct operating brand, trading name or retained legacy nameplate captured above, marked `SAFE` (distinctive enough to name-match) or `DOMAIN-ONLY` (must be resolved by domain; name-matching will produce false positives against honest independents).

**Counts by platform:**

| Platform | Distinct brand tokens captured |
|---|---|
| Pye-Barker Fire & Safety | **≈204** (144 canonical + ≈60 location-derived) |
| Sciens Building Solutions | 31 (1 holdco + 30 divisions incl. duplicated cities) |
| Zeus Fire and Security | 15 (1 + 14 members) |
| Convergint | 13 (1 + 12 acquired) |
| Altus Fire & Life Safety | 12 (1 + 10 brands + 1 spelling variant) |
| Kidde Global Solutions | 9 (1 + 8 brands) |
| Summit Companies / SFP Holding | 7 |
| APi Group | 6 |
| ORR Protection | 4 |
| AI Fire | 4 |
| Guardian cluster (4 owners) | 5 (incl. Harris Fire Protection) |
| Minimax Viking (Cosco/Firetrol) | 4 |
| Minuteman Security Technologies | 4 |
| Telgian | 3 |
| VSC Fire & Security | 3 |
| Everon | 3 (incl. former name ADT Commercial) |
| Pavion | 2 |
| Security 101 | 1 |
| Fire Safety and Protection | 1 |
| ASPYRE | 1 |
| Marmic | 1 |
| National Fire & Safety | 2 |
| **Total distinct tokens** | **≈370** |

## 3.1 `SAFE` — distinctive enough to name-match

These are coined words, full multi-word strings, or surname+category constructions unlikely to collide:

APi Group · Chubb Fire & Security *(full string only)* · Western States Fire Protection *(full string)* · CertaSite · Onyx-Fire Protection Services *(full string)* · WTech Fire Group *(full string)* · Pye-Barker Fire & Safety · Summit Fire Protection *(full string)* · Summit Fire & Security *(full string)* · Summit Fire Consulting · Summit Fire National Accounts · Everon · NewTech Systems · Convergint · Sciens *(and every `Sciens … Division` string)* · Pavion · Altus Fire & Life Safety · Croker Fire Drill · Adcock Systems / Addock Systems · Zeus Fire and Security · Alert Alarm Hawaii · ClearLine Networks · Gallaher · Telgian · Telgian Engineering & Consulting · Telgian Fire Safety · ORR Protection *(full string)* · Marmic Fire & Safety · Impact Fire Services · Academy Fire Life Safety · Kanske Fire Systems · Minuteman Security Technologies *(full string)* · Split Pine Technologies · Performance Link Technologies · ASPYRE Fire & Life Safety · Fire Safety and Protection, LLC · Protegis Fire & Safety · Performance Systems Integration · Guardian Fire Services *(full string, but see §2.15)* · Guardian Fire Protection Services *(full string, but see §2.15)* · Koetter Fire Protection · Nardini Fire Equipment · Matson Alarm · Briscoe Protective · Bates Security · Acadiana Security Plus · CopperState Fire Protection · Strickland Fire Protection · Vanguard Fire & Security · Seacoast Security · Yarnell Security Systems · Altronics Security Systems · Brightspeed Security Systems · Fyr-Fyters · DaBo Fire · Pyrotech · CRIMPCO · DACSIS · FESSCO · Vermillion Systems Security Solutions · Odyssey Fire Protection · Treasure Valley Fire Protection · Bender & Modlin · The Hartline Company · AC Daughtry · Bevan Security Systems · Lowitt Alarms & Security Systems · Alarms of Berkshire County · Shiver Security · Frazier Fire · Hernando Fire · Naples Fire Protection · Marquee Fire Protection · Justice Fire & Safety · Moon Security Services · Low Volt Ninja · OK SEE Security Trailers · Cascade Fire & Security · Evco Integrated · Bass United · W.W. Gay Fire · Cen-Cal Fire Systems · Alarmtechs · Christian Cable · Sabah · Anchor Fire · ARK Systems

## 3.2 `DOMAIN-ONLY` — do not name-match, with reason

| Token | Reason | Owner(s) |
|---|---|---|
| **Guardian** | **4 unrelated owners** + many independents | Investcorp / Knox Lane / Armstrong / independent |
| **Summit** | bare common noun; heavily reused industry-wide | SFP Holding + others |
| **ASG** | 3 chars; **used by two platforms** | Zeus **and** Pye-Barker |
| **UAS** / **United Alarm Services** | 3 chars; collides with Pye-Barker's *United Alarm Service Inc.* | Zeus / Pye-Barker |
| **United** (any bare use) | bare common word | Pye-Barker (United Fire Protection, United Fire Solutions, United Automation, United Alarm), Zeus (UAS), VSC (United Fire Suppression) |
| **American** (any bare use) | bare common word | Pye-Barker (American Fire & Safety, American Fire & Safety Supply, American Fire Systems) |
| **Empire** | bare common noun; **two owners** | Sciens (Miami FL) **and** Pye-Barker (Empire Fire & Safety) |
| **Elite Fire** | **two owners** | Sciens (Detroit MI) **and** Highview/NFS (Elite Fire Protection Systems) |
| **Onyx** | very common commercial name | APi (Canada) |
| **Chubb** | dominated by Chubb Limited (insurance, NYSE: CB) | APi |
| **Kidde**, **Badger**, **Edwards**, **FIREX**, **GST**, **Aritech** | **manufacturer brands** — matches will be dealers/distributors, not owned entities | Kidde Global Solutions |
| **Cosco** | collides with Costco and COSCO Shipping | Minimax Viking |
| **Firetrol** | collides with Firetrol fire-pump controller lineage | Minimax Viking |
| **Minuteman** | Minuteman Press, Minuteman International | Tenex |
| **ORR** | 3 chars; common surname | ORR Protection |
| **VSC** | 3 chars | Markel |
| **NEFS**, **FSI**, **OSI**, **ESS**, **WSA**, **FS&S**, **LPS**, **ASG**, **HEIM**, **SEi**, **PASS**, **SGTS**, **DC** | ≤4-character acronyms | various |
| **Mammoth**, **Sabah**, **Empire**, **West Fire**, **Southern Fire**, **Western Fire Protection**, **Standard Electronics**, **Time & Alarm**, **Eastern Time**, **Educational Electronics**, **Classic Protection**, **Absolute Protective**, **LS Systems** | bare common nouns / generic descriptors | Sciens |
| **Fire Systems Inc** | many independents literally share this name | Altus |
| **Star Fire Protection** | generic; **domain is starfireny.com**, not the brand string | Altus |
| **CIA Alarm**, **BK Systems**, **CFS NYC** | acronym-led | Altus |
| **Alpha Fire**, **Integrity Fire**, **Reliable Fire**, **Triangle Fire**, **Fire Pro**, **PRO Security & Fire**, **Certified Fire Protection**, **Commercial Fire Equipment**, **Automatic Fire Sprinkler**, **General Sprinkler Corporation**, **Allstate Fire Protection**, **Vanwell**, **Comtron**, **Modern Systems**, **First Guard**, **Invision**, **Maximum Security**, **Security Solutions Inc.**, **Alarm Service Inc.**, **Alarm Specialist(s)**, **Fire Alarm Services Inc.**, **Fire Equipment Services**, **Advanced Engineered Systems**, **Innovative Electronic Control Systems**, **Industrial Fire Systems**, **Superior Fire Protection**, **Extreme Fire Protection**, **Priority One Security**, **Total LifeSafety** | generic descriptors that will false-match honest independents nationwide | Pye-Barker |
| **Allstate Fire Protection** | additionally collides with **Allstate** (insurance) | Pye-Barker |
| **Reliable Fire** | additionally collides with **Reliable Automatic Sprinkler Co.** (unrelated manufacturer) | Pye-Barker |
| **Sonitrol** (all variants) | **Sonitrol is a franchise network** — Pye-Barker owns *some* Sonitrol franchises (Charleston & The Midlands, Louisville & Western KY, New England, SW Ohio, Upstate SC, Pacific, the Carolinas, South Carolina) but **not all Sonitrol dealers nationwide**. Name-matching "Sonitrol" will wrongly capture independent franchisees | Pye-Barker (partial) |
| **National Fire & Safety** | near-pure generic; dozens of unrelated independents | Highview |
| **Fiber Solutions**, **Digital Visions**, **Security Resources**, **Martin Systems** | generic | Convergint / Zeus |
| **Link Interactive** | generic; consumer-DIY-alarm lineage | Pye-Barker |

---

# PART 4 — COLLISIONS AND REBRANDS

## 4.1 Same-token collisions **between two owned platforms** (both sides named)

| Token | Owner A | Owner B | Resolution |
|---|---|---|---|
| **ASG** | Zeus Fire and Security (Access Holdings) | Pye-Barker Fire & Safety | domain only |
| **United Alarm Service(s)** | Pye-Barker — *United Alarm Service Inc.*, Brookfield CT | Zeus — *UAS (United Alarm Services)* | domain only |
| **Empire** | Sciens — *Sciens Empire Division*, Miami FL | Pye-Barker — *Empire Fire & Safety* | domain / geography |
| **Elite Fire** | Sciens — *Sciens Elite Fire Division*, Detroit MI | Highview/NFS — *Elite Fire Protection Systems* | geography |
| **Guardian** | Investcorp; Knox Lane | Armstrong Group; independent (Guardian Alarm) | **4-way** — domain only |
| **Western … Fire Protection** | APi — *Western States Fire Protection* (45+ western US locations) | Sciens — *Sciens Western Fire Protection Division*, Poway CA | **full string** required |
| **Summit** | SFP Holding / BlackRock LTPC | reused widely; stream 04 warns against confusion with other Summit-branded entities | full string / domain |
| **Universal Fire** | Pye-Barker — *Universal Fire Equipment, Inc.* | Pye-Barker — *Universal Fire Systems*, Tampa FL | same owner, two variants — register both |
| **Fire Pro / PRO Security & Fire** | Pye-Barker (both) | — | same owner, two variants — register both |
| **AAA Fire …** | Pye-Barker — *AAA Fire & Safety Equipment*, *AAA Fire Safety & Alarm*, *AAA Fire Extinguisher* | — | three variants, same owner |
| **Spectrum Safety Solutions** | Sentinel Capital carve-out (US, domain unknown) | **unrelated India-market firm at spectrumsafetysolutions.com** | **do not use that domain** |

## 4.2 Recently rebranded — the **former** name a stale list will still carry

| Former name | Now trades as | Owner |
|---|---|---|
| **ADT Commercial** | **Everon** | GTCR |
| **ADT Multifamily** (B2B segments) | **Everon** | GTCR |
| Moore Fire Protection (Bellevue WA) | Pye-Barker Fire & Safety | Pye-Barker |
| Pacific Fire & Security (Kirkland WA) | Pye-Barker Fire & Safety | Pye-Barker |
| Secure Pacific / Sonitrol Pacific / Evco Integrated / Moon Security (Spokane WA) | Pye-Barker Fire & Safety | Pye-Barker |
| Sonitrol Pacific / Secure Pacific (Everett WA) | Pye-Barker Fire & Safety | Pye-Barker |
| Mountain Alarm / AAA Fire Safety & Alarm (Ogden UT) | Pye-Barker Fire & Safety | Pye-Barker |
| Mountain Alarm / Hitek (Orem UT) | Pye-Barker Fire & Safety | Pye-Barker |
| Rapid Fire Protection (Salt Lake City UT) | Pye-Barker Fire & Safety | Pye-Barker |
| PEAK Alarm (Salt Lake City UT) | Pye-Barker Fire & Safety | Pye-Barker |
| Fire Protection Equipment Co (Richmond VA) | Pye-Barker Fire & Safety | Pye-Barker |
| **All 30 Sciens legacy names** (W.W. Gay Fire, Bass United, ARK Systems, Mammoth, Anchor Fire, etc.) | `Sciens <Legacy> Division` | Carlyle |
| **Protegis Fire & Safety** | absorbed into Summit Fire & Security | BlackRock LTPC |
| **Performance Systems Integration (PSI)** | absorbed into Summit Fire & Security | BlackRock LTPC |
| Arkansas Automatic Sprinkler; United Fire Suppression | VSC Fire & Security | Markel |
| Harris Fire Protection | Guardian Fire Protection Services | Knox Lane |
| Compass Fire Protection; Detection & Suppression International (DSI) | ORR Protection | — |
| Split Pine Technologies; Performance Link Technologies | Minuteman Security and Life Safety | Tenex |
| Kanske Fire Systems | Impact Fire / AI Fire | Blackstone |
| JSC Systems; Ballou Fire Systems; Esscoe; A+ Technology & Security Solutions; Digital Visions; Fiber Solutions; Simpson Security Systems; Delco Security; Panavideo; MVP Tech; Nusource Financial; Helinick | Convergint | Ares / Leonard Green / Harvest |

## 4.3 Domain-side traps

| Trap | Detail |
|---|---|
| `pyebarkerfire.com` → `pyebarkerfs.com` | 302 redirect; **register both** |
| `sciensbuildingsolutions.com` → `sciensusa.com` | 302 redirect; **register both** |
| Guardian Fire Protection Services | publishes on **two** domains: `guardianfireprotection.com` **and** `ars-guardian.com` |
| CertaSite | domain is **certasitepro.com**, not the obvious construction |
| Star Fire Protection (Altus) | domain is **starfireny.com** — brand string absent from domain |
| Summit Fire & Security | Summit's own site links a **WP Engine staging host**; production domain is **summitfiresecurity.com** |
| `spectrumsafetysolutions.com` | **NOT** the Sentinel carve-out — unrelated India-market business |
| `apigroupinc.com` | robots.txt **blocks ClaudeBot** — brand roster not retrievable by this method |

---

## Sources

All retrieved **29 July 2026**.

**Platform primary sites**
1. Pye-Barker Fire & Safety, "Our Family of Brands" — https://pyebarkerfs.com/our-family-of-brands/
2. Pye-Barker Fire & Safety, Locations — https://pyebarkerfs.com/locations
3. Pye-Barker Fire & Safety, Acquisitions — https://pyebarkerfs.com/about-us/acquisitions/
4. Pye-Barker location sitemap (256 URLs) — https://pyebarkerfs.com/pye_location-sitemap.xml
5. Pye-Barker metro sitemap — https://pyebarkerfs.com/pye_metro-sitemap.xml
6. Pye-Barker page sitemap — https://pyebarkerfs.com/page-sitemap.xml
7. Pye-Barker, Seattle WA locations — https://pyebarkerfs.com/locations/seattle-wa/
8. Pye-Barker, Salt Lake City UT locations — https://pyebarkerfs.com/locations/salt-lake-city-ut/
9. Pye-Barker, Richmond VA — https://pyebarkerfs.com/locations/richmond-va/
10. Pye-Barker, Menomonee Falls WI — https://pyebarkerfs.com/locations/menomonee-falls-wi/
11. Pye-Barker redirect check — https://www.pyebarkerfire.com/locations/ (302 → pyebarkerfs.com/locations)
12. Western States Fire Protection — https://www.wsfp.com/
13. Chubb Fire & Security — https://www.chubbfs.com/
14. CertaSite locations — https://certasitepro.com/locations/
15. Summit Companies locations — https://summitcompanies.com/locations/
16. Summit Fire Protection branch locations — https://summitfire.com/branch-locations/
17. Summit Fire & Security branch locations — https://summitfiresecurity.com/branch-locations/
18. Everon — https://www.everonsolutions.com/
19. Everon locations — https://www.everonsolutions.com/about/company-information/locations
20. Convergint, About — https://www.convergint.com/about-us/
21. Convergint, Acquisitions — https://www.convergint.com/who-we-are/acquisitions/
22. Kidde Global Solutions — https://www.kiddeglobalsolutions.com/
23. AI Fire — https://www.aifire.com/
24. Academy Fire Life Safety — https://academyfire.com/
25. Impact Fire Services, Contact — https://impactfireservices.com/contact-us/
26. Marmic Fire & Safety — https://www.marmicfire.com/
27. Marmic Fire & Safety locations — https://www.marmicfire.com/locations/
28. Sciens Building Solutions — https://www.sciensbuildingsolutions.com/ (302 → sciensusa.com)
29. Sciens USA — https://www.sciensusa.com/
30. Sciens USA, all locations — https://www.sciensusa.com/service-area-finder/all-locations/
31. Pavion — https://pavion.com/
32. Pavion locations — https://pavion.com/about-pavion/locations/
33. Altus Fire & Life Safety — https://altusfire.com/
34. Zeus Fire and Security — https://zeusfireandsecurity.com/
35. VSC Fire & Security — https://www.vscfire.com/
36. Telgian — https://www.telgian.com/
37. ORR Protection — https://www.orrprotection.com/
38. COSCO Fire Protection — https://www.coscofire.com/
39. Firetrol Protection Systems — https://www.firetrol.net/
40. Minuteman Security Technologies — https://minutemanst.com/
41. Security 101 — https://www.security101.com/
42. Fire Safety and Protection (FSP) — https://firesp.com/
43. ASPYRE Fire & Life Safety — https://aspyrefls.com/
44. "Spectrum Safety Solutions" domain collision check — https://www.spectrumsafetysolutions.com/ (**unrelated India-market business**)
45. APi Group robots.txt (ClaudeBot disallowed) — https://www.apigroupinc.com/robots.txt

**Acquisition press releases**
46. Businesswire, "APi Group Completes Acquisition of Onyx-Fire Protection Services, Inc. And Updates 2026 Guidance," 9 Jun 2026 — https://www.businesswire.com/news/home/20260609553468/en/APi-Group-Completes-Acquisition-of-Onyx-Fire-Protection-Services-Inc.-And-Updates-2026-Guidance
47. Businesswire, "APi Group Completes the Acquisition of WTech Fire Group and Updates 2026 Guidance," 2 Jul 2026 — https://www.businesswire.com/news/home/20260702084305/en/APi-Group-Completes-the-Acquisition-of-WTech-Fire-Group-and-Updates-2026-Guidance

**Prior streams in this study (used for ownership context and for the Guardian cluster domains)**
48. `/root/fire-safety/research/03-consolidators-a.md`
49. `/root/fire-safety/research/04-consolidators-b.md`

---

## What I could not verify

1. **APi Group's full US operating-brand roster.** `apigroupinc.com/robots.txt` **explicitly disallows ClaudeBot**, so its "Our Companies" and "Company Locations" pages were unreachable. The five brands recorded are from subsidiary sites and press releases only. APi's Safety Services segment is **$5,456M** of revenue (stream 03) — five brands cannot plausibly account for it. **Treat the APi roster as materially incomplete.** Next step: retrieve **Exhibit 21.1 (Subsidiaries of the Registrant)** from APi's Form 10-K on EDGAR.
2. **APi's 10-K Exhibit 21.1 itself.** SEC `cgi-bin/browse-edgar` returned **ROBOTS_DISALLOWED**, and the EDGAR directory listing for CIK 1796209 returns bare accession numbers with no form-type labels, so I could not isolate the 10-K accession. Not retrieved.
3. **Marmic Fire & Safety's 30+ acquired company names.** Marmic states *"over 30 companies having joined the Marmic family"* and *"over 50 Marmic locations"* but publishes **no names**; its locations page renders via an interactive map that yielded no text. A KKR platform with 30+ unnamed legacy brands is a significant register gap.
4. **Encore Fire Protection's domain and its 70+ acquired brand names.** The candidate domain I tested returned a robots.txt **connect timeout** — inconclusive, so **no domain is recorded**. With 2,400 staff and 70+ acquisitions across 17 states (stream 03), this is the **largest single unmapped brand estate in the study**.
5. **Relay Fire and Safety's domain.** The candidate I tested **failed DNS resolution**. No domain, no roster.
6. **Spectrum Safety Solutions' true domain and brand roster.** The obvious domain is occupied by an unrelated India-market firm (documented §1.7). I did **not** identify the Sentinel carve-out's actual web presence, and I did **not** independently verify which Carrier industrial-fire brands sit inside it. The Marioff→Inflexion sale (31 Mar 2026) is carried from the brief unverified.
7. **National Fire & Safety's domain.** Unverified. Combined with its near-generic name, this platform is **currently unmatchable by name or domain** — the highest-priority single gap.
8. **ASPYRE's member companies.** Its own site describes *"a network of top-tier independent Fire and Life Safety companies across the U.S. and Canada"* but names none; Percheron's launch release did not name the foundational acquisition either (stream 03 §2.9 reached the same wall).
9. **Per-brand domains for all 144 Pye-Barker canonical brands.** The "Our Family of Brands" page displays logos **without hyperlinks**. I therefore have 144 brand names and **zero** brand-level domains for the largest platform in the industry. Whether the legacy domains redirect to pyebarkerfs.com is **untested** — testing them would be the single highest-value follow-up for a domain-keyed matcher.
10. **Per-brand domains for Zeus's 14 member brands.** Not published on zeusfireandsecurity.com.
11. **The "Addock Systems" vs "adcocksystems.com" spelling discrepancy on Altus's own site.** I did not determine which is correct; both are registered above.
12. **Pye-Barker brands in states after Texas.** The locations page truncated at Texas on repeated fetches. I recovered WA, UT, VA and WI via individual location pages, but did **not** systematically cover the remaining ≈35 location URLs in those and other late-alphabet states. Some brands are certainly missing.
13. **Ownership confirmation for Cosco and Firetrol from their own sites.** Neither states an owner. The Minimax Viking attribution is `Press-derived` from stream 03 only.
14. **ORR Protection's sponsor.** Not stated on orrprotection.com; stream 04 also failed to verify it.
15. **Whether Protegis and PSI retain any live trading presence.** Neither appears on Summit's own branch-locations pages, which is strong evidence of absorption but not an explicit disclosure of brand retirement.
16. **Convergint acquisition dates.** Its acquisitions page names companies but gives **no dates** for most, only regions.
17. **WebSearch was unavailable for this stream** — the session's 200-call budget was exhausted by parallel streams before I began. All findings above come from **direct WebFetch of primary sources**, which is why several domain gaps remain: without search I could not discover unlinked domains, only test candidates and record the confirmed ones. Direct `curl` was also unavailable (the agent proxy returns 403 on CONNECT for arbitrary hosts).

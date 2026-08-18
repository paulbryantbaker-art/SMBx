# Consolidator register — home services

**What this file is for.** `house/screen.ts` calls a candidate *independent* when
it is **not in here**, and nothing more. So this register is not a reference
list — it is the thing standing between an already-owned business and the top of
a draft board. Its completeness is the ceiling on every affiliation verdict
downstream.

**Rebuilt 2026-08-01** from `markets/home-services/master.md` §4.2–4.6 and §5.1 —
named entities only, nothing invented. Paul's call this session: rebuild from the
master rather than wait on the 2026-07-31 pass, which was built (31 parents, 29
with verified domains, per `SMBX_BD_ENGINE_METHODOLOGY_2026-07-31.md`) but never
landed on disk.

**Domains added 2026-08-01** by a verification pass against each parent's own
website. Method, and its limits, in the block below.

### How the domains were established

Every domain below was **observed** — either as the URL of a search result
resolving to the company's own corporate site, or on a page fetched from that
site, or in the `About` boilerplate of a dated press release naming the URL. None
was constructed from a company name. Where a domain could not be confirmed the
cell is empty, and no parent in this pass ended empty.

Each entry carries a `source:` line naming the page the domain and the DFW
detail came off. Three of the least obvious were re-checked by hand after the
pass — `repipe.com` (brand name absent from the domain), `nearu-services.com`
(hyphenated), and Strikepoint's brand roster — and all three held.

**What this still is not.** Domain matching catches a location whose sign name
changed after the close. It does **not** catch a location the parent has never
named publicly, and two parents here publish no brand roster at all. So:

> **"Independent" in any output derived from this file means "unmatched," not
> "confirmed independent."** Every board carries that label until the brand/DBA
> layer is built. Paul's standing instruction, 2026-08-01. This is not a caveat
> to be softened.

### Matcher limits worth knowing at the point of use

- **Brand tokens under five characters are discarded by the matcher.** `M&M`
  (Champions) and `ARS` will not match by name. They are caught by domain, and
  that is why the domain lines matter more than the brand lines.
- **Generic single words are dropped from `brands:` deliberately.** `Anthony`
  (TurnPoint), `Alpine` (SEER — and also the name of Apex's sponsor) and
  `Cardinal` (Redwood) are ordinary words that would false-match independents. A
  false *affiliated* suppresses a genuine target, which is the more expensive
  error in a buy-side screen. They are recorded in `note:` lines and must be
  caught by domain.
- **One live name collision.** *Swan Plumbing, Heating & Air* (Colorado) belongs
  to Champions Group. *Swan Electric, Plumbing, Heating & Air* (Sunnyvale/
  Mesquite, DFW) belongs to The SEER Group. Different owners, same first word,
  both in scope. Match these on domain or not at all.
- **Franchise systems are listed, and a franchisee is not platform-owned.** A Mr.
  Rooter or One Hour location is independently owned and is acquirable — with a
  franchise agreement attached. They are here so the name is identified before it
  reaches a board, not because the franchisor owns the business.

The shape the parser reads, for reference — lines that are not `backer:`,
`brands:` or `domains:` are ignored, so `dfw:`, `note:` and `source:` are for the
reader:

```
## Parent Name
backer: Sponsor
brands: Brand One, Brand Two
domains: parent.com, brandone.com
```

---

# Residential HVAC / plumbing / electrical platforms

## Apex Service Partners
backer: Alpine Investors + Partners Group; Apollo minority
brands: Frank Gay Services, Best Home Services, We Care Plumbing Heating & Air, ProFlo, BelRed Energy Solutions, Academy Air, HomeBreeze, Hansen Super Techs, Haley Mechanical, Korte Does It All, AB May
domains: apexservicepartners.com
dfw: **NOT CONFIRMED.** The master places Apex in DFW; Apex publishes no brand roster on its own site, so no DFW nameplate could be verified. This is the single largest hole in the DFW subtraction — 75 brands claimed, 11 identifiable.
source: apexservicepartners.com homepage
note: master carries 75 brands (official) against 19 publicly listed and 107 reported; the identifiable subset only is listed. We Care ownership contested with Any Hour as of Dec 2025.

## Wrench Group
backer: Leonard Green + TSG + Oak Hill
brands: Coolray, Berkeys, Abacus, Parker & Sons, Morris-Jenkins, Baker Brothers, Comfort Dynamics, Lindstrom, Baker Brothers LLC, Berkeys LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: wrenchgroup.com, bakerbrothersplumbing.com, berkeys.com
dfw: Baker Brothers (Dallas Metroplex) · Berkeys (Dallas/Grapevine). Abacus is Houston/Austin, not DFW.
source: wrenchgroup.com/wrench-group-brands/ and the per-brand pages under /companies/
note: brand count carried as 17 / 25 / 28 across sources; 26 markets, 15 states, ≈7,300 staff is the stable frame.

## The SEER Group
backer: Genstar Capital
brands: Breeze Air, Kilowatt, Swan Electric Plumbing Heating & Air, Tuscan, S&S Mechanical, All Fuel, Columbia NW, Swan Electric Plumbing & Air Inc.
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: theseergroup.com, callswan.com
dfw: Swan Electric, Plumbing, Heating & Air — Sunnyvale/Mesquite, DFW. **SEER's own HQ is 15303 Dallas Parkway #475, Addison TX** — inside the MSA.
source: theseergroup.com; callswan.com; BusinessWire SEER release 2025-04-29
note: 37–42 brands across 11+ states. `Alpine` (Eugene, OR) dropped from brands: as a generic collision — catch by domain.

## Champions Group
backer: Blackstone perpetual private equity strategy (BXPE)
brands: Service Champions, Adeedo!, ASI Hastings, JW Plumbing Heating & Air, Timo's, Bee's Plumbing & Heating, Lex Cooling Heating Plumbing & Electrical
domains: championsgroupholdings.com, championsgh.com
dfw: **Lex Cooling, Heating, Plumbing & Electrical — "based in North Texas."** Not in the master. Brand domain not confirmed.
source: championsgroupholdings.com, release dated 2026-01-21; championsgh.com returns 302 to championsgroupholdings.com
note: `M&M` retained in the portfolio but under five characters — matcher will skip it; catch by domain. Champions' own *Swan Plumbing, Heating & Air* is Colorado, not the Dallas Swan.

## ARS / Rescue Rooter
backer: GI Partners + Charlesbank
brands: ARS, Rescue Rooter, Greenstar, RighTime, American Residential Services
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: ars.com
dfw: **ARS / Rescue Rooter DFW (Irving, TX) and ARS/Rescue Rooter Dallas (Irving, TX).** Not in the master's DFW row. Will Fix It is San Antonio, not DFW.
source: ars.com/locations/texas; ars.com/media-kit
note: sale explored at "over $3.5 billion" (Reuters 2026-03-23), no process update since March. `ARS` is three characters — domain match only.

## TurnPoint Services
backer: OMERS Private Equity
brands: Dauenhauer, Anderson Plumbing Heating & Air, Apollo Home, Aztec Plumbing, Arctic Air, Anytime Plumbing, Sunny Service
domains: turnpointservices.com, sunnyservice.com
dfw: **Sunny Service — Hurst, TX (Tarrant County).** Not in the master.
source: turnpointservices.com/turnpoint-brands/
note: 57 brands. `Anthony` dropped from brands: as a generic first name that would false-match independents — catch by domain.

## Service Experts
backer: Brookfield Infrastructure, via Enercare
brands: Service Experts Heating & Air Conditioning, Service Experts Heating & AC LLC, Service Experts Heating AC & Plumbing
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: serviceexperts.com
dfw: **Service Experts Dallas (Richardson, TX) and Service Experts Fort Worth.** Not in the master's DFW row. **Service Experts' own HQ is Richardson, TX** — inside the MSA.
source: serviceexperts.com/locations/texas; PRNewswire acquisition release boilerplate

## Legacy Service Partners
backer: Gridiron Capital
brands: Lightfoot Mechanical, Black Plumbing Heating & Air, Lightfoot Mechanical Services LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: legacyservicepartners.com, lightfootmechanical.com, blackplumbing.com
dfw: **Lightfoot Mechanical (Weatherford, Parker County — serving Fort Worth, Benbrook, Burleson, Crowley, Saginaw, Aledo, Azle, Granbury).** Parker County is in the MSA. **Black Plumbing holds a Cleburne, TX office** — Johnson County, also in the MSA. Neither is in the master.
source: legacyservicepartners.com/partners; lightfootmechanical.com; blackplumbing.com
note: 22 brands across 19 states; the master named none of them.

## Sila Services
backer: Goldman Sachs Alternatives
brands: Reliable Heating & Air, Blanton's, Honest Air, MPHAC, Sullivan Super Service, A-Comfort, Norfolk Air, Guy Smith, Live Free, My Plumber Plus, Delco Storm & Sewer, Ahrens & Condill, Tangney & Sons, John Nugent & Sons, New Berlin Heating, Davis Heating & Air
domains: silaservices.com, sila.com
dfw: none. Brand roster is Northeast / Mid-Atlantic / Midwest only.
source: silaservices.com/we-are-sila and /brands
note: sila.com is a separate official consumer-brand hub, not a redirect.

## Redwood Services
backer: Altas Partners
brands: Tony's Plumbing, Hope Plumbing
domains: redwoodservices.com
dfw: none. 24-partner list carries no Texas partner.
source: redwoodservices.com; Businesswire release 2025-05-08
note: `Cardinal` (Madison, WI) dropped from brands: as a generic collision — catch by domain. Acquired the five-contractor Sierra platform May 2026, partners 19 → 24.

## Strikepoint
backer: New Mountain Capital
brands: Horizon Services, Casteel, Gold Medal Service, Hutchinson, IERNA's, Pinellas Comfort Systems, Performance, Paradise Air, HARP Home Services, SNELL, Fenwick Home Services, Wm. Henderson, Maitz Home Services, Eanes Heating and Air Conditioning, Hurley & David, Solvit Home Services, Elite Home Services, Waychoff's, Nicholson, Phillips Air Care, North Point Heating and Air, Farryn Electric, Red Rooter, Campbell Comfort Systems, Kagel's, Hawke Electrical, Air McCall, Olson's, SABRS, Sansone, Weeks Service Company, Gervais Mechanical
domains: strikepointgroupholdings.com
dfw: **none.** Full 33-brand roster checked by hand; the only Texas brand is Weeks Service Company, League City — Houston, not DFW. The master's "MA to FL plus TX" is Houston.
source: strikepointgroupholdings.com/brands/ — full roster read 2026-08-01
note: ex-Horizon, rebranded 2024.

## Southern Home Services
backer: Gryphon Investors
brands: Nick's Plumbing, Fox Service Company, Precision Heating & Air, Dunn's
domains: southernhomeservices.com
dfw: none. Texas brands are Houston (Nick's) and Austin (Fox, Precision).
source: southernhomeservices.com/locations
note: also trades as NAEHS; 27 businesses, 11 states per its own site.

## Heartland Home Services
backer: The Jordan Company + Cobepa
brands: Randazzo, Vredevoogd, A+Derr, Hager Fox, First Call Plumbing, Blind & Sons
domains: heartlandhomeservices.com
dfw: none. 42 brands across MI/OH/IN/IL/WI/MO/KY/MN/DE.
source: heartlandhomeservices.com/brands

## NearU Services
backer: Freeman Spogli + SkyKnight
brands: Action Air, Custom Air & Plumbing, Carolina Heating, Bass Air, Carolina Power and Generators
domains: nearu-services.com
dfw: none. Confirmed by hand 2026-08-01 — portfolio is Carolinas/Virginia.
source: nearu-services.com (note the hyphen)

## Any Hour Group
backer: Knox Lane
brands: Any Hour Services, Oak Island
domains: anyhourgroup.com
dfw: none. 21 brands across UT, AZ, NV, ID, CA, OR, MI, MN, CO, NM.
source: anyhourgroup.com/partners

## Goettl Home Services
backer: Cortec Group
brands: Goettl Air Conditioning & Plumbing
domains: goettl.com
dfw: none. Texas branches are Austin and San Antonio.
source: goettl.com; Cortec Group portfolio page

## Leap Partners
backer: Concentric Equity Partners
brands: Cool Wizard
domains: theleappartners.com
dfw: none listed.
source: theleappartners.com/about; PRNewswire release 2022-05-25

## Guild Garage Group
backer: Oak Hill Capital
domains: guildgaragegroup.com, guildgarage.com
dfw: none. All 28 brands checked.
source: guildgaragegroup.com/brands/; guildgarage.com returns 302 to guildgaragegroup.com
note: garage doors — adjacency, not HVAC.

## Service Logic
backer: Bain Capital + Mubadala
brands: Air Texas Mechanical, Air Texas Mechanical LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: servicelogic.com
dfw: **Air Texas Mechanical — 3724 Arapaho Road, Addison, TX.** Not in the master.
source: servicelogic.com/about-us; servicelogic.com/locations
note: commercial-lean; 50+ brands, 140+ locations.

---

# Commercial-mechanical platforms

Separate underwriting logic, and mostly not competing for a residential asset.
They are in the register because they own DFW locations a screen will surface,
and because a 238220 pull cannot tell commercial from residential on its own —
which is the same reason the NAICS split problem is the soft spot of this hunt.

## Comfort Systems USA
backer: public (NYSE: FIX)
brands: DynaTen, Walker Engineering, DynaTen Comfort Systems USA
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: comfortsystemsusa.com, dynaten.com, walkertx.com
dfw: **DynaTen (Fort Worth) and Walker Engineering (Irving).** Not in the master's DFW row.
source: comfortsystemsusa.com/our-companies; dynaten.com; walkertx.com/about
note: FY25 mix 73.3% mechanical / 26.7% electrical; 63.2% of revenue is new-construction installation. Not a residential comp.

## EMCOR Group
backer: public (NYSE: EME)
brands: Dallas Mechanical Group
domains: emcorgroup.com
dfw: **Dallas Mechanical Group**, acquired 2021-04-05, serving North Texas.
source: BusinessWire, "EMCOR Group, Inc. Acquires Dallas Mechanical Group, LLC", 2021-04-05

## Crete United
backer: Ridgemont Equity
brands: Hartwig, Crete Building Services, Crete United Energy Services
domains: creteunited.com, cretemechanical.com
dfw: **Crete Building Services (Mesquite, TX) and Crete United Energy Services (Dallas, TX).**
source: creteunited.com/our-partners; cretemechanical.com returns 302 to creteunited.com
note: sale process reported 2025, no 2026 outcome announced.

## Modigent
backer: OMERS Private Equity
brands: Southland, Infinity Contractors, Evolution Mechanical, Infinity Contractors Inc, Infinity Contractors Ltd, Evolution Mechanical & Controls LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: modigent.com, infinitycontractors.com, evomechtx.com
dfw: **Infinity Contractors (Fort Worth) and Evolution Mechanical (Irving)** — Modigent's own site describes Infinity as serving "the greater Dallas-Fort Worth metroplex."
source: modigent.com/companies

## FirstCall Mechanical
backer: SkyKnight Capital
brands: FirstCall Mechanical Group, FirstCall Mechanical Group TX LLC, First Call Mechanical Group LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: firstcallmechanical.com
dfw: **a dedicated Dallas–Fort Worth branch**, run under the unified FirstCall brand rather than a legacy nameplate.
source: firstcallmechanical.com branch pages; BusinessWire 2023-02-09

## Astra Service Partners
backer: Alpine Investors
brands: Diamondback, Texas Chiller Systems
domains: astraservicepartners.com, orionservicesgroup.com
dfw: **Texas Chiller Systems — 14311 Welch Rd #500, Farmers Branch, TX.**
source: astraservicepartners.com partner list
note: also trades as Orion Group. orionservicesgroup.com is a live sibling site carrying the same Astra releases; observed as an alternate official domain, not a verified redirect.

## United Building Solutions
backer: AE Industrial
brands: DFW Mechanical Group, DFW Mechanical Group LLC
source: TDLR ltairref.csv — state licence registry legal entity names, current licences as of 2026-08-01 (run 05)
domains: unitedbuildingsolutionsusa.com
dfw: **DFW Mechanical Group (Wylie, TX), acquired 2026-01-20** — the most recent platform entry into the metro found in this pass.
source: Businesswire, "United Building Solutions Acquires DFW Mechanical Group", 2026-01-20

## PremiStar
backer: Partners Group
brands: Dahme, Capstone Mechanical, SI Mechanical
domains: premistar.com, reedyindustries.com
dfw: none confirmed. Texas brands are Capstone (Waco) and SI Mechanical (Austin).
source: premistar.com/about; premistar.com/nationwide-locations
note: ex-Reedy Industries; reedyindustries.com still resolves and serves legacy content — no redirect observed.

## Pueblo Mechanical & Controls
backer: OMERS Private Equity
domains: pueblo-mechanical.com
dfw: none. Own locations are Phoenix, Tucson, Flagstaff, Sierra Vista — Arizona only.
source: pueblo-mechanical.com; modigent.com/companies
note: identifies on its own site as "a Modigent company."

---

# Franchise systems and adjacencies

**A franchisee is independently owned.** These are here so a franchise location is
identified before it reaches a board, not because the franchisor owns it. The
consequence for a buy-box is the franchise agreement attached to the business — a
structuring question, not an ownership one. A DFW screen will return these in
volume and they must not be counted as platform-owned.

## Neighborly
backer: KKR
brands: Aire Serv, Mr. Rooter, Mr. Electric
domains: neighborlybrands.com, neighborly.com, aireserv.com, mrrooter.com, mrelectric.com
dfw: franchise territories, not company-owned locations. **Neighborly's own corporate HQ is 1020 N. University Parks Dr, Waco TX** — Texas, but outside the MSA.
source: neighborlybrands.com/our-brands, /about-us, /contact-us; neighborly.com brand links
note: 28 global brands.

## Authority Brands
backer: Apax + BCI
brands: One Hour Heating & Air Conditioning, Benjamin Franklin Plumbing, Mister Sparky
domains: authoritybrands.com, onehourheatandair.com, benjaminfranklinplumbing.com, mistersparky.com
dfw: franchise territories, not company-owned.
source: authoritybrands.com/about-us; mistersparky.com/our-family
note: 15 franchise brands, 31 states.

## Roto-Rooter
backer: public, via Chemed (NYSE: CHE)
brands: Roto-Rooter
domains: rotorooter.com
dfw: **a company Dallas branch, and the Fort Worth territory re-acquired from its franchisee 2026-03-31** for "approximately $20.6 million" (with San Francisco), adding "$5.0 million to $5.5 million" of 2026 revenue. A 21-county south Texas franchise followed 2026-06-08 at "approximately $12.0 million."
source: rotorooter.com/dallas/; rotorooter.com/media/corporate-office/; master §4.4
note: refranchising is running in reverse — company-owned territory is expanding in Texas. Directly relevant to the DFW platform-owned count, and it moved this year.

## P3 Services
backer: Stellex
brands: Schrader Plumbing
domains: p3services.com
dfw: **Schrader Plumbing (Dallas)** — named as P3's entry into the Dallas market.
source: PRNewswire, 2025-03-04, "About P3 Services" boilerplate; p3services.com partner logos
note: pure-play plumbing. `www.p3services.com` fails TLS hostname validation; the apex domain resolves.

## Repipe Specialists
backer: Gryphon Heritage
brands: Repipe Specialists
domains: repipe.com
dfw: **Dallas and Fort Worth service locations** (dallas.repipe.com, fort-worth.repipe.com). Confirmed by hand 2026-08-01.
source: repipe.com service-location list; PRNewswire 2025-01-16
note: repiping — a narrow adjacency. Brand name absent from the domain; `repipespecialists.com` was not observed.

## ServiceMaster Brands
backer: Roark Capital
brands: ServiceMaster Restore, ServiceMaster Recovery Management, ServiceMaster Clean, Merry Maids
domains: servicemaster.com
dfw: not applicable.
note: **carries no HVAC, plumbing or electrical brand.** The master lists it among franchise platforms; on its own site the portfolio is restoration, cleaning and moving. Retained in the register for completeness and flagged as out-of-trade — it should not be treated as an HVAC consolidator.
source: servicemaster.com/about/

---


## Team Enoch
backer: McKinney Capital (family investment firm, Birmingham AL — recapitalization announced 2022-03-01)
brands: Team Enoch
domains: teamenoch.com
dfw: Fort Worth — HVAC, plumbing and electrical residential services; expanded post-recap to Austin (Pflugerville) and Houston (Spring)
source: mckinneycapital.net release 2022-03-01; teamenoch.com
note: **verdict corrected 2026-08-03** — carried as a notable independent in run 13 off its own site; the recap release refutes that. The own-site-only "independent" verdict is provisional by construction; this is the live example.

## Mpact Home Services Company
backer: family-held (Antos family; Gus Antos, Co-Owner)
brands: Milestone, Milestone Electric, Hank's Handyman Services, Firehouse Roofing
domains: callmilestone.com
dfw: the metro's largest electrical-led residential operator; HQ relocating to Rockwall Technology Park (announced 2026-06-09, 175+ HQ staff)
source: rockwalledc.com relocation announcement 2026-06-09; callmilestone.com
note: **not institutional capital — in the register for identification only.** A family multi-brand owner: a roofing screen would otherwise call Firehouse Roofing independent, and it is not. Milestone remains an acquirable-universe question for Paul, never a public-collateral name.

---

# Roofing platforms (added 2026-08-03, run 14)

Commercial and residential split deliberately — different buyers, different
theses. Collision warnings are load-bearing here; roofing brand names repeat
across unrelated companies more than any other trade in this register.

## Tecta America
backer: Altas Partners; Leonard Green minority (2021-09-01)
brands: Empire Roofing, J Reynolds & Co
domains: tectaamerica.com
dfw: Empire Roofing (Fort Worth, 4801 Esco Dr); J Reynolds & Co (Saginaw)
source: tectaamerica.com location pages
note: commercial. CEI Roofing Texas no longer on Tecta's roster; its Texas Roofing nameplate is Round Rock, not DFW.

## Nations Roof
backer: AEA Investors (closed 2024-07-15)
domains: nationsroof.com
dfw: Nations Roof of Dallas (Rowlett, 2914 Lawing Ln)
source: nationsroof.com; aeainvestors.com
note: commercial.

## CentiMark
domains: centimark.com
dfw: Dallas and Fort Worth pages on its own site; street addresses JS-gated
note: commercial. Ownership not verified — left blank rather than guessed.

## Flynn Group
domains: flynncompanies.com
dfw: Flynn Dallas-Fort Worth (Fort Worth, 5233 Sun Valley Dr)
note: commercial. Ownership not verified.

## Roofing Corp of America
backer: FirstService Corporation (public; from Soundcore 2023-12-15)
brands: WeatherShield Roofing & Sheet Metal
domains: roofingcorp.com, weathershieldroofs.com
dfw: WeatherShield (Aledo, Parker County)
source: weathershieldroofs.com/locations; roofingcorp.com
note: commercial + residential, storm/disaster-response emphasis.

## Quick Roofing
backer: Centre Partners (2024-01-08)
domains: quickroofing.com
dfw: Kennedale (Tarrant County) — the platform's anchor market
source: quickroofing.com; PRNewswire 2024-01-08
note: residential + commercial + new construction. PE-anchored local platform.

## Omnia Exterior Solutions
backer: CCMP Growth Advisors
brands: HUF Construction
domains: omniaexteriorsolutions.com, hufconstruction.com
dfw: HUF Construction (Waxahachie, Ellis County) — hail/storm
source: BusinessWire 2025-05-14 (sponsor-side)
note: **HUF's own site does not name Omnia** — the tie rests on the sponsor release. Treat as caveated.

## Leaf Home
backer: Gridiron Capital (Erie Home acquired Sept 2025)
brands: Erie Home
domains: eriehome.com
dfw: Erie Home (Carrollton, 3333 Earhart Dr)
source: eriehome.com; PRNewswire
note: residential.

## Premier Roofing Company
backer: Aurora Capital Partners (2020-12-10)
domains: premier-roofing.com
dfw: Dallas branch (Bedford, 315 Harwood Rd)
source: premier-roofing.com/locations; auroracap.com
note: residential **storm-restoration**, insurance-led; Denver company. **COLLISION:** Infinity Home Services' "Premier Roofing" is West Michigan (exteriorsbypremier.com) — a different company, not in DFW.

## Stronghouse Solutions
backer: O2 Investment Partners
brands: Infinity Roofing & Siding
domains: infinityroofer.com
dfw: Dallas service page (company HQ Houston)
source: BusinessWire 2023-01-31 (sponsor-side)
note: weakest row in this section — Infinity's own site does not name Stronghouse. **COLLISIONS:** not Infinity Contractors (Modigent) and not Infinity Home Services.

## Peachtree Roofing & Exteriors
brands: TC Roofing & Restorations
domains: peachtreerestorations.com, tcroofingexperts.com
dfw: TC Roofing & Restorations (Dallas, 5339 Alpha Rd) — acquired 2025-10-31
source: peachtreerestorations.com blog 2025-11-04; Yahoo Finance 2025-10-31
note: no PE backer found. TC's own site does not yet name Peachtree.

## Honest Abe Roofing
backer: franchisor
domains: honestaberoofing.com
dfw: Honest Abe Roofing of Dallas (Plano, 800 N Jupiter Rd) — **a franchise**, independently owned
source: honestaberoofing.com/locations

---

# Pest control platforms (added 2026-08-03, run 15)

The most consolidated trade in the register. Nine parents hold verified DFW
ground; entries dated 2024-12, 2025-06 and 2026-04 show live tuck-in appetite.

## Rollins
backer: public (NYSE: ROL)
brands: Orkin, HomeTeam Pest Defense, Fox Pest Control, Romex Pest Control
domains: rollins.com, orkin.com, pestdefense.com, fox-pest.com, romexpest.com
dfw: Orkin branches Fort Worth, Carrollton, Lake Dallas; **HomeTeam HQ is Dallas** (1341 W Mockingbird Ln) with branches Richardson, Carrollton, Grand Prairie, Denton, McKinney; Fox (Southlake); Romex (Dallas/Fort Worth office per romexpest.com/texas — **acquired 2026-04-02**, brand retained; the Rollins release names four states, not cities)
source: rollins.com/brands; pestdefense.com; fox-pest.com; rollins.com release 2026-04-02

## Rentokil Initial
backer: public
brands: Terminix, Rentokil
domains: terminix.com, rentokil.com
dfw: **thirteen Terminix addresses** — Irving, Dallas, Fort Worth, Arlington, Plano, Frisco, McKinney, Flower Mound, Grand Prairie, Saginaw; Rentokil Carrollton (ex-Presto-X, rebranded)
source: terminix.com/exterminators/tx; dallas.rentokil.com; PRNewswire rebrand release

## Anticimex
backer: EQT
brands: Safe Haven Pest Control, Abby's Pest & Termite Services, Metro Guard Termite & Pest Control, BUGCO
domains: anticimex.com, us.anticimex.com, bugco.org
dfw: Safe Haven (Garland), Abby's (Cleburne, Johnson County), Metro Guard (Hurst) — all acquired in one announcement **2025-06-16**, the newest platform entry into the metro; BUGCO (Dallas)
source: anticimex.com release 2025-06-16; us.anticimex.com/service-area
note: BUGCO's own site does not name Anticimex.

## Aptive Environmental
backer: Citation Capital (2024-08-27)
domains: aptivepestcontrol.com
dfw: Plano; Fort Worth
source: aptivepestcontrol.com/locations; PRNewswire 2024-09
note: door-to-door model.

## Hawx Pest Control
backer: PCM Growth (July 2021)
domains: hawxpestcontrol.com
dfw: Grand Prairie (2604 W Marshall Dr)
source: hawxpestcontrol.com; PRNewswire 2021
note: a third-party tracker names a different backer; only the primary-source PCM Growth release is carried.

## Barefoot Mosquito & Pest Control
backer: Incline Equity Partners (2023-02-02)
brands: All Seasons Pest Control
domains: barefootmosquito.com
dfw: Richardson office (401 International Pkwy); acquired All Seasons (Euless) **2024-12-20**
source: inclineequity.com; barefootmosquito.com; pctonline.com

## Aruza Pest
backer: Concentric Equity Partners — the same backer as Leap Partners
domains: aruzapest.com
dfw: Carrollton (1406 Halsey Way)
source: aruzapest.com; PRNewswire 2022-11

## Massey Services
backer: private, family
domains: masseyservices.com
dfw: seven service centers — Dallas, Fort Worth, Frisco, McKinney, Plano, Euless, Denton
source: masseyservices.com/dallas-fort-worth

## Pestmaster
backer: The Riverside Company owns the franchisor
domains: pestmaster.com
dfw: Pestmaster of North Dallas — **a franchise**, "locally owned and operated"
source: pestmaster.com/north-dallas

## Moxie Pest Control
domains: moxieservices.com
dfw: Farmers Branch (14282 Gillis Rd); Fort Worth (2317 E Loop 820 N)
note: multi-state operator; current ownership could not be established from its own site — carried so the matcher sees it, ownership blank.

## EcoShield Pest Solutions
domains: ecoshieldpest.com
dfw: Plano (608 Development Dr), serving eight of the eleven counties
note: same — ownership unresolved, carried for matching.

---

# Commercial electrical — large owners (added 2026-08-03, run 13)

Not consolidators in the roll-up sense, but owners whose DFW locations a 238210
screen will surface and must not call independent.

## IES Holdings
backer: public (NASDAQ: IESC)
brands: IES Residential, IES Communications
domains: iesresidentialinc.com, iescomm.com
dfw: IES Residential (Irving — new-construction-oriented); IES Communications (Fort Worth; Addison)
source: iesresidentialinc.com careers pages; iescomm.com/contact-us

## Facility Solutions Group
backer: private (Austin, TX)
domains: fsg.com
dfw: FSG Dallas – Electric (2525 Walnut Hill Ln); FSG Dallas – Lighting; FSG Fort Worth (3601 NE Loop 820)
source: fsg.com/locations
note: fsgi.com has an expired certificate; fsg.com is the live domain.

## Rosendin
backer: employee-owned
domains: rosendin.com
dfw: Coppell (615 Freeport Pkwy)
source: rosendin.com/contact/office-locations
note: notable DFW independents recorded in run 13 and NOT in this register (they are potential targets, not owners): Prism Electric (Garland), Team Enoch (Fort Worth), Milestone (DFW-wide).

### What this register still does not have

- **No brand/DBA layer.** Parent-level plus the brands each parent names — the
  same limitation the 2026-07-31 pass carried. This remains the standing blocker
  on any named work.
- **Apex publishes no roster.** 75 brands claimed, 11 identifiable, and no DFW
  nameplate confirmable. Any DFW independent residual is overstated by whatever
  Apex owns there, and that quantity is currently unknown rather than zero.
- **Brand-level domains are thin** for the parents that publish names without
  links. Present where observed, absent where not.
- **Franchisee rosters are not here at all.** Neighborly and Authority Brands
  together will account for a meaningful count of DFW HVAC and plumbing
  establishments, none of them platform-owned and all of them encumbered.
- **`markets/fire-safety/screen/consolidators.md` is still missing** and its
  doctor blocker stands. Out of scope this session.

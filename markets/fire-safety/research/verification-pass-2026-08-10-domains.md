# Verification pass — consolidator domains and parent identity

**Market:** fire and life safety
**Pass run:** 2026-08-10
**Document verified against:** `markets/fire-safety/master.md`, published 30 July 2026, sponsor states given as of 2026-07-29
**Output this pass supports:** `fire-safety-consolidators.md` (the consolidator register), built the same day
**Companion pass:** `research/verification-pass-2026-07-30.md` — figures against issuing bodies. This pass does not
overlap with it and does not re-check a single figure it settled.

This is a primary-source verification pass in the same tradition as the 2026-07-30 figures pass, run against a
different class of claim. That pass asked whether the master's numbers say what their sources say. This one asks a
narrower and more operational question: **for every parent in the register, does the domain the register will use to
identify it actually belong to that company?** In a consolidator register the domain is the identifier of last
resort — the master's own collision table resolves twenty-seven token clashes with the instruction "domain only" —
so a wrong domain is not a cosmetic error. It silently assigns an owner, and an already-owned company is then
screened as independent, or an independent company is suppressed as owned.

Twelve findings changed the register. Three open flags the master raised were closed. Fifteen parents could not be
given a verified domain and are named. Two of the master's internal discrepancies were deliberately left undecided
and are carried forward with the reason.

---

## 1. Method and scope

### What was checked

Every parent entity in the register — **63 parents**: 17 class 1a, 5 class 1b, 3 class 2, 8 class 3, 11 class 4,
and 19 entities that sit outside the master's class counts because they distort a register rather than appear in
it. Alongside the parents, the major operating brands whose domains the master publishes, principally APi Group's
brand estate and the member-brand sets of Altus, Kidde Global Solutions and Spectrum Safety Solutions.

**88 HTTP fetch attempts against roughly 80 distinct hosts, and 16 web searches**, all on 2026-08-10. Searches were
used only to *locate* a candidate domain for an entity the master records as having none; **no entity's domain was
accepted on the strength of a search result.** In every case the candidate was then fetched and had to
self-identify before it was written into the register.

### What "verified" meant operationally

A domain counts as verified in the register if and only if, on 2026-08-10:

1. the URL was fetched and returned page content, and
2. that content identified the site as the company named in the master — by trading name, legal name in a footer or
   copyright line, or a headquarters address matching the master's, and
3. the identification was consistent with the company being **the fire or life-safety business the master names**,
   not a similarly-named business in another industry, another country or another trade.

Where a company's own site additionally named its corporate parent — most of the APi estate, CertaSite, Guardian
Protection — that is recorded, because it converts an attribution from second-hand to primary. Where it did not,
that is recorded too.

**No domain in the register was constructed, guessed or inferred from a company name.** Where a domain could not be
reached and confirmed it was left out of the `domains:` field and named in `## Coverage and gaps`. Two live
entities in this market publish on domains that contain no part of their trading name — Guardian Fire Services of
Nashville on `guardianfireholdings.com`, Altus's Star Fire Protection on `starfireny.com` — and one platform's
domain is `certasitepro.com` rather than the obvious construction. Any register built by construction would have
missed all three and invented several others.

### What this pass does NOT establish

State this plainly, because the rows below are more useful when their limits are known.

- **It does not establish ownership.** It establishes that a domain belongs to a named company. Who owns that
  company is a separate question answered from filings, sponsor announcements and the master. The exception is the
  subset of sites that name their own parent in their own footer; those rows say so explicitly.
- **It does not re-verify any figure in the master** — no revenue, RMR, enterprise value, multiple, add-on count,
  branch count or margin was checked. Those belong to the 2026-07-30 pass.
- **It does not establish that a verified domain is a company's only domain.** Guardian Fire Protection Services of
  Rockville publishes on two unrelated-looking domains, and a matcher holding only the first misses every business
  trading on the second. A single verified domain narrows a gap; it does not close one.
- **It does not touch state licence registries or legal-entity records.** The master's own closing instruction
  stands undisturbed: *"Ownership must be established per legal entity from a primary source, not inferred from a
  trading name, and the absence of a brand from the record is not evidence that the business is unowned."*
- **It does not re-verify sponsor attribution.** Backers in the register are the master's as of 2026-07-29, except
  in the two rows below where a company's own site upgraded or contradicted one.
- **It is point-in-time and it decays.** Finding 1 below is a domain the master carried as verified eleven days
  before this pass and which no longer resolves to a fire company. Treat every row here as true on 2026-08-10 and
  re-check before a client-facing use.

### The one structural gap this pass could not narrow at all

The largest exposure in this register is not a wrong domain — it is the absence of any domain to check. Pye-Barker's
≈204 brand tokens, Encore's 75 affiliated brand partners, Sciens' 31 divisions, Marmic's ~22 unnamed legacy names
and ASPYRE's entire undisclosed roster **publish no brand-level domains at all.** Pye-Barker's brands page displays
logos without hyperlinks. Several hundred already-owned businesses are therefore invisible to any domain-based
screen regardless of how good this pass was, and must be caught by full string plus state or not at all. Nothing
below improves that.

---

## 2. Findings that changed the register — twelve

House shape: `Figure/claim | Was | Now | Why`. "Why" names the source that overturned it and the date it was
checked. Where a conclusion rests on reasoning rather than on something the source states, the row says
**inferred**.

Finding 1 leads because it is the failure mode the register exists to prevent: a domain the master carries as
verified, which a screener would trust, and which now points somewhere else.

| # | Claim | Was (master, 30 July 2026) | Now (checked 2026-08-10) | Why — source that overturned it, and consequence if uncorrected |
|---|---|---|---|---|
| **1** | **National Fire & Safety's second domain, `absolutefireaz.com`** | Carried in the master's verified domain set for the Highview Capital platform, mapped to its Glendale AZ nameplate **Absolute Fire Protection**. The master's own collision table resolves four "Absolute" nameplates under three owners with the rule *"domain plus state"*, and this domain is the resolver for one of them. | **The domain no longer resolves to a fire company.** A fetch of `https://absolutefireaz.com` returned **HTTP 302 to an off-host URL at `legalesedecoder.com`**. **Excluded from the register.** | Fetch of `absolutefireaz.com`, 2026-08-10 — the 302 and its off-host destination were observed directly. **The destination page was not fetched, so what it now serves is not established here; only that the host no longer returns the company's own site.** Whether the registration lapsed or was repurposed is **inferred, not confirmed**. **Consequence:** this is the exact failure the domain-only rule exists to stop. A screener resolving "Absolute Fire Protection" through a dead or repurposed domain either mis-attributes the Glendale AZ business to whoever now holds the host, or — more likely — gets no match and promotes an owned company onto the board as independent. Three other Absolute nameplates (APi/VFPG Midwest, Marmic Paragould AR, Sciens Absolute Protective Piscataway NJ) then have no clean resolver either. **National Fire & Safety now stands on `natfiresafety.com` alone in the register.** |
| **2** | Relay Fire and Safety has no domain | The master states it explicitly: **"no domain on the record"**. The entity carries a `domains:` gap and can only be matched on the string "Relay Fire and Safety" and its one named add-on. | **`relaysafety.com` exists and is the company.** Fetched at `/about/`: footer and body carry **"Relay Fire and Safety"**, describing fire alarm, sprinkler, extinguisher and security services. The site publishes an `/acquisitions/` page. | Fetch of `relaysafety.com/about/`, 2026-08-10. **Note the limit: the company's own About page names no investor**, so The Riverside Company tie still rests on Riverside's portfolio page, not on Relay's site — that attribution is unchanged and second-hand. **Consequence:** an SV3 extinguisher-route platform in the NY metro was unmatchable by domain. Riverside is simultaneously an active buyer and an active seller in this sub-vertical, so its portfolio is exactly where a stale register does damage in both directions. |
| **3** | RapidFire Safety & Security has no domain and no footprint | Domain **null**. The master's footprint cell for this entity is **empty**. | **`rapidfiress.com` exists and is the company, with a stated HQ.** Fetched at `/about-rapidfire/`: **"RapidFire Safety & Security"**, HQ **55 Westport Plaza, Suite 350, St. Louis, MO 63146**, describing fire alarm, sprinkler, suppression, video, access control and intrusion across multiple US regions. | Fetch of `rapidfiress.com/about-rapidfire/`, 2026-08-10; HQ corroborated by Security Sales & Integration, which describes the company as a St. Louis-based buy-and-build platform. **Consequence:** a platform with six undisclosed add-ons was previously unmatchable by any means except its own exact string. **The weak sponsor attribution is unchanged — Concentric Equity Partners remains trade-press only and this pass produced no evidence either way on it.** |
| **4** | Security Fire Systems has no domain and no footprint | Domain **null**. Footprint cell **empty**. The master separately warns that `securityfire.com` appears in APi Group's verified set and must not be attached to this entity. | **`securityfiresystems.com` exists and is the company, with a stated footprint.** Fetched: **"SFS Security Fire Systems"**, a fire sprinkler and ERCES contractor **founded 1993**, with offices in **Dallas–Fort Worth, Texas and Arkansas**. | The candidate domain came from **Blackford Capital's own press release**, *"Blackford Capital Acquires Security Fire Systems and Enters the Fire Safety and Security Space"*, which hyperlinks `https://www.securityfiresystems.com/` and locates the company in Dallas–Fort Worth; the domain was then fetched and self-identified, 2026-08-10. **Consequence:** this entity and APi's Memphis TN company differ by one word and both trade on a "Security Fire" string. With no domain for one of them, the pair was unresolvable — and the master's warning could be honoured only by leaving the entity unmatchable. Now both sides have a distinct verified domain. See §3. |
| **5** | FSS Technologies has no domain, and is headquartered in Ann Arbor MI | Domain **null**. Footprint recorded as **"HQ Ann Arbor MI"** and nothing further. | **`fsstechnologies.com` exists and is the company, and the location is different and much larger.** Fetched: **"FSS Technologies"**, primary location **Arlington Heights, Illinois**, with further offices at **Mishawaka IN, Ypsilanti MI, Eagan MN, Fargo ND and Sioux Falls SD** — a six-state Midwest footprint. The Michigan presence is Ypsilanti, adjacent to but not Ann Arbor. | Fetch of `fsstechnologies.com`, 2026-08-10. **Consequence, two-part.** The domain gap made a brand-new platform (Lightview Capital, 2025-10-28) unmatchable. The location error is worse for screening: an Ann Arbor MI single-point entry understates a live sponsor-backed acquirer as a Michigan local business when it is in fact competing across six states — including Minnesota and the Dakotas, part of the interior-West and Plains region the master separately warns **"a register that treats as empty will be wrong."** |
| **6** | `guardianfireholdings.com` cannot be attributed | The master lists this domain in its **"Guardian cluster (five owners)"** row but **never states which of the five Guardians owns it**, and its flag list instructs: *"do not attribute it."* | **It is Guardian Fire Services of Nashville TN — the Investcorp platform.** Fetched at `/contact-gfs/`: trading name **"Guardian Fire Services"**, address **2 Dell Parkway, Suite 100, Nashville, TN 37217**, tagline *"National Fire and Life Safety. Local Expertise."* | Fetch of `guardianfireholdings.com/contact-gfs/`, 2026-08-10. The Nashville address matches the master's own location for this entity, and none of the other four Guardians trades under the string "Guardian Fire Services". **The master's do-not-attribute instruction can be lifted.** **Consequence:** the Guardian collision is five unrelated entities graded **"domain only, maximum severity"**. An unattributed domain in that cluster is the most dangerous single artefact in the register — it invites exactly the cross-assignment the severity grade warns about. Three of the five now carry distinct verified domains and a fourth (Rockville) carries two. See §3. |
| **7** | Seven further entities have no domain on the record | The master's flag list names entities with **"genuinely zero domain in the document"**. Seven of them are register parents: **Kastle Systems, Guardian Protection, Vector Security, Bay Alarm Company, Per Mar Security Services, Guardian Alarm Company** (all class 3) and **CPI Security Systems** (owner not established). | **All seven have a verified domain**: `kastle.com` ("Kastle Systems"), `guardianprotection.com` (legal name "Guardian Protection Services"), `vectorsecurity.com` ("Vector Security"), `bayalarm.com` ("Bay Alarm Company"), `permarsecurity.com` ("Per Mar Security Services"), `guardianalarm.com` ("Guardian Alarm", HQ Southfield MI), `cpisecurity.com` ("CPI Security Systems, Inc."). | Individual fetches of each, 2026-08-10; `guardianprotection.com/about/guardians-evolution/`, `bayalarm.com/about/`, `permarsecurity.com/about` and `guardianalarm.com/about-us/` were fetched at their About pages. **Limits worth carrying: `kastle.com`, `vectorsecurity.com` and `cpisecurity.com` do not state a headquarters on the pages fetched**, and `cpisecurity.com` says only *"Charlotte-owned"*. **Consequence:** class 3 is the class most often missing from sponsor trackers precisely because it has no sponsor to track — permanent capital, families and individuals with no exit clock. It was also the class least matchable. Seven of eight class-3 parents were domain-blind before this pass; none is now. |
| **8** | AI Fire's brand policy makes ownership legible from the brand | The master reads AI Fire's policy as prefixing the legacy name — *"Impact Fire, a Division of AI Fire"* — and calls it **"the only policy of the three that makes ownership legible from the brand itself."** | **It does not, at the brand's own site.** `impactfireservices.com` identifies as **"Impact Fire"** and **AI Fire is not mentioned anywhere** on the page fetched — no parent, no division line, no corporate structure. `academyfire.com` identifies as **"Academy Fire Life Safety, LLC®"**, names **no parent**, and mentions Impact Fire Services only as a sister company in a disclaimer. Ownership is legible from **aifire.com**, the parent's site, which names both units. | Fetches of `impactfireservices.com`, `academyfire.com` and `aifire.com`, 2026-08-10. **Consequence:** the master's reading implies a screener meeting Impact Fire or Academy Fire in the field can establish ownership from the nameplate. They cannot — they must already hold the parent. The practical grading of AI Fire's brand policy moves closer to the other two, and both brands must be caught by their own verified domains, which is why all three are in the register's `domains:` field. Secondary observation: `aifire.com` gives HQ as **Long Beach CA** while the master gives Impact Fire's HQ as Round Rock TX; these are plausibly parent and unit and **no conflict is asserted here** — flagged only so a later session does not read one as overturning the other. |
| **9** | Zeus Fire and Security's member brands | The master records **14 member brands** and names **five**: UAS / United Alarm Services, SMG, Alert Alarm, Martin Systems, ASG. | **The platform's own site names eleven**, adding six the master does not carry: **Security Resources, Independent Alarm NJ, PASS, Bayside Fire and Security, Gallaher, SEi** — and renders three of the master's five more fully as **Alert Alarm Hawaii, SMG Security** and **ASG (American Security Group)**. | Fetch of `zeusfireandsecurity.com`, 2026-08-10. **Consequence:** Zeus runs a declared **"House of Brands"** model with distinct regional identities and **no per-brand domains**, so it is one of the two platforms in this market that presents to a screen as several separate independents in several separate metros. Six previously unnamed nameplates means six businesses that would have screened as independent. **PASS and SEi are both sub-5-character tokens on the master's never-match list**, so they are additionally unmatchable as bare strings and now depend on the full company name plus state. |
| **10** | APi Group's sub-brand rosters under VFPG and AFPG | The master records **9 Viking Fire Protection Group sub-brands** and **6 American Fire Protection Group sub-brands**, naming a subset, and cautions that its brand layers **"overlap, so they do not sum to a distinct count."** | **The two platform sites name five nameplates the master does not carry.** `vfpg.com` names **Kimble Fire Protection** and **Quality Fire Protection** alongside Viking Automatic Sprinkler, VFP Fire Systems, Absolute Fire Protection, High Sierra, Landmark Sprinkler and Valley Fire Protection. `afpgusa.com` names **AFPG Security Houston, A-Com Security – Albuquerque** and **Phoenix Fire Protection** alongside Mid Atlantic Fire Protection. | Fetches of `vfpg.com` and `afpgusa.com`, 2026-08-10; both footers state *"is a subsidiary of APi Group"*. **Consequence:** APi is already the largest distortion in any fire register because its bolt-ons are disclosed only as counts and aggregate consideration — four Q1-2026 targets described merely as *"individually immaterial acquisitions"* at $25m aggregate. Five further live nameplates is five more businesses a name-based screen would have promoted. **Kimble is separately on the master's surname-token trap list** (*"match unrelated firms in every trade — name plus state, or domain"*), so "Kimble Fire Protection" must be matched in full. |
| **11** | Spectrum Safety Solutions' brand set | The master records **five tokens** — Autronica, Det-Tronics, Fireye, Marioff — and correctly records both divestments: Marioff agreed to Inflexion 2026-03-31, **Autronica closed to MSA Safety 2026-07-09 at ≈$555m**. | **The parent's own site is stale and still presents all four as current brands**, including both divested ones. `spectrum-safety.com` lists Autronica, Det-Tronics, Fireye and Marioff. The divested brand's own site is correct and current: `autronicafire.com` identifies as **"Autronica Fire and Security AS"** and carries the news item *"MSA Safety Completes Acquisition of Autronica Fire and Security, a Leading Provider of Fire and Gas Detection and Alarm Systems"*, **dated 21.7.2026**, with **Spectrum not mentioned anywhere on the site**. | Fetches of `spectrum-safety.com` and `autronicafire.com`, 2026-08-10. **This does not contradict the master's facts — it contradicts the reliability of a source a later session would naturally reach for.** **Consequence:** anyone rebuilding the Spectrum block from the parent's own brand wall will re-add two divested businesses and mis-attribute both. The register now carries the instruction to trust the brand's site over the parent's here. Secondary: `det-tronics.com` identifies as **"Det-Tronics" / "Detector Electronics, LLC"** and **does not name Spectrum as parent** either — the only trace is an e-commerce portal at a `spectrum-det-tronics` subdomain, which is suggestive but **inferred, not stated**. The master's own note that the site's date is 21.7.2026 versus the close at 2026-07-09 is a publication-lag difference, not a conflict. |
| **12** | The master's 302-redirect set | Five redirects are recorded with the instruction to register both sides: `pyebarkerfire.com`→`pyebarkerfs.com`, `sciensbuildingsolutions.com`→`sciensusa.com`, `vfpfire.com`→`vfpg.com`, `grunaufire.com`→`davisulmer.com`, `cogswellsprinkler.com`→`davisulmer.com`. | **All five hold exactly as stated, and there is a sixth.** Each returned **HTTP 302** to the stated destination — `vfpfire.com`→`vfpg.com/companies/vfp-fire-systems`, `grunaufire.com`→`davisulmer.com/grunau-fire-protection`, `cogswellsprinkler.com`→`davisulmer.com/cogswell-sprinkler-company`. **New: `premierfire.net` 302-redirects off-host to `premierfire.us`**, which identifies as **"Premier Fire & Security"**, founded 1974, and states *"Premier Fire & Security is a subsidiary of APi Group."* | Individual fetches of all six, 2026-08-10. **This row is a confirmation, not a correction — recorded because a confirmed claim is worth as much to a later session as an overturned one, and because it is the counterweight to Finding 1.** Five of six domain claims in this set held; one lapsed. **Consequence:** `premierfire.net` is the master's registered token for APi's Paducah KY nameplate, and "Premier" sits in a three-way collision (APi's Premier Fire & Security, CertaSite's Premier Electronics, Pavion's Premier Security Solutions) graded domain only. **Both sides of the new redirect must be registered** or the resolver for one of the three degrades. |

---

## 3. Master flags closed by this pass

The master's §L raised eight items for the register owner. **Three are closed.** The rest are in §6.

### 3.1 `guardianfireholdings.com` — attributed

**Master's flag (§L.2):** *"guardianfireholdings.com is unattributed. The master lists it in the 'Guardian cluster
(five owners)' domain row but never says which of the five Guardians owns it."*

**Closed.** It belongs to **Guardian Fire Services of Nashville TN**, the Investcorp platform. Evidence: fetch of
`guardianfireholdings.com/contact-gfs/`, 2026-08-10, returning trading name "Guardian Fire Services" and address
2 Dell Parkway, Suite 100, Nashville, TN 37217 — matching the master's own location for this entity. No other
Guardian in the cluster trades under the string "Guardian Fire Services".

The cluster now stands as follows. **Nothing in this table may be cross-assigned.**

| Entity | Location | Backer (master, as of 2026-07-29) | Domain, verified 2026-08-10 |
|---|---|---|---|
| Guardian Fire Protection Services | Rockville MD | Knox Lane | `guardianfireprotection.com`, `ars-guardian.com` |
| Guardian Fire Services | Nashville TN | Investcorp | `guardianfireholdings.com` |
| Guardian Protection | Warrendale / Pittsburgh PA | Armstrong Group | `guardianprotection.com` |
| Guardian Alarm | Southfield MI | none named in the record | `guardianalarm.com` |
| "Guardian" | — | an Encore Fire Protection affiliated brand partner | none — no brand domains exist |

Four of five now carry a distinct verified domain, and the fifth is a brand partner with no domain because **none
of Encore's 75 affiliated brand partners has one.** The Rockville entity's second domain carries a caveat — see
§5.3.

### 3.2 `securityfire.com` — confirmed as APi Group's, not the Blackford platform's

**Master's flag (§L.3):** *"securityfire.com belongs to APi's verified set, not to the sponsor-backed platform named
Security Fire Systems (Blackford Capital), which has no domain on the record. A register that pairs them is wrong."*

**Closed, and upgraded from a warning to a positive identification on both sides.**

- `securityfire.com`, fetched 2026-08-10, identifies as **"Security Fire Protection Company, Inc"**, address
  **4495 Mendenhall Road South, Memphis, TN 38141**, with the footer statement *"Security Fire Protection is a
  subsidiary of APi Group."* This is a **primary confirmation of ownership from the company's own site**, not an
  inference from the master.
- `securityfiresystems.com`, fetched 2026-08-10, identifies as **"SFS Security Fire Systems"**, a fire sprinkler
  and ERCES contractor founded 1993 with offices in **Dallas–Fort Worth TX and Arkansas**. Located via Blackford
  Capital's own acquisition press release, which hyperlinks the domain and places the company in Dallas–Fort Worth.

The two companies are now separable by domain, by legal name, by state and by service line. The master's warning
stands and is now enforceable rather than merely stated.

**Additional note:** `Security Fire Protection Company, Inc.` is one of the legal entities the master identifies as
**deleted from APi's FY2025 EX-21 exhibit** while remaining a live trading nameplate. This pass confirms the second
half of that observation directly — the nameplate is live, has a branch address and states its APi parentage on its
own site. The EX-21 deletion trap is real and this is a worked example of it.

### 3.3 Guardian Protection / Armstrong Group — upgraded to primary-verified

**Master's grading:** ownership recorded as **"widely reported, not primary-verified"**, and listed among the
weakly-attributed entities.

**Upgraded.** `guardianprotection.com/about/guardians-evolution/`, fetched 2026-08-10, states on the company's own
site: *"In 1991, Guardian joined forces with the Armstrong Group and merged with their security company,
Mastertech."* The same page confirms **"Guardian Protection Services is still our legal name"** and lists the
Armstrong family of companies, describing Armstrong Group as *"a family-owned and operated collection of home- and
business-service companies."*

This moves the row from second-hand reporting to a statement by the owned company about its own owner. **The
weak-attribution marker can be removed for this entity.** It does not move for the other five weakly-attributed
rows, none of which this pass touched.

### 3.4 Partial closure — §L.6, "entities with genuinely zero domain in the document"

The master's list of entities with no domain anywhere in the document included **twelve register parents**. Seven
now have one (Finding 7), plus Relay, RapidFire, Security Fire Systems and Guardian Fire Services from Findings
2, 3, 4 and 6 — **eleven of twelve closed.**

The remaining entry, and the parts of §L.6 that are brand-level rather than parent-level, are **not** closed: every
Pye-Barker brand, every Encore brand, every Sciens division, every Marmic sub-brand, every Convergint acquired
name, every Zeus member brand, Fireye, Protegis, PSI, COPS Monitoring, Rapid Response, Affiliated Monitoring and
National Monitoring Center all remain without a domain. **That is the structural gap described in §1 and this pass
did not narrow it.**

---

## 4. New material the master does not carry

Distinct from §2 in that these are additions rather than corrections — the master is not wrong, it is incomplete,
and the incompleteness is consequential for screening because every item below is a live nameplate that would
otherwise screen as independent.

| Source | Material added, checked 2026-08-10 | Why it matters |
|---|---|---|
| `zeusfireandsecurity.com` | Six member brands the master does not name: **Security Resources · Independent Alarm NJ · PASS · Bayside Fire and Security · Gallaher · SEi**. Three of the master's five rendered more fully: **Alert Alarm Hawaii · SMG Security · ASG (American Security Group)**. | Declared House of Brands model, **no per-brand domains**. Six nameplates that a name-based screen would have missed entirely. **PASS and SEi are sub-5-character tokens on the never-match list** — full string plus state only. **ASG is claimed by both Zeus and Pye-Barker**, so a bare ASG match is wrong for at least one of them; the fuller rendering "American Security Group" is a partial resolver for the Zeus side. |
| `vfpg.com` | Two VFPG sub-brands the master does not name: **Kimble Fire Protection · Quality Fire Protection**. Footer states *"Viking Fire Protection Group is a subsidiary of APi Group."* | APi's disclosure policy makes acquired companies vanish from the observable universe; every recoverable nameplate is worth carrying. **Kimble is on the master's surname-token trap list** — must be matched as "Kimble Fire Protection" plus state, never as "Kimble". |
| `afpgusa.com` | Three AFPG divisions the master does not name: **AFPG Security Houston · A-Com Security – Albuquerque · Phoenix Fire Protection**. Footer states *"American Fire Protection Group is a subsidiary of APi Group."* | Same. "Phoenix Fire Protection" is a generic construction that will collide widely; carry with the AFPG/APi attribution attached. |
| `fsstechnologies.com` | **Location correction, not an addition.** Master: *"HQ Ann Arbor MI"*. Site: primary location **Arlington Heights, Illinois**, with offices at **Mishawaka IN · Ypsilanti MI · Eagan MN · Fargo ND · Sioux Falls SD**. | Restated here because it is the one geographic claim this pass overturned. A six-state Midwest platform read as an Ann Arbor local business understates a live sponsor-backed acquirer, and three of the six states sit in the interior-West/Plains region the master warns must not be treated as empty. |
| `wmfireprotection.com` | The **ownership chain stated in full on the brand's own site**: *"W&M Fire & Security Services A Division of Davis-Ulmer Sprinkler Company"* plus *"W&M Fire & Security is a subsidiary of APi Group"* — HQ **50 Broadway, Hawthorne, New York 10532**, further offices Plantsville CT and Holbrook NY. | A worked three-level chain (APi → Davis-Ulmer → W&M) stated primarily rather than inferred. Useful as the template for how the rest of the Davis-Ulmer family's 18 sub-brands are likely structured — **though that generalisation is inferred and was not checked for the other seventeen.** |
| Fifteen APi brand sites | Each states *"is a subsidiary of APi Group"* in its own footer: `davisulmer.com` · `wsfp.com` · `vfpg.com` · `afpgusa.com` · `securityfire.com` · `premierfire.us` · `usafireprotectioninc.com` · `texassprinkler.com` · `icsgf.com` · `candoifp.com` · `3s-incorporated.com` · `api-nsg.com` · `onesourcesecurity.com` · `integratedprotectionservices.com` · `wmfireprotection.com`. `certasitepro.com` carries the APi logo and *"CertaSite is a subsidiary of APi Group."* Legal names and cities captured where stated: United States Fire Protection, Inc. (USAFP) · Texas Sprinkler, Grapevine TX · ICS, Inc., Grand Forks ND · International Fire Protection, Inc., Madison AL · 3S Incorporated, Harrison OH · One Source Security, Merrimack NH · Integrated Protection Services, Darien CT · Western States Fire Protection Co · Security Fire Protection Company, Inc., Memphis TN. | **The master notes that beyond the redirects and a few source-note paths it does not state which domain belongs to which brand, and instructs that the mapping not be constructed.** This pass establishes sixteen of those mappings by fetching them, so they are stated rather than constructed. That is the difference between a register that can resolve an APi nameplate and one that can only warn about it. |

---

## 5. What could not be verified — all of it, named

### 5.1 Fifteen parents with no verified domain

**Eight are absorbed or dissolved nameplates that correctly have no live site.** These are not gaps in any useful
sense — there is nothing left to reach, and their absence from the web is consistent with the master's account of
them. All eight are carried in the register with `NOT A TARGET` in the note line.

| Entity | Status per the master | Why there is no domain |
|---|---|---|
| Protegis Fire & Safety | Absorbed into Summit Fire & Security, 2022-05-02 | Does not appear as a live trading brand on Summit's own branch-locations pages |
| Performance Systems Integration | Absorbed into Summit Fire & Security, 2025-08-12 (closed 2025-08-21) | Master records no domain in its register sections; a `psintegrated.com` URL appears only in an unrelated appendix source list and was **not fetched in this pass**, so it is deliberately excluded rather than carried unverified |
| STANLEY Security | Acquired by Securitas AB, completed 2022-07-22 | Trades inside Securitas Technology; no standalone site sought or found |
| Corbett Technology Solutions (CTSI) | Is Pavion — rebrand complete, "one Pavion" migration finished 2025 | The company still exists under a different name at `pavion.com` |
| ADT Commercial / ADT Multifamily | Renamed Everon at the GTCR close, 2023-10-02 | The company still exists under a different name at `everonsolutions.com` |
| Consolidated Fire Protection | Sold by Gryphon Investors to Minimax, 2007 | Successors are `coscofire.com`, `coscodas.com`, `firetrol.net` |
| Onyx-Fire Protection Services | Acquired by APi Group, closed 2026-06-08 | **Canadian** — not sought; removes nothing from a US target board |
| WTech Fire Group | Acquired by APi Group, closed 2026-07-01 | **Europe/Ireland** — not sought; same |

**Seven are live entities where this pass simply did not establish a domain.** These are real gaps. Each is stated
with the specific reason, so a later session knows whether to retry or not to bother.

| Entity | Reason no domain was written | Retry worth it? |
|---|---|---|
| **Carrier Global Corporation** | `corporate.carrier.com` returned **HTTP 302 to an off-host URL at `carrier.com/us/en`**. **The destination was not fetched**, so no page was reached and nothing self-identified. Left out rather than assumed. | Yes, trivially — but low value. The master establishes Carrier **retains no fire business and is not a bidder**; it is in the register only so a screener does not attribute Kidde, Edwards, Marioff, Autronica, Det-Tronics, Fireye or LenelS2 to it. |
| **Bosch Group** | **Not attempted.** Deliberate: the master establishes Bosch appears in this market only as the buyer of JCI's residential HVAC, and that **no US fire sprinkler or suppression contracting asset under Bosch appears in the public record.** | Low value for the same reason. |
| **COPS Monitoring** | No domain on the record and none sought. **Ownership also not established in the public record.** Monitoring infrastructure, not a fire contractor. | Moderate — it holds the wholesale monitoring businesses of Security Partners and AlarmWATCH, so it sits upstream of SV2 recurring revenue. |
| **Rapid Response Monitoring Services** | No domain on the record and none sought. **Ownership also not established.** | Moderate, same reason. ⚠️ **Token trap if retried: "Rapid" collides three ways** — this entity, RapidFire Safety & Security (Concentric, St. Louis, `rapidfiress.com`), and Pye-Barker's Rapid Fire Protection brand in Salt Lake City. Do not accept a "rapid" domain without checking which of the three it is. |
| **Affiliated Monitoring** | No domain on the record and none sought. **Ownership also not established.** | Moderate, same reason. |
| **National Monitoring Center / The Netwatch Group** | No domain on the record and none sought. NMC sits inside The Netwatch Group after a merger with Netwatch, Onwatch Multifire and CalAtlantic — all four absorbed. **NMC is a sub-5-character never-match token.** | Low as a target; relevant mainly because ORR Protection's CEO previously ran NMC. |
| **Fortis** | **Deliberately not sought, and no domain may be attached to this name.** "Fortis" appears **exactly once** in the master (line 1108) in a list of platforms that disclose no deal values. The master gives it **no class, no sponsor, no footprint, no domain and no Part IV entry.** | **No.** Searching a bare token that collides across many industries and writing whatever comes back is precisely how an invented domain enters a register. It stays empty until the master or a primary source names the entity properly. |

### 5.2 Domains reached but not counted clean — four

Each was fetched and returned content, but something specific stops it being a clean verification. All four are
recorded in the register's `## Coverage and gaps` with the same reasons.

| Domain | What was reached, 2026-08-10 | Why it is not counted clean |
|---|---|---|
| **`clearconnection.com`** | Page returned. Identifies as **"Clear Connection"**, address **11850 Baltimore Avenue, Suite A, Beltsville, MD 20705**. | **Names no parent anywhere on the page.** The master carries this domain inside **APi Group's verified domain set**, but the site itself gives no APi trace — unlike the fifteen APi brand sites that state subsidiary status in their own footers. **The company identity is verified; the APi attribution is not confirmed from the brand's side and remains the master's claim alone.** Consequence: do not use this domain to attribute an owner without a second source. |
| **`tenetsolutions.com`** | **Nothing.** The fetch failed before any content was returned: robots.txt could not be read because of an **expired TLS certificate** (`CERTIFICATE_VERIFY_FAILED — certificate has expired`). | **No page was reached, so nothing self-identified.** In APi's master domain set; not verified here. **Not treated as a dead domain** — an expired certificate is an operational lapse, not evidence of a lapsed registration, and it is a materially different finding from Finding 1. Retry is worthwhile and cheap. |
| **`cfsnyc.com`** | Page returned. Identifies as **"CROSS-FIRE & SECURITY CO., INC."**, address **41-33 38th St, Long Island City, NY 11101**, described as a New York State licensed and insured life-safety firm. | **The page presents the company as independent and names no parent.** The only Altus trace is a recruitment link to `altusfirejobs.com`. **The Altus tie is established from the parent's side — `altusfire.com` lists CFS NYC among its member brands — not from the brand's.** This is the mirror image of Finding 8 and the same caution applies: a screener meeting Cross-Fire in the field cannot establish ownership from the nameplate or its site. |
| **`chubbfs.com`** | Page returned. Identifies as **"Chubb Fire & Security"**, *"more than 12,000 employees, operating from more than 200 offices in 17 countries"* — consistent with the master. | **Does not name APi Group in its body text.** The only APi trace is a **footer link to an ESG document hosted at `apigroupinc.com`**. Company identity is verified; the APi parentage is legible from APi's filings and from that footer link, but **is not stated on the page**, which is weaker than the fifteen brand sites that say so outright. Also, not to be confused with Chubb Limited, the insurer. |

### 5.3 Two further caveats attached to domains that ARE counted clean

Recorded so a later session can see exactly how thin each thread is.

- **`ars-guardian.com`** — the root was reached and self-identified as **"Guardian Fire Protection Services"**, the
  exact and unique trading name of the Rockville MD entity. But **the page disclosed no location**, and a follow-up
  fetch of `/about-us/` returned **HTTP 404**. **The Rockville tie therefore rests on the exact name string plus
  the master's statement that this entity publishes on two domains** — it was not independently confirmed by an
  address on that host. Given the Guardian cluster's maximum-severity grading, this is the thinnest verification in
  the register. It is counted because the name string is unique across all five Guardians, but a session with a
  reason to be careful should re-check it against a page that carries an address.
- **`convergint.com`** — the domain is cleanly verified as Convergint. But the page reached led with **physical
  access control** and **did not evidence a fire and life-safety line.** Convergint's **class 1b membership depends
  on fire and life safety appearing in its own service description**, which is the master's criterion for that
  class. **This pass did not reconfirm that criterion for this entity.** The classification is carried on the
  master's authority alone.

---

## 6. Carried forward unresolved — deliberately not decided

Four items. In each case the reason for not deciding is the same in shape: **this pass checked the master against
the live web, and these are contradictions or absences inside the master itself, on which fetching a website
produces no evidence at all.** Deciding them anyway would mean substituting a preference for a finding, and a
register cannot tell the difference afterwards.

### 6.1 Security Fire Systems — weak-attribution marker versus the §4.1 count

**The discrepancy.** The master's §4.3 table marks this entity's sponsor **"(trade press only)"** — the same
weak-attribution marker carried by RapidFire Safety & Security and Telgian. But **§4.1 names only two**
weakly-attributed entities, RapidFire and Telgian, and omits Security Fire Systems. Both statements are in the
document.

**Why not mine.** This is a grading decision about the strength of an ownership attribution, and it changes how the
entity is scored on a target board — a weakly-attributed sponsor means the ownership claim itself may not hold,
which is a different risk from a well-evidenced sponsor early in a hold. Resolving it requires reading the
underlying trade-press sources and judging whether they clear the master's own bar, which is research adjudication,
not domain verification. **This pass produced no evidence bearing on it either way.** What it did produce is the
company's own site and footprint (Finding 4), which makes the entity identifiable but says nothing about Blackford
Capital's stake. **Both readings are carried in the register block.**

### 6.2 Security 101 — excluded in §4.3, listed as a likely acquirer in §10.5

**The discrepancy.** §4.3 **explicitly excludes** Security 101 from the register, and says the exclusion is itself
the finding: *"Neither the acquisition announcement nor the company's own site names fire or life safety anywhere
… a sponsor-backed integrator of that size with no fire line will not appear as a bidder for fire assets."* Yet
§10.5 names *"Security 101 under Morgan Stanley Capital Partners"* in its likely-acquirers list.

**What this pass can contribute — and its limit.** `security101.com` was fetched 2026-08-10 and **corroborates the
§4.3 half**: the site describes access control, video, intrusion detection and visitor management, and **fire and
life safety appear nowhere.** That is a real data point and it is recorded in the register block.

**Why it still is not mine to decide.** The §10.5 statement is a judgment about *bidder behaviour*, not about
service lines — an integrator can bid for an adjacent asset it does not currently operate, which is exactly what a
sponsor-backed platform with capital and no fire line might do. My fetch confirms the absence of a fire line; it
does **not** establish that the company will not bid. Deciding whether Security 101 belongs in the acquirer set is
a scoping call about who competes for the targets on the board, and under the studio's decision gates that scoping
belongs to Paul, not to a verification pass. **Both statements are carried in the register block with the
inconsistency named.**

### 6.3 Class 4's five members are never enumerated

**The gap.** The master states the class-4 count as **5** in both its §4.1 table and its executive summary, but
**never lists which five.** Eleven entities are named across the document as exited-to-a-strategic or
absorbed-into-another-platform.

**Why not mine.** Choosing five from eleven would be a guess dressed as a finding, and the specific harm is
asymmetric: an entity wrongly excluded from class 4 gets screened as a live target when it no longer exists
independently. **The register carries all eleven, each flagged `NOT A TARGET`, and states explicitly that the five
the count refers to are unknown.** That is strictly safer than any selection and costs nothing on a target board,
since none of the eleven is a target under either reading.

### 6.4 The two unnamed long-hold platforms

**The gap.** §10.5 states that **"continued ownership could not be confirmed from a primary source for two of the
platforms whose hold periods look longest"**, so those two are candidates *"on the strength of an absence of news
rather than on evidence."* **The master does not name them.**

**Why not mine, and why it matters more than it looks.** Two entities in class 1a are therefore carried on weaker
evidence than the other fifteen, and **nobody reading the register can tell which two.** Identifying them requires
re-running the master's own ownership checks across the class-1a set — research work, not verification of a domain.
**A verified domain does not help here at all**, and this is worth stating plainly: several class-1a sites reached
in this pass name no owner whatsoever, which is normal and is not evidence of anything. `coscofire.com` carries a
**© 2020** footer and names no owner; `firetrol.net` names no owner; `orrprotection.com` names no owner. **Silence
on a company's website is not evidence about its ownership in either direction.**

---

## 7. Observations that did not rise to a correction

Recorded because they are cheap to carry and expensive to rediscover. None of these changes the register; each is
a thread a later session might otherwise pull from scratch.

- **"Adcock" has three spellings.** The master notes Altus renders the brand *"Addock Systems"* on its own page
  while the published domain is `adcocksystems.com`, and instructs that both be carried. The page fetched
  2026-08-10 renders it **"Addcock Systems"** — a third variant. Carry all three; the domain is the only stable
  identifier.
- **Everon's site did not show NewTech Systems.** The master records NewTech as the one legacy nameplate retained,
  and the only Everon unit carrying named cities. It was **not visible on the pages fetched**. This is absence of
  evidence from one homepage fetch, not evidence of absence — but verify before relying on those six cities.
- **`kidde.com` does not show FIREX on its brand wall.** `kiddeglobalsolutions.com` lists Kidde, Badger, Gloria,
  Edwards, Kidde Commercial, GST, Aritech, EMS, AirSense and Kidde Commercial UK — adding **Gloria, EMS, AirSense**
  to the master's set and **not displaying FIREX**, which the master carries as a Kidde brand and which separately
  collides with a named Encore affiliated brand partner. Does not overturn anything; flagged because FIREX is one
  of the tokens the master grades **domain only**.
- **`comfortsystemsusa.com` lists no fire protection service line at all.** The master's case rests on a 10-Q
  saying the mechanical segment *"principally includes … monitoring and fire protection"*, and concludes **no
  fire-protection denominator exists in the public record.** The corporate site not listing it is a second,
  independent reason not to attempt to size it. Same for `emcorgroup.com`, which lists mechanical and electrical
  construction, facilities services, energy infrastructure and green building, and no fire line.
- **`cintas.com` does display Fire Protection Services** — fire extinguisher inspection, fire alarm monitoring,
  fire sprinkler systems — consistent with the master's account of a live competing bidder for SV3 route assets
  that a fire-only tracker would miss. The disclosure caveat is unaffected: it sits inside "All Other" and cannot
  be sized.
- **`securitastechnology.com` does carry commercial fire detection and alarm**, confirming the fire line, but the
  page fetched **does not state the Securitas AB parent relationship**. The parent tie is the master's.
- **`becklar.com` names only two of its five brands.** The About page names **AvantGuard and Freeus** and does
  **not** name Armstrongs, Eyeforce or Dynamark Monitoring. Treat those three as master-sourced only.
- **`orrprotection.com` names no owner** — directly confirming the master's most pointed caution, that an active
  acquirer with no identified owner is the most dangerous entry in a register because it cannot be graded on hold
  period and may or may not be a competing bidder. The site does corroborate **15 branches serving 50 states** and
  CEO **Woodie Andrawos**.
- **`coscofire.com` and `firetrol.net` both name no owner**, directly confirming the master's observation that
  *"neither Cosco's nor Firetrol's own site states an owner"* — which is why a screener working from company sites
  alone reads a two-decade strategically-held franchise as two independents.
- **`aspyrefls.com` describes a network across the US and Canada**; the master records "Southern US foundational,
  stated intent to expand nationally". Not a contradiction — a later date and a broader statement — but the Canada
  element is new.

---

## 8. Summary of state

| | Count |
|---|---|
| Parents in the register | **63** |
| Parents with at least one domain verified 2026-08-10 | **48** |
| Parents with none — absorbed/dissolved, correctly no live site | **8** |
| Parents with none — live entities, domain not established this pass | **7** |
| Distinct domain tokens written into the register | **80** |
| Findings that changed the register | **12** |
| Master flags closed | **3** (plus 11 of 12 parent-level entries in §L.6) |
| Domains reached but not counted clean | **4** |
| Domains deliberately excluded despite appearing in the master | **1** (`absolutefireaz.com`) |
| Master internal discrepancies carried forward undecided | **4** |

**By class, domain coverage:** 1a **17/17** · 1b **5/5** · 2 **3/3** · 3 **8/8** · 4 **3/11** · outside the counts
**12/19**.

**What this pass proves:** that 48 of 63 parents can be resolved to a company by domain as of 2026-08-10, that
sixteen APi brand-to-parent mappings the master declined to construct are now stated primarily, and that the
Guardian cluster — the master's maximum-severity collision — is separable for four of its five members.

**What it does not prove:** that any of those 48 companies is owned by the backer named beside it. Ownership in
this register is the master's, dated 2026-07-29, and per the master's own closing instruction it must still be
established per legal entity from a primary source before any name reaches a client document. **A clean domain
pass is not an ownership pass, and this file should never be cited as one.**


---

# ADDENDUM — second pass, 2026-08-10 · the Guardian cluster, corrected

**This addendum corrects this document's own first pass.** It is filed here rather
than silently edited into the tables above, on the same principle the master's
`A.0.x` ledgers use: a correction that erases its own history teaches nothing.

**How it was found.** Paul read the contact email address published on
`ars-guardian.com` — `CS@GuardianFPS.com` — and followed it to `guardianfps.com`.
The first pass had reached the `ars-guardian.com` root, found it self-identifying
as "Guardian Fire Protection Services", found `/about-us/` returning 404, and
attributed it to the Rockville MD entity on the strength of that name string. It
flagged the row as thin. It was thin because it was wrong.

| Claim | First pass said | Second pass finds | Why |
|---|---|---|---|
| `ars-guardian.com` | A second domain of **Guardian Fire Protection Services (Rockville MD)**, Knox Lane platform, class 1a — "the Rockville tie rests on the exact and unique name string plus the master" | **Not the Rockville entity at all.** It is a **sixth Guardian**, in Houston TX | `ars-guardian.com/contact/` states *"17440 W. Little York, Houston, TX 77084"* and publishes `CS@GuardianFPS.com`; `guardianfps.com` gives the same address and the same trading name. Both fetched 2026-08-10. |
| Rockville MD entity's domains | `guardianfireprotection.com`, `ars-guardian.com` | **`guardianfireprotection.com` only** | `guardianfireprotection.com/contact-us/` states *"7668 Standish Place Rockville, MD 20855"*, a Baltimore second office, and a county-level service area across MD, Northern VA and DC. Fetched 2026-08-10. |
| Size of the Guardian collision | Five unrelated entities (the master's count) | **Six** | The Houston entity is not in the master. |
| Houston entity's owner | n/a — not previously identified | **Unknown.** No parent, sponsor or holding company named on either of its sites | Absence of a named owner is *unknown ownership*, not verified independence. Not a clean target on this evidence. |

## Why this row mattered more than any missing domain

Every other gap in this pass fails **visibly**: a parent with no domain is a parent
the matcher cannot catch, and the register says so in `## Coverage and gaps`.

This one failed the other way. It placed a Houston company's two domains inside a
Knox Lane platform's entry — so a Houston-area screen would have matched that
business against an owned platform and dropped it as **already consolidated**. The
register's stated purpose is that "independent" only means "not in this register";
a wrong entry therefore does not merely fail to catch an owned company, it
**deletes a live independent target off the board**, silently, and nothing
downstream ever asks why a business stopped appearing.

That is the more expensive direction, and it is the harder one to notice, because
a target board with a missing row looks exactly like a target board.

## What this changes about method

The first pass recorded its own weak evidence accurately and still let the row
through. **A row whose evidence is a name string is not a verified row.** The
operational rule going forward: an entity in a known collision cluster requires an
address, a licence-registry record, or a stated parent before a domain is attached
to it — never a name match, however exact and however unique the string looks.

Published contact email addresses are cheap corroboration and were not used in the
first pass. They should be: an email domain that differs from the site's own domain
is a direct pointer to the operator's real identity, and it is exactly what
resolved this.

## Still open on the Houston entity

- Owner not established. Check the Texas Secretary of State and the **Texas State
  Fire Marshal licence registry** before this name reaches any client document —
  Places-style discovery is not evidence.
- Whether it is a genuine independent or a brand of something larger is unresolved.
  It is SV1+SV2+SV3 with kitchen suppression and hood cleaning, which is the
  recurring-revenue shape the thesis looks for, so it is worth the check.

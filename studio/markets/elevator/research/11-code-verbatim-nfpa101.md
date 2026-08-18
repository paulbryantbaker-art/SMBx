<!-- run: 11 | hunt: B | date: 2026-08-11
     query: web search — "NFPA 101 section 9.4 elevators escalators ASME A17.3 existing"; "\"9.4.1\" NFPA 101 \"A17.3\" existing elevators conform"; "\"NFPA 101\" \"9.4.3\" \"existing elevators\" \"A17.3\" shall conform"; "NFPA 101 Life Safety Code free access read only nfpa.org"; "CMS K-tag elevators \"9.4\" Life Safety Code survey existing elevators A17.3 firefighters service"; "\"9.4.2.2\" OR \"9.4.2\" NFPA 101 \"Existing elevators, escalators, dumbwaiters, and moving walks shall conform\""; "CMS 42 CFR 2012 edition Life Safety Code NFPA 101 adopted final rule 2016"; "ASME A17.1 \"8.6.1.2\" Maintenance Control Program written verbatim text"; "\"8.6.1.2.1\" A17.1 \"Maintenance Control Program\" \"shall be in place\""; "archive.org ASME A17.1 safety code elevators escalators full text download"; "\"8.6.1.4.2\" elevator callback records ASME A17.1 five years retained on site"
     fetch — archive.org full-text search-inside API (fulltext/inside.php) against gov.law.nfpa.101.bis.2012, gov.law.nfpa.101.2000, gov.law.asme.a17.1a.2005, gov.law.asme.a17.2.2010, gov.law.asme.a17.3.2002, gov.law.asme.a17.3.2008, queries: "Existing elevators", "New elevators", "shall be in accordance with the requirements of ASME", "Except as modified herein", "escalators, and conveyors shall comply with", "A17.1", "escalators", "Maintenance Control Program", "Control Program", "Maintenance Records", "8.6.1.2", "callback", "callbacks", "written maintenance", "retained", "on site", "retroactive", "The purpose of this Code", "This Code applies"; archive.org /metadata/ for the same items; archive.org advancedsearch identifier:gov.law.asme.a17*; raw djvu.txt for gov.law.asme.a17.1.2004 and gov.law.asme.a17.1a.2005; cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms2786R.pdf; law.cornell.edu 26 Tex. Admin. Code § 505.164; law.cornell.edu Ga. Comp. R. & Regs. R. 120-3-25-.06; law.cornell.edu Ariz. Admin. Code § R20-5-506; oci.georgia.gov 120-3-3-.04 NFPA 101 Chapter 9 modification; ops.colorado.gov mcpguidance0417.pdf; easternelevator.com MCP-Maintenance-Procedures; elevatorworld.com "Creating a Written Maintenance Control Program Document"; link.nfpa.org free-access/publications/101/2024
     tool: web search + fetch -->

# ANSWER — NFPA 101 §9.4

**YES.** NFPA 101 §9.4.2.2 requires existing elevators, escalators, dumbwaiters and moving walks to be in accordance with ASME A17.3, *Safety Code for Existing Elevators and Escalators* — subject to two scope conditions: the "except as modified herein" carve-outs inside §9.4 itself, and the fact that Chapter 9 provisions bind through the occupancy chapters that invoke Section 9.4 (and through CMS, which invokes it for every Medicare/Medicaid-participating health care facility).

---

## 1. The code text itself — NFPA 101, 2012 edition

**Evidence class (a): the code text.** Source is the Internet Archive's full-text copy of NFPA 101 (2012 edition), part of the Public.Resource.Org collection of standards incorporated by reference into law: https://archive.org/details/gov.law.nfpa.101.bis.2012. Text retrieved through archive.org's search-inside API, which returns verbatim snippets with page numbers and, where the OCR captured them, section numbers. **These are snippets, not a continuous reading of the section** — see "What we don't know yet".

### §9.4.2 — Code Compliance

> **9.4.2.1** "Except as modified herein, new elevators, escalators, dumbwaiters, and moving walks shall be in accordance with"
> — NFPA 101 (2012), p. 100

> **9.4.2.2** "Except as modified herein, existing elevators, escalators, dumbwaiters, and moving walks shall be in accordance with the requirements of ASME A17.3"
> — NFPA 101 (2012), p. 101

A second snippet from the same page carries the full standard title:

> "existing elevators, escalators, dumbwaiters, and moving walks shall be in accordance with the requirements of ASME A17.3, Safety Code for Existing Elevators and Escalators."
> — NFPA 101 (2012), p. 101

**This is the whole question, and the answer is that §9.4.2 does exactly what the brief anticipated: it splits new from existing, points new at A17.1 and existing at A17.3.**

### §9.4.3 — Fire Fighters' Emergency Operations

> **9.4.3.1** "All new elevators shall conform to the fire fighters' emergency operations requirements of ASME A17.1/CSA B44, Safety Code for Elevators and Escalators."
> — NFPA 101 (2012), p. 101

> "All existing elevators having a travel distance of 25 ft (7620 mm) or more above or below the level that best serves the needs of emergency personnel for fire-fighting or rescue purposes shall conform to the fire fighters' emergency operations requirements of ASME A17.3, Safety Code for Existing Elevators and Escalators."
> — NFPA 101 (2012), p. 101 (this is §9.4.3.2; the section number was not captured in the snippet, but Texas regulators cite this sentence as §9.4.3 — see §3 below)

### Which edition of A17.3 the 2012 Life Safety Code points at

> "ASME A17.3, *Safety Code for Existing Elevators and Escalators*, 2008."
> — NFPA 101 (2012), Chapter 2 Referenced Publications, p. 26

A second, later listing in the same volume reads:

> "ASME A17.3, *Safety Code for Existing Elevators and Escalators*, 2005."
> — NFPA 101 (2012), p. 448

**Conflicting internal references, both kept.** p. 26 (Chapter 2, mandatory references) says 2008; p. 448 (a later reference list, probably an annex) says 2005. p. 26 is the mandatory-reference chapter and should govern. This is not a material difference for the market question but it is a real inconsistency in the document.

### The same provision in an earlier edition — NFPA 101, 2000 edition

Source: https://archive.org/details/gov.law.nfpa.101.2000, same method.

> **§9.4.2** "existing elevators, escalators, dumbwaiters, and moving walks shall conform to the requirements of ASME/ANSI A17.3"
> — NFPA 101 (2000), p. 77

> **§9.4.3** "All existing elevators having a travel distance of 25 ft (7.6 m) or more above or below the level that best serves the needs of emergency personnel"
> — NFPA 101 (2000), p. 77

Referenced edition in the 2000 Life Safety Code:

> "ASME/ANSI A17.3-1993, *Safety Code for Existing Elevators and Escalators*, including Addenda A17.3a-1994 and A17.3b-1995"
> — NFPA 101 (2000), p. 27

**The provision is stable across twelve years and two editions.** Numbering moved from a flat `9.4.2` (2000) to a split `9.4.2.1` / `9.4.2.2` (2012); the substance did not. Note the verb changed from "shall conform to" (2000) to "shall be in accordance with" (2012) — no evident change in effect.

---

## 2. CMS — the federal enforcement seam

**Evidence class (b): a regulator reproducing the code.** CMS Form **CMS-2786R**, "2012 LIFE SAFETY CODE HEALTHCARE" (the health care facility Life Safety Code survey form), https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms2786R.pdf. Tag **K531**:

> **K531 — EXISTING:** "Elevators comply with the provision of 9.4. Elevators are inspected and tested as specified in ASME A17.1, Safety Code for Elevators and Escalators. Firefighter's Service is operated monthly with a written record. **Existing elevators conform to ASME/ANSI A17.3, Safety Code for Existing Elevators and Escalators.** All existing elevators, having a travel distance of 25 feet or more above or below the level that best serves the needs of emergency personnel for firefighting purposes, conform with Firefighter's Service Requirements of ASME/ANSI A17.3."

> **K531 — NEW:** "Elevators comply with the provision of 9.4… New elevators conform to ASME/ANSI A17.1, Safety Code for Elevators and Escalators, including Firefighter's Service Requirements."

**This is the load-bearing fact for the market sizing.** CMS surveys against the 2012 Life Safety Code, and K531 puts A17.3 conformance for existing elevators on the survey form as a citable deficiency. Every hospital, nursing home, ambulatory surgical centre and other CMS-certified facility with an elevator is inside this, in every state, regardless of whether the state adopted A17.3 directly. That is a federal channel entirely separate from the three states (IL, TX, WA) previously confirmed.

---

## 3. State reproduction of the same provision

**Evidence class (b): a state regulator reproducing the code.** 26 Tex. Admin. Code § 505.164, "Elevators, Escalators, and Conveyors" (via Cornell LII):

> "All existing elevators having a travel distance of 25 feet or more above or below the level that best serves the needs of emergency personnel for fire-fighting or rescue purposes shall conform to Fire Fighters' Service Requirements of ASME/ANSI A17.3 **as required by NFPA 101, §9.4.3**."

> "All elevators equipped with fire fighter service shall be subject to a monthly operation with a written record of the findings made and kept on the premises **as required by NFPA 101, §9.4.6**."

> "New elevators, escalators and conveyors shall be installed in accordance with the requirements of A17.1 Safety Code for Elevators and Escalators, 2000 edition."

> "Existing elevators, escalators, and conveyors shall comply with ASME/ANSI A17.3, Safety Code for Existing Elevators and Escalators, 1996 edition."

Texas is naming §9.4.3 and §9.4.6 as the source of the obligation, which independently corroborates the section numbering read off the code text. Note Texas here pins A17.3-**1996** and A17.1-**2000** — older editions than either NFPA 101 edition references. **Adopted editions vary by jurisdiction and by rule; the requirement does not.**

## 4. What A17.3 is, in its own words

**Evidence class (a): the code text.** ASME A17.3 (2002 edition), https://archive.org/details/gov.law.asme.a17.3.2002:

> "This Code is intended to serve as the basis for state and local jurisdictional authorities in adopting retroactive requirements for existing elevators and escalators…"
> — ASME A17.3 (2002), p. 15

> "The following is a brief history of how the various editions of this Code addressed the matter of retroactive requirements for existing installations."
> — ASME A17.3 (2002), p. 9

> "A too extensive retroactive application is not advisable in any case."
> — ASME A17.3 (2002), p. 9

The retroactive character of A17.3 is confirmed from A17.3 itself. The last quote is worth holding: A17.3 is deliberately a *minimum* retroactive baseline, not a full upgrade to current A17.1. It forces a safety floor, not a modernisation.

## 5. Scope conditions — read these before sizing anything

Three real qualifications, none of which overturns the YES:

1. **"Except as modified herein."** Both §9.4.2.1 and §9.4.2.2 open with this phrase. §9.4 then modifies the referenced ASME codes in its own subsections. The A17.3 reference is not unconditional.
2. **Chapter 9 binds through the occupancy chapters.** NFPA 101 Chapter 9 is "Building Service and Fire Protection Equipment"; occupancy chapters invoke it. One such invocation was captured verbatim: §**28.5.3.1**, "Elevators, escalators, and conveyors shall comply with the provisions of Section 9.4." (NFPA 101 2012, p. 264 — new hotels and dormitories). A phrase search for other occupancy chapters using that exact wording returned only this one hit, which is an OCR/phrasing limitation of the search rather than evidence that other chapters do not invoke §9.4 — CMS K531 demonstrates that health care occupancies do.
3. **No occupancy restriction inside §9.4.2.2 itself.** The captured text carries no occupancy qualifier. The limiting factor is which occupancy chapters invoke Section 9.4, not the wording of §9.4.2.2.

**Market consequence, stated plainly:** the modernization/safety-baseline mandate is not a three-state phenomenon. It travels with every adoption of NFPA 101 — and CMS's adoption of the 2012 Life Safety Code makes it national for health care buildings on its own. Whether it *bites* on a given building still depends on the adopted edition of NFPA 101 and A17.3, the AHJ, and how much of A17.3 that building already meets.

---

# QUESTION 2 — ASME A17.1 §8.6.1.2, read verbatim

**Partially reached. The section number is confirmed from ASME's own text. The full verbatim wording of §8.6.1.2.1 was not obtained, and two of the practice's sub-citations did not check out in the edition reached.**

Nothing was paid for and no paywall was circumvented. ASME A17.1 (2004) and its 2005 addenda are in the Public.Resource.Org collection on archive.org as standards incorporated by reference into law.

### 5a. ASME confirming the section number — A17.2 (2010)

**Evidence class (a): ASME code text, companion volume.** ASME A17.2 (2010), *Guide for Inspection of Elevators, Escalators, and Moving Walks*, https://archive.org/details/gov.law.asme.a17.2.2010:

> "This procedure may also be part of the maintenance control program (MCP) **as required by 8.6.1.2.1**."
> — ASME A17.2 (2010), p. 143, and again identically at p. 163

**ASME's own inspection guide cites §8.6.1.2.1 as the provision requiring the MCP.** This is the single strongest corroboration available short of reading A17.1 §8.6.1.2 itself: it is ASME citing ASME, not a regulator or a vendor. The practice's core claim — that the MCP is required at A17.1 §8.6.1.2 — **holds.**

### 5b. Actual A17.1 text on the MCP — A17.1a (2005), Addenda to the 2004 Edition

**Evidence class (a): the code text.** https://archive.org/details/gov.law.asme.a17.1a.2005, item title "ASME A17.1 (2004): Addenda to the 2004 Edition". All from p. 126:

> "The Maintenance Control Program shall be accessible to the elevator personnel and shall document compliance with 8.6."

> "The instructions for locating the Maintenance Control Program shall be provided in or on the controller along with instructions on how to report any corrective action that might be necessary to the responsible party."

These two appear as lettered items — reported by the search as items (d) and (b) respectively — within §8.6.1.2's on-site documentation provisions. **This is genuine A17.1 code text about the MCP.** It is not the opening sentence of §8.6.1.2.1 defining the programme, which was not reached.

### 5c. §8.6.1.4 Maintenance Records — actual text, and a numbering problem

**Evidence class (a): the code text.** ASME A17.1a (2005), p. 126:

> **8.6.1.4** "Maintenance Records"

> **8.6.1.4.1** "Maintenance records shall document compliance with 8.6 of the Code and shall include records on the following activities:"

> **8.6.1.4.2** "The maintenance records shall be available to the elevator personnel."

> **8.6.1.4(c)** "The maintenance records required by 8.6.1.4 shall be kept at a central location."

**This does not match what the assessment currently says.** The assessment attributes *five-year on-site records* to §8.6.1.4.1 and *callback logs* to §8.6.1.4.2. In the 2004/2005 edition, §8.6.1.4.1 is the *contents* of the maintenance record and §8.6.1.4.2 is its *availability to elevator personnel*. Searches of A17.1a-2005 for "retained" (15 hits, all in §8.7 alteration provisions, none about record retention), "on site" (0 hits) and "callbacks" (0 hits) found no five-year retention period and no callback-log provision at those numbers. A search of ASME A17.2 (2010) for "callback" also returned 0 hits.

Two readings, both live, and both should be carried:
- The five-year retention and callback-log requirements entered A17.1 in a **later edition** (2010, 2013, 2016 or 2019) and sit at those numbers there. The state regulators the practice triangulated from are mostly quoting A17.1-**2013**, which is consistent with this.
- Or the sub-numbers were **mis-mapped** somewhere in the triangulation chain.

**These cannot be told apart without reading a post-2010 edition of §8.6, which was not reached.** The Colorado and Eastern Elevator documents below both cite A17.1-2013 and both name §8.6.1.4 and §8.6.1.2.2 — so the structure survives into 2013 — but neither reproduces the text.

### 5d. Corroboration that goes no further than description

**Evidence class (c): documents describing the code, not quoting it.**

- Colorado Division of Oil and Public Safety, MCP guidance (`ops.colorado.gov/.../mcpguidance0417.pdf`): "The On-site Documentation component shall include items listed in **ASME A17.1-2013 Section 8.6.1.2.2**" and "The Maintenance Records component shall include items listed in **ASME A17.1-2013 Section 8.6.1.4**." Paraphrase throughout; no code text reproduced.
- Eastern Elevator, "MCP Maintenance Procedures, ASME A17.1-2013/CSA B44-13": references §8.6.1.2.1 and §8.6.1.4.1(a). Paraphrase; it is a contractor's implementation document, not a reproduction.
- Georgia R. 120-3-25-.06: "The records shall contain, but not be limited to, all tests, inspections and other maintenance duties referred to in the latest adopted version of ASME A17.1." Names no subsection, names no edition.
- Elevator World, "Creating a Written Maintenance Control Program Document": discusses §8.6 but reproduces none of it.

**Together these establish that §8.6.1.2.2 is "On-site Documentation" and §8.6.1.4 is "Maintenance Records" in the 2013 edition — consistent with the 2004/2005 text read above. They do not establish the five-year or callback claims.**

### 5e. Routes tried and closed

- **ASME A17.1 (2004) full text, archive.org** (`gov.law.asme.a17.1.2004`): the item has **no OCR search index** ("No hOCR or Abbyy file present"), so search-inside fails; the raw 2.9MB text file truncates during fetch at **§8.5**, one section short of §8.6. Closed by tooling, not by access.
- **up.codes** hosts both "9.4.3 Fire Fighters' Emergency Operations" and "Requirements for Maintenance Control Program and Remote Monitoring" — blocked by robots.txt. Not attempted around.
- **NFPA LiNK free access** (`link.nfpa.org`): JavaScript application; no server-rendered section text reachable by fetch.
- **Wisconsin SPS 318.17086(5)**, which by its numbering appears to modify A17.1 §8.6 — `docs.legis.wisconsin.gov` robots.txt could not be fetched. **This is the single most promising unexplored route** and is reachable from a browser.
- **asme.org** — refused at the network layer in this environment (403 at the proxy); free read-only access, if it exists, was not tested.
- ASME A17.1 (1971) full text is on archive.org and would show the pre-MCP structure, but it predates Part 8 in its current form and was not used — the 2004 edition and its 2005 addenda are strictly better for this purpose and were reached.

---

## What we don't know yet

1. **The opening sentence of A17.1 §8.6.1.2.1 — the actual definition of the Maintenance Control Program — has not been read.** ASME's own A17.2 confirms the MCP "is required by 8.6.1.2.1", and A17.1 code text about the MCP's accessibility and controller signage was reached, but the requirement's own wording was not. The assessment's caveat should stay.
2. **Whether §8.6.1.4.1 carries a five-year on-site record retention and §8.6.1.4.2 a callback log in any edition.** In A17.1-2004/2005 they do not — they are record contents and record availability. Either the requirements moved in later than 2005 at those numbers, or the practice's sub-citations are mis-mapped. **Until this is settled, the assessment should cite §8.6.1.2 for the MCP (confirmed) and drop or footnote the §8.6.1.4.1 / §8.6.1.4.2 sub-citations.** Wisconsin SPS 318.17086, a post-2013 state reproduction, or a QEI training deck quoting §8.6.1.4 in full would resolve it.
3. **How many NFPA 101 occupancy chapters invoke Section 9.4.** Only §28.5.3.1 (new hotels and dormitories) was captured verbatim. CMS K531 proves health care occupancies are in. The full list matters for sizing outside health care and was not enumerated.
4. **The content of §9.4's "except as modified herein" modifications**, and of §9.4.4 through §9.4.6 (§9.4.6 is cited by Texas as the monthly fire-fighters'-service test). Not read.
5. **Which NFPA 101 edition each state has adopted**, and therefore which A17.3 edition each state's buildings are actually held to — 1993, 1996, 2002, 2005, 2008 and 2015 all appear in the sources above. The number of states adopting NFPA 101 was asserted in the brief as near-universal but was not verified in this run.
6. **Whether the p. 26 (A17.3-2008) or p. 448 (A17.3-2005) reference governs in NFPA 101-2012.** Both are in the same volume. Chapter 2 should win, but this was not confirmed against the section's own wording.
7. **Enforcement intensity.** That K531 exists on the CMS survey form is not evidence of how often it is cited, or of what remediation surveyors actually demand. No citation-frequency data was sought in this run, and it is the difference between a mandate on paper and a capex driver.

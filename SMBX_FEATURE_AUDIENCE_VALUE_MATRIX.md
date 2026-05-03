# smbX.ai — Feature × Audience Value Matrix

**Status:** Pre-pricing strategic document. Use alongside `SMBX_STRATEGIC_POSITIONING_AND_AUDIENCE_DOC.md`.
**Date:** April 2026.
**Purpose:** Honest map of what smbX has built against what audiences actually need, at what prices they'll actually pay, in a world where ChatGPT-plus-effort is free and SaaS consolidation is killing $149 line items that can't justify themselves. Identifies the features that should be the hero, the features that belong in the platform but shouldn't be the marketing, and the features that may be worth cutting or deprioritizing.

**How to use:** Part 1 is the scored matrix. Part 2 is the interpretation — which cells are hot, which are cold, and what that means for product marketing and pricing. Part 3 is the "so what" — decisions this matrix forces.

---

## Framework

### The 12 capabilities (rows)

I've grouped the built and planned features into 12 capabilities that map to how practitioners actually talk about their work. Implementation details from the repo roll up into these.

| # | Capability | What this actually is |
|---|---|---|
| 1 | **Deal screening & triage** | Fast "should I care about this deal" — classify the business, estimate ranges, flag red flags from a teaser or inbound |
| 2 | **Add-back & QoE Lite analysis** | Normalized EBITDA / SDE work, one-timer identification, working capital math — pre-LOI level depth |
| 3 | **Valuation modeling & comps** | Multiples analysis, sensitivity tables, purchase price structure |
| 4 | **CIM / teaser / pitch book drafting** | First-draft deal marketing documents with real narrative, not template filler |
| 5 | **Buyer list building & target sourcing** | Who to approach for a sell-side, who to target for a buy-side |
| 6 | **LOI / IOI / term sheet drafting** | First-draft offer documents from collected deal context |
| 7 | **Due diligence coordination** | Diligence checklists, data room organization, status comms across parties |
| 8 | **Deal pipeline & CRM** | Tracking deals through stages, gate transitions, relationship history |
| 9 | **Market / industry / comp research** | Sector research, comp transactions, market sizing |
| 10 | **Investor memos & deal updates** | IC memos, LP updates, capital partner pitches |
| 11 | **Post-close / PMI planning** | 100-day plans, integration tracking, portfolio ops |
| 12 | **Regulatory & structure modeling** | SBA SOP 50 10 8 structures, R&W, earnout, rollover scenarios |

### The 7 audiences (columns)

From the strategic doc, ranked and consolidated:

1. **Independent sponsors** (Tier 1)
2. **Search funders** (traditional + self-funded combined; differences noted in cells) (Tier 1)
3. **LMM advisors / boutique bankers / brokers** (Tier 1)
4. **Corp dev at serial acquirers** (Tier 2)
5. **Family offices direct-investing** (Tier 2)
6. **Principal sellers** (individual owner-operators selling their business) (organic)
7. **Principal buyers** (first-time acquirers not in any other category) (organic)

### The 5 scoring dimensions (each cell 1–5)

Each feature × audience cell scored on five dimensions:

- **Pain (P):** How acutely does this audience feel this problem today? (5 = they vent about it publicly; 1 = they barely think about it)
- **WTP (W):** What willingness-to-pay band does this sit in, *when priced as a standalone capability*? (5 = $1K+/month band; 4 = $200–500/month; 3 = $50–150/month; 2 = $10–40/month; 1 = they want it free)
- **Build-it-yourself difficulty (B):** How hard would it be for an 80th-percentile-resourceful practitioner to replicate this with ChatGPT + Excel + a weekend? (5 = essentially impossible to replicate well; 3 = doable but painful; 1 = trivially replicable with a good prompt)
- **Competitor crowding (C):** How crowded is this capability with established vendors already? (5 = wide open; 1 = dominated by incumbents with deep moats)
- **smbX fit & defensibility (S):** Does smbX's current architecture, restraint pattern, and positioning execute this well and defensibly? (5 = hero feature territory; 1 = we shouldn't ship it)

**Composite score:** P + W + B + C + S, max 25. Anything over 18 is a "lead with this" capability for that audience. 14–18 is "platform depth." Under 14 is "ship it but don't market it."

---

## PART 1 — The Matrix

Scores are shown as **P/W/B/C/S = total**. Narrative follows each capability.

### 1. Deal screening & triage

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 5 | 4 | 3 | 4 | 5 | **21** | 🔥 Hero |
| Search funders | 5 | 3 | 3 | 4 | 5 | **20** | 🔥 Hero |
| LMM advisors | 4 | 4 | 3 | 3 | 5 | **19** | 🔥 Hero |
| Corp dev | 5 | 4 | 3 | 4 | 5 | **21** | 🔥 Hero |
| Family offices | 5 | 5 | 3 | 4 | 5 | **22** | 🔥 Hero |
| Principal sellers | 2 | 2 | 2 | 3 | 4 | **13** | Platform |
| Principal buyers | 4 | 3 | 3 | 4 | 5 | **19** | 🔥 Hero |

**Why this scores so high across practitioner audiences:** Screening is the single most repeated, highest-volume activity in deal work. An IS or corp dev team screens 100+ opportunities per closed deal. The practitioner's most common vent — "still doing this in Excel" — is literally about screening. ChatGPT can do a superficial pass but lacks the harness: persistent deal memory, vernacular-accurate output, sources, and a classification system that ties to valuation workflow. Build-it-yourself would require a real prompt library, embeddings, a deal-data model, and output formatting — that's a 2-week engineering project for a resourceful shop, vs. a $149/month purchase decision.

**Why principal sellers score low:** They screen one deal (their own) in a lifetime. Screening tooling isn't their pain. Their pain is "what's my business worth."

---

### 2. Add-back & QoE Lite analysis

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 5 | 5 | 4 | 4 | 5 | **23** | 🔥 Hero |
| Search funders | 5 | 5 | 4 | 4 | 5 | **23** | 🔥 Hero |
| LMM advisors | 4 | 4 | 3 | 3 | 5 | **19** | 🔥 Hero |
| Corp dev | 4 | 3 | 4 | 4 | 5 | **20** | 🔥 Hero |
| Family offices | 4 | 4 | 4 | 4 | 5 | **21** | 🔥 Hero |
| Principal sellers | 4 | 4 | 4 | 4 | 5 | **21** | 🔥 Hero (for sell-side prep) |
| Principal buyers | 5 | 5 | 4 | 4 | 5 | **23** | 🔥 Hero |

**The highest-total capability in the matrix.** A full QoE runs $25–75K and 3–6 weeks. Practitioners routinely spend $10–25K on QoE for deals that die in DD. A pre-LOI add-back analysis that catches the big issues before the full QoE is exactly the "$25K of decision insurance for $149" value prop. ChatGPT can do arithmetic, but the harness — deterministic calc engine, bank statement reconciliation, adjusted EBITDA schedule formatting, audit trail — is real engineering work that most shops will not replicate.

**Only drag:** Finsider.ai and similar specialist tools are moving into this space with venture funding. Competitor crowding is rising from 5 to 4. smbX's 22-formula deterministic engine is already built, which is the moat — LLMs hallucinate arithmetic; smbX doesn't, because the numbers come from code, not the model.

**This is the single clearest lead-with-this capability across every practitioner audience.** If smbX has only one marketable hero in its first 6 months, it should be this.

---

### 3. Valuation modeling & comps

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 4 | 4 | 3 | 2 | 4 | **17** | Platform |
| Search funders | 4 | 3 | 3 | 2 | 4 | **16** | Platform |
| LMM advisors | 5 | 4 | 3 | 2 | 4 | **18** | Platform, edge-hero |
| Corp dev | 4 | 3 | 3 | 2 | 4 | **16** | Platform |
| Family offices | 4 | 4 | 3 | 2 | 4 | **17** | Platform |
| Principal sellers | 5 | 3 | 4 | 3 | 5 | **20** | 🔥 Hero (principal-side) |
| Principal buyers | 5 | 3 | 4 | 3 | 5 | **20** | 🔥 Hero (principal-side) |

**Competitor crowding (C=2) is the drag.** BVR, DealStats, GF Data, PitchBook, CapIQ, Mergr all own this space with massive data moats. LMM advisors buy these subscriptions specifically. smbX's valuation modeling benefits from the calc engine but doesn't have proprietary transaction comps — so for practitioners, this is a "good enough that you don't need another tool" feature, not a "replaces your PitchBook subscription" feature. Don't market against PitchBook; market it as "one of many things Yulia handles."

**For principals, the dynamic flips.** An individual seller or first-time buyer doesn't have PitchBook. Their alternative is a free Google search and guesswork. For them, "what's this worth" is the *entire reason they're here*. Mark this as a principal-facing hero.

---

### 4. CIM / teaser / pitch book drafting

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 3 | 3 | 4 | 4 | 4 | **18** | Platform, edge-hero |
| Search funders | 3 | 3 | 4 | 4 | 4 | **18** | Platform, edge-hero |
| LMM advisors | 5 | 5 | 4 | 4 | 5 | **23** | 🔥 Hero |
| Corp dev | 3 | 3 | 4 | 4 | 4 | **18** | Platform |
| Family offices | 3 | 2 | 4 | 4 | 4 | **17** | Platform |
| Principal sellers | 4 | 4 | 5 | 4 | 5 | **22** | 🔥 Hero (sell-side prep) |
| Principal buyers | 2 | 2 | 4 | 4 | 3 | **15** | Platform |

**For LMM advisors, this is the hero capability.** CIM drafting is where bankers lose the most time and where the output quality directly drives the pitch/win rate. A first-draft CIM in hours instead of a week compresses the sell-side timeline by 2–4 weeks. That's the single most valuable time recovery in a boutique banker's workflow, and Rogo/Hebbia don't serve them.

**For buyers (IS, search funders, corp dev), they're consuming CIMs not producing them.** The flip-side capability — CIM *review* and scoring — is where their value is. That's scored under Deal screening (#1).

**For principal sellers, this is huge.** The owner-operator selling their business needs marketing materials and doesn't know where to start. "You get a CIM-grade summary of your business in 48 hours" is a strong principal hero.

**Build-it-yourself is high (4) because** a CIM isn't just a document — it's a narrative, a financial model, chart generation, confidentiality handling, and distribution. ChatGPT can write narrative. It can't do the whole workflow. This is where the harness pays.

---

### 5. Buyer list building & target sourcing

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 4 | 3 | 3 | 2 | 3 | **15** | Platform |
| Search funders | 5 | 4 | 3 | 2 | 3 | **17** | Platform |
| LMM advisors | 5 | 5 | 3 | 2 | 3 | **18** | Platform, careful-hero |
| Corp dev | 5 | 4 | 3 | 2 | 3 | **17** | Platform |
| Family offices | 3 | 2 | 3 | 2 | 3 | **13** | Ship, don't market |
| Principal sellers | 3 | 3 | 3 | 2 | 3 | **14** | Platform |
| Principal buyers | 4 | 3 | 3 | 2 | 3 | **15** | Platform |

**The most competitor-crowded capability in the matrix (C=2).** Grata, Sourcescrub, Cyndx, PitchBook, Axial, Affinity, SetSail all own real share here. Datasite's roll-up of Grata + Sourcescrub explicitly consolidates this category. smbX can do target sourcing via website enrichment and aggregator monitoring, but so can everyone else.

**Do not market sourcing against Grata.** You will lose head-to-head comparisons on data breadth. Market it as "your targeted list lives inside your deal conversation" — i.e., workflow integration, not data dominance. The practitioner who's paying $20K/year for Grata is not the one smbX wins. smbX wins the practitioner who was going to Clay + Apollo + Google + Sheets (the "85% of the value at 20% of the cost" DIY archetype from Searchfunder).

**This is a "reason they stay" feature, not a "reason they sign up" feature.** Ship it, include it in Pro, but never make it the homepage hero.

---

### 6. LOI / IOI / term sheet drafting

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 3 | 3 | 3 | 4 | 5 | **18** | Platform, edge-hero |
| Search funders | 3 | 3 | 3 | 4 | 5 | **18** | Platform, edge-hero |
| LMM advisors | 4 | 3 | 3 | 4 | 5 | **19** | 🔥 Hero |
| Corp dev | 3 | 2 | 3 | 4 | 5 | **17** | Platform |
| Family offices | 3 | 2 | 3 | 4 | 5 | **17** | Platform |
| Principal sellers | 3 | 3 | 3 | 4 | 5 | **18** | Platform |
| Principal buyers | 4 | 4 | 3 | 4 | 5 | **20** | 🔥 Hero |

**Quietly strong capability, especially for principal buyers** (self-funded searchers, first-time acquirers, IS with limited legal budget) who are currently paying $2–10K per LOI to an attorney for a document that's 80% template. Harvey and DraftWise serve this for AmLaw 100 — nobody serves it below that line.

**Caution:** LOI drafting is the single capability where regulatory posture matters most. This is why S=5 is warranted — the Analysis → Options → Implications → User Decides pattern is structurally protective here. Yulia generates the LOI; the user signs it. Never the other way. The restraint pattern *is* the legal moat on this capability.

**For LMM advisors,** this rolls up under CIM/pitch work. For principal buyers, it deserves its own hero treatment: "Your first LOI, drafted, for $149."

---

### 7. Due diligence coordination

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 4 | 3 | 4 | 3 | 4 | **18** | Platform, edge-hero |
| Search funders | 3 | 3 | 4 | 3 | 4 | **17** | Platform |
| LMM advisors | 5 | 4 | 4 | 3 | 4 | **20** | 🔥 Hero |
| Corp dev | 5 | 4 | 4 | 3 | 4 | **20** | 🔥 Hero |
| Family offices | 4 | 3 | 4 | 3 | 4 | **18** | Platform |
| Principal sellers | 3 | 2 | 4 | 3 | 3 | **15** | Platform |
| Principal buyers | 4 | 3 | 4 | 3 | 3 | **17** | Platform |

**Classic "harness premium" capability.** ChatGPT cannot do this at all. You need persistent state, notifications, document indexing, cross-party communication, audit trails. Build-it-yourself = 4 (high) for any practitioner team.

**The specific pain for LMM advisors:** "I'm writing the same status email to five parties on Friday afternoon." This is a universal LMM workflow that smbX's notification + invitation + RBAC infrastructure was built to solve. The work is done; the marketing isn't.

**For corp dev teams running 20+ deals,** this is where DealCloud and Midaxo make $500K/year. Yulia's workspace model + conversation-per-gate structure is the 80% solution at 5% of the price. Market this as "DealCloud that doesn't need a dedicated administrator."

**Competitor crowding is moderate** — DealCloud, Midaxo, DealRoom, Devensoft are all here. But they all require implementation time and dedicated admins. smbX's no-setup advantage is real for teams under 10 people.

---

### 8. Deal pipeline & CRM

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 4 | 3 | 3 | 2 | 3 | **15** | Platform |
| Search funders | 5 | 3 | 3 | 2 | 3 | **16** | Platform |
| LMM advisors | 5 | 4 | 3 | 2 | 3 | **17** | Platform |
| Corp dev | 5 | 4 | 3 | 2 | 3 | **17** | Platform |
| Family offices | 4 | 3 | 3 | 2 | 3 | **15** | Platform |
| Principal sellers | 2 | 1 | 3 | 2 | 2 | **10** | Don't bother |
| Principal buyers | 3 | 2 | 3 | 2 | 3 | **13** | Ship, don't market |

**Crowded and mediocre as a lead feature.** HubSpot free tier + Pipedrive + DealCloud + Affinity + Salesforce + 4Degrees + Altvia all own this space. smbX's pipeline is good but not category-defining.

**The one differentiator:** deals-as-conversations rather than deals-as-records. Yulia remembers the deal; the user talks to Yulia. That's a genuine UX innovation vs. a Salesforce-style database. But that innovation only shines when paired with the other capabilities. Standalone, pipeline/CRM is a commodity.

**Do not make this a pricing tier boundary.** "You need to upgrade for CRM" is a bad upgrade trigger. Make pipeline available in every paid tier including Starter.

---

### 9. Market / industry / comp research

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 3 | 3 | 3 | 2 | 3 | **14** | Platform |
| Search funders | 4 | 3 | 3 | 2 | 3 | **15** | Platform |
| LMM advisors | 4 | 4 | 3 | 2 | 3 | **16** | Platform |
| Corp dev | 4 | 3 | 3 | 2 | 3 | **15** | Platform |
| Family offices | 3 | 3 | 3 | 2 | 3 | **14** | Platform |
| Principal sellers | 4 | 3 | 4 | 3 | 4 | **18** | Platform, edge-hero |
| Principal buyers | 4 | 3 | 4 | 3 | 4 | **18** | Platform, edge-hero |

**Crowded by AlphaSense, Tegus (pre-acquisition), PitchBook, CapIQ, FactSet, Bloomberg.** Practitioners already have research subscriptions. smbX's deep research via Sonnet is good but not category-defining for the professional segment.

**For principals,** this shifts. An owner-operator doesn't have AlphaSense. A first-time buyer doesn't have Tegus. For them, "show me what businesses like mine sold for last year" is high-value and not solved by anything else at a consumer price point. Lean into this on principal-facing pages.

---

### 10. Investor memos & deal updates

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 5 | 4 | 3 | 4 | 5 | **21** | 🔥 Hero |
| Search funders | 5 | 4 | 3 | 4 | 5 | **21** | 🔥 Hero |
| LMM advisors | 3 | 2 | 3 | 4 | 4 | **16** | Platform |
| Corp dev | 5 | 4 | 3 | 4 | 5 | **21** | 🔥 Hero |
| Family offices | 4 | 3 | 3 | 4 | 4 | **18** | Platform, edge-hero |
| Principal sellers | 2 | 2 | 3 | 4 | 2 | **13** | Don't bother |
| Principal buyers | 3 | 2 | 3 | 4 | 3 | **15** | Platform |

**Hiding in plain sight.** IC memos, LP updates, capital partner pitches, board decks — this is the weekly grind for every IS, search funder, and corp dev lead. It's not marketed anywhere by competitors because Rogo/Hebbia serve enterprise where memo writing is done by 27-year-olds who are paid to do it. The segments smbX targets don't have those 27-year-olds.

**"Your quarterly LP update, written in 20 minutes"** is a concrete, testable value prop that would resonate instantly with IS and search funders. This deserves more marketing prominence than it currently has.

---

### 11. Post-close / PMI planning

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 3 | 3 | 3 | 4 | 4 | **17** | Platform |
| Search funders | 4 | 4 | 3 | 4 | 4 | **19** | 🔥 Hero (post-close only) |
| LMM advisors | 1 | 1 | 3 | 4 | 2 | **11** | Don't market |
| Corp dev | 4 | 3 | 3 | 4 | 4 | **18** | Platform, edge-hero |
| Family offices | 3 | 3 | 3 | 4 | 4 | **17** | Platform |
| Principal sellers | 1 | 1 | 3 | 4 | 2 | **11** | Don't market |
| Principal buyers | 4 | 4 | 3 | 4 | 4 | **19** | 🔥 Hero (searcher/buyer) |

**Search funders become CEOs of the businesses they buy.** The 100-day plan is the most important deliverable of their career and nobody serves them well. The subscription-continues-post-close decision you already made pays off directly here — the deal relationship extends into operating the business, and Yulia becomes a new kind of Chief of Staff.

**For LMM advisors, irrelevant.** Their engagement ends at close. Don't market PMI to them.

---

### 12. Regulatory & structure modeling (SBA SOP 50 10 8, R&W, earnouts, rollover)

| Audience | P | W | B | C | S | Total | Read |
|---|---|---|---|---|---|---|---|
| Independent sponsors | 5 | 4 | 5 | 5 | 5 | **24** | 🔥 Hero |
| Search funders | 5 | 5 | 5 | 5 | 5 | **25** | 🔥 Hero |
| LMM advisors | 5 | 4 | 5 | 5 | 5 | **24** | 🔥 Hero |
| Corp dev | 3 | 2 | 5 | 5 | 4 | **19** | 🔥 Hero (narrow) |
| Family offices | 3 | 3 | 5 | 5 | 4 | **20** | 🔥 Hero |
| Principal sellers | 3 | 3 | 5 | 5 | 4 | **20** | 🔥 Hero |
| Principal buyers | 5 | 4 | 5 | 5 | 5 | **24** | 🔥 Hero |

**The single highest-scoring capability in the entire matrix.** And it's the one that hasn't been marketed at all.

**Why:** SBA SOP 50 10 8 (effective June 1, 2025) is the most disruptive regulatory change in two decades for SMB/LMM/search-fund deals. 41% of brokers report deal delays. Rollover equity is effectively dead in SBA deals. Seller notes only count as equity on full standby. Partial change-of-ownership must now be stock purchases. Every single practitioner in our target audiences is actively trying to figure out how to restructure deals to close.

**Nobody else covers this with AI tooling.** Rogo and Hebbia don't care — their customers don't do SBA-financed deals. OffDeal does the deals but doesn't publish tooling. The lawyers charge $1,000/hour to model scenarios.

**Build-it-yourself is 5 (impossible to replicate well)** because this isn't a prompt — it's regulatory knowledge, financial structure modeling, and lender-specific scenario generation. A practitioner with ChatGPT can ask "what is SOP 50 10 8" and get a Wikipedia answer. They cannot get "restructure this specific deal to maintain 10% equity injection with a 24-month limited-standby seller note under the new rules."

**This should be a marketing hero, not just a platform feature.** "Your rollover structure just died. Yulia rebuilds it in 5 minutes." This is the most specific, most timely, most differentiating hook the matrix produces.

---

## Matrix summary — totals by audience

Averaged across all 12 capabilities, by audience:

| Audience | Avg composite | Avg "pain" | Avg "WTP" | Hottest capability |
|---|---|---|---|---|
| Independent sponsors | 18.4 | 4.0 | 3.5 | Regulatory & structure (24) |
| Search funders | 18.8 | 4.3 | 3.6 | Regulatory & structure (25) |
| LMM advisors | 19.0 | 4.3 | 3.8 | Regulatory & structure (24), CIM drafting (23) |
| Corp dev | 18.4 | 4.3 | 3.3 | Diligence coord (20), Screening (21), Memos (21) |
| Family offices | 18.5 | 3.7 | 3.3 | Screening (22), Add-back (21) |
| Principal sellers | 15.6 | 2.8 | 2.5 | CIM/marketing (22), Add-back (21) |
| Principal buyers | 18.0 | 4.0 | 3.3 | Add-back (23), LOI (20), Regulatory (24) |

**The cleanest read:**
1. **Search funders, LMM advisors, and principal buyers have the most pain.** They're also the three that should get the most marketing attention per the strategic doc.
2. **Regulatory & structure modeling is the highest-total capability across every practitioner audience.** It is smbX's single most undermarketed asset.
3. **Add-back / QoE Lite is the second-strongest.** It is the most concrete "$25K-of-value-for-$149" hook the matrix produces.
4. **Principal sellers are the weakest-fit audience in the matrix** — confirming the strategic doc's recommendation to treat them as organic pickup, not a paid acquisition target.

---

## PART 2 — Interpretation: where the hot zones actually are

### The three capabilities that should be the homepage heroes

When multiple audiences all light up on the same capability, that's where marketing compounds. The top three, by how many audiences score them 🔥 Hero:

**1. Regulatory & structure modeling (6 of 7 audiences mark as hero)**
Lead copy candidate: *"Your rollover structure just died. Yulia rebuilds it before your LOI expires."*

Why this wins: timely, specific, unmatched by competitors, and the audience doesn't need to be educated on why it matters — they're already losing deals over it. It also immediately positions Yulia as "expert in the things that actually break deals," which spills over credibility into every other capability.

**2. Add-back / QoE Lite analysis (7 of 7 audiences mark as hero)**
Lead copy candidate: *"$25K of pre-LOI decision insurance. For $149."*

Why this wins: universal pain, strong WTP (because the alternate-universe cost is $25–75K per deal), concrete deliverable, measurable value, and the 22-formula deterministic engine you already built is the moat. This is the best "the platform does real work, not just chat" demonstration.

**3. Deal screening & triage (6 of 7 practitioner audiences mark as hero)**
Lead copy candidate: *"Screen a deal in 90 seconds. The ones worth your time get a memo."*

Why this wins: highest-volume activity in deal work, lowest cost per use, highest frequency of return visits, and the best TTFV demonstration. If a practitioner pastes a teaser into Yulia and gets a useful classification + range + three questions in 90 seconds, they're hooked. This is your activation hero.

### Four capabilities that should be platform depth, not marketing

These score 14–18 across most audiences — genuinely useful, but crowded or not differentiating enough to lead with.

**4. Buyer list building** — crowded by Grata/Sourcescrub/Axial. Mention, don't lead.
**5. Deal pipeline & CRM** — commodity. Never make it an upgrade trigger.
**6. Valuation modeling** — PitchBook/BVR own the data moat. Ship it; don't fight there.
**7. Market research** — AlphaSense/Tegus own it. Don't claim to replace them.

### Two capabilities that deserve more weight than they currently get

**8. Investor memos & deal updates** — scores 21 for IS, search funders, and corp dev. Completely unclaimed by competitors in our price band. *"Your quarterly LP update, written in 20 minutes"* is a strong second-tier hero.

**9. LOI drafting** — scores 20 for principal buyers. The $2–10K/LOI attorney spend is the anchor. *"Your first LOI, drafted, for $149"* is a principal-buyer hero that nobody currently owns.

### The two capabilities that should be ruthlessly deprioritized

**10. Pipeline/CRM for principal sellers** — not their pain. Don't build seller-facing pipeline UI.
**11. PMI for LMM advisors** — their engagement ends at close. Don't build advisor-facing PMI.

---

## PART 3 — So what: the decisions this matrix forces

### Decision 1: What's on the homepage?

Current positioning spine stays: *"90% of what an investment bank does. Everything that doesn't require a license."* What changes is what lives beneath it. The homepage should surface in rotation:

- **Hero slot 1:** Add-back / QoE Lite (`"$25K of decision insurance for $149"`)
- **Hero slot 2:** Regulatory & structure modeling (`"SOP 50 10 8 killed your rollover. Yulia rebuilds it."`)
- **Hero slot 3:** Screening (`"Screen a deal in 90 seconds"`)

The current site leads with generic "chat with Yulia" messaging. That's a wasted hero. Lead with specific work Yulia does.

### Decision 2: What do we cut or hide in the navigation?

Buyer list building, pipeline/CRM, valuation modeling, and market research should be *platform depth* — visible on a /features page, mentioned in pricing tiers, but never the hero. Stop fighting Grata and PitchBook in the hero. You'll lose that fight on data breadth, and you'll waste marketing cycles.

### Decision 3: What gets new surface area in the product?

Three capabilities are currently under-surfaced relative to their matrix score:

- **SOP 50 10 8 structure modeling** — this is the highest-scoring single item. It should have a dedicated page (`/regulatory` or `/sba-structure`) and a dedicated LinkedIn content drumbeat. Tier 1 product investment.
- **Investor memos / LP updates** — deserves a template library and a dedicated surface. Tier 2 product investment.
- **LOI drafting for principal buyers** — deserves a front-door workflow ("Start your LOI"). Tier 2 product investment.

### Decision 4: What does this tell us about pricing?

Without recommending specific prices, the matrix produces three structural pricing implications:

**(a) The "hero" capabilities should be available in the lowest paid tier.** If add-back analysis, regulatory modeling, and screening are the three reasons people pay, putting any of them behind Pro ($149) when there's a Starter ($49) will cause signups at Starter to churn immediately. The Starter tier needs to deliver real hero value, not limited teasers. If you can't afford that economically, Starter shouldn't exist.

**(b) Platform-depth capabilities are where tier differentiation should live.** Pipeline with unlimited deals, sourcing volume, CIM document generation count, enterprise compliance features — these are where Starter vs. Pro vs. Enterprise should differ. Not the hero capabilities.

**(c) The composite WTP scores across practitioner audiences average 3.3–3.8.** Translated, that's the $50–500/month band. $49 Starter is fine for principals and self-funded searchers. $149 Pro is fine for most practitioners. But the matrix shows a cluster of capabilities where IS, corp dev, and family offices would pay 4+ ($200–500/month) — the current $999 Enterprise overshoots that band while the $149 Pro undershoots it. The strategic doc's intermediate tier hypothesis ($399–499 for small teams) is supported by the matrix.

### Decision 5: The ChatGPT-harness question, answered

Every single 🔥 Hero cell in the matrix has a Build-it-yourself score of 4 or 5. That's the answer.

A practitioner can absolutely use ChatGPT to screen a deal, draft a CIM, or analyze add-backs — once. Building the *harness* that makes those capabilities fast, reliable, auditable, team-shareable, and integrated with each other is 2–12 weeks of real engineering work, for each capability. Multiply by 12 capabilities and you're at 2+ years of build work.

The 80% of shops that don't have a full-time AI engineer aren't debating ChatGPT vs. smbX. They're debating "do we want to spend 2 years building this ourselves, or pay $149/month." The matrix tells us unambiguously that the answer, for most of them, is $149/month.

**What smbX is selling isn't AI. It's the harness. Say it directly in the marketing.**

Candidate tagline:

> *"ChatGPT can do any one of these. smbX does all of them, together, with your deal's context, at a price you don't have to defend."*

That's the SaaSpocalypse answer. The pitch isn't "we're better than ChatGPT." It's "we save you from becoming your own AI engineering team."

---

## Appendix: Quick reference card

### The 3 hero capabilities (lead marketing with these)
1. **Add-back / QoE Lite** — "$25K of decision insurance for $149"
2. **Regulatory & structure modeling** — "SOP 50 10 8 killed your rollover. Yulia rebuilds it."
3. **Deal screening & triage** — "Screen a deal in 90 seconds"

### The 2 underweight capabilities that deserve more (secondary heroes)
4. **Investor memos / LP updates** — "Quarterly LP update, written in 20 minutes"
5. **LOI drafting** — "Your first LOI, drafted, for $149"

### The 4 platform-depth capabilities (include, don't lead)
6. Buyer list building
7. Pipeline & CRM
8. Valuation modeling & comps
9. Market & industry research

### The 2 capabilities to deprioritize
10. Pipeline for principal sellers (not their pain)
11. PMI for LMM advisors (not their engagement)

### The 1 thing to say clearly in every marketing surface
*"We're the harness. ChatGPT is the engine. You keep the judgment."*

---

*End of matrix document. Reference alongside `SMBX_STRATEGIC_POSITIONING_AND_AUDIENCE_DOC.md` for audience prioritization, channel plan, and competitive context.*

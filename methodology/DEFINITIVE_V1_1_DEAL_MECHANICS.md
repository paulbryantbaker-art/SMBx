# DEFINITIVE v1.1 Deal Mechanics Expansion

**Status:** V20 deal-mechanics update.  
**Date:** May 21, 2026.  
**Applies to:** DEFINITIVE model-catalog, gate-routing, deal-mapping, and pass-through substrate portions.  
**Supersedes:** The 38-model / 27-gate catalog target in DEFINITIVE v1.0 for forward build planning.

## Doctrine

DEFINITIVE is the deterministic deal-mechanics substrate. Yulia and the app are surfaces over it.

THE LINE is descriptive per model: DEFINITIVE computes deterministic figures and presents sourced inputs. The user, the user's financial advisor, the user's counsel, a specialist, or a court makes advice, opinion, legal, tax, accounting, appraisal, remediation, feasibility, fairness, solvency, confirmation, and litigation determinations.

## V20 Target Shape

| Area | v1.0 target | v1.1 / V20 target |
|---|---:|---:|
| Model catalog | 38 model slots | 123 model slots, M101-M223 |
| Gates | 27 | 30 |
| Authority Register | 500+ entries | 800+ entries |
| New primary gates | None | G28 Distressed / Restructuring; G29 Capital Structure & Liability Management; G30 Real Estate & Asset-Class Overlays |
| Coverage-gap closure | partial | Real estate M187-M199; connected tax M200-M205; legal/agreement architecture M206-M213; IP M214-M223 |
| Immediate core | V19 plus first batch | 95-model core, with LME/crypto/industry overlays staged or research-only where required |

## New Gates

### G28 - Distressed / Restructuring

Runs distressed-sale, Chapter 11, Chapter 7, DIP, claims-trading, solvency, and recovery mechanics.

Primary models: M148, M151-M159, M164-M168.

Deterministic triggers:

- M148 fails any solvency prong.
- Cash runway is less than 90 days.
- FCCR is below 1.0x.
- Secured debt trades below 60 cents.
- Bankruptcy filing, RSA, forbearance, DIP lender, stalking horse, distressed fund, liquidating trustee, or similar party appears.

THE LINE: DEFINITIVE computes mechanics; courts, counsel, CROs, and financial advisors make legal, feasibility, and opinion determinations.

### G29 - Capital Structure & Liability Management

Runs recapitalization, exchange-offer, covenant, DIP, convertible, ABL, make-whole, and liability-management mechanics.

Primary models: M148, M158, M160-M164, M180-M184.

Deterministic triggers:

- Maintenance covenant breach is projected within four quarters.
- Secured debt trades below 80 cents.
- Balance-sheet alteration, liability-management exercise, recapitalization, exchange offer, covenant amendment, or distressed debt exchange appears.

THE LINE: LME models M161-M163 ship research-only until case law stabilizes. DEFINITIVE outputs math and contract-language flags; counsel determines viability.

### G30 - Real Estate & Asset-Class Overlays

Runs real estate, project-finance, digital-asset, LP-secondary, strip-sale, NAV-facility, and real-estate pass-through overlays.

Primary models: M169-M179 and M187-M199.

Deterministic triggers:

- Real estate is at least 25 percent of enterprise value.
- Digital assets are at least 10 percent of enterprise value.
- Infrastructure/project-finance, REIT, LP/GP secondary, strip sale, NAV facility, title, survey, lease, rent roll, NOI, cap rate, CAM, CITT, FIRPTA, 1031, OpCo/PropCo, ground lease, ALTA, or PCA appears.

THE LINE: Digital-asset and industry-regulated overlays remain research-only until rulemaking and counsel templates are stable. Real-estate models may consume specialist/appraisal/title/environmental data as pass-through inputs; they do not opine the underlying domain conclusion.

## Coverage-Gap Closure

### Real Estate M&A

New model slots: M187-M199.

DEFINITIVE owns asset-vs-entity election math, RE/operating-business bifurcation, rent-roll normalization, NOI/cap-rate bridge, transfer/CITT tax computation, CAM reconciliation, lease abstraction schema, OpCo/PropCo mechanics, property-level escrow sizing, title/survey process sequencing, ground-lease mechanics, PCA reserve modeling, and FIRPTA v1.1.

Pass-through: MAI/USPAP appraisal, Phase I/II and remediation estimate, title exception legal analysis, zoning/entitlement opinions, structural/PCA narrative, market cap-rate data, and rent/lease comp surveys.

### Connected Transaction Tax

New model slots: M200-M205.

DEFINITIVE owns the master tax integration path: entity type, deal form, consideration mix, buyer basis, seller federal/state tax, after-tax proceeds, gross-up gap, and the fired sub-model schedule.

Pass-through: tax opinions on specific facts, controversy/audit defense, international tax structuring, and contested SALT nexus positions.

### Legal / Agreement Architecture

New model slots: M206-M213.

DEFINITIVE owns the economic-term engines: indemnification ladder, survival periods, escrow/holdback sizing, RWI stack, closing-statement true-up, conditions-to-close logic, break/reverse-break fee economics, and earnout/dispute architecture.

Pass-through: clause drafting, enforceability opinions, whether a specific MAE occurred, state non-compete enforceability, specific-performance availability, legal opinion letters, litigation strategy, negotiation/advocacy, and disclosure-schedule legal sufficiency.

### Intellectual Property

New model slots: M214-M223.

DEFINITIVE owns chain-of-title verification sequencing, IP encumbrance/lien search tracks, license dependency mapping, IP representation-set scaffolding, carve-out/license-back mechanics, source-code escrow mechanics, employee-IP assignment verification, OSS exposure process, IP-specific Section 1060 allocation, and domain/trademark transfer mechanics.

Pass-through: freedom-to-operate, patent validity, claim construction, patentability, trademark confusion analysis, IP litigation assessment, patent-portfolio valuation, specific copyleft-trigger legal opinion, and IP enforceability opinions.

## Pass-Through Substrate Rule

DEFINITIVE may call external data/software APIs at cost or cost-plus-fixed margin, billed per call regardless of deal outcome. This includes appraisal datasets, market comps, title/lien records, USPTO/copyright records, SALT/tax databases, SCA scans, and deal-comparable datasets.

DEFINITIVE must not receive any success fee, deal-value fee, referral fee, or compensation tied to routing a user or deal to a human service provider. A Specialist Directory may exist, but it is editorial and free to use.

## Model Sequencing

### v1.0 Core To Ship First

M101-M158, M160, M165-M167, M169-M172, M180, M182-M190, M192-M193, M195-M196, M198-M204, M206-M208, M210-M212, M214-M217, and M219-M223.

This is the 95-model core that makes "substrate for all deal mechanics" credible while keeping professional handoff and research-only areas clearly bounded.

### v1.1 Staged Models

M143 and M161-M163.

The LME set M161-M163 is explicitly research-only: uptier, drop-down, double-dip, and pari-plus outcomes depend on jurisdiction and exact loan-document language.

### v1.2 Staged Models

M173-M176 and industry-regulated overlays.

Crypto, GENIUS Act, token taxonomy, 1099-DA, healthcare, banking, insurance, FERC, FCC, ITAR, and CFIUS overlays remain research-only until live legal/currentness templates are counsel-reviewed and version pinned.

## Runtime Implementation Rules

1. Do not mark a model production-ready unless it has a deterministic function, input schema, output schema, citations, THE LINE category, and conformance cases.
2. Every model id must remain addressable as `definitive://v1.1/deal-mechanics/models/m###`.
3. Existing `MODEL.*.v1` runtime ids remain valid. V20 catalog entries should map to runtime ids only where the runtime model actually implements the same computation.
4. Research-only and professional-handoff models may appear in discovery, Studio planning, and Yulia explanation, but must not present conclusions as advice.
5. G28/G29/G30 route composition must preserve prior healthy-M&A outputs when a deal switches track. The overlay changes process mechanics; it does not throw away earlier facts.
6. Pass-through inputs must be labeled with source, timestamp or version, per-call pricing rule, and the specialist/domain conclusion they do not replace.

## Current Repo Mapping

The code source for this catalog is:

- `server/services/definitiveDealMechanicsCatalog.ts`
- `server/services/definitiveDealRouteMap.ts`
- `server/services/definitiveStackOverlays.ts`

The manifest exposes a DB-free route-map coverage check so every active model slot must have journey, gate, deal-type, league-range, readiness, and tool-surface metadata before the surface can pass smoke tests.

Agent-facing discovery includes:

- `/.well-known/agent-card.json`
- `/.well-known/definitive.json`
- `/api/definitive/spec`

The V19 runtime remains the current execution baseline while expanded DEFINITIVE model functions land in batches. The first v1.1 executable slices are now implemented for 1060 allocation, FIRPTA withholding, 1031 timing, sale-leaseback/ASC 842, REIT compliance, rent-roll normalization, CAM true-up, RE-heavy asset/entity election, RE/operating-business bifurcation, NOI/cap-rate bridge, lease abstraction, property escrow/holdback sizing, title/survey checklist, PCA reserve modeling, FIRPTA v1.1, CITT transfer tax, OpCo/PropCo separation, ground lease mechanics, convertible/SAFE conversion, venture-debt warrant coverage, ABL borrowing base, make-whole/call protection, covenant baskets, 280G, 382 NOL limitation, connected transaction tax, SALT transaction tax, indemnity ladder, survival periods, escrow/holdback sizing, RWI stack architecture, closing true-up, conditions logic, termination-fee economics, earnout architecture, IP chain-of-title, IP lien search, IP representation set, license dependency mapping, IP carve-out/license-back, source-code escrow, employee IP assignment verification, OSS exposure process, IP-specific 1060 allocation, domain/trademark transfer mechanics, three-prong solvency, 363 sale mechanics, plan feasibility, best-interests-of-creditors, APR/new-value, cramdown-rate, 1111(b) election, Chapter 7 waterfall, DIP sizing, exchange-offer mechanics, fulcrum security, RSA economics, ABC/Article 9 liquidation, claims trading, Subchapter V eligibility, Chapter 22 recidivism, LP-secondary/ECI withholding, strip-sale pricing, and NAV facility LTV.

## Next Build Runs

1. Continue deterministic runtime functions and schemas for the v1.1 executable batch. Sixty-eight models are executable with conformance coverage: M139, M148, M151-M160, M164-M172, and M177-M223. Next targets are M143, M161-M163, and M173-M176.
2. Expand Authority Register from 500+ target to 800+ target, prioritizing bankruptcy, restructuring, IRC/Treasury, real estate, IP, agreement architecture, pass-through pricing, recovery data, digital assets, and regulated-industry sources.
3. Publish the Pass-Through Substrate Catalog with per-call cost, fixed margin, source type, and THE LINE boundary.
4. Add Yulia prompt/runtime language so research-only, professional-handoff, and pass-through models are useful without crossing THE LINE.
5. Connect route-level applicable mechanics to Today, Pipeline, Files, and Studio surfaces after the chat/tool contract is stable.

Completed first pass: `compose_model_stack` now uses the route map as Yulia's deal-profile classifier. It returns applicable mechanics, readiness, tool surfaces, and THE LINE boundary by deal profile, including G28/G29/G30 trigger overlays.
Completed runtime slices: M139, M148, M151-M160, M164-M172, and M177-M223 are mapped to `MODEL.*.v1` runtime ids with deterministic functions, registry entries, and complete/missing-input fixtures.
Completed first conformance pass: `npm run test:definitive-conformance` now includes 198 cases: 186 model-runtime cases and 12 deal-mechanics route cases spanning real estate, connected tax, agreement architecture, IP, restructuring, LME, capital structure, secondaries, crypto, carve-out/JV, and venture/PIPE profiles.

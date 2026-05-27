# LOI-001 Agent Simulation Output

Generated: 2026-05-27

Purpose: show the actual substrate output for a simulated external agent asking for an LOI scaffold. This is not a signed LOI, binding offer, legal clause draft, negotiation instruction, or external transmission.

## Simulated Agent Input

| Field | Value |
| --- | --- |
| Intent | External agent wants an LOI scaffold for an HVAC acquisition. |
| Journey | buy |
| Target | LOI Ready HVAC Co. |
| Industry | HVAC services |
| Jurisdiction | US-TX |
| Revenue | $24,000,000 |
| EBITDA | $5,000,000 |
| Purchase price | $40,000,000 |
| Enterprise value | $40,000,000 |
| Structure | Asset purchase with senior debt, sponsor equity, seller note, and customary confirmatory diligence |
| Working capital peg | $1,800,000 |
| Seller note | $4,000,000 |
| Escrow / holdback | $2,000,000 |
| Diligence condition | QoE, customer concentration, permits, contracts, tax, and benefits diligence |
| Financing condition | Debt financing subject to lender diligence and credit approval |
| Exclusivity | 45 days, counsel to draft and user decides whether to send |
| Timeline | Sign LOI after internal approval; close only after confirmatory diligence |
| Model state | `MODEL.LBO.LMM.v1`, `sha256:lbo-demo`, complete |
| Source docs | Financials, tax returns, legal contracts, customer/commercial analysis |

## DealState Output

| Output | Value |
| --- | --- |
| CID | `definitive:deal-state:sha256:6239e82891ef7b226f55200650410402809b3f5a4677ee9ae2fe4cdb8bb4f897` |
| State hash | `6239e82891ef7b226f55200650410402809b3f5a4677ee9ae2fe4cdb8bb4f897` |
| Journey | buy |
| Sub-journey | healthy_buy_side |
| League | L4 |
| Industry | HVAC services |
| Jurisdiction | US-TX |
| Overlay gates | none |
| Completeness level | `DRL4_DILIGENCE_READY` |
| Completeness score | 100 |
| Missing input status | `sufficient_for_next_step` |
| Minimal next input set | none |

Satisfied completeness checks:

- `journey_classified`
- `deal_subject_present`
- `industry_present`
- `jurisdiction_present`
- `economic_scale_present`
- `source_trail_present`
- `deal_structure_present`
- `term_architecture_present`
- `file_universe_present`
- `model_state_present`

## LOIPacket Output

| Output | Value |
| --- | --- |
| Packet ID | `loi_59d60257a818a1da` |
| Schema | `LOIPacket.v0.1` |
| Stage | negotiation |
| Readiness level | `DRL4_DILIGENCE_READY` |
| Objective | prepare internal LOI architecture for counsel review |
| Audience | internal_deal_team_and_counsel |
| Source gaps | none |
| Missing inputs | none |
| Model dependency | `not_blocked` |

### Deal Architecture

| Item | Status | Value / Note | Source support |
| --- | --- | --- | --- |
| Transaction structure | present | Asset purchase with senior debt, sponsor equity, seller note, and customary confirmatory diligence | legal, tax |
| Consideration mix | present | Seller note / consideration fact present from payload | financials, legal, tax |
| Tax classification | missing | Not supplied | tax source present, advisor determination still required |
| Governing jurisdiction / deal jurisdiction | present | US-TX | legal |
| Triggered overlay gates | missing | none triggered | financials, legal, tax |

### Economic Terms

| Term | Status | Value | Boundary |
| --- | --- | ---: | --- |
| Purchase price | payload_fact_present | $40,000,000 | payload fact, not a recommendation or offer |
| Enterprise value | payload_fact_present | $40,000,000 | payload fact, not a recommendation or offer |
| Revenue | payload_fact_present | $24,000,000 | payload fact |
| EBITDA | payload_fact_present | $5,000,000 | payload fact |
| Working capital peg | payload_fact_present | $1,800,000 | payload fact |
| Escrow or holdback | payload_fact_present | $2,000,000 | payload fact |
| Seller note | payload_fact_present | $4,000,000 | payload fact |
| Earnout | missing | not supplied | placeholder only |
| Rollover equity | missing | not supplied | placeholder only |

### Closing Conditions

| Condition | Status | Value / Note |
| --- | --- | --- |
| Diligence condition | payload_fact_present | QoE, customer concentration, permits, contracts, tax, and benefits diligence |
| Financing condition | payload_fact_present | Debt financing subject to lender diligence and credit approval |
| Regulatory approvals | missing | Not supplied |
| Third-party consents | missing | Not supplied |
| Exclusivity / no-shop | payload_fact_present | 45 days, counsel to draft and user decides whether to send |
| Timing and signing/closing path | payload_fact_present | Sign LOI after internal approval; close only after confirmatory diligence |

### Source References

| ID | Type | Category | Hash |
| --- | --- | --- | --- |
| `ttm-financials` | financials | financials | `sha256:ttm` |
| `tax-returns` | tax | tax | `sha256:tax` |
| `legal-contracts` | legal | legal | `sha256:legal` |
| `customer-analysis` | commercial | commercial | `sha256:commercial` |

### Handoffs

| Category | Reason | Status |
| --- | --- | --- |
| clause_language_and_enforceability | LOI clause drafting, binding/non-binding architecture, enforceability, and signature authority remain with counsel and the user. | counsel_review_required |
| external_transmission | Sending an LOI externally requires a separate user-approved disclosure/export action. | external_approval_required |

### LOI Boundary

```json
{
  "composedOnly": true,
  "noBindingOffer": true,
  "noClauseDrafting": true,
  "noLegalOpinion": true,
  "noTaxOpinion": true,
  "noNegotiationAuthority": true,
  "noExternalTransmission": true,
  "userAndCounselDecide": "The user and counsel decide whether to send an LOI, which terms to include, clause language, enforceability, signature authority, and counterparty communications."
}
```

### Next Suggested Calls

| Priority | Tool | Reason |
| --- | --- | --- |
| P1 | `compose_document_draft` | Render the LOI packet into a source-aware Studio LOI outline scaffold. |
| P2 | `prepare_diligence_request` | Prepare the diligence request list that follows the LOI architecture pass. |
| P2 | `prepare_negotiation_brief` | Track open terms and model-backed range status without negotiating or recommending concessions. |

Take-back artifacts:

- `LOIPacket`
- `DealState`
- `DocumentDraft`
- `DiligenceRequest`
- `MCPCallHint[]`

## DocumentDraft Output

| Output | Value |
| --- | --- |
| Draft ID | `draft_95489e290c247f15` |
| Schema | `DocumentDraft.v0.1` |
| Document type | `loi_outline` |
| Stage | negotiation |
| Audience | internal_deal_team_and_counsel |
| Title | LOI Ready HVAC Co. LOI architecture scaffold |
| Model dependency | `not_blocked` |

### Draft Sections

| Section | Status | Purpose | Source support |
| --- | --- | --- | --- |
| Economic terms | source_ready | Structure price, consideration, working capital, escrow, and earnout placeholders from model-backed facts. | financials |
| Structure and tax mechanics | source_ready | Surface structure choices and tax/legal handoffs without drafting clauses or giving opinions. | tax, legal |
| Conditions and diligence | source_ready | Track conditions, consents, and diligence asks that must be verified before signing. | legal, commercial |

### Source Policy

```json
{
  "unsourcedClaimsAllowed": false,
  "uncheckedClaimsFlag": "[unverified]",
  "sourceRefsRequiredBeforeExternalExport": true
}
```

### Export Boundary

```json
{
  "composedOnly": true,
  "noExternalTransmission": true,
  "externalExportRequires": "A5_EXTERNAL_DISCLOSURE approval through a separate export/share action."
}
```

### Draft Next Suggested Call

| Priority | Tool | Reason |
| --- | --- | --- |
| P1 | `compose_deal_package` | Package the draft with DealState, source refs, model dependencies, and next calls for agent take-back. |

Take-back artifacts:

- `DocumentDraft`
- `SourceIndex`
- `MissingInputContract`
- `MCPCallHint[]`

## THE LINE Invariant

DEFINITIVE computes, organizes, cites, and routes deal work. The user, counsel, advisor, or court makes legal, tax, fairness, feasibility, solvency, negotiation, and closing determinations.

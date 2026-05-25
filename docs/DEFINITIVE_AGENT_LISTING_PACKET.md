# DEFINITIVE Agent Listing Packet

Last updated: 2026-05-24

This is the copy/paste packet for listing `smbx-ai/diligence` as the agent-accessible DEFINITIVE / The Diligence Standard substrate.

## Canonical Identity

- Namespace: `smbx-ai/diligence`
- Title: `smbX DEFINITIVE Diligence Substrate`
- Standard: `The Diligence Standard`
- Methodology pin: `methodology://v19`
- Spec pin: `DEFINITIVE.v1.0`
- Category tags: `finance`, `m-and-a`, `private-equity`, `diligence`, `deal-os`

## Public Discovery URLs

- MCP server card: `https://smbx.ai/.well-known/mcp/server-card.json`
- MCP discovery manifest: `https://smbx.ai/.well-known/mcp`
- Agent card: `https://smbx.ai/.well-known/agent-card.json`
- DEFINITIVE manifest: `https://smbx.ai/.well-known/definitive.json`
- Schema registry: `https://smbx.ai/.well-known/definitive-schemas.json`
- Registry package: `https://smbx.ai/api/definitive/registry-package`
- Enterprise allow-list templates: `https://smbx.ai/api/definitive/enterprise-allow-lists`

## Auth Posture

- Current: public discovery plus bearer-authenticated execution.
- Internal app calls: existing smbX JWT.
- External agent bridge: token-bound scoped JWTs with `tokenUse: definitive_agent`, `userId`, and `scopes`.
- Token issue route: `POST https://smbx.ai/api/definitive/agent-tokens` from an authenticated human app session.
- Scope rule: `requestedScopes` may be omitted or narrowed by the caller, but cannot exceed the scopes bound to the bearer token.
- Production target: OAuth 2.1 + PKCE with scoped, audience-bound agent tokens.

## Short Description

Deterministic M&A Deal OS and diligence substrate for private-company deal work: partial DealState intake, IOI/LOI/diligence/modeling/negotiation/close/PMI workflow, M101-M223 model mechanics, citation provenance, audit packets, and THE LINE-safe agent access.

## Long Description

smbX DEFINITIVE gives external agents and humans one recurring Deal OS for iterative M&A work. Agents can bring incomplete facts, including only EV and rough company context; smbX classifies the deal, returns missing inputs, maps the applicable M101-M223 deterministic model stack, runs and reruns model iterations with output-hash lineage, and generates source-aware documents such as IOIs, LOIs, Term Sheets, diligence requests, data-room indexes, negotiation briefs, funds flows, CIMs, IC memos, and PMI plans.

Every output is methodology-pinned, schema-shaped, citation/provenance-ready, and governed by THE LINE: smbX computes, packages, and audits software/data outputs. It does not give legal, tax, investment, brokerage, negotiation, closing, or operating advice; it charges no success fee, no deal-value fee, no wallet, and no paid human-service referral.

## Agent Entry Examples

1. EV-only entry:
   `assess_deal_entry` -> `introspect_capabilities` -> `ingest_deal_payload` -> `compose_model_stack` -> `run_model_iteration` -> `prepare_ioi_packet`

2. Model rerun to document:
   `list_model_executions` -> `run_model_iteration` -> `generate_output_doc(requireFreshModels=true)`

3. Data-room diligence loop:
   `compose_data_room_index` -> `prepare_diligence_request` -> `update_deal_payload` -> `check_completeness`

## Core Tool Surface

- Start and resume: `ingest_deal_payload`, `update_deal_payload`, `get_deal_state`, `resume_deal`
- Routing and planning: `assess_deal_entry`, `introspect_capabilities`, `compose_deal_plan`, `compose_model_stack`, `get_deal_runbook`, `lookup_model_slot`
- Models: `execute_model`, `run_model_iteration`, `list_model_executions`

Model execution accepts either executable runtime IDs (`MODEL.*.v1`) or public DEFINITIVE M-slot IDs (`M101`-`M223`) when that slot has an implemented runtime model. If a slot is routable but not executable yet, the tool returns a structured route/handoff response instead of silently failing.
- Documents and deal artifacts: `generate_output_doc`, `compose_document_draft`, `prepare_ioi_packet`, `prepare_loi_packet`, `compose_data_room_index`, `prepare_diligence_request`, `prepare_negotiation_brief`, `compose_close_readiness`, `generate_funds_flow`, `compose_pmi_plan`
- Packaging and verification: `compose_deal_package`, `verify_package`, `finalize_deal_package`, `reopen_deal_package`, `disclose_subset`
- Trust and governance: `validate_conformance`, `lookup_citation`, `record_corpus_observation`, `defer_to_counsel`

## Managed Agent Templates

These are the later rentable-agent profiles that use the same app and tool substrate for companies that do not want to deploy their own agents:

- Acquisition Analyst Agent: intake, model stack, iterative model versions, IOI/LOI support.
- Diligence Manager Agent: data room, source gaps, diligence requests, disclosure subsets, package verification.
- Document Builder Agent: source-aware IOI, LOI, Term Sheet, CIM, IC memo, funds flow, negotiation, and PMI drafts.

Managed agents remain permission-scoped users of the same Deal OS. They do not create a separate product surface and do not cross THE LINE.

## Verification

Current local verification commands:

```bash
npx tsc --noEmit --pretty false
npm run test:definitive-conformance
npm run test:definitive-surface
npm run build
```

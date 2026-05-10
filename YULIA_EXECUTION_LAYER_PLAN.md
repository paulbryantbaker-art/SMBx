# Yulia Execution Layer Plan

This plan turns `METHODOLOGY_V17.md` from doctrine into runtime behavior.

## North Star

Yulia is not a chatbot wrapped around software. Yulia is the agentic deal operator. The app surfaces exist so users can inspect, approve, correct, and navigate the work while Yulia operates the process.

Methodology v17 is the playbook: journeys, leagues, gates, Author vs Auditor mode, sourcing, calculations, legal/tax posture, data sovereignty, document flow, and canvas behavior.

The execution layer is the runtime: context, permissions, tools, approvals, writeback, surfaces, and audit.

```text
User intent or surface click
-> Yulia context pack
-> Methodology classifier
-> Action contract
-> Governance check
-> Tool execution or staged approval
-> Database writeback
-> Surface update
-> Audit trail
```

## 1. Methodology Runtime Mapping

### Author vs Auditor

- Author mode drafts, explains, prepares, generates, and synthesizes.
- Auditor mode verifies from supplied source material only.
- Any claim that must exist in documents must route through Auditor mode.
- Auditor responses must cite source material or say `NOT FOUND IN PROVIDED DOCUMENTS`.

Runtime implication:

- Prompt layer must state the active mode.
- Context pack must expose whether source documents are attached, uploaded, or in the data room.
- Analysis and diligence tools must distinguish generated observations from sourced facts.

### League And Gate Governance

- Every deal has a journey, league, gate, role, and active risk posture.
- Today, Pipeline, Files, and Deal pages should all derive from that state.
- Gate changes are consequential workflow mutations and must be governed.

Runtime implication:

- Gate advancement uses deterministic readiness checks.
- Yulia can prepare the next gate move, but consequential status changes are staged unless clearly safe.
- Today should be a generated work queue from gate, docs, reviews, stale deliverables, and open actions.

### Math Engine

- LLMs explain math; deterministic calculators do math.
- SDE, EBITDA, DSCR, SBA, tax, cap table, working capital, valuation, sensitivity, and comparison models should be structured model actions.

Runtime implication:

- `create_model_tab`, `update_model`, and future analysis tools share a model store.
- Generated documents cite the model snapshot used.
- Stale deliverable detection fires when inputs change.

### Data Room And Documents

- Deal library contains private workspace, generated analyses, drafts, deal docs, shared workflow, and the data room.
- Data room is the shared diligence drive for the deal team.
- Artifacts are review-only source materials.
- Legal/deal docs can live in the data room as drafts, review items, or executed records.
- Executed records are immutable.

Runtime implication:

- File objects need location, lifecycle status, visibility, owner, next actor, and immutable hash fields.
- Filing a private deliverable into the data room is a confirm-first action.
- Sharing, cross-fence transmission, execution, deletion, permission changes, and close events require governance.

### Legal And Tax Boundary

- Yulia can issue-spot, organize, model, draft scaffolds, surface options, and summarize risks.
- Yulia cannot provide legal/tax opinions or signoffs.
- V18a tax and V18b legal amendments supersede v17 sections 9 and 10 for current prompt substance.

Runtime implication:

- Legal/tax-sensitive actions defer final signoff to attorney/CPA/user.
- Attorney/CPA attestations must be captured before execution where required.
- The system presents facts and options; users decide.

## 2. Execution Architecture

### A. Context Pack

The context pack must become the canonical bridge between surface and agent.

It should include:

- active device, mode, tab, view, deal, document, file scope
- user role and plan
- active deal journey, gate, league, status
- visible document lifecycle state
- pending reviews, approvals, shares, staged actions
- data-room scope and visibility
- model preference and model tab state
- legal/tax flags

### B. Action Registry

Every Yulia tool and every frontend button must map to an action contract:

- label
- methodology reference
- agency mode
- permission level
- risk level
- confirmation rule
- action gate, if any
- write scope
- expected surface result

No orphan buttons. No orphan tools.

### C. Governed Executor

All tool calls flow through one executor:

```text
executeGovernedTool(tool, input)
-> resolve action contract
-> classify safe / internal / external / irreversible
-> stage if confirmation is required
-> run action gate if required
-> execute underlying tool
-> audit outcome
```

### D. Staged Actions

When the action is consequential, Yulia prepares it instead of pretending it happened.

Examples:

- Share this CIM with a buyer.
- File this draft into the data room.
- Send review request to counsel.
- Mark LOI executed.
- Close the deal.

The user then confirms. Later phases should persist staged actions to the database and render them as approval cards in chat/surfaces.

### E. Surface Controller

Yulia and UI controls must share the same action layer.

Examples:

- Clicking `Run analysis` calls the same action as asking Yulia to run it.
- Clicking `Open files` opens the same Files detail surface as Yulia would.
- Clicking `Share` stages the same share action as chat.

### F. Audit Log

Every action needs a durable trail:

- user
- conversation
- deal/document if available
- tool/action
- input summary
- staged/blocked/executed/error
- gate result
- timestamp

## 3. Build Phases

### Phase 1: Governance Spine

- Add action registry.
- Add governed tool executor.
- Route chat tool calls through executor.
- Stage confirm-first actions.
- Add optional confirmation fields to confirm-first tool schemas.
- Add audit event table.
- Add methodology-to-runtime prompt layer.

### Phase 2: Persistent Staged Actions

- Add `agency_staged_actions`.
- Render pending actions in chat and Today.
- Add confirm/cancel endpoints.
- Allow frontend buttons to stage actions without chat gymnastics.

### Phase 3: Real Context Pack

- Add document/file/review/share/action/model state to the context pack.
- Expose visible file/document lifecycle and next actor.
- Include model preference and active model tabs.

### Phase 4: Surface Action Contracts

- Inventory every button on Today, Pipeline, Search, Files, Deal, Document Viewer.
- Convert buttons into typed action calls.
- Remove any decorative/nonfunctional controls.
- Add tests proving primary buttons produce action results.

### Phase 5: Files And Data Room Object Model

- Normalize file hierarchy:
  - Portfolio
  - Deal
  - All Files
  - Private Workspace
  - Data Room
  - Shared
- Track data-room status:
  - Artifact
  - Draft
  - Action needed
  - Action requested
  - In review
  - Executed
  - Deferred
- Enforce immutable executed documents.

### Phase 6: Analysis And Document Generation

- Add first-class action endpoints for:
  - generate doc
  - run analysis
  - compare deals
  - create model
  - regenerate stale deliverable
  - cite source docs
- Make generated work product open in real document/model surfaces.

### Phase 7: Model Routing

- Persist user default model.
- Add per-action model routing.
- Keep `Auto` as default routing policy.
- Route research, drafting, legal/tax, math, and fast chat differently.

### Phase 8: Full Deal Operator Loop

- Today becomes the agentic command center.
- Yulia watches for stale docs, review blockers, data-room actions, gate blockers, and open decisions.
- User can run the deal by natural language or by clicking surface actions.

## 4. Current Phase 1 Acceptance Criteria

- Tool calls no longer bypass governance.
- Confirm-first tools return a staged action when called without explicit confirmation.
- Confirmed calls can proceed through existing handlers.
- Action gate blocks share/execution where review/signoff chain is incomplete.
- Prompt tells Yulia how to use the runtime.
- Build passes.

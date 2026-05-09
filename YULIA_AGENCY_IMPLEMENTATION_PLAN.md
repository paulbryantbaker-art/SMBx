# Yulia Agency Implementation Plan

**Status:** Implementation map
**Created:** May 9, 2026
**Companion:** `YULIA_AGENCY_SPEC.md`

This plan describes how to tie the built app surfaces to Yulia's prompt, governance, guidance, file, and action systems.

The goal is not to add another page or another prompt. The goal is to make the current app behave like one agentic deal process.

---

## 1. Current App Shape

### Desktop Shell

Desktop is already structurally close to the right pattern.

Files:

- `client/src/components/v6/V6App.tsx`
- `client/src/components/v6/Canvas.tsx`
- `client/src/components/v6/Chat.tsx`
- `client/src/components/v6/Sidebar.tsx`

Current behavior:

- Chat sits beside the canvas.
- Canvas has tabs.
- Root modes render in tabs: Today, Pipeline, Search, Files, Docs, Analysis, Intel, Library.
- Detail surfaces render as tabs: Deal, Doc, Analysis, Learn, Settings, History, Starter.
- Backend tool results can emit `canvas_action`.
- `useAuthChat` dispatches `smbx:canvas_action`.
- `V6App` listens for that event and opens tabs or switches modes.

This is the core seam for agency: Yulia can already cause the app to move.

### Desktop Surfaces

| Surface | File | Current Purpose | Agency Role |
|---|---|---|---|
| Today | `modes/TodayRoot.tsx` | Daily brief, priority cards, deal pulse, files needing review | Ranked action desk generated from workspace state |
| Pipeline | `modes/PipelineRoot.tsx` | Ranked deals by pursue/watch/pass | Stage/risk/priority view, audience-specific |
| Search | `modes/SearchRoot.tsx` | Market discovery for buyers, targets, capital, professionals | External discovery and sourcing engine |
| Files | `modes/FilesRoot.tsx` | Files overview, current rooms, data-room work queue | Document system front door |
| Deal | `views/DealView.tsx` | Deal command center plus file explorer lenses | One-deal operating cockpit |
| Doc | `views/DocView.tsx` | Document viewer/editor layout with comments/version rail | Draft/review/approval/execution surface |
| Analysis | `views/AnalysisView.tsx` | Interactive model | Deterministic calculation surface |
| Sidebar | `Sidebar.tsx` | Mode nav + prompts | Fast access and context-aware starts |

### Mobile Shell

Files:

- `client/src/components/v6/mobile/V6Mobile.tsx`
- `client/src/components/v6/mobile/screens/Today.tsx`
- `client/src/components/v6/mobile/screens/Pipeline.tsx`
- `client/src/components/v6/mobile/screens/Detail.tsx`
- `client/src/components/v6/mobile/screens/LibrarySearch.tsx`
- `client/src/components/v6/mobile/ChatSheet.tsx`

Current behavior:

- Mobile uses a view state rather than desktop tabs.
- Bottom nav has Today, Pipeline, Search, Files.
- Chat is a sheet.
- Files has home, finder, deal library detail, and document viewer screens.
- URL hash carries the active mobile view.

Agency implication:

Desktop and mobile need one shared surface-action vocabulary even though they render differently. Yulia should emit `open_surface` style actions; each shell translates that into tabs or mobile views.

---

## 2. Current Backend Shape

### Prompt Stack

Files:

- `server/services/promptBuilder.ts`
- `server/prompts/masterPrompt.ts`
- `server/prompts/taxEngine.ts`
- `server/prompts/legalEngine.ts`
- `server/prompts/gatePrompts.ts`
- `server/prompts/personas.ts`
- `server/prompts/branchingLogic.ts`

Current behavior:

- Authenticated chat uses `buildSystemPrompt`.
- Anonymous chat uses `buildAnonymousPrompt` or `buildDynamicAnonymousPrompt`.
- Deal context, user context, portfolio awareness, league persona, gate prompts, tax engine, legal engine, market heat, stale deliverable alerts, and auditor mode are layered into the system prompt.

This is good. The missing layer is explicit agency governance:

- active app surface
- visible tab/file/deal context
- pending approvals
- action permission ladder
- data-room/file state
- staged external actions
- canonical "Yulia operates the surface" policy

### Agentic Loop

Files:

- `server/services/aiService.ts`
- `server/services/tools.ts`
- `client/src/hooks/useAuthChat.ts`

Current behavior:

- Claude is called with tools.
- Tool calls execute server-side.
- Tool results stream to the client.
- If a tool returns `canvas_action`, the client opens or updates UI.

This is the right architecture. It needs a governance wrapper.

### Tools

File:

- `server/services/tools.ts`

Current tool families:

- deal creation and updates
- league classification
- gate advancement
- deliverable generation
- provider matching
- buyer demand
- franchise matching
- optimization plans
- deal list/context switching
- market scan
- sourcing portfolio
- model tab create/update/read
- support issue creation
- review request
- document share
- lifecycle records
- sourcing runs
- deal comparison and merger pairing

Risk:

Some tools are safe internal actions. Others are external or consequential. Today they live in one undifferentiated tool list.

### Existing Governance Seed

File:

- `server/services/actionGate.ts`

This already models the important idea:

- action class
- required document status
- required approvals
- reviewer attestation
- blocked reasons
- next steps

This should become the enforcement layer in front of all external, legal, sharing, execution, and irreversible tools.

### Existing Document/Data-Room Backend

Files:

- `server/routes/dataRoom.ts`
- `server/services/documentLifecycle.ts`
- `server/services/documentShareService.ts`
- `server/migrations/008_data_room.sql`
- `server/migrations/009_collaboration_rbac.sql`
- `server/migrations/044_document_management.sql`

Current backend already has:

- data-room folders
- data-room documents
- participants and roles
- folder scope
- activity log
- document lifecycle
- doc classes
- execution hash fields
- document shares

What is missing is the canonical file system abstraction the UI now implies:

- private workspace vs data room vs shared workflow
- location vs status vs permission vs next actor
- all-files lens across deal libraries
- per-deal file tree
- data-room artifact/legal/executed distinction
- hot docs and action queues derived from state

---

## 3. The Main Gap

The app has surfaces.

The backend has prompts, tools, legal/tax engines, document lifecycle, data room, sharing, and an action gate.

What is missing is the connective tissue:

1. **Context Pack:** the backend does not receive a full structured description of what the user is looking at.
2. **Governed Tool Execution:** tools are not typed by permission level, reversibility, externality, or legal/tax sensitivity.
3. **Staged Actions:** Yulia cannot consistently prepare an external/irreversible action and ask approval before execution.
4. **Surface Contracts:** Today, Files, Deal, Search, Pipeline, Doc, and Analysis do not yet consume one shared workspace state model.
5. **File Object Model:** current UI semantics are ahead of the database abstraction.
6. **Cross-Device Surface Actions:** desktop tabs and mobile views need one common action vocabulary.

---

## 4. Target Architecture

```text
User message or surface click
-> client sends message + SurfaceContext
-> server builds YuliaContextPack
-> promptBuilder composes governance + methodology + deal state
-> Claude chooses response/tools
-> governedExecuteTool checks ActionPolicy + ActionGate
-> safe actions execute
-> approval-required actions stage
-> results write to workspace + audit log
-> client receives text + surface_action/staged_action
-> desktop/mobile render the appropriate surface
```

---

## 5. The Yulia Context Pack

Create a first-class context object.

Suggested file:

- `server/services/yuliaContextPack.ts`

Suggested client type:

- `client/src/lib/agencyContext.ts`

### Client Surface Context

The client should send this with every chat message:

```ts
interface SurfaceContext {
  device: "desktop" | "mobile";
  activeMode?: "today" | "pipeline" | "search" | "files" | "docs" | "analysis" | "intel" | "library";
  activeTabId?: string;
  activeTabKind?: string;
  activeTitle?: string;
  dealId?: string | number;
  fileScope?: "all" | "data-room" | "shared";
  documentId?: string | number;
  analysisId?: string | number;
  visibleObjectIds?: Array<string | number>;
  userIntentHint?: string;
}
```

Desktop should build it from:

- `activeMode`
- `activeTabId`
- `tabs.find(...)`
- `activeTab.fileScope`

Mobile should build it from:

- `view.kind`
- `activeTab`
- `dealTitle`
- `dealStage`
- `filesFilter`
- `docTitle`

### Server Context Pack

The server then enriches that surface context:

```ts
interface YuliaContextPack {
  user: UserContext;
  audience: Audience | null;
  journey: Journey | null;
  league: League | null;
  conversation: ConversationContext;
  surface: SurfaceContext;
  activeDeal: DealContext | null;
  portfolio: PortfolioSummary;
  openTasks: TaskSummary[];
  pendingApprovals: StagedActionSummary[];
  relevantDocuments: DocumentSummary[];
  dataRoomState: DataRoomSummary | null;
  modelState: ModelSummary | null;
  legalTaxFlags: GovernanceFlag[];
}
```

This pack becomes the spine for prompts, Today, Files, and surface control.

---

## 6. Prompt/Governance Layer

Create a distilled runtime doctrine from `YULIA_AGENCY_SPEC.md`.

Suggested file:

- `server/prompts/agencyDoctrine.ts`

It should include:

- Yulia is the agentic deal process.
- User decides, sends, signs, approves.
- Permission levels A0-A7.
- Pre-output check.
- Surface operation policy.
- External action approval policy.
- File/data-room boundary.
- Location/status/permission/next-actor separation.

Then update:

- `server/services/promptBuilder.ts`

Prompt composition order should become:

```text
1. MASTER_PROMPT
2. AGENCY_DOCTRINE
3. User + audience + conversation state
4. Surface context
5. Active deal context
6. Task / pending approval / document context
7. League persona
8. Gate prompt
9. Tax engine
10. Legal engine
11. Knowledge and market context
12. Branching logic
```

The important change: Yulia should know what surface the user is on and what action boundaries apply before she decides what tool to call.

---

## 7. Governed Tool Execution

Create a tool policy registry.

Suggested file:

- `server/services/agencyActionRegistry.ts`

Example:

```ts
interface ToolPolicy {
  toolName: string;
  permissionLevel: "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";
  reversible: boolean;
  privateOnly: boolean;
  external: boolean;
  requiresUserApproval: boolean;
  actionClass?: ActionClass;
  legalSensitive?: boolean;
  taxSensitive?: boolean;
  writesAuditLog: boolean;
}
```

Examples:

| Tool | Level | Policy |
|---|---|---|
| `get_deal_context` | A0 | safe read |
| `update_deal_field` | A5 | private reversible-ish write; no approval |
| `create_model_tab` | A5 | private surface action; no approval |
| `generate_free_deliverable` | A5 | private generation; no approval unless paid/external |
| `request_review` | A4/A6 | stage or require approval depending recipient |
| `share_document` | A6 | must stage and require approval |
| `record_loi_executed` | A6 | must verify signoff/execution evidence |
| `close_deal` | A6 | confirmation required |
| `start_sourcing_run` | A5 | internal research job; no approval unless paid/external outreach |

Then modify:

- `server/services/aiService.ts`
- `server/services/tools.ts`

Replace direct `executeTool(...)` with:

```ts
governedExecuteTool({
  toolName,
  input,
  userId,
  conversationId,
  contextPack,
});
```

Behavior:

- Safe tools execute immediately.
- Blocked tools return `blocked_action` with reason and next steps.
- Approval-required tools create a staged action, return `staged_action`.
- Defer-required moments return handoff guidance rather than executing.

---

## 8. Staged Actions and Approvals

Create a durable staged-action table.

Suggested migration:

- `server/migrations/061_agency_actions.sql`

Suggested table:

```sql
CREATE TABLE agency_actions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  conversation_id INTEGER REFERENCES conversations(id),
  deal_id INTEGER REFERENCES deals(id),
  action_type TEXT NOT NULL,
  tool_name TEXT,
  payload JSONB NOT NULL,
  policy JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'staged',
  approval_required BOOLEAN NOT NULL DEFAULT true,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  blocked_reason TEXT,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Endpoints:

- `POST /api/agency/actions/:id/approve`
- `POST /api/agency/actions/:id/cancel`
- `GET /api/agency/actions/pending`

Client:

- Chat renders a staged-action pill/card.
- Deal and Doc surfaces show pending approvals in context.
- Today pulls pending approvals into the action queue.

Yulia wording:

> I prepared this. It will not go out until you approve it.

---

## 9. Surface Action Vocabulary

Replace loose `canvas_action` strings with typed surface actions.

Suggested type:

```ts
type SurfaceAction =
  | { type: "open_mode"; mode: ModeId }
  | { type: "open_deal"; dealId: number | string; title?: string; scope?: FileScope }
  | { type: "open_files"; scope?: "all" | "data-room" | "shared"; dealId?: number | string }
  | { type: "open_document"; documentId: number | string; title?: string }
  | { type: "open_analysis"; analysisId: number | string; title?: string }
  | { type: "open_approval"; actionId: number }
  | { type: "show_toast"; tone: "info" | "success" | "warning"; message: string };
```

Desktop maps these to tabs.

Mobile maps them to `MobileView`.

This is how Yulia operates the app without caring whether the user is on desktop or mobile.

---

## 10. Real Workspace State for Surfaces

The surfaces should consume state from backend view-model endpoints.

### Today

Endpoint:

- `GET /api/agency/today`

Returns:

```ts
interface TodayState {
  brief: string;
  priorities: YuliaPriority[];
  liveWork: LiveWorkItem[];
  dealsInMotion: DealPulse[];
  filesNeedingEye: FileActionItem[];
}
```

Source data:

- pending approvals
- tasks
- data-room uploads
- stale deliverables
- stage blockers
- review requests
- model changes
- recently touched files

Today should stop being sample-first and become the daily output of the agency loop.

### Files

Endpoints:

- `GET /api/agency/files`
- `GET /api/agency/deals/:dealId/files?scope=all|data-room|shared`

Returns:

```ts
interface FileHomeState {
  shortcuts: FileShortcut[];
  recents: FileItem[];
  activeRooms: DataRoomSummary[];
  workQueue: FileActionItem[];
}

interface DealFileTree {
  deal: DealSummary;
  scopes: ScopeCount[];
  folders: FileFolder[];
  sections: FileSection[];
}
```

### Deal

Endpoint:

- `GET /api/agency/deals/:dealId/command`

Returns:

- deal dashboard
- verdict
- stats
- open decisions
- linked files
- data-room summary
- pending approvals
- Yulia read

### Search

Endpoint:

- `GET /api/agency/discovery`

Returns:

- saved searches
- recent discovery runs
- suggested searches
- buyer/target/provider lists
- active sourcing jobs

Search actions call existing services:

- `start_sourcing_run`
- `searchService`
- `sourcingPipelineService`
- `providerMatchingService`
- `buyerSourcingService`

### Pipeline

Endpoint:

- `GET /api/agency/pipeline`

Audience-specific:

- buyer/sponsor/search/corp dev: deal stages
- seller: buyer/inquirer process
- advisor: client deals
- PMI: workstreams

---

## 11. Canonical File Model

Short term: create backend view models over existing tables.

Long term: add a canonical document object model that unifies:

- `deliverables`
- `data_room_documents`
- uploaded files
- shared links
- review requests
- executed records

Required fields:

- `location`
- `scope`
- `folder`
- `status`
- `workflowState`
- `permissionState`
- `nextActor`
- `owner`
- `dealId`
- `portfolioId`
- `docClass`
- `immutable`
- `sourceKind`
- `sourceId`
- `version`
- `citationIndexStatus`

The key product rule:

> Location is where it lives. Status is what is happening. Permission is who can see it. Next actor is who owes the next move.

Do not collapse these into one field.

---

## 12. Prompt-to-Surface Workflows

### "Show files that need my eye"

1. Client sends message + current surface.
2. YuliaContextPack includes user/deal/file state.
3. Yulia calls safe read endpoint/tool.
4. Response includes brief explanation.
5. Surface action opens Files filtered to action-needed.

### "Share this CIM with the buyer"

1. Yulia identifies `share_document` as A6.
2. `governedExecuteTool` does not send immediately.
3. System creates `agency_actions` row with payload.
4. Chat renders approval card.
5. User approves.
6. Server checks `actionGate`.
7. If clear, share executes and logs.
8. If blocked, Yulia prepares next step: request review, counsel signoff, NDA, etc.

### "Is this LOI ready to send?"

1. Auditor checks document state and review chain.
2. Legal engine checks whether counsel signoff is required.
3. ActionGate checks status/approvals.
4. Yulia presents:
   - ready/not ready
   - missing signoffs
   - legal/tax issues
   - exact next action

### "Open the data room for Pest Control"

1. Yulia identifies deal.
2. Surface action opens deal file explorer with scope `data-room`.
3. Data-room state endpoint returns artifacts, legal docs, review items, executed records.

---

## 13. Implementation Phases

### Phase 1: Context and Governance Spine

Build:

- `SurfaceContext` sent from desktop and mobile chat.
- `YuliaContextPack` server builder.
- `AGENCY_DOCTRINE` prompt layer.
- `agencyActionRegistry`.
- `governedExecuteTool` wrapper.

Outcome:

Yulia knows where the user is, what she is allowed to do, and when she must stage or defer actions.

### Phase 2: Staged Actions

Build:

- `agency_actions` migration.
- approve/cancel/execute endpoints.
- chat staged-action card.
- `share_document` and `request_review` moved behind staging/approval rules.
- `actionGate` called before execution.

Outcome:

External and irreversible actions become agentic but controlled.

### Phase 3: Real Today

Build:

- `/api/agency/today`.
- Today view consumes real priorities.
- Pending approvals, stale docs, file review needs, and stage blockers appear in Today.

Outcome:

Today becomes Yulia's ranked action desk.

### Phase 4: Real Files and Data Room

Build:

- file view-model service.
- `/api/agency/files`.
- `/api/agency/deals/:dealId/files`.
- Files root and Deal file explorer consume backend state.
- Data-room artifact/legal/executed/shared workflows become real.

Outcome:

Files becomes a functioning deal document system.

### Phase 5: Surface Controller

Build:

- typed `SurfaceAction`.
- desktop action handler.
- mobile action handler.
- surface actions returned consistently from tools.

Outcome:

Yulia can operate the app across desktop and mobile.

### Phase 6: Search as Discovery System

Build:

- Search runs become saved discovery objects.
- search results can be promoted to targets, buyers, providers, or deal tasks.
- SearchRoot consumes real saved/recent discovery state.

Outcome:

Search becomes a sourcing and relationship discovery engine.

### Phase 7: Document/Analysis Deepening

Build:

- document viewer tied to real document lifecycle.
- comments and versions tied to backend.
- immutable execution records.
- analysis models saved, versioned, and attached to deals/files.

Outcome:

Docs and Analysis become real work surfaces Yulia can update and explain.

---

## 14. First Code Slice

The best first implementation slice is small but architectural:

1. Add `SurfaceContext` to chat requests.
2. Build `YuliaContextPack`.
3. Add `AGENCY_DOCTRINE` to prompt composition.
4. Add `agencyActionRegistry`.
5. Wrap `share_document` so it stages instead of immediately sending.
6. Render staged-action cards in chat.

Why this first:

- It connects UI state to Yulia.
- It makes the legal boundary real.
- It uses the existing action gate.
- It establishes the pattern for every other agentic action.
- It does not require rebuilding every surface at once.

---

## 15. Success Criteria

The implementation is working when these are true:

1. User asks from any surface and Yulia knows what they are looking at.
2. Yulia can open the right surface without making the user navigate.
3. Today is generated from real action state.
4. Files and data room reflect real document state, not sample arrays.
5. External actions are staged for approval.
6. Legal/tax-sensitive actions defer or request signoff before execution.
7. Every meaningful action is logged.
8. Every important number is sourced or calculated deterministically.
9. User can either navigate directly or ask Yulia; both paths reach the same objects.
10. The product feels like an agentic process, not a CRM with a chat box.

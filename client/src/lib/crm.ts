/**
 * CRM vocabulary — shared by the desktop and mobile client-pipeline screens so
 * the two can never disagree about what a stage is called or what a tier means.
 *
 * Scoring itself lives in `house/leads.ts` and runs on the server. Nothing here
 * computes a score; this file only names and colours what the server returned.
 */

/** A CLIENT relationship stage — deliberately not a deal gate. A deal gate
 *  describes a target being underwritten; this describes whether we have a
 *  mandate. Mirrors CRM_STAGES in server/routes/crm.ts. */
export const CRM_STAGES = [
  'lead', 'contacted', 'conversation', 'qualified', 'proposal', 'negotiation',
  'won', 'nurture', 'lost',
] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

/* The spec's set, adopted whole (Paul, 2026-08-16: "All of this needs to be
   running in app properly"). Won creates the mandate (the Engagement card);
   Nurture is the parking lot — real fit, wrong timing — and it still demands
   a dated next step, which IS the quarterly touch. Migration 131 mapped the
   old six (prospect→lead, engaged→negotiation, mandate_live→won,
   passed→lost) without resetting anyone's aging clock. */
export const STAGE_LABEL: Record<CrmStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  conversation: 'In conversation',
  qualified: 'Qualified',
  proposal: 'Proposal out',
  negotiation: 'Negotiation',
  won: 'Won — mandate',
  nurture: 'Nurture',
  lost: 'Lost',
};

/** What has to be true to leave each stage — the spec's exit criteria,
 *  rendered where the stage is worked instead of remembered. */
export const STAGE_EXIT: Record<CrmStage, string> = {
  lead: 'Trigger verified (dated, sourced) and fits the beachhead → Contacted. Otherwise archive with a reason.',
  contacted: 'Any reply or meeting → Conversation. Three attempts without a response → Nurture.',
  conversation: 'Need confirmed — they have or expect a mandate and lack origination capacity → Qualified.',
  qualified: 'Fit, budget-holder and timing all confirmed; verbal interest in a proposal → Proposal out.',
  proposal: 'Negotiation begins → Negotiation. Three weeks silent → chase or park.',
  negotiation: 'Signed → Won (open the engagement). Dead → Lost with its reason.',
  won: 'The mandate is live — the work moves to Targets and Deals.',
  nurture: 'Real fit, wrong timing. The dated next step IS the quarterly touch; trigger fires → back to Conversation.',
  lost: 'Closed with a reason. Reopening to any other stage clears the verdict.',
};

/* ── the TARGET origination pipeline (deal funnel, pre-IoI) ──────────── */

export const TARGET_STAGES = [
  'sourced', 'in_wave', 'contacted', 'conversation', 'nda', 'financials_in', 'ioi_decision',
] as const;
export type TargetStage = (typeof TARGET_STAGES)[number];

export const TARGET_STAGE_LABEL: Record<TargetStage, string> = {
  sourced: 'Sourced',
  in_wave: 'In wave',
  contacted: 'Contacted',
  conversation: 'Conversation',
  nda: 'NDA',
  financials_in: 'Financials in',
  ioi_decision: 'IoI decision',
};

/** Target aging thresholds run hotter than the client funnel (spec law 6):
 *  outreach that sits ten days is already cooling. */
export const TARGET_AMBER_DAYS = 10;
export const TARGET_RED_DAYS = 20;

/** What the buyer is missing — the buy signal. `thesis_no_flow` is the sale;
 *  `has_both` means they already have the function in-house. */
export const MOMENT_LABEL: Record<string, string> = {
  thesis_no_flow: 'Thesis, no flow',
  capital_no_thesis: 'Capital, no thesis',
  has_both: 'Has both',
  unknown: 'Unknown',
};

/** Short, honest gloss for why a moment matters — shown next to the label so
 *  the ranking can be understood without reading the scorer. */
export const MOMENT_WHY: Record<string, string> = {
  thesis_no_flow: 'declared a thesis and cannot fill it — this is the sale',
  capital_no_thesis: 'capital looking for a thesis — longer cycle',
  has_both: 'already has thesis and flow — hardest sale',
  unknown: 'not yet diagnosed',
};

export const SEGMENT_LABEL: Record<string, string> = {
  independent_sponsor: 'Independent sponsor',
  family_office: 'Family office',
  permanent_capital: 'Permanent capital',
  holdco: 'Holdco',
  pe_fund: 'PE fund',
  platform: 'Platform',
  strategic: 'Strategic',
  unknown: 'Unknown',
};

export const PITCH_LABEL: Record<string, string> = {
  origination: 'Origination',
  conviction: 'Conviction',
  unknown: '—',
};

/** Evidence quality. Not a quality score — a confidence discount, so the UI
 *  labels it as provenance rather than as a grade. */
export const GRADE_LABEL: Record<string, string> = {
  primary: "Their own disclosure",
  trade: 'Trade press',
  directory: 'Directory only',
  unknown: 'Source unrecorded',
};

export const ACTIVITY_KINDS = ['note', 'email', 'call', 'meeting', 'intro'] as const;

export interface CrmAccount {
  id: number;
  firm: string;
  /** acquirer | service_provider | target | other (migration 115). Only
   *  `acquirer` is ranked — a law firm is in the book to be reachable. */
  kind?: string | null;
  website: string | null;
  domain: string | null;
  hq_city: string | null;
  hq_state: string | null;
  segment: string | null;
  buyer_moment: string | null;
  dfw: string | null;
  trades: string | null;
  product_fit: string | null;
  sponsor: string | null;
  grade: string | null;
  evidence: string | null;
  source_url: string | null;
  notes: string | null;
  last_deal_on: string | null;
  disqualified: string | null;
  stage: string;
  owner_email: string | null;
  next_action: string | null;
  next_action_on: string | null;
  score: number | null;
  tier: string | null;
  pitch: string | null;
  score_detail: string | null;
  scored_at: string | null;
  archived: boolean;
  /** When the CURRENT stage began (migration 130) — aging runs from here,
   *  never from updated_at, which moves on every edit. */
  stage_entered_at?: string | null;
  /** Set only when stage='passed'; the route refuses the move without one. */
  loss_reason?: string | null;
  contact_count?: number;
  activity_count?: number;
  last_touch_at?: string | null;
}

export interface CrmContact {
  id: number;
  account_id: number;
  name: string;
  title: string | null;
  /** Migration 115 — the load-bearing field for who's who. It decides who gets
   *  a campaign and who can be assigned a deal action. */
  role: string | null;
  /** Set once, never cleared by an import: an unsubscribe is permanent. */
  unsubscribed_at: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  is_primary: boolean;
  notes: string | null;
}

export interface CrmActivity {
  id: number;
  account_id: number;
  contact_id: number | null;
  kind: string;
  direction: string | null;
  subject: string | null;
  body: string | null;
  occurred_at: string;
}

export interface CrmSummary {
  total: number;
  byTier: Record<string, number>;
  bySegment: Record<string, number>;
  byMoment: Record<string, number>;
  byPitch: Record<string, number>;
  byStage: Record<string, number>;
  needContact: number;
  directoryOnly: number;
  inMetro: number;
  dueNow: number;
}

/** Days until `next_action_on`. Negative means overdue; null when unset. */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(t)) return null;
  const now = new Date();
  const todayUtc = Date.parse(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00Z`,
  );
  return Math.round((t - todayUtc) / 86_400_000);
}

/** "today" / "in 3 days" / "4 days overdue" — never a bare date, because the
 *  question the board answers is when, not what the calendar says. */
export function dueLabel(iso: string | null | undefined): string | null {
  const d = daysUntil(iso);
  if (d == null) return null;
  if (d === 0) return 'today';
  if (d < 0) return `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`;
  if (d === 1) return 'tomorrow';
  return `in ${d} days`;
}

/** Loss reasons — mirrors LOSS_REASONS in server/routes/crm.ts. The route
 *  refuses stage='passed' without one; the histogram of these is the
 *  P4-hypothesis evidence (CRM_WORKFLOW_SPEC.md). */
export const LOSS_REASONS = [
  'no_budget', 'internal_bd_owns_origination', 'timing',
  'lost_to_competitor', 'trigger_evaporated', 'unresponsive',
] as const;
export type LossReason = (typeof LOSS_REASONS)[number];

export const LOSS_LABEL: Record<LossReason, string> = {
  no_budget: 'No budget',
  internal_bd_owns_origination: 'Internal BD owns origination',
  timing: 'Timing',
  lost_to_competitor: 'Lost to a competitor',
  trigger_evaporated: 'Trigger evaporated',
  unresponsive: 'Unresponsive',
};

/** Aging thresholds for the CLIENT funnel (CRM_WORKFLOW_SPEC.md law 6):
 *  amber at 14 days in stage, red at twice that. */
export const STAGE_AMBER_DAYS = 14;
export const STAGE_RED_DAYS = 28;

/** Whole days the account has sat in its current stage. Null when the stamp
 *  is missing (pre-migration-130 rows before their first move). */
export function daysInStage(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

/** The aging read: quiet under 14d, amber to 28d, red past that. The CLOSED
 *  stages never age — a mandate being live for 90 days is success, not rot —
 *  and NURTURE shows its age but never colours: a parking lot is supposed to
 *  hold things. */
export function stageAging(stage: string, iso: string | null | undefined):
  { days: number; tone: 'quiet' | 'amber' | 'red' } | null {
  if (stage === 'won' || stage === 'lost') return null;
  const days = daysInStage(iso);
  if (days == null) return null;
  if (stage === 'nurture') return { days, tone: 'quiet' };
  return {
    days,
    tone: days >= STAGE_RED_DAYS ? 'red' : days >= STAGE_AMBER_DAYS ? 'amber' : 'quiet',
  };
}

/** Law 3: an OPEN pursuit with no dated next action is flagged everywhere it
 *  appears. Closed stages are exempt — nothing is owed on a verdict. Nurture
 *  is NOT exempt: its dated next step is the quarterly touch. */
export function needsNextStep(a: { stage: string; next_action?: string | null; next_action_on?: string | null }): boolean {
  if (a.stage === 'won' || a.stage === 'lost') return false;
  return !a.next_action || !a.next_action_on;
}

/** Relative age of the last touch. Null when a firm has never been contacted —
 *  which the UI states outright rather than printing a dash. */
export function touchLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30.44);
  return months <= 1 ? 'last month' : `${months} months ago`;
}

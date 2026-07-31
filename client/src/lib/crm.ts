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
  'prospect', 'conversation', 'proposal', 'engaged', 'mandate_live', 'passed',
] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export const STAGE_LABEL: Record<CrmStage, string> = {
  prospect: 'Prospect',
  conversation: 'In conversation',
  proposal: 'Proposal out',
  engaged: 'Engaged',
  mandate_live: 'Mandate live',
  passed: 'Passed',
};

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
  contact_count?: number;
  activity_count?: number;
  last_touch_at?: string | null;
}

export interface CrmContact {
  id: number;
  account_id: number;
  name: string;
  title: string | null;
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

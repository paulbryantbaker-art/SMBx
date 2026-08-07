/**
 * OwnerChat — the free owner evaluation, run as a conversation
 * (SELLER_EVALUATION_PLAN.md, Paul 2026-08-04: "use the Agent chat pill for
 * all of the business intake and valuation… full valuation after the user
 * logs in with Google").
 *
 * P1 brain is SCRIPTED — a deterministic step machine wearing the chat UI.
 * That is a feature, not a shortcut: the evaluation needs exact numbers, the
 * math is pure (house/evaluate.ts, server-side), and the funnel keeps working
 * when the model API is down. A Haiku conversational layer can front this in
 * P2; the scripted path must exist anyway as its fail-soft.
 *
 * ONE CHAT (Paul, 2026-08-04 night: "we don't need its own chat… just use
 * the chat pill on the homepage again"): this component renders NO card of
 * its own — it is the msgs/chips/inputrow FRAGMENT YuliaIntake mounts inside
 * its one conversation card (and mobile sheet) when owner mode is on.
 *
 * PRIVACY MECHANICS (the transcript law): stage A answers (lane, geography,
 * band, situation) persist to localStorage — sessionStorage broke the magic
 * link, which opens a new tab where sessionStorage is empty — so a Google
 * redirect, reload, or emailed return resumes cleanly. Stage C figures live in React state ONLY — never
 * sessionStorage, never a transcript row anywhere. After delivery they stay
 * in MEMORY ONLY for the finish-your-valuation carry-over (mapDraftAnswers
 * seeds the consented workspace so nothing is re-asked), and are wiped the
 * moment the owner declines the continuation or the carry lands. The FIGURES
 * are never stored; the finished REPORT (which shows the normalized numbers)
 * is the one record, kept only if the owner chooses Keep on the end card —
 * every storage sentence in this file carries that exception explicitly.
 *
 * CONSENT SHAPE (Paul, 2026-08-04 evening): acceptance up front is MINIMAL —
 * one tap agreeing we process the answers to build and email the report.
 * The real decision comes AFTER delivery: the chat renders the server's
 * truthful inventory of what's on file (general business info + the report,
 * nothing else) and the owner keeps it or erases it on the spot.
 *
 * FINISHING THE VALUATION (P2 mechanics; PAUL'S TAXONOMY 2026-08-05: the
 * valuation is ONE full-depth product — the first sitting's deliverable is
 * the DRAFT, and the section walk completes it; no customer-facing "quick"
 * tier exists): offered only AFTER the draft delivers, and the continuation
 * is a different privacy deal the owner accepts explicitly —
 * "log back in and finish" IS storage, so answers save to the consented
 * workspace (owner_evaluations) as sections close. The walk is driven
 * ENTIRELY by SECTIONS from house/fullEvaluation — the chat never carries a
 * question of its own, so the ledger, the validators, and the report gates
 * all read the same source. Parking is a first-class answer ("I need to find
 * this" → the whereToFind hint becomes the go-get instruction); localStorage
 * holds only a resume POINTER ({stage:'full-resume', a}) and never the
 * transcript, because the figures' one home is the workspace itself.
 */
import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
// The full tier's single source of questions — house doctrine: pure module,
// imported directly (the same way the app shells import house/tokens), so the
// chat, the server ledger, and the report gates can never disagree on what a
// question asks or where its answer is found.
import {
  SECTIONS,
  ALL_QUESTIONS,
  answeredCount,
  mapDraftAnswers,
  parkedList,
  sectionStatus,
  type EvalAnswer,
  type EvalAnswers,
  type EvalQuestion,
} from '../../../house/fullEvaluation';

const SS_KEY = 'smbx_owner_intake_v1';

export interface OwnerLane { key: string; label: string }

/** Every vertical the practice covers (the Industries page's own list), not
 *  just the lanes with published bands (Paul, 2026-08-04: "why are only a
 *  handful of home service verticals being offered"). Lanes without sourced
 *  valuation data flow to the honest waitlist path — the server refuses to
 *  guess, and the owner is first in line when that lane's read exists. */
export const OWNER_LANES: OwnerLane[] = [
  { key: 'hvac', label: 'HVAC' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'roofing', label: 'Roofing' },
  { key: 'pest-control', label: 'Pest control' },
  { key: 'garage-doors', label: 'Garage doors' },
  { key: 'landscaping', label: 'Landscaping & grounds' },
  { key: 'commercial-mechanical', label: 'Commercial MEP' },
  { key: 'fire-life-safety', label: 'Fire & life safety' },
  { key: 'elevator-escalator', label: 'Elevator & escalator' },
  { key: 'power-grid', label: 'Power & grid services' },
  { key: 'energy-services', label: 'Energy & industrial services' },
  { key: 'fuel-distribution', label: 'Fuel & propane distribution' },
  { key: 'building-automation', label: 'Building automation' },
  { key: 'tic-ndt', label: 'Testing & inspection' },
  { key: 'environmental-cleaning', label: 'Environmental & industrial cleaning' },
  { key: 'water-wastewater', label: 'Water & wastewater O&M' },
  { key: 'mro-distribution', label: 'Specialty & MRO distribution' },
  { key: 'machining', label: 'Machine shops & precision mfg' },
  { key: 'food-copack', label: 'Food co-packing' },
  { key: 'nemt', label: 'Medical transport (NEMT)' },
  { key: 'rcm-billing', label: 'Medical billing / RCM' },
];
const LANES = OWNER_LANES;

const REV_BANDS = ['Under $1M', '$1M–$3M', '$3M–$10M', '$10M+'];
const SITUATIONS = ['Just curious', 'Thinking about it in 1–3 years', 'Ready in the next 12 months'];

interface Msg { who: 'y' | 'me'; text: string }

type Stage =
  | 'lane' | 'lane-other' | 'geo' | 'revband' | 'situation' | 'laneread'
  | 'gate' | 'fin-revenue' | 'fin-earnings' | 'fin-ownercomp'
  | 'fin-onetime' | 'fin-personal' | 'fin-family'
  | 'fin-re' | 'fin-rentpaid' | 'fin-marketrent'
  | 'fin-recurring' | 'fin-owner' | 'fin-customer' | 'fin-books' | 'fin-newcon'
  | 'accept' | 'sending' | 'retain' | 'done' | 'waitlist' | 'waitlist-done'
  // FULL tier (P2) — every 'full-*' stage is unreachable unless the owner
  // taps into the full evaluation at 'done'; the quick walk never sees them.
  | 'full-loading' | 'full-consent' | 'full-q' | 'full-check' | 'full-section-end'
  | 'full-walk-end' | 'full-final' | 'full-checklist' | 'full-saved' | 'full-build'
  | 'full-retain' | 'full-done';

/** The truthful inventory the end card renders — comes back from the server's
 *  evaluate response, so the card can only show what was actually written. */
interface OnFile {
  email: string; name: string | null; lane: string; geography: string | null;
  situation: string | null; revenueBand: string; readiness: string; report: string;
}

interface StageA { lane?: string; laneLabel?: string; geo?: string; revBand?: string; situation?: string }

declare const google: any;

function money(s: string): number | null {
  // Owners type "1.2m", "750k", "-40k" (a loss year is a real answer), or
  // plain dollars. The sign must be read BEFORE stripping non-digits, or a
  // negative silently becomes a positive.
  const neg = /^\s*-/.test(s) || /\(.*\)/.test(s); // "-40k" or accountant's "(40k)"
  const digits = s.replace(/[^0-9.]/g, '');
  if (digits === '' || digits === '.') return null;
  const n = Number(digits);
  if (!isFinite(n)) return null;
  const mag = /m/i.test(s) ? 1_000_000 : /k/i.test(s) ? 1_000 : 1;
  return Math.round(n * mag) * (neg ? -1 : 1);
}
function pct(s: string): number | null {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : null;
}

export default function OwnerChat({ initialLane, onBusy }: { initialLane?: OwnerLane | null; onBusy?: (b: boolean) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [stage, setStage] = useState<Stage>('lane');
  const [a, setA] = useState<StageA>({});
  const [verified, setVerified] = useState<{ email: string } | null>(null);
  // Stage C — React state only, per the transcript law. Never persisted.
  const fin = useRef<Record<string, number | string>>({});
  const [draft, setDraft] = useState('');
  const [onFile, setOnFile] = useState<OnFile | null>(null);
  const [closeLine, setCloseLine] = useState('');
  const [deciding, setDeciding] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const googleBtn = useRef<HTMLDivElement>(null);

  // FULL tier state. `answers` mirrors the consented workspace; `patch` is
  // the not-yet-flushed delta (kept on flush failure, retried at the next
  // save point). None of it exists until the owner accepts the full-tier
  // terms — the quick walk touches none of these.
  const fullLane = useRef<string | null>(null);
  const fullPending = useRef<string | null>(null); // lane awaiting re-verification at the gate
  const answers = useRef<EvalAnswers>({});
  const patch = useRef<Record<string, EvalAnswer>>({});
  const revisit = useRef(false); // a resume/circle-back pass re-asks parked (and skipped-required) questions
  const lastSection = useRef(-1);
  const pendingNext = useRef<{ si: number; qi: number } | null>(null);
  const checkedOnce = useRef<string | null>(null); // a cross-check re-asks once, never loops
  const building = useRef(false);
  const [cur, setCur] = useState<{ si: number; qi: number } | null>(null);
  const [fullOffered, setFullOffered] = useState(false);
  const [consenting, setConsenting] = useState(false);

  const say = (who: 'y' | 'me', text: string) => setMsgs(m => [...m, { who, text }]);

  // Hydrate stage A after a Google redirect or reload; greet fresh visitors.
  useEffect(() => {
    let saved: { a: StageA; stage: Stage | 'full-resume'; msgs: Msg[] } | null = null;
    try { saved = JSON.parse(localStorage.getItem(SS_KEY) || 'null'); } catch { /* fine */ }
    if (saved?.stage === 'full-resume' && saved.a?.lane) {
      // FULL tier return — the pointer only says which workspace to reopen;
      // the workspace itself is the state. bootFull (after /me) reopens it.
      setA(saved.a);
      setMsgs([{ who: 'y', text: 'One moment — pulling up your evaluation workspace…' }]);
      setStage('full-loading');
    } else if (saved?.a?.lane && saved.stage) {
      setA(saved.a); setMsgs(saved.msgs || []); setStage(saved.stage === 'gate' ? 'gate' : saved.stage as Stage);
    } else if (initialLane) {
      // Entered from the #owners section with a trade already picked — the
      // conversation starts one step in.
      setA({ lane: initialLane.key, laneLabel: initialLane.label });
      setMsgs([{ who: 'y', text: `${initialLane.label} — good. Let's build your free valuation. What metro or region is the business in?` }]);
      setStage('geo');
      trackEvent('owner_lane_picked', { lane: initialLane.key, via: 'section' });
    } else if (initialLane === null) {
      // "Another trade" from the section.
      setMsgs([{ who: 'y', text: "Let's build your free valuation. Name the trade — what's the business?" }]);
      setStage('lane-other');
    } else {
      setMsgs([{ who: 'y', text: "Let's build your free valuation. First — which trade is your business in?" }]);
    }
    fetch('/api/owners/me').then(r => (r.ok ? r.json() : null)).catch(() => null).then(me => {
      if (me?.email) setVerified({ email: me.email });
      // Full-tier resume ("On return: the greeting is the ledger head, not a
      // restart"). When full mode was never entered, no workspace exists and
      // this resolves to nothing — the quick walk stands untouched.
      void bootFull(me, saved);
    });
  }, []);

  // Persist ONLY stage A + transcript-so-far (never stage C figures).
  useEffect(() => {
    if (stage === 'done' || stage === 'sending') { try { localStorage.removeItem(SS_KEY); } catch { /* fine */ } return; }
    if (fullLane.current || fullPending.current) {
      // FULL tier: persist only the resume POINTER — never the transcript.
      // The figures' one home is the consented workspace (owner_evaluations);
      // localStorage carries just enough to reopen it on any reload/return.
      const lane = a.lane || fullLane.current || fullPending.current || undefined;
      try { localStorage.setItem(SS_KEY, JSON.stringify({ a: { ...a, lane }, stage: 'full-resume', msgs: [] })); } catch { /* fine */ }
      return;
    }
    // 'laneread' is deliberately NOT here: it renders no chips and no input
    // (it's the await on the lane-read fetch), so a reload restored into it
    // would have nothing to tap. The prior 'situation' write resumes cleanly.
    const persistable = ['lane', 'lane-other', 'geo', 'revband', 'situation', 'gate', 'waitlist', 'waitlist-done'].includes(stage);
    if (!persistable) return;
    try { localStorage.setItem(SS_KEY, JSON.stringify({ a, stage, msgs })); } catch { /* fine */ }
  }, [a, stage, msgs]);

  useEffect(() => { listRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs, stage]);

  // Tell the host card when leaving mid-flight would orphan a delivery —
  // it disables its X during 'sending' (and the full tier's report build).
  useEffect(() => { onBusy?.(stage === 'sending' || stage === 'full-build'); }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verified mid-gate (Google popup or magic-link return) → continue to
  // figures — unless the gate was a full-tier re-verification, in which case
  // the workspace reopens where it left off instead.
  useEffect(() => {
    if (verified && stage === 'gate') {
      if (fullPending.current) {
        const lane = fullPending.current;
        fullPending.current = null;
        void resumeFull(lane);
        return;
      }
      say('y', `You're verified as ${verified.email} — your valuation report will go there. Now the numbers. Trailing-twelve-month revenue? (e.g. "2.4m")`);
      setStage('fin-revenue');
    }
  }, [verified, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // GIS button at the gate — the same credential flow the app login uses.
  useEffect(() => {
    if (stage !== 'gate' || verified) return;
    const cid = (window as any).__GOOGLE_CLIENT_ID;
    if (!cid || typeof google === 'undefined' || !googleBtn.current) return;
    try {
      google.accounts.id.initialize({
        client_id: cid,
        callback: async (resp: { credential: string }) => {
          const r = await fetch('/api/owners/google', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: resp.credential }),
          });
          if (r.ok) { const j = await r.json(); setVerified({ email: j.email }); trackEvent('owner_verified', { via: 'google' }); }
        },
      });
      google.accounts.id.renderButton(googleBtn.current, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with' });
    } catch { /* GIS unavailable — magic link still works */ }
  }, [stage, verified]);

  const pickOtherLane = () => {
    say('me', 'Another trade');
    say('y', "Name it — what's the trade?");
    setStage('lane-other');
  };
  const submitOtherLane = () => {
    const label = draft.trim(); if (!label) return;
    say('me', label); setDraft('');
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
    setA(v => ({ ...v, lane: key, laneLabel: label }));
    say('y', 'Got it. What metro or region are you in?');
    setStage('geo');
    trackEvent('owner_lane_picked', { lane: key, other: true });
  };

  const pickLane = async (key: string, label: string) => {
    say('me', label);
    setA(v => ({ ...v, lane: key, laneLabel: label }));
    say('y', 'Got it. What metro or region are you in?');
    setStage('geo');
    trackEvent('owner_lane_picked', { lane: key });
  };

  const submitGeo = () => {
    const geo = draft.trim(); if (!geo) return;
    say('me', geo); setDraft('');
    setA(v => ({ ...v, geo }));
    say('y', 'Roughly what revenue band is the business in?');
    setStage('revband');
  };

  const pickRevBand = (band: string) => {
    say('me', band);
    setA(v => ({ ...v, revBand: band }));
    say('y', 'And where is your head on selling?');
    setStage('situation');
  };

  const pickSituation = async (s: string) => {
    say('me', s);
    const nextA = { ...a, situation: s };
    setA(nextA);
    setStage('laneread');
    try {
      const r = await fetch(`/api/owners/lane-read?lane=${encodeURIComponent(nextA.lane || '')}&geography=${encodeURIComponent(nextA.geo || '')}`);
      const j = await r.json();
      if (j.supported) {
        say('y',
          `The market context first: published data has ${nextA.laneLabel} businesses trading between ` +
          `${j.band.low}x and ${j.band.high}x, with the market's middle at ${j.band.marketLow}x–${j.band.marketHigh}x ` +
          `(${j.band.basisNote}). Source: ${j.band.source}.`);
        say('y',
          'To build YOUR valuation I need your actual figures — and a verified email to deliver the report to. ' +
          "Continue with Google below, or I'll email you a link. The figures you type are never stored — they run " +
          'the calculation and are gone. The finished report is the one record of them, and whether we keep a copy ' +
          'is YOUR call at the end.');
        setStage('gate');
      } else {
        say('y', j.message);
        say('y', "Leave your email and you're first in line the day your trade's valuation data is published — and on the first-call list when a buyer engages us in your lane.");
        setStage('waitlist');
      }
    } catch {
      say('y', 'Something hiccuped on my side — give that another tap.');
      setStage('situation');
    }
  };

  const submitMagic = async () => {
    const email = draft.trim(); if (!email) return;
    say('me', email); setDraft('');
    const r = await fetch('/api/owners/magic', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    });
    if (r.ok) say('y', 'Link sent — open it on this device and we pick up right here. (Good for 30 minutes.)');
    else say('y', "That email didn't look right — try again?");
  };

  const submitWaitlist = async () => {
    const email = draft.trim(); if (!email) return;
    say('me', email); setDraft('');
    await fetch('/api/owners/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lane: a.lane, geography: a.geo }),
    }).catch(() => { /* fine */ });
    say('y', "Done — you're registered. We work for buyers and never take a fee from an owner; when one engages us in your lane, registered owners hear first.");
    setStage('waitlist-done');
    trackEvent('owner_waitlisted', { lane: a.lane });
  };

  // Each step stores THIS stage's answer, then asks the NEXT question and
  // moves there. The add-backs are itemized (Paul, 2026-08-04: "thorough with
  // real estate, add-backs etc. not fluff") — buyers rebuild them line by
  // line in QofE, so the intake walks them the same way.
  const FIN_STEPS: Array<{ stage: Stage; key: string; parse: (s: string) => number | string | null; ask: string; next: Stage }> = [
    { stage: 'fin-revenue', key: 'revenueUsd', parse: money, next: 'fin-earnings',
      ask: 'Profit on the tax return last year — the bottom line before any adjustments? (rough is fine)' },
    { stage: 'fin-earnings', key: 'earningsUsd', parse: money, next: 'fin-ownercomp',
      ask: 'Your total owner compensation — W-2 salary plus the distributions you actually take?' },
    { stage: 'fin-ownercomp', key: 'ownerCompUsd', parse: money, next: 'fin-onetime',
      ask: 'Now the add-backs, one at a time — a buyer\'s accountants will rebuild these line by line, so precise beats optimistic. First: one-time costs that won\'t repeat (a lawsuit, a flood repair, a one-off equipment purchase)? "0" is a fine answer.' },
    { stage: 'fin-onetime', key: 'addBackOneTimeUsd', parse: money, next: 'fin-personal',
      ask: 'Personal expenses run through the business — vehicles you drive personally, family phones, travel, meals?' },
    { stage: 'fin-personal', key: 'addBackPersonalUsd', parse: money, next: 'fin-family',
      ask: "Family on payroll who don't actually work in the business — their total comp? (If everyone earns their keep, \"0\".)" },
    { stage: 'fin-rentpaid', key: 'rentPaidUsd', parse: money, next: 'fin-marketrent',
      ask: 'And market rent for that space — roughly what a landlord would charge a stranger per year? Buyers restate your earnings at market rent, so this moves the number.' },
    { stage: 'fin-marketrent', key: 'marketRentUsd', parse: money, next: 'fin-recurring',
      ask: 'What percent of revenue recurs — maintenance plans, service contracts? (0–100)' },
    { stage: 'fin-recurring', key: 'recurringPct', parse: pct, next: 'fin-owner',
      ask: 'Who runs the day to day?' },
  ];

  const submitFin = () => {
    const step = FIN_STEPS.find(s => s.stage === stage);
    if (!step) return;
    const v = step.parse(draft);
    if (v === null) { say('y', "I couldn't read that as a number — try like \"1.2m\", \"750k\", or \"40\"."); return; }
    say('me', draft.trim()); setDraft('');
    fin.current[step.key] = v;
    say('y', step.ask);
    setStage(step.next);
  };

  // fin-family types a number but forks to the RE chips rather than a next
  // question, so it has its own handler instead of a FIN_STEPS entry.
  const submitFamily = () => {
    const v = money(draft);
    if (v === null) { say('y', "I couldn't read that as a number — try like \"25k\" or \"0\"."); return; }
    say('me', draft.trim()); setDraft('');
    fin.current.addBackFamilyUsd = v;
    say('y', 'Real estate — does the business (or you personally) own the property it operates from, or do you lease from a third party?');
    setStage('fin-re');
  };

  const pickRealEstate = (label: string, val: 'owned' | 'leased') => {
    say('me', label);
    fin.current.realEstate = val;
    if (val === 'owned') {
      say('y', 'What rent does the business currently pay for the space per year? "0" if it pays none — common, and exactly why buyers restate it.');
      setStage('fin-rentpaid');
    } else {
      say('y', 'Got it — your lease carries over as a real cost, no restatement needed. What percent of revenue recurs — maintenance plans, service contracts? (0–100)');
      setStage('fin-recurring');
    }
  };

  const pickOwnerDep = (label: string, val: string) => {
    say('me', label); fin.current.ownerDependence = val;
    say('y', 'Largest single customer — roughly what percent of revenue? (0–100)');
    setStage('fin-customer');
  };
  const submitCustomer = () => {
    const v = pct(draft); if (v === null) { say('y', 'A percent between 0 and 100, roughly.'); return; }
    say('me', draft.trim()); setDraft(''); fin.current.topCustomerPct = v;
    say('y', 'How are the books kept?');
    setStage('fin-books');
  };
  const pickBooks = (label: string, val: string) => {
    say('me', label); fin.current.booksQuality = val;
    say('y', 'Last one: what percent of revenue is new-construction or GC work? (0–100)');
    setStage('fin-newcon');
  };
  const submitNewcon = () => {
    const v = pct(draft); if (v === null) { say('y', 'A percent between 0 and 100, roughly.'); return; }
    say('me', draft.trim()); setDraft(''); fin.current.newConstructionPct = v;
    say('y',
      "That's everything. To build your valuation, we process your answers and email you the report — that's " +
      "the minimum this takes. The figures themselves are never stored. When it's delivered, I'll show you exactly " +
      "what's on file — including the report copy, which is the one record of your numbers — and YOU decide " +
      'whether we keep any of it.');
    setStage('accept');
  };

  const runEvaluation = async () => {
    setStage('sending');
    say('y', 'Building your valuation…');
    try {
      const r = await fetch('/api/owners/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lane: a.lane, geography: a.geo, situation: a.situation,
          financials: fin.current,
        }),
      });
      const j = await r.json();
      if (!r.ok) { say('y', j.error || 'That didn\'t go through — try once more.'); setStage('accept'); return; }
      // The figures stay in MEMORY ONLY (React ref — never persisted anywhere)
      // so continuing into the workspace can carry them over without
      // re-asking; they are wiped when the owner declines the continuation
      // (declineFull) or the carry lands in the consented workspace
      // (acceptFull → mapDraftAnswers).
      say('y', j.mailed
        ? `Done — your draft valuation is in your inbox — the wide published band applied to your figures (readiness read: ${j.position} of your lane's band).`
        : 'Your draft valuation is built, but mail delivery is unavailable right now — we\'ll get it to you shortly.');
      say('y',
        "One last thing, and it's your call. Below is what we hold for this trade — general business " +
        'information and the report itself, nothing else. Keep it on file and you\'re on the first-call list ' +
        'when a buyer engages us in your lane; tell us to delete and everything under your email is gone ' +
        'right now — this record, any other trade you\'ve run, report and all.');
      setOnFile(j.onFile || null);
      setCloseLine(j.close || '');
      setStage('retain');
      trackEvent('owner_evaluated', { lane: a.lane, position: j.position });
    } catch {
      say('y', 'Network hiccup — nothing was lost, tap Build again.');
      setStage('accept');
    }
  };

  // The retention decision — Keep files the row (and the first-call consent);
  // Delete is the right to erasure, exercised on the spot.
  const decide = async (keep: boolean) => {
    if (deciding) return;
    setDeciding(true);
    try {
      const r = await fetch('/api/owners/retention', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        // keep is scoped to THIS lane (consent covers only what the card
        // showed); delete is email-wide (erasure is broader by right).
        body: JSON.stringify({ keep, firstCall: keep, lane: a.lane }),
      });
      if (!r.ok) { say('y', 'That didn\'t go through — give it another tap.'); setDeciding(false); return; }
      if (keep) {
        say('y', `Kept. ${closeLine || 'When a buyer engages us in your lane, registered owners hear before anyone else.'}`);
      } else {
        say('y', 'Deleted — your information and the report copy are gone from our system. The email in your inbox is yours to keep.');
      }
      // The walk's one entry point — offered only now, after the draft has
      // fully delivered and the retention decision is made.
      say('y', 'Finish your valuation — the rest of the walk narrows your range and completes the full report. From here your progress saves so you can leave and come back.');
      setFullOffered(true);
      setStage('done');
      trackEvent('owner_retention', { lane: a.lane, kept: keep });
    } catch {
      say('y', 'Network hiccup — give it another tap.');
      setDeciding(false);
    }
  };

  /* ── FULL EVALUATION (P2) — everything below is dead code until the owner
   *    taps into the full tier at 'done'. The walk is a cursor over SECTIONS;
   *    the chat carries no question text of its own. ─────────────────────── */

  const fullQ = (p: { si: number; qi: number } | null): EvalQuestion | null =>
    (p ? SECTIONS[p.si].questions[p.qi] : null);

  const isReq = (q: EvalQuestion) => (q.requiredIf ? q.requiredIf(answers.current) : !q.optional);

  const askable = (q: EvalQuestion, rv: boolean): boolean => {
    if (q.requiredIf && !q.requiredIf(answers.current)) return false; // not applicable under current answers
    const st = answers.current[q.key]?.state;
    if (!st) return true;
    if (!rv) return false;
    // A circle-back pass re-opens parked questions, and skipped ones the
    // final report cannot go without — a skipped optional stays skipped.
    return st === 'parked' || (st === 'skipped' && isReq(q));
  };

  const nextAskable = (si: number, qi: number, rv: boolean): { si: number; qi: number } | null => {
    for (let i = si; i < SECTIONS.length; i++) {
      const qs = SECTIONS[i].questions;
      for (let j = i === si ? qi : 0; j < qs.length; j++) {
        if (askable(qs[j], rv)) return { si: i, qi: j };
      }
    }
    return null;
  };

  const record = (key: string, entry: EvalAnswer) => {
    answers.current[key] = entry;
    patch.current[key] = entry;
  };

  const sectionsDoneNow = () =>
    SECTIONS.filter(s => s.questions.every(q =>
      (q.requiredIf && !q.requiredIf(answers.current)) || !!answers.current[q.key]?.state,
    )).map(s => s.key);

  // Flush the unsent delta to the consented workspace. A failed flush keeps
  // the buffer and retries at the next save point — quiet, never a block.
  // Returns whether the workspace actually took the write, so no caller can
  // claim "saved" (or build a report off a stale server copy) when it didn't.
  const flush = async (): Promise<boolean> => {
    if (!fullLane.current) return false;
    const sending = { ...patch.current };
    try {
      const r = await fetch('/api/owners/full/answers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: fullLane.current, answers: sending, sectionsDone: sectionsDoneNow() }),
      });
      if (r.ok) {
        for (const k of Object.keys(sending)) if (patch.current[k] === sending[k]) delete patch.current[k];
      }
      return r.ok;
    } catch { return false; /* buffer kept — retried at the next save point */ }
  };

  const askQuestion = (pos: { si: number; qi: number }) => {
    const sec = SECTIONS[pos.si];
    const q = sec.questions[pos.qi];
    if (lastSection.current !== pos.si) {
      lastSection.current = pos.si;
      say('y', `Section ${pos.si + 1} of ${SECTIONS.length} — ${sec.title}`);
      if (sec.questions.every(qq => !answers.current[qq.key]?.state)) say('y', sec.intro);
    }
    const st = answers.current[q.key]?.state;
    say('y', (st === 'parked' ? 'Circling back — ' : st === 'skipped' ? 'You skipped this earlier, and the full report needs it — ' : '') + q.ask);
    checkedOnce.current = null;
    setCur(pos);
    setStage('full-q');
  };

  const beginWalk = (rv: boolean) => {
    revisit.current = rv;
    lastSection.current = -1;
    const pos = nextAskable(0, 0, rv);
    if (pos) askQuestion(pos);
    else walkEnd();
  };

  const walkEnd = () => {
    void flush();
    const missing = sectionStatus(answers.current).filter(s => !s.complete);
    const led = answeredCount(answers.current);
    if (!missing.length) {
      say('y', "Every section is complete. I can build your full report now — every figure either yours or the published band's, and a range, never a number.");
      setStage('full-final');
    } else {
      say('y',
        `That's the walk — ${led.answered} of ${led.total} answered. The final report needs ${missing.length} section${missing.length === 1 ? '' : 's'} finished: ` +
        missing.map(m => m.title).join(', ') + ". A draft names its own gaps; circling back picks up what's open.");
      setStage('full-walk-end');
    }
  };

  const advance = (from: { si: number; qi: number }) => {
    checkedOnce.current = null;
    const next = nextAskable(from.si, from.qi + 1, revisit.current);
    if (next && next.si === from.si) { askQuestion(next); return; }
    void flush();
    if (!next) { walkEnd(); return; }
    const sec = SECTIONS[from.si];
    const led = answeredCount(answers.current);
    const parkedHere = parkedList(answers.current).filter(p => p.sectionKey === sec.key);
    say('y', `${sec.title} — done. ${led.answered} of ${led.total} answered${led.parked ? `, ${led.parked} parked` : ''}.`);
    if (parkedHere.length) {
      say('y', 'From this section, still to find: ' + parkedHere.map(p => `${p.ask} (${p.whereToFind})`).join(' · '));
    }
    pendingNext.current = next;
    setStage('full-section-end');
  };

  const parseFull = (q: EvalQuestion, t: string): number | string | null => {
    if (q.kind === 'money') return money(t);
    if (q.kind === 'pct') return pct(t);
    if (q.kind === 'int') {
      const digits = t.replace(/[^0-9]/g, '');
      return digits ? Number(digits) : null;
    }
    if (q.kind === 'text') return t;
    return null; // choice answers arrive by chip
  };
  const parseHint = (q: EvalQuestion) =>
    q.kind === 'money' ? 'I couldn\'t read that as a dollar figure — try like "1.2m", "750k", or "0". "skip" and "park" work too.'
    : q.kind === 'pct' ? 'A percent between 0 and 100, roughly — or "skip" / "park".'
    : 'A whole number, like "12" — or "skip" / "park".';

  const submitFull = () => {
    const q = fullQ(cur);
    if (!q || !cur) return;
    const t = draft.trim();
    if (!t) return;
    const low = t.toLowerCase();
    if (low === 'skip') { setDraft(''); skipFull(); return; }
    if (low === 'park' || low === 'i need to find this') { setDraft(''); parkFull(); return; }
    const v = parseFull(q, t);
    if (v === null) { say('y', parseHint(q)); return; }
    say('me', t); setDraft('');
    record(q.key, { state: 'answered', value: v });
    // The deterministic cross-checks from the question defs, run as the
    // answer lands — a failed check is a gentle re-ask, never a block.
    const check = q.validate?.(answers.current) ?? null;
    if (check && checkedOnce.current !== q.key) {
      checkedOnce.current = q.key;
      say('y', `${check} Type a corrected figure, or tap "Looks right" to keep it.`);
      setStage('full-check');
      return;
    }
    advance(cur);
  };

  const submitFullCheck = () => {
    const q = fullQ(cur);
    if (!q || !cur) return;
    const t = draft.trim();
    if (!t) return;
    const v = parseFull(q, t);
    if (v === null) { say('y', parseHint(q)); return; }
    say('me', t); setDraft('');
    record(q.key, { state: 'answered', value: v });
    const check = q.validate?.(answers.current) ?? null;
    if (check) say('y', 'Noted — keeping your figures as entered; you can reconcile them any time before the final build.');
    advance(cur);
  };
  const keepAnyway = () => {
    if (!cur) return;
    say('me', 'Looks right');
    advance(cur);
  };

  const skipFull = () => {
    const q = fullQ(cur);
    if (!q || !cur) return;
    say('me', 'Skip');
    record(q.key, { state: 'skipped' });
    if (isReq(q)) say('y', 'Skipped — the report names it as a gap until it lands.');
    advance(cur);
  };
  const parkFull = () => {
    const q = fullQ(cur);
    if (!q || !cur) return;
    say('me', 'I need to find this');
    record(q.key, { state: 'parked' });
    say('y', `Parked — it's on your go-get list. Find it: ${q.whereToFind}`);
    advance(cur);
  };
  const pickFullChoice = (value: string, label: string) => {
    const q = fullQ(cur);
    if (!q || !cur) return;
    say('me', label);
    record(q.key, { state: 'answered', value });
    advance(cur);
  };

  const continueWalk = () => {
    const nx = pendingNext.current;
    if (!nx) return;
    pendingNext.current = null;
    say('me', 'Continue');
    askQuestion(nx);
  };
  const circleBack = () => {
    say('me', 'Circle back to open items');
    beginWalk(true);
  };

  const saveAndLeave = async () => {
    say('me', 'Save & come back later');
    const ok = await flush();
    if (!ok) {
      // Leaving on a failed save would silently lose the buffered answers —
      // keep the same chips on screen so the tap can simply be repeated.
      say('y', "I couldn't reach the server to save just now — give \"Save & come back later\" another tap in a moment.");
      return;
    }
    const led = answeredCount(answers.current);
    const parked = parkedList(answers.current);
    say('y', `Saved — ${led.answered} of ${led.total} answered. Come back on any device: continue with Google or the emailed link and this chat picks up exactly here.`);
    trackEvent('owner_full_saved', { lane: fullLane.current, answered: led.answered, parked: parked.length });
    if (parked.length) {
      say('y',
        `Your go-get list holds ${parked.length} item${parked.length === 1 ? '' : 's'}: ` +
        parked.slice(0, 4).map(p => p.ask).join(' · ') +
        (parked.length > 4 ? ` — and ${parked.length - 4} more` : '') +
        '. Want it emailed, so the list survives the walk to the filing cabinet?');
      setStage('full-checklist');
    } else {
      setStage('full-saved');
    }
  };
  const emailChecklist = async () => {
    say('me', 'Email me the go-get list');
    try {
      const r = await fetch('/api/owners/full/checklist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: fullLane.current }),
      });
      const j = await r.json();
      say('y', r.ok && j.mailed
        ? 'Sent — each item says exactly where the answer lives.'
        : "Couldn't send it just now — the list stays saved in your workspace regardless.");
    } catch {
      say('y', "Couldn't send it just now — the list stays saved in your workspace regardless.");
    }
    setStage('full-saved');
  };
  const declineChecklist = () => { say('me', "No need — I've got it"); setStage('full-saved'); };
  const resumeSaved = () => { say('me', 'Pick the walk back up'); beginWalk(true); };

  const restoreAfterBuild = (prev: Stage) => {
    if (prev === 'full-q' && cur) {
      const q = fullQ(cur);
      if (q) say('y', `Back to it — ${q.ask}`);
      setStage('full-q');
    } else {
      setStage(prev);
    }
  };

  const buildReport = async (mode: 'draft' | 'final') => {
    if (building.current || !fullLane.current) return;
    building.current = true;
    const prevStage = stage;
    say('me', mode === 'final' ? 'Build my full report' : 'Build my draft');
    setStage('full-build');
    say('y', mode === 'final' ? 'Building your full report…' : 'Building your draft — it will name its own gaps…');
    // The report renders from the WORKSPACE, so unsaved answers must land
    // first — building off a stale server copy would name gaps that aren't.
    if (Object.keys(patch.current).length && !(await flush())) {
      say('y', "I couldn't reach the server to save your latest answers — give it another tap in a moment.");
      restoreAfterBuild(prevStage);
      building.current = false;
      return;
    }
    try {
      const r = await fetch('/api/owners/full/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: fullLane.current, mode }),
      });
      const j = await r.json();
      if (r.status === 422) {
        say('y', `${j.error || 'The final build needs every section complete.'} Still open: ${(j.incomplete || []).map((s: { title: string }) => s.title).join(', ')}.`);
        setStage('full-walk-end');
      } else if (!r.ok) {
        say('y', j.error || "That didn't go through — give it another tap.");
        restoreAfterBuild(prevStage);
      } else {
        trackEvent('owner_full_report', { lane: fullLane.current, mode, mailed: j.mailed });
        say('y', j.mailed
          ? (mode === 'final' ? 'Done — your full report is in your inbox.' : 'Draft delivered — check your inbox.')
          : "Built, but mail delivery is unavailable right now — we'll get it to you shortly.");
        if (mode === 'draft' && Array.isArray(j.gaps) && j.gaps.length) {
          say('y', `It names ${j.gaps.length} gap${j.gaps.length === 1 ? '' : 's'} on the page itself — finish the walk and the withheld pages fill in.`);
        }
        if (mode === 'final') {
          say('y', "Your workspace — the answers and the report copy — stays saved so you can update figures and rebuild any time. Or delete it now and it's all gone, report included. Your call.");
          setStage('full-retain');
        } else {
          restoreAfterBuild(prevStage);
        }
      }
    } catch {
      say('y', 'Network hiccup — nothing was lost, tap it again.');
      restoreAfterBuild(prevStage);
    }
    building.current = false;
  };

  // The full tier's keep-or-delete — same right the quick tier grants, on the
  // workspace this tier stores. Delete erases the row, answers and report.
  const fullDecide = async (keep: boolean) => {
    if (keep) {
      say('me', 'Keep it');
      say('y', 'Kept. Come back any time to update a figure — the walk reopens where the change lands, and the report rebuilds on your say-so.');
      setStage('full-done');
      return;
    }
    say('me', 'Delete my workspace & report');
    try {
      const r = await fetch('/api/owners/full/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: fullLane.current }),
      });
      if (!r.ok) { say('y', "That didn't go through — give it another tap."); return; }
      say('y', 'Deleted — your answers and the report copy are gone from our system. The PDF in your inbox is yours to keep.');
      fullLane.current = null;
      try { localStorage.removeItem(SS_KEY); } catch { /* fine */ }
      setStage('full-done');
    } catch {
      say('y', 'Network hiccup — give it another tap.');
    }
  };

  const startFull = () => {
    say('me', 'Finish my valuation');
    setFullOffered(false);
    say('y',
      'Plainly, because from here the walk works differently: to finish your valuation across visits, we save your ' +
      "answers to your evaluation workspace until the full report is built. Delete anytime, and the keep-or-delete " +
      'decision at the end still governs everything. It stays an evaluation from published market data — a range, ' +
      'never a number; not an appraisal, not an opinion of value, not an offer.');
    setStage('full-consent');
    trackEvent('owner_full_started', { lane: a.lane });
  };
  const declineFull = () => {
    say('me', 'Not now');
    // The figures' memory-only copy dies with the decline — nothing carries
    // unless the owner chooses to continue.
    fin.current = {};
    say('y', 'Here whenever you want it — your draft valuation stands on its own.');
    setFullOffered(false);
  };
  const acceptFull = async () => {
    if (consenting || !a.lane) return;
    setConsenting(true);
    try {
      const r = await fetch('/api/owners/full/consent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: a.lane, accept: true }),
      });
      const j = await r.json();
      if (!r.ok) { say('y', j.error || "That didn't go through — give it another tap."); setConsenting(false); return; }
      fullLane.current = a.lane;
      trackEvent('owner_full_consented', { lane: a.lane, resumed: !!j.resumed });
      say('y',
        `Workspace open. ${SECTIONS.length} sections, ${ALL_QUESTIONS.length} questions — every one takes an answer, ` +
        '"skip", or "park" ("I need to find this"), and parking builds your go-get list. Nothing blocks: the report ' +
        "simply names what's missing until it lands.");
      if (j.resumed) {
        const sr = await fetch(`/api/owners/full/state?lane=${encodeURIComponent(a.lane)}`);
        const sj = sr.ok ? await sr.json() : null;
        answers.current = (sj?.answers as EvalAnswers) || {};
        patch.current = {};
        fin.current = {}; // the workspace's own answers win — nothing to carry
        beginWalk(true);
      } else {
        // ANSWER CARRY-OVER (Paul's taxonomy, 2026-08-05): the first
        // sitting's answers seed the workspace so nothing already given is
        // re-asked — the walk opens at the first section with unanswered
        // questions. The figures were memory-only until this moment; from
        // here their one home is the consented workspace.
        const seeded = mapDraftAnswers(fin.current, a);
        fin.current = {};
        answers.current = seeded;
        patch.current = { ...seeded };
        if (Object.keys(seeded).length) {
          void flush();
          say('y', 'Everything from your first sitting is already in — nothing you told me gets re-asked.');
        }
        beginWalk(false);
      }
    } catch {
      say('y', 'Network hiccup — give it another tap.');
    }
    setConsenting(false);
  };

  const resumeFull = async (lane: string) => {
    try {
      const r = await fetch(`/api/owners/full/state?lane=${encodeURIComponent(lane)}`);
      const j = r.ok ? await r.json() : null;
      if (!j?.exists) {
        // A pointer without a workspace (deleted elsewhere) — start fresh.
        try { localStorage.removeItem(SS_KEY); } catch { /* fine */ }
        setMsgs([{ who: 'y', text: "Let's build your free valuation. First — which trade is your business in?" }]);
        setStage('lane');
        return;
      }
      const label = OWNER_LANES.find(l => l.key === lane)?.label || lane;
      fullLane.current = lane;
      answers.current = (j.answers as EvalAnswers) || {};
      patch.current = {};
      setA(v => ({ ...v, lane, laneLabel: label }));
      const led = answeredCount(answers.current);
      const parked = parkedList(answers.current);
      const greet: Msg[] = [{
        who: 'y',
        text: `Welcome back — your ${label} valuation is ${led.answered} of ${led.total} answered${parked.length ? `, ${parked.length} parked` : ''}.`,
      }];
      if (parked.length) greet.push({ who: 'y', text: `You were finding: ${parked[0].ask} (${parked[0].whereToFind})` });
      setMsgs(greet);
      trackEvent('owner_full_resumed', { lane, answered: led.answered, parked: parked.length });
      if (j.termsCurrent === false) {
        say('y', 'One thing before we continue — the owner-evaluation terms were updated since you accepted them. Same deal, current text: your answers stay in your workspace until the report is built, delete anytime, keep-or-delete at the end governs everything.');
        setStage('full-consent');
        return;
      }
      beginWalk(true);
    } catch {
      say('y', 'Something hiccuped pulling up your workspace — reload and we try again.');
    }
  };

  const bootFull = async (me: { email?: string } | null, saved: { a?: StageA; stage?: Stage | 'full-resume' } | null) => {
    if (saved?.stage === 'full-resume' && saved.a?.lane) {
      if (me?.email) { await resumeFull(saved.a.lane); return; }
      fullPending.current = saved.a.lane;
      setMsgs([{
        who: 'y',
        text: 'Welcome back. Your sign-in expired — continue with Google below, or drop your email for a fresh link, and your evaluation workspace reopens right where you left it.',
      }]);
      setStage('gate');
      return;
    }
    if (!me?.email) return;
    // A saved QUICK walk in progress is never hijacked into a full
    // workspace — mid-walk stages ('geo', 'revband', …) resume the quick
    // conversation exactly where it stood. Auto-resume into a workspace
    // runs only from a clean slate ('done' clears the save entirely) or
    // the full-resume pointer handled above.
    if (saved?.stage && saved.stage !== 'full-resume') return;
    // A verified owner with a saved workspace resumes it — but an explicit
    // fresh lane pick from #owners is never hijacked onto another lane.
    try {
      const r = await fetch('/api/owners/full/state');
      if (!r.ok) return;
      const j = await r.json();
      const ws: Array<{ lane: string }> = j.workspaces || [];
      if (!ws.length) return;
      const target =
        (initialLane ? ws.find(w => w.lane === initialLane.key) : undefined)
        || (saved?.a?.lane ? ws.find(w => w.lane === saved?.a?.lane) : undefined)
        || (initialLane === undefined && !saved?.a?.lane ? ws[0] : undefined);
      if (target) await resumeFull(target.lane);
    } catch { /* fine — the quick walk stands */ }
  };

  const inputStages: Stage[] = [
    'lane-other', 'geo', 'fin-revenue', 'fin-earnings', 'fin-ownercomp', 'fin-onetime', 'fin-personal',
    'fin-family', 'fin-rentpaid', 'fin-marketrent', 'fin-recurring', 'fin-customer', 'fin-newcon', 'waitlist',
  ];
  const onSubmit = () => {
    if (stage === 'lane-other') return submitOtherLane();
    if (stage === 'geo') return submitGeo();
    if (stage === 'waitlist') return submitWaitlist();
    if (stage === 'fin-family') return submitFamily();
    if (stage === 'fin-customer') return submitCustomer();
    if (stage === 'fin-newcon') return submitNewcon();
    if (stage === 'gate') return submitMagic();
    if (stage === 'full-q') return submitFull();
    if (stage === 'full-check') return submitFullCheck();
    return submitFin();
  };

  // Full-tier input: typed kinds take the text field; choice kinds are chips
  // only. 'full-check' keeps the field open for a corrected figure.
  const fullQNow = stage === 'full-q' || stage === 'full-check' ? fullQ(cur) : null;
  const fullTyping = !!fullQNow && (stage === 'full-check' || fullQNow.kind !== 'choice');

  return (
    <>
      <div className="pd-msgs" ref={listRef}>
        {msgs.map((m, i) => (
          <div className="pd-msgrow" key={i}>
            <div className={`pd-bub ${m.who === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      {stage === 'lane' && (
        <div className="pd-chips">
          {/* Uppercase to match the landing #owners picker — same 22 trades,
              one case (2026-08-07 consistency audit). */}
          {LANES.map(l => <button key={l.key} type="button" className="pd-chip" style={{ textTransform: 'uppercase' }} onClick={() => pickLane(l.key, l.label)}>{l.label}</button>)}
          <button type="button" className="pd-chip" onClick={pickOtherLane}>Another trade →</button>
        </div>
      )}
      {stage === 'revband' && (
        <div className="pd-chips">{REV_BANDS.map(b => <button key={b} type="button" className="pd-chip" onClick={() => pickRevBand(b)}>{b}</button>)}</div>
      )}
      {stage === 'situation' && (
        <div className="pd-chips">{SITUATIONS.map(s => <button key={s} type="button" className="pd-chip" onClick={() => pickSituation(s)}>{s}</button>)}</div>
      )}
      {stage === 'fin-re' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={() => pickRealEstate('We own the property', 'owned')}>We own the property</button>
          <button type="button" className="pd-chip" onClick={() => pickRealEstate('We lease from a third party', 'leased')}>We lease from a third party</button>
        </div>
      )}
      {stage === 'fin-owner' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={() => pickOwnerDep('I run it day to day', 'runs-daily')}>I run it day to day</button>
          <button type="button" className="pd-chip" onClick={() => pickOwnerDep('A manager runs it', 'manager-in-place')}>A manager runs it</button>
          <button type="button" className="pd-chip" onClick={() => pickOwnerDep('It runs without me', 'absentee')}>It runs without me</button>
        </div>
      )}
      {stage === 'fin-books' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={() => pickBooks('Cash basis', 'cash')}>Cash basis</button>
          <button type="button" className="pd-chip" onClick={() => pickBooks('Accrual', 'accrual')}>Accrual</button>
          <button type="button" className="pd-chip" onClick={() => pickBooks('Accrual + CPA reviewed', 'reviewed')}>Accrual + CPA reviewed</button>
        </div>
      )}

      {stage === 'done' && fullOffered && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={startFull}>Finish my valuation →</button>
          <button type="button" className="pd-chip" onClick={declineFull}>Not now</button>
        </div>
      )}

      {stage === 'full-q' && fullQNow && (
        <div className="pd-chips">
          {fullQNow.kind === 'choice' && fullQNow.choices?.map(c => (
            <button key={c.value} type="button" className="pd-chip" onClick={() => pickFullChoice(c.value, c.label)}>{c.label}</button>
          ))}
          <button type="button" className="pd-chip" onClick={skipFull}>Skip</button>
          <button type="button" className="pd-chip" onClick={parkFull}>I need to find this</button>
          <button type="button" className="pd-chip" onClick={() => buildReport('draft')}>Build my draft — it will name its own gaps</button>
        </div>
      )}

      {stage === 'full-check' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={keepAnyway}>Looks right — keep it</button>
        </div>
      )}

      {stage === 'full-section-end' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={continueWalk}>
            Continue — Section {(pendingNext.current?.si ?? 0) + 1} of {SECTIONS.length}
          </button>
          <button type="button" className="pd-chip" onClick={saveAndLeave}>Save & come back later</button>
          <button type="button" className="pd-chip" onClick={() => buildReport('draft')}>Build my draft — it will name its own gaps</button>
        </div>
      )}

      {stage === 'full-walk-end' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={circleBack}>Circle back to open items</button>
          <button type="button" className="pd-chip" onClick={() => buildReport('draft')}>Build my draft — it will name its own gaps</button>
          <button type="button" className="pd-chip" onClick={saveAndLeave}>Save & come back later</button>
        </div>
      )}

      {stage === 'full-final' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={() => buildReport('final')}>Build my full report →</button>
          <button type="button" className="pd-chip" onClick={saveAndLeave}>Save & come back later</button>
        </div>
      )}

      {stage === 'full-checklist' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={emailChecklist}>Email me the go-get list</button>
          <button type="button" className="pd-chip" onClick={declineChecklist}>No need — I've got it</button>
        </div>
      )}

      {stage === 'full-saved' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={resumeSaved}>Pick the walk back up</button>
        </div>
      )}

      {stage === 'full-retain' && (
        <div className="pd-chips">
          <button type="button" className="pd-chip" onClick={() => fullDecide(true)}>Keep my workspace</button>
          <button type="button" className="pd-chip" onClick={() => fullDecide(false)}>Delete my workspace & report</button>
        </div>
      )}

      {stage === 'full-consent' && (
        <div className="ow-consent">
          <a className="pd-link" href="/legal/terms" target="_blank" rel="noreferrer">Read the owner-evaluation terms</a>
          <button type="button" className="pd-pill-primary ow-build" disabled={consenting} onClick={acceptFull}>
            I accept — open my workspace →
          </button>
        </div>
      )}

      {stage === 'gate' && !verified && !!(window as any).__GOOGLE_CLIENT_ID && (
        <div className="ow-gate">
          <div ref={googleBtn} className="ow-gbtn" />
          <div className="ow-or">or</div>
        </div>
      )}

      {stage === 'accept' && (
        <div className="ow-consent">
          <button type="button" className="pd-pill-primary ow-build" onClick={runEvaluation}>
            I agree — build my valuation →
          </button>
        </div>
      )}

      {stage === 'retain' && onFile && (
        <div className="ow-onfile">
          <div className="k">On file for this trade</div>
          <dl>
            <div><dt>Contact</dt><dd>{onFile.name ? `${onFile.name} · ` : ''}{onFile.email}</dd></div>
            <div><dt>Trade</dt><dd>{onFile.lane}</dd></div>
            {onFile.geography && <div><dt>Area</dt><dd>{onFile.geography}</dd></div>}
            {onFile.situation && <div><dt>Where you stand</dt><dd>{onFile.situation}</dd></div>}
            <div><dt>Size band</dt><dd>{onFile.revenueBand} revenue (the band only, never a figure)</dd></div>
            <div><dt>Readiness read</dt><dd>{onFile.readiness}</dd></div>
            <div><dt>Report</dt><dd>{onFile.report} — the one record of your numbers; delete and it goes too</dd></div>
          </dl>
          <div className="ow-decide">
            <button type="button" className="pd-pill-primary" disabled={deciding} onClick={() => decide(true)}>
              Keep it — put me on the first-call list
            </button>
            <button type="button" className="ow-erase" disabled={deciding} onClick={() => decide(false)}>
              Delete my information
            </button>
          </div>
        </div>
      )}

      {(inputStages.includes(stage) || stage === 'gate' || fullTyping) && (
        <div className="pd-chat-inputrow">
          <input
            className="pd-chat-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit(); }}
            placeholder={
              stage === 'geo' ? 'e.g. Dallas–Fort Worth'
              : stage === 'gate' ? 'you@company.com — email me a link instead'
              : stage === 'waitlist' ? 'you@company.com'
              : stage === 'fin-revenue' ? 'e.g. 2.4m'
              : ['fin-onetime', 'fin-personal', 'fin-family'].includes(stage) ? 'e.g. 25k — or 0'
              : ['fin-rentpaid', 'fin-marketrent'].includes(stage) ? 'e.g. 60k'
              : ['fin-recurring'].includes(stage) ? 'e.g. 35'
              : ['fin-customer', 'fin-newcon'].includes(stage) ? 'e.g. 10'
              : stage === 'full-check' ? 'Corrected figure — or tap "Looks right"'
              : fullTyping ? (
                  fullQNow!.kind === 'money' ? 'e.g. 1.2m — or "skip" / "park"'
                  : fullQNow!.kind === 'pct' ? 'e.g. 35 — or "skip" / "park"'
                  : fullQNow!.kind === 'int' ? 'e.g. 12 — or "skip" / "park"'
                  : 'Type it — or "skip" / "park"')
              : 'e.g. 300k'}
            inputMode={stage.startsWith('fin') || (fullTyping && fullQNow!.kind !== 'text') ? 'decimal' : undefined}
            aria-label="Your answer"
          />
          <button type="button" className="pd-send" onClick={onSubmit} aria-label="Send">↑</button>
        </div>
      )}

      {(stage === 'done' || stage === 'full-saved' || stage === 'full-done') && (
        <div className="ow-doneline">We work for buyers — an owner never pays us anything.</div>
      )}
    </>
  );
}

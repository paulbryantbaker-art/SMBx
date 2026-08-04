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
 * PRIVACY MECHANICS (the transcript law): stage A answers (lane, geography,
 * band, situation) persist to sessionStorage so a Google-redirect or reload
 * resumes cleanly. Stage C figures live in React state ONLY — never
 * sessionStorage, never a transcript row anywhere. On delivery, state is
 * wiped. The FIGURES are never stored; the finished REPORT (which shows the
 * normalized numbers) is the one record, kept only if the owner chooses Keep
 * on the end card — every storage sentence in this file carries that
 * exception explicitly.
 *
 * CONSENT SHAPE (Paul, 2026-08-04 evening): acceptance up front is MINIMAL —
 * one tap agreeing we process the answers to build and email the report.
 * The real decision comes AFTER delivery: the chat renders the server's
 * truthful inventory of what's on file (general business info + the report,
 * nothing else) and the owner keeps it or erases it on the spot.
 */
import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const SS_KEY = 'smbx_owner_intake_v1';

/** Every vertical the practice covers (the Industries page's own list), not
 *  just the lanes with published bands (Paul, 2026-08-04: "why are only a
 *  handful of home service verticals being offered"). Lanes without sourced
 *  valuation data flow to the honest waitlist path — the server refuses to
 *  guess, and the owner is first in line when that lane's read exists. */
const LANES = [
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

const REV_BANDS = ['Under $1M', '$1M–$3M', '$3M–$10M', '$10M+'];
const SITUATIONS = ['Just curious', 'Thinking about it in 1–3 years', 'Ready in the next 12 months'];

interface Msg { who: 'y' | 'me'; text: string }

type Stage =
  | 'lane' | 'lane-other' | 'geo' | 'revband' | 'situation' | 'laneread'
  | 'gate' | 'fin-revenue' | 'fin-earnings' | 'fin-ownercomp'
  | 'fin-onetime' | 'fin-personal' | 'fin-family'
  | 'fin-re' | 'fin-rentpaid' | 'fin-marketrent'
  | 'fin-recurring' | 'fin-owner' | 'fin-customer' | 'fin-books' | 'fin-newcon'
  | 'accept' | 'sending' | 'retain' | 'done' | 'waitlist' | 'waitlist-done';

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

export default function OwnerChat() {
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

  const say = (who: 'y' | 'me', text: string) => setMsgs(m => [...m, { who, text }]);

  // Hydrate stage A after a Google redirect or reload; greet fresh visitors.
  useEffect(() => {
    let saved: { a: StageA; stage: Stage; msgs: Msg[] } | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(SS_KEY) || 'null'); } catch { /* fine */ }
    if (saved?.a?.lane && saved.stage) {
      setA(saved.a); setMsgs(saved.msgs || []); setStage(saved.stage === 'gate' ? 'gate' : saved.stage);
    } else {
      setMsgs([{ who: 'y', text: "Let's build your free valuation. First — which trade is your business in?" }]);
    }
    fetch('/api/owners/me').then(r => (r.ok ? r.json() : null)).then(me => {
      if (me?.email) setVerified({ email: me.email });
    }).catch(() => { /* fine */ });
  }, []);

  // Persist ONLY stage A + transcript-so-far (never stage C figures).
  useEffect(() => {
    if (stage === 'done' || stage === 'sending') { try { sessionStorage.removeItem(SS_KEY); } catch { /* fine */ } return; }
    // 'laneread' is deliberately NOT here: it renders no chips and no input
    // (it's the await on the lane-read fetch), so a reload restored into it
    // would have nothing to tap. The prior 'situation' write resumes cleanly.
    const persistable = ['lane', 'lane-other', 'geo', 'revband', 'situation', 'gate', 'waitlist', 'waitlist-done'].includes(stage);
    if (!persistable) return;
    try { sessionStorage.setItem(SS_KEY, JSON.stringify({ a, stage, msgs })); } catch { /* fine */ }
  }, [a, stage, msgs]);

  useEffect(() => { listRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs, stage]);

  // Verified mid-gate (Google popup or magic-link return) → continue to figures.
  useEffect(() => {
    if (verified && stage === 'gate') {
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
      google.accounts.id.renderButton(googleBtn.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' });
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
      fin.current = {}; // the figures evaporate — nothing left client-side either
      say('y', j.mailed
        ? `Done — your valuation report is in your inbox (readiness read: ${j.position} of your lane's band).`
        : 'Your valuation is built, but mail delivery is unavailable right now — we\'ll get it to you shortly.');
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
      setStage('done');
      trackEvent('owner_retention', { lane: a.lane, kept: keep });
    } catch {
      say('y', 'Network hiccup — give it another tap.');
      setDeciding(false);
    }
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
    return submitFin();
  };

  return (
    <div className="ow-chatwrap">
      <div className="pd-chat-head">
        <img src="/logo-green-x.png" alt="smbX.ai" style={{ height: 28, width: 'auto', display: 'block' }} />
        <div className="pd-chat-title">Free Valuation</div>
      </div>
      <div className="pd-msgs" ref={listRef}>
        {msgs.map((m, i) => (
          <div className="pd-msgrow" key={i}>
            <div className={`pd-bub ${m.who === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      {stage === 'lane' && (
        <div className="pd-chips">
          {LANES.map(l => <button key={l.key} type="button" className="pd-chip" onClick={() => pickLane(l.key, l.label)}>{l.label}</button>)}
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

      {stage === 'gate' && !verified && (
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

      {(inputStages.includes(stage) || stage === 'gate') && (
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
              : 'e.g. 300k'}
            inputMode={stage.startsWith('fin') ? 'decimal' : undefined}
            aria-label="Your answer"
          />
          <button type="button" className="pd-send" onClick={onSubmit}>Send</button>
        </div>
      )}

      {stage === 'done' && (
        <div className="ow-doneline">We work for buyers — an owner never pays us anything.</div>
      )}
    </div>
  );
}

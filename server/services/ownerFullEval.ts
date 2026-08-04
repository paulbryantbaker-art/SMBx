/**
 * server/services/ownerFullEval.ts — the FULL owner evaluation's server layer
 * (SELLER_EVALUATION_PLAN.md §P2, Paul 2026-08-04 night: "log back in,
 * finish, go get answers, come back — when they're done they have a full
 * thorough report they can bank on").
 *
 * THE PRIVACY MODEL FORKS HERE, BY DESIGN. The quick tier (ownerFunnel.ts)
 * stays ephemeral — its figures stream through the engine and evaporate.
 * A multi-session evaluation cannot be ephemeral: "log back in and finish"
 * IS storage. So this tier stores the owner's answers in owner_evaluations
 * (migration 119) under an EXPLICIT, VERSIONED terms acceptance recorded on
 * the row — no workspace exists before fullEvalConsent, delete-anytime is a
 * real endpoint (fullEvalDelete), and the end-of-report keep-or-delete still
 * governs everything. Three laws are load-bearing:
 *
 *  • NEVER LOG A REQUEST BODY. The answers payload carries the owner's
 *    figures; it lands in the consented answers JSONB and nowhere else — not
 *    in logs, not echoed into error messages, not in the registry.
 *  • THE MODEL LEGS WRITE NOTHING. executeV19Model() is pure in-memory
 *    computation; persistV19ModelExecution is deliberately never imported
 *    here, so the DEFINITIVE runs leave no row behind.
 *  • RANGE, NEVER A NUMBER. The report model has no point-estimate field and
 *    the disclaimer travels on the page, in the email, and on the PDF.
 */

import type { Request, Response } from 'express';
import { createSql } from '../dbConfig.js';
import { sendEmail, brandedEmail } from './emailService.js';
import { newRenderPage } from './premiumPdfRenderer.js';
import { readOwner } from './ownerFunnel.js';
// executeV19Model ONLY — persistV19ModelExecution stays unimported so no code
// path in this file can write a model execution anywhere.
import { executeV19Model } from './v19ModelRuntime.js';
import { renderFullReportHtml, type FullEvalModelRuns } from './ownerFullReport.js';
import { SBA_SOP_50_10_8 } from '../constants/v19Regulatory.js';
import {
  SECTIONS,
  ALL_QUESTIONS,
  answeredCount,
  parkedList,
  sectionStatus,
  computeFullEvaluation,
  narrowBand,
  bandBasisFor,
  type EvalAnswer,
  type EvalAnswers,
  type FullEvaluationReport,
  type NarrowBandModels,
  type NarrowedBand,
} from '../../house/fullEvaluation.js';

const sql = createSql();
const appUrl = () => process.env.APP_URL || process.env.BASE_URL || 'https://smbx.ai';

/** The owner-evaluation terms live at /legal/terms; bumping the TEXT bumps
 *  this, and the row records which version was accepted — an unversioned
 *  checkbox proves nothing later. ('.2': the terms page was rewritten as
 *  practice terms after the first acceptance text, 2026-08-04.) */
export const OWNER_EVAL_TERMS_VERSION = '2026-08-04.2';

const QUESTION_KEYS = new Set(ALL_QUESTIONS.map(q => q.key));
const QUESTION_BY_KEY = new Map(ALL_QUESTIONS.map(q => [q.key, q]));
const SECTION_KEYS = new Set(SECTIONS.map(s => s.key));

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ── the workspace row ───────────────────────────────────────────────────── */

interface WorkspaceRow {
  id: number;
  email: string;
  name: string | null;
  lane: string;
  answers: EvalAnswers;
  sections_done: string[];
  terms_version: string;
  report_generated_at: string | null;
  updated_at: string;
}

async function loadWorkspace(email: string, lane: string): Promise<WorkspaceRow | null> {
  const rows = await sql`
    SELECT id, email, name, lane, answers, sections_done, terms_version,
           report_generated_at, updated_at
    FROM owner_evaluations
    WHERE LOWER(email) = ${email.toLowerCase()} AND lane = ${lane}
  `;
  return (rows[0] as unknown as WorkspaceRow) || null;
}

/** The three views every response carries so the chat can read the ledger
 *  back without a second round trip. */
function ledgerView(answers: EvalAnswers) {
  return {
    ledger: answeredCount(answers),
    sections: sectionStatus(answers),
    parked: parkedList(answers),
  };
}

/** Accept only known question keys with valid states and bounded values —
 *  the JSONB stores the walk, never arbitrary payload. `null` clears a key. */
function sanitizeAnswerPatch(raw: unknown): { patch: Record<string, EvalAnswer | null>; rejected: string[] } {
  const patch: Record<string, EvalAnswer | null> = {};
  const rejected: string[] = [];
  if (!raw || typeof raw !== 'object') return { patch, rejected };
  for (const [key, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!QUESTION_KEYS.has(key)) { rejected.push(key); continue; }
    if (v === null) { patch[key] = null; continue; }
    if (typeof v !== 'object') { rejected.push(key); continue; }
    const a = v as Record<string, unknown>;
    if (a.state !== 'answered' && a.state !== 'skipped' && a.state !== 'parked') { rejected.push(key); continue; }
    const entry: EvalAnswer = { state: a.state };
    if (a.state === 'answered') {
      const qDef = QUESTION_BY_KEY.get(key);
      if (qDef?.kind === 'choice') {
        // A choice answer must be one of the question's OWN choices — the
        // workspace stores the walk, never an arbitrary string that would
        // later parse as a driver value it never was.
        if (typeof a.value === 'string' && (qDef.choices ?? []).some(c => c.value === a.value)) entry.value = a.value;
        else { rejected.push(key); continue; }
      }
      else if (typeof a.value === 'number' && isFinite(a.value) && Math.abs(a.value) < 1e13) entry.value = a.value;
      else if (typeof a.value === 'string' && a.value !== '') entry.value = a.value.slice(0, 500);
      else { rejected.push(key); continue; } // answered without a usable value
    }
    if (typeof a.note === 'string' && a.note !== '') entry.note = a.note.slice(0, 1000);
    patch[key] = entry;
  }
  return { patch, rejected };
}

/* ── endpoints ───────────────────────────────────────────────────────────── */

/** GET /api/owners/full/state[?lane=] — session + ledger for resume. With a
 *  lane: the full workspace (answers included — the owner's own data, behind
 *  their own pass, so the chat can rehydrate on any device). Without: a
 *  summary of every workspace under the email. */
export async function fullEvalState(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.query.lane || '').trim();

  if (!lane) {
    const rows = await sql`
      SELECT lane, question_states, sections_done, report_generated_at, updated_at
      FROM owner_evaluations
      WHERE LOWER(email) = ${owner.email.toLowerCase()}
      ORDER BY updated_at DESC
    `;
    return res.json({
      termsVersion: OWNER_EVAL_TERMS_VERSION,
      workspaces: rows.map(r => ({
        lane: r.lane as string,
        // question_states is {key: state} — enough to compute the ledger
        // without shipping a single figure in the listing.
        ledger: answeredCount(Object.fromEntries(
          Object.entries((r.question_states || {}) as Record<string, EvalAnswer['state']>)
            .map(([k, state]) => [k, { state }]),
        )),
        sectionsDone: (r.sections_done || []) as string[],
        reportGeneratedAt: r.report_generated_at as string | null,
        updatedAt: r.updated_at as string,
      })),
    });
  }

  const row = await loadWorkspace(owner.email, lane);
  if (!row) return res.json({ exists: false, lane, termsVersion: OWNER_EVAL_TERMS_VERSION });
  res.json({
    exists: true,
    lane,
    termsVersion: row.terms_version,
    termsCurrent: row.terms_version === OWNER_EVAL_TERMS_VERSION,
    answers: row.answers,
    sectionsDone: row.sections_done,
    reportGeneratedAt: row.report_generated_at,
    updatedAt: row.updated_at,
    ...ledgerView(row.answers),
  });
}

/** POST /api/owners/full/consent — creates the workspace. Nothing exists
 *  before this, and the acceptance is RECORDED (terms_version +
 *  terms_accepted_at) — re-consent after a terms bump updates the record
 *  without touching the answers already saved. */
export async function fullEvalConsent(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.body?.lane || '').trim().slice(0, 80);
  if (!lane) return res.status(400).json({ error: 'lane required' });
  if (req.body?.accept !== true) {
    return res.status(400).json({
      error: 'The workspace only exists under your acceptance of the owner-evaluation terms.',
      termsVersion: OWNER_EVAL_TERMS_VERSION,
    });
  }
  const existing = await loadWorkspace(owner.email, lane);
  await sql`
    INSERT INTO owner_evaluations
      (email, name, google_sub, lane, consent_workspace, terms_version, terms_accepted_at, updated_at)
    VALUES
      (${owner.email}, ${owner.name || null}, ${owner.sub.startsWith('email:') ? null : owner.sub},
       ${lane}, true, ${OWNER_EVAL_TERMS_VERSION}, now(), now())
    ON CONFLICT (LOWER(email), lane) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, owner_evaluations.name),
      google_sub = COALESCE(EXCLUDED.google_sub, owner_evaluations.google_sub),
      consent_workspace = true,
      terms_version = EXCLUDED.terms_version,
      terms_accepted_at = now(),
      updated_at = now()
  `;
  const answers = existing?.answers || {};
  res.json({
    ok: true,
    lane,
    termsVersion: OWNER_EVAL_TERMS_VERSION,
    resumed: !!existing && Object.keys(answers).length > 0,
    ...ledgerView(answers),
  });
}

/** POST /api/owners/full/answers — upsert a section's answers + states.
 *  PRIVACY LAW: the body carries the owner's figures. It must NEVER be
 *  logged, echoed into an error message, or written anywhere but the
 *  consented answers JSONB on their own row. */
export async function fullEvalAnswers(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.body?.lane || '').trim();
  if (!lane) return res.status(400).json({ error: 'lane required' });
  const row = await loadWorkspace(owner.email, lane);
  if (!row) {
    return res.status(409).json({
      error: 'no workspace — accept the owner-evaluation terms first',
      termsVersion: OWNER_EVAL_TERMS_VERSION,
    });
  }

  const { patch, rejected } = sanitizeAnswerPatch(req.body?.answers);
  const merged: EvalAnswers = { ...row.answers };
  for (const [key, entry] of Object.entries(patch)) {
    if (entry === null) delete merged[key];
    else merged[key] = entry;
  }

  let sectionsDone = row.sections_done;
  if (Array.isArray(req.body?.sectionsDone)) {
    sectionsDone = (req.body.sectionsDone as unknown[])
      .filter((k): k is string => typeof k === 'string' && SECTION_KEYS.has(k));
  }

  const states = Object.fromEntries(Object.entries(merged).map(([k, a]) => [k, a.state]));
  await sql`
    UPDATE owner_evaluations
    SET answers = ${sql.json(merged as any)}::jsonb,
        question_states = ${sql.json(states)}::jsonb,
        sections_done = ${sectionsDone},
        updated_at = now()
    WHERE id = ${row.id}
  `;

  // Deterministic cross-checks run on every save — arithmetic and published
  // thresholds only — so the chat can say "worth double-checking" while the
  // owner is still looking at the figure.
  const checks = ALL_QUESTIONS
    .filter(q => q.validate)
    .map(q => ({ key: q.key, message: q.validate!(merged) }))
    .filter((c): c is { key: string; message: string } => c.message !== null);

  res.json({ ok: true, rejected, checks, sectionsDone, ...ledgerView(merged) });
}

/** POST /api/owners/full/checklist — email the parked go-get list, each item
 *  carrying its question's own whereToFind, "so the list survives the walk
 *  to the filing cabinet". No figures ride in this mail — only the questions
 *  and the owner's own notes, sent to the owner themselves. */
export async function fullEvalChecklist(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.body?.lane || '').trim();
  if (!lane) return res.status(400).json({ error: 'lane required' });
  const row = await loadWorkspace(owner.email, lane);
  if (!row) return res.status(404).json({ error: 'no workspace for this lane' });

  const parked = parkedList(row.answers);
  if (!parked.length) {
    return res.json({ ok: true, mailed: false, parked: 0, message: 'Nothing parked — no list to send.' });
  }

  const items = parked.map(p => `
    <p style="margin:0 0 16px;">
      <b>${esc(p.sectionTitle)} — ${esc(p.ask)}</b><br>
      Find it: ${esc(p.whereToFind)}${p.note ? `<br>Your note: ${esc(p.note)}` : ''}
    </p>`).join('');
  const count = parked.length;
  const mailed = await sendEmail({
    to: owner.email,
    subject: `Your go-get list — ${count} item${count === 1 ? '' : 's'} to find`,
    html: brandedEmail({
      headline: `${count} thing${count === 1 ? '' : 's'} to go get`,
      body:
        `You parked ${count} question${count === 1 ? '' : 's'} in your full evaluation. ` +
        `Each one below says exactly where the answer lives — grab them and pick the walk back up on any device:<br><br>${items}`,
      ctaLabel: 'Pick up where you left off',
      ctaUrl: `${appUrl()}/#owners`,
      footnote: 'We work for buyers. We never take a fee from an owner.',
    }),
  });
  res.json({ ok: true, mailed: mailed !== false, parked: count });
}

/* ── the DEFINITIVE legs — executed in memory, persisted nowhere ─────────── */

/** SBA 7(a) business-acquisition loans amortize over at most 10 years
 *  (SOP 50 10 8 — the same source as the rate band and equity floor in
 *  server/constants/v19Regulatory.ts). The financing test models the full
 *  amortization at the SOP's published ceiling rate: the most expensive
 *  structure a compliant lender could write, so a DSCR that clears here
 *  clears anywhere in the published range. */
const SBA_ACQ_TERM_YEARS = 10;

const usdToCents = (usd: number) => Math.round(usd * 100);

function annualDebtServiceCents(loanCents: number, annualRate: number, years: number): number {
  const i = annualRate / 12;
  const n = years * 12;
  return Math.round((loanCents * i / (1 - (1 + i) ** -n)) * 12);
}

async function runModelLegs(report: FullEvaluationReport, answers: EvalAnswers): Promise<FullEvalModelRuns> {
  const runs: FullEvalModelRuns = { dscrStress: null, lboSba: null, dcfTwoStage: null, reBifurcation: null };
  const q = report.quick;
  if (!q || !q.laneSupported || q.basisUsd <= 0) return runs;
  const basisCents = usdToCents(q.basisUsd);

  // The financing ceiling: can the business's own cash flow finance the TOP
  // of the published band? Price at the marketHigh endpoint, SBA-shaped —
  // 10% buyer equity (the SOP floor), the balance amortized at the SOP
  // ceiling rate over the acquisition maturity. Every input is published
  // data or the owner's own figures; a buyer cannot pay what the earnings
  // cannot service, and that is arithmetic, not opinion.
  const priceCents = usdToCents(q.rangeUsd.marketHigh);
  if (priceCents > 0) {
    const equityCents = Math.round(priceCents * SBA_SOP_50_10_8.EQUITY_INJECTION_PCT);
    const adsCents = annualDebtServiceCents(
      priceCents - equityCents, SBA_SOP_50_10_8.ALL_IN_RATE_HIGH, SBA_ACQ_TERM_YEARS,
    );
    runs.dscrStress = await executeV19Model({
      modelId: 'MODEL.DSCR.STRESS.v1',
      input: { cash_flow_cents: basisCents, annual_debt_service_cents: adsCents },
    });
    runs.lboSba = await executeV19Model({
      modelId: 'MODEL.LBO.SBA.v1',
      input: {
        purchase_price_cents: priceCents,
        cash_flow_cents: basisCents,
        buyer_equity_cents: equityCents,
        annual_debt_service_cents: adsCents,
      },
    });
  }

  // The income-approach cross-check: five years of the normalized basis
  // grown at the SAME planning rate the what-moves page uses (defaulted
  // BELOW the achieved rate), discounted at the band's own implied yield —
  // 1 ÷ the marketLow multiple, arithmetic on published data rather than an
  // invented WACC. Terminal growth 0: nothing perpetual is assumed.
  if (q.band.marketLow > 0) {
    const g = (report.whatMoves?.growthPctUsed ?? 0) / 100;
    const fcf = Array.from({ length: 5 }, (_, y) => Math.round(basisCents * (1 + g) ** (y + 1)));
    runs.dcfTwoStage = await executeV19Model({
      modelId: 'MODEL.VAL.DCF.TWOSTAGE.v1',
      input: { free_cash_flows_cents: fcf, discount_rate: 1 / q.band.marketLow, terminal_growth_rate: 0 },
    });
  }

  // The building as a separate asset — only when the owner owns it. Market
  // rent stands in as the income figure an appraiser would refine; `cap_rate`
  // is DELIBERATELY not supplied, because capitalizing rent into a property
  // value IS an appraisal and appraisal is a policy boundary the practice
  // does not cross. The execution honestly records the missing input; the
  // renderer's line is "an appraiser sets this number", never us.
  const re = answers['realEstate'];
  const marketRent = answers['marketRentUsd'];
  if (re?.state === 'answered' && re.value === 'owned' && priceCents > 0) {
    runs.reBifurcation = await executeV19Model({
      modelId: 'MODEL.RE.OPBUS.BIFURCATION.v1',
      input: {
        enterprise_value_cents: priceCents,
        ...(marketRent?.state === 'answered' && typeof marketRent.value === 'number' && marketRent.value > 0
          ? { noi_cents: usdToCents(marketRent.value) }
          : {}),
      },
    });
  }

  return runs;
}

/** The narrowed band's financing input, built from the DSCR/SBA legs' own
 *  outputs — house stays pure, so the SOP constants and the citation string
 *  live here. The cap only exists when both legs completed AND the implied
 *  loan fits the 7(a) program maximum (otherwise the SBA buyer isn't in the
 *  buyer set at this size and arithmetic about an unwritable loan caps
 *  nothing — the published band is what equity buyers demonstrably pay). */
function narrowModels(basisUsd: number, runs: FullEvalModelRuns): NarrowBandModels {
  const stress = runs.dscrStress;
  const lbo = runs.lboSba;
  if (!stress || stress.status !== 'complete' || !lbo || lbo.status !== 'complete') return {};
  const baseDscr = Number(stress.outputs.base_dscr);
  const lenderFloor = Number(stress.outputs.lender_floor);
  const priceCents = Number(lbo.inputs?.purchase_price_cents);
  const equityCents = Number(lbo.inputs?.buyer_equity_cents);
  const max7aCents = Number(lbo.outputs?.max_7a_loan_cents);
  const basisCents = usdToCents(basisUsd);
  if (!isFinite(baseDscr) || !isFinite(lenderFloor) || lenderFloor <= 0
    || !isFinite(priceCents) || priceCents <= 0 || basisCents <= 0) return {};
  const loanWithin7aCap = isFinite(equityCents) && isFinite(max7aCents)
    ? priceCents - equityCents <= max7aCents
    : false;
  return {
    financing: {
      baseDscr,
      lenderFloor,
      pricedAtX: priceCents / basisCents,
      loanWithin7aCap,
      source:
        `SBA SOP 50 10 8 (effective ${SBA_SOP_50_10_8.EFFECTIVE_DATE}) — ${lenderFloor.toFixed(2)}x lender DSCR ` +
        `standard at ${Math.round(SBA_SOP_50_10_8.EQUITY_INJECTION_PCT * 100)}% minimum equity, ` +
        `${(SBA_SOP_50_10_8.ALL_IN_RATE_HIGH * 100).toFixed(2)}% published ceiling rate`,
    },
  };
}

function modelSummary(models: FullEvalModelRuns) {
  return Object.fromEntries(
    Object.entries(models).map(([leg, ex]) => [
      leg,
      ex ? {
        modelId: ex.modelId,
        status: ex.status,
        missingInputs: ex.missingInputs,
        outputs: ex.outputs,
        citations: ex.citationTags,
      } : null,
    ]),
  );
}

/** POST /api/owners/full/report — assemble, run the model legs (in memory,
 *  nothing persisted), render, mail the PDF, file it on the row. `draft` is
 *  allowed incomplete and names its own gaps; `final` requires every section
 *  complete — a report you can bank on doesn't print on partial inputs. */
export async function fullEvalReport(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.body?.lane || '').trim();
  if (!lane) return res.status(400).json({ error: 'lane required' });
  const row = await loadWorkspace(owner.email, lane);
  if (!row) return res.status(404).json({ error: 'no workspace for this lane' });

  const mode: 'draft' | 'final' = req.body?.mode === 'final' ? 'final' : 'draft';
  const report = computeFullEvaluation(row.answers, lane);

  if (mode === 'final') {
    const incomplete = report.sections.filter(s => !s.complete);
    if (incomplete.length) {
      return res.status(422).json({
        error: 'The final report requires every section complete — request a draft, or finish the walk.',
        incomplete: incomplete.map(s => ({
          key: s.key,
          title: s.title,
          missing: s.missing.map(m => ({ key: m.key, ask: m.ask, whereToFind: m.whereToFind, state: m.state })),
        })),
      });
    }
  }

  const models = await runModelLegs(report, row.answers);
  // THE NARROWED BAND: the published tier is the starting band; the owner's
  // verified drivers + the financing arithmetic narrow it, every step cited.
  // Draft mode still computes — bandBasisFor supplies the band + basis leg
  // when the driver questions are still parked/open, so the draft shows the
  // wide band and what completing the walk would narrow (the widthNotes).
  const basisLeg = report.quick?.laneSupported && report.quick.basisUsd > 0
    ? report.quick
    : bandBasisFor(row.answers, lane);
  const narrowed: NarrowedBand | null =
    basisLeg && basisLeg.basisUsd > 0
      ? narrowBand(basisLeg, row.answers, narrowModels(basisLeg.basisUsd, models))
      : null;
  const html = renderFullReportHtml(report, models, { name: owner.name || row.name || undefined, mode, narrowed });

  let pdf: Buffer;
  const page = await newRenderPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdf = Buffer.from(await page.pdf({ format: 'letter', printBackground: true }));
  } finally {
    await page.close().catch(() => { /* fine */ });
  }

  const gapsHtml = report.gaps.length
    ? `<br><br>Built with gaps, named on the page itself:<br>${report.gaps.map(g => `— ${esc(g)}`).join('<br>')}`
    : '';
  const mailed = await sendEmail({
    to: owner.email,
    subject: mode === 'final' ? 'Your full evaluation — smbX' : 'Your full evaluation draft — smbX',
    html: brandedEmail({
      headline: mode === 'final' ? 'Your full evaluation is attached' : 'Your draft is attached — gaps named',
      body: (mode === 'final'
        ? 'Your full evaluation is attached as a PDF — revenue lines, the normalized bridge, the three-year trend, ' +
          'the ratios a buyer computes before the first call, and the published band applied to your figures. ' +
          'Keep it for your banker, your CPA, or your own planning.'
        : 'A draft of your full evaluation is attached, built only from what has landed so far. ' +
          'It names what it still needs — finish the walk and the withheld pages fill in.' + gapsHtml
      ) + ` ${report.disclaimer}`,
      footnote: 'We work for buyers. We never take a fee from an owner.',
    }),
    attachments: [{
      filename: mode === 'final' ? 'smbX-full-evaluation.pdf' : 'smbX-full-evaluation-draft.pdf',
      content: pdf,
    }],
  });

  await sql`
    UPDATE owner_evaluations
    SET report_pdf = ${pdf}, report_generated_at = now(), updated_at = now()
    WHERE id = ${row.id}
  `;

  res.json({
    ok: true,
    mode,
    mailed: mailed !== false,
    gaps: report.gaps,
    ledger: report.ledger,
    narrowed,
    models: modelSummary(models),
  });
}

/** POST /api/owners/full/delete — the delete-anytime right. A lane erases
 *  that workspace; no lane erases every workspace under the email, answers
 *  and report and all. Erasure means erasure — rows are DELETEd, never
 *  flagged. */
export async function fullEvalDelete(req: Request, res: Response) {
  const owner = readOwner(req);
  if (!owner) return res.status(401).json({ error: 'verify first' });
  const lane = String(req.body?.lane || '').trim();
  const result = lane
    ? await sql`DELETE FROM owner_evaluations WHERE LOWER(email) = ${owner.email.toLowerCase()} AND lane = ${lane}`
    : await sql`DELETE FROM owner_evaluations WHERE LOWER(email) = ${owner.email.toLowerCase()}`;
  res.json({ ok: true, deleted: result.count });
}

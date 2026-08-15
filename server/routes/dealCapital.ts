/**
 * DEAL CAPITAL STACK — what the client told us their financing costs.
 *
 * Paul, 2026-08-15: *"we want the client to tell us their capital stack and
 * borrow costs so we can update WACC and we should update the prime rate."*
 *
 *   GET   /api/deals/:dealId/capital   read the stack, with WACC computed
 *   PUT   /api/deals/:dealId/capital   replace it (whole-document write)
 *
 * ── THIS ROUTE CALLS NO MODEL ───────────────────────────────────────────
 * Every number it returns comes out of `house/capital.ts`, which is pure
 * arithmetic. That matters for THE SPLIT: a CRM is forms and SQL, and so is
 * this — it belongs in the app, and it cannot spend a cent against the metered
 * key no matter how often it is opened.
 *
 * ── WHY THE SERVER COMPUTES A NUMBER THE CLIENT COULD COMPUTE ───────────
 * The panel imports `house/capital.ts` directly and does its own arithmetic
 * for live feedback while typing. This endpoint computes it AGAIN on read, on
 * purpose: anything server-side that wants the discount rate — the DCF, a
 * generated document, Yulia — must not have to reimplement the blend. One
 * engine, two callers, which is the same contract `house/deck.ts` has with the
 * builders. If these two ever disagree it is a bug in one caller, not a
 * difference of opinion.
 *
 * ── WHOLE-DOCUMENT WRITE, DELIBERATELY ──────────────────────────────────
 * PUT rather than PATCH. A stack is read and reasoned about as a unit — a
 * partial update that changed one layer's rate while leaving a stale
 * `taxRateSource` behind would produce a WACC whose workings cite a memo that
 * no longer describes the inputs. The workings are the deliverable here; they
 * have to be internally consistent.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  wacc, lboRatesFrom, sbaChecks, isDebt, SOURCE_KINDS,
  RATE_INDEX, indexStatus,
  type Stack, type StackLayer, type SourceKind, type IndexName,
} from '../../house/capital.js';

export const dealCapitalRouter = Router();
dealCapitalRouter.use(requireAuth);

const INDEXES: readonly IndexName[] = ['prime', 'sofr'];

/** The persisted document. Everything optional — a half-entered stack is a
 *  legitimate state, and house/capital.ts reports what is missing rather than
 *  guessing at it. */
export interface CapitalDoc {
  layers: StackLayer[];
  purchasePriceCents: number | null;
  equity: {
    riskFreePct?: number; equityRiskPremiumPct?: number;
    sizePremiumPct?: number; specificRiskPct?: number; sourceNote?: string;
  };
  marginalTaxRatePct?: number;
  taxRateSource?: string;
  updatedAt?: string;
}

const EMPTY: CapitalDoc = { layers: [], purchasePriceCents: null, equity: {} };

async function ownsDeal(userId: number, dealId: number) {
  const [d] = await sql`
    SELECT id, capital_stack, asking_price, sde, ebitda
    FROM deals WHERE id = ${dealId} AND user_id = ${userId}
  `;
  return d ?? null;
}

/* ── validation ───────────────────────────────────────────────────────
   Strict about SHAPE, silent about COMPLETENESS. A rate of `null` is a
   perfectly good "we have not asked them yet"; a rate of `"about 9%"` is a
   number that will read as sourced and is not one. */

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function intCents(v: unknown): number | undefined {
  const n = num(v);
  return n === undefined ? undefined : Math.round(n);
}

function str(v: unknown, max = 400): string | undefined {
  const s = String(v ?? '').trim();
  return s ? s.slice(0, max) : undefined;
}

function parseLayer(raw: unknown): { ok: true; layer: StackLayer } | { ok: false; why: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, why: 'A layer must be an object.' };
  const r = raw as Record<string, unknown>;
  const kind = String(r.kind ?? '') as SourceKind;
  if (!SOURCE_KINDS.includes(kind)) {
    return { ok: false, why: `Unknown capital source "${String(r.kind)}". Known kinds: ${SOURCE_KINDS.join(', ')}.` };
  }
  const amountCents = intCents(r.amountCents);
  if (amountCents === undefined || amountCents < 0) {
    return { ok: false, why: `${kind} needs a non-negative amount in cents.` };
  }

  const layer: StackLayer = { kind, amountCents };
  const label = str(r.label, 120);
  if (label) layer.label = label;
  const ratePct = num(r.ratePct);
  if (ratePct !== undefined) {
    /* A rate typed as 9.75 instead of 0.0975 is the error this catches. It is
       rejected rather than helpfully divided by 100, because a 0.5 could
       legitimately be either and guessing would be the invented number again. */
    if (ratePct < 0 || ratePct > 1) {
      return { ok: false, why: `${kind} rate must be a decimal (0.0975 for 9.75%), got ${ratePct}.` };
    }
    layer.ratePct = ratePct;
  }
  const termMonths = num(r.termMonths);
  if (termMonths !== undefined && termMonths > 0) layer.termMonths = Math.round(termMonths);

  const f = r.floating as Record<string, unknown> | undefined;
  if (f && typeof f === 'object') {
    const idx = String(f.index ?? '') as IndexName;
    const spreadPct = num(f.spreadPct);
    if (!INDEXES.includes(idx)) return { ok: false, why: `Unknown index "${String(f.index)}".` };
    if (spreadPct === undefined || spreadPct < 0 || spreadPct > 1) {
      return { ok: false, why: `Spread must be a decimal (0.0275 for 275bp), got ${String(f.spreadPct)}.` };
    }
    layer.floating = { index: idx, spreadPct };
  }
  const note = str(r.note, 300);
  if (note) layer.note = note;
  return { ok: true, layer };
}

function parseDoc(body: unknown): { ok: true; doc: CapitalDoc } | { ok: false; why: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const rawLayers = Array.isArray(b.layers) ? b.layers : [];
  if (rawLayers.length > 24) return { ok: false, why: 'A stack of more than 24 layers is a data-entry error, not a deal.' };

  const layers: StackLayer[] = [];
  for (const raw of rawLayers) {
    const p = parseLayer(raw);
    if (!p.ok) return p;
    layers.push(p.layer);
  }

  const e = (b.equity ?? {}) as Record<string, unknown>;
  const equity: CapitalDoc['equity'] = {};
  for (const k of ['riskFreePct', 'equityRiskPremiumPct', 'sizePremiumPct', 'specificRiskPct'] as const) {
    const v = num(e[k]);
    if (v === undefined) continue;
    if (v < -1 || v > 1) return { ok: false, why: `${k} must be a decimal, got ${v}.` };
    equity[k] = v;
  }
  const sourceNote = str(e.sourceNote, 600);
  if (sourceNote) equity.sourceNote = sourceNote;

  const doc: CapitalDoc = {
    layers,
    purchasePriceCents: intCents(b.purchasePriceCents) ?? null,
    equity,
  };
  const tax = num(b.marginalTaxRatePct);
  if (tax !== undefined) {
    if (tax < 0 || tax > 1) return { ok: false, why: `Marginal tax rate must be a decimal, got ${tax}.` };
    doc.marginalTaxRatePct = tax;
  }
  const taxSrc = str(b.taxRateSource, 400);
  if (taxSrc) doc.taxRateSource = taxSrc;
  return { ok: true, doc };
}

function readDoc(raw: unknown): CapitalDoc {
  if (!raw) return { ...EMPTY };
  const parsed = typeof raw === 'string' ? safeJson(raw) : raw;
  const p = parseDoc(parsed);
  /* A row that fails validation is shown as empty rather than throwing. The
     alternative is a deal that cannot be opened because of one bad field. */
  return p.ok ? p.doc : { ...EMPTY };
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}

/* ── the computed view ────────────────────────────────────────────────── */

/** Everything derivable from the stored document, or the reasons it is not. */
export function computeCapital(doc: CapitalDoc, today: string) {
  const stack: Stack = {
    layers: doc.layers,
    purchasePriceCents: doc.purchasePriceCents ?? 0,
  };

  const w = wacc({
    stack,
    equity: {
      riskFreePct: doc.equity.riskFreePct as number,
      equityRiskPremiumPct: doc.equity.equityRiskPremiumPct as number,
      sizePremiumPct: doc.equity.sizePremiumPct as number,
      specificRiskPct: doc.equity.specificRiskPct as number,
      sourceNote: doc.equity.sourceNote as string,
    },
    marginalTaxRatePct: doc.marginalTaxRatePct as number,
    taxRateSource: doc.taxRateSource as string,
    today,
  });

  const m = lboRatesFrom(stack, RATE_INDEX, today);

  const totalCents = doc.layers.reduce((s, l) => s + (l.amountCents || 0), 0);
  const debtCents = doc.layers.filter(l => isDebt(l.kind)).reduce((s, l) => s + (l.amountCents || 0), 0);

  return {
    wacc: w.ok ? w.result : null,
    waccMissing: w.ok ? [] : w.missing,
    lbo: m.ok ? m.mapping : null,
    lboMissing: m.ok ? [] : m.missing,
    sba: sbaChecks(stack),
    totals: { totalCents, debtCents, equityCents: totalCents - debtCents },
    indexes: Object.fromEntries(
      INDEXES.map(n => [n, { ...RATE_INDEX[n], ...indexStatus(RATE_INDEX[n], today) }]),
    ),
  };
}

/* ── routes ───────────────────────────────────────────────────────────── */

dealCapitalRouter.get('/deals/:dealId/capital', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const dealId = Number(req.params.dealId);
  if (!Number.isFinite(dealId)) return res.status(400).json({ error: 'Bad deal id' });

  const deal = await ownsDeal(userId, dealId);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const doc = readDoc(deal.capital_stack);
  /* Seed the price from the deal's asking price when the client has not given
     one — an asking price is a fact already on the row, not an assumption. The
     practitioner can overwrite it, and nothing is written back until they do. */
  if (doc.purchasePriceCents == null && deal.asking_price) {
    doc.purchasePriceCents = Number(deal.asking_price);
  }
  const today = new Date().toISOString().slice(0, 10);
  res.json({ stack: doc, ...computeCapital(doc, today), today });
});

dealCapitalRouter.put('/deals/:dealId/capital', async (req, res) => {
  const userId = (req as any).user?.id as number;
  const dealId = Number(req.params.dealId);
  if (!Number.isFinite(dealId)) return res.status(400).json({ error: 'Bad deal id' });

  const deal = await ownsDeal(userId, dealId);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const p = parseDoc(req.body);
  if (!p.ok) return res.status(400).json({ error: p.why });

  const today = new Date().toISOString().slice(0, 10);
  const doc: CapitalDoc = { ...p.doc, updatedAt: today };

  await sql`
    UPDATE deals SET capital_stack = ${JSON.stringify(doc)}::jsonb
    WHERE id = ${dealId} AND user_id = ${userId}
  `;

  res.json({ stack: doc, ...computeCapital(doc, today), today });
});

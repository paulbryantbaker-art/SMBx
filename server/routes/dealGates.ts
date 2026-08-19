/**
 * THE GATE STACK, OVER HTTP — DEFINITIVE becomes something you can look at.
 *
 * FRONT_END_REBUILD.md §4: *"Today DEFINITIVE is an engine Yulia calls. You
 * cannot look at it."* This route is the fix's server half: one read-only
 * endpoint that gives the deal page everything the gate-stack screen renders.
 *
 *   GET /api/deals/:dealId/gates
 *
 * ── WHY A NEW ROUTE AND NOT /api/definitive/* ───────────────────────────
 * The whole `/api/definitive` prefix returns **410 in practice mode** — it is
 * the mothballed external-agent surface (`mothballedAgentSurface`), and the
 * standing law is that it reopens deliberately, never by accident. This is not
 * that surface: it is the practitioner's own instrument, behind the same
 * team-auth + practice-perimeter stack as every other `/api` route, exactly
 * like `dealCapital.ts` beside it. Same catalog, different door, different
 * audience — which is the distinction the mothball exists to draw.
 *
 * ── THIS ROUTE CALLS NO MODEL ───────────────────────────────────────────
 * Everything here is a catalog lookup plus SQL plus one PURE function.
 * `composeDefinitiveApplicableMechanics` is deterministic route-map matching
 * (token scoring over the deal's journey/league/type/industry) — verified: no
 * Anthropic client, no apiSpend, no fetch anywhere in its import chain. The
 * page can be opened a hundred times a day and cannot spend a cent.
 *
 * ── WHAT IT RETURNS, AND WHAT EACH PIECE HONESTLY IS ────────────────────
 *   gates       The 30 DEFINITIVE gate expansions, verbatim from the catalog,
 *               each carrying its slots. A slot serving several gates appears
 *               under each — that is the catalog's own shape, and the client's
 *               ranking note says so rather than deduplicating silently.
 *   applicable  The slots the ROUTE MAP matches to THIS deal's recorded
 *               journey/league/type/industry. This is a deterministic match,
 *               not a judgement: the response labels its basis so the screen
 *               can say "matched by the route map", never "applies" bare.
 *   journey     The deal's own gate_progress rows (S0..B5 — the JOURNEY gates,
 *               a different axis from G1..G30, and the response keeps them
 *               apart because conflating the two would let a cleared B2 read
 *               as a cleared G2).
 *   stack       The latest composed model stack, if one was ever composed —
 *               version, when, and its runtime model ids. Null when none: the
 *               screen shows "no stack composed yet" rather than an empty list
 *               pretending to be a finding.
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  DEFINITIVE_GATE_EXPANSIONS,
  DEFINITIVE_DEAL_MECHANICS_CATALOG,
  DEFINITIVE_DEAL_MECHANICS_VERSION,
} from '../services/definitiveDealMechanicsCatalog.js';
import { composeDefinitiveApplicableMechanics } from '../services/definitiveDealRouteMap.js';

export const dealGatesRouter = Router();
dealGatesRouter.use(requireAuth);

dealGatesRouter.get('/deals/:dealId/gates', async (req, res) => {
  const userId = (req as any).userId as number;
  const dealId = Number(req.params.dealId);
  if (!Number.isFinite(dealId)) return res.status(400).json({ error: 'Bad deal id' });

  const [deal] = await sql`
    SELECT id, journey_type, current_gate, league, industry, name, business_name
    FROM deals WHERE id = ${dealId} AND user_id = ${userId}
  `;
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const journeyGates = await sql`
    SELECT gate, status, completed_at FROM gate_progress
    WHERE deal_id = ${dealId} ORDER BY gate
  `;

  const [stackRow] = await sql`
    SELECT version, composed_at, journey, league, deal_type,
           primary_models, supporting, tax_legal, sensitivity
    FROM deal_model_stack WHERE deal_id = ${dealId}
    ORDER BY version DESC LIMIT 1
  `;

  /* The route-map match. Pure and deterministic — same inputs, same answer,
     on the server or in a Cowork session. If the deal's own fields are too
     thin to match on (no journey recorded), we return an EMPTY match with the
     reason, not a guess. */
  let applicable: ReturnType<typeof composeDefinitiveApplicableMechanics> = [];
  let applicableBasis: string;
  if (deal.journey_type) {
    applicable = composeDefinitiveApplicableMechanics({
      journey: deal.journey_type,
      league: deal.league ?? null,
      dealType: null,
      industry: deal.industry ?? null,
      jurisdiction: null,
      triggeredGates: [],
      limit: 72,
    } as any);
    applicableBasis =
      `Matched by the DEFINITIVE route map from this deal's recorded ` +
      `journey (${deal.journey_type})` +
      (deal.league ? `, league (${deal.league})` : '') +
      (deal.industry ? ` and industry (${deal.industry})` : '') +
      `. Deterministic token match — the same inputs always give the same list. It is routing, not a judgement.`;
  } else {
    applicableBasis =
      'No journey is recorded on this deal, so the route map was not consulted — matching on nothing would return everything and call it relevant.';
  }

  /* Slots grouped under each gate expansion, in catalog order. */
  const byGate = DEFINITIVE_GATE_EXPANSIONS.map(g => ({
    gateId: g.gateId,
    name: g.name,
    purpose: g.purpose,
    lineNotes: g.lineNotes,
    slots: DEFINITIVE_DEAL_MECHANICS_CATALOG
      .filter(m => m.gates.includes(g.gateId))
      .map(m => ({
        slotId: m.slotId,
        name: m.name,
        lineCategory: m.lineCategory,
        status: m.status,
        dealTypes: m.dealTypes,
        deterministicComputation: m.deterministicComputation,
        runtimeModelId: m.implementedRuntimeModelId ?? null,
      })),
  }));

  res.json({
    catalogVersion: DEFINITIVE_DEAL_MECHANICS_VERSION,
    deal: {
      id: deal.id,
      name: deal.business_name || deal.name,
      journey: deal.journey_type ?? null,
      currentGate: deal.current_gate ?? null,
      league: deal.league ?? null,
      industry: deal.industry ?? null,
    },
    journeyGates: journeyGates.map(g => ({
      gate: g.gate, status: g.status, completedAt: g.completed_at,
    })),
    stack: stackRow
      ? {
          version: stackRow.version,
          composedAt: stackRow.composed_at,
          journey: stackRow.journey,
          league: stackRow.league,
          dealType: stackRow.deal_type,
          runtimeModels: [
            ...(stackRow.primary_models ?? []),
            ...(stackRow.supporting ?? []),
            ...(stackRow.tax_legal ?? []),
            ...(stackRow.sensitivity ?? []),
          ],
        }
      : null,
    applicable: applicable.map(m => ({
      slotId: m.slotId,
      gates: m.gates,
      appliesWhen: m.appliesWhen,
      boundary: m.boundary,
    })),
    applicableBasis,
    gates: byGate,
  });
});

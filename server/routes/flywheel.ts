/**
 * Flywheel Routes — Transaction benchmarks, ground truth, usage tracking, data products
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const flywheelRouter = Router();
flywheelRouter.use(requireAuth);

// ─── Submit transaction benchmark (post-close) ──────────────

flywheelRouter.post('/benchmarks', async (req, res) => {
  try {
    const { naicsCode, industry, geography, dealSizeCents, revenueCents, ebitdaCents, sdeCents,
            multiple, metricUsed, structure, sbaFinanced, daysToClose, league } = req.body;

    const [benchmark] = await sql`
      INSERT INTO transaction_benchmarks (
        naics_code, industry, geography, deal_size_cents, revenue_cents, ebitda_cents, sde_cents,
        multiple, metric_used, structure, sba_financed, days_to_close, league
      ) VALUES (
        ${naicsCode || null}, ${industry || null}, ${geography || null}, ${dealSizeCents || null},
        ${revenueCents || null}, ${ebitdaCents || null}, ${sdeCents || null},
        ${multiple || null}, ${metricUsed || null}, ${structure || null}, ${sbaFinanced || null},
        ${daysToClose || null}, ${league || null}
      )
      RETURNING id
    `;

    return res.status(201).json({ id: benchmark.id, submitted: true });
  } catch (err: any) {
    console.error('Submit benchmark error:', err.message);
    return res.status(500).json({ error: 'Failed to submit benchmark' });
  }
});

// ─── Get benchmark statistics ────────────────────────────────

flywheelRouter.get('/benchmarks/stats', async (req, res) => {
  try {
    const naicsCode = req.query.naicsCode as string || null;

    let stats;
    if (naicsCode) {
      stats = await sql`
        SELECT
          naics_code, industry,
          COUNT(*) as sample_size,
          ROUND(AVG(multiple)::numeric, 2) as avg_multiple,
          ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as p25_multiple,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as median_multiple,
          ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as p75_multiple,
          ROUND(AVG(days_to_close)::numeric, 0) as avg_days_to_close,
          ROUND(AVG(deal_size_cents)::numeric / 100, 0) as avg_deal_size,
          ROUND((COUNT(*) FILTER (WHERE sba_financed = true))::numeric / NULLIF(COUNT(*), 0) * 100, 1) as pct_sba_financed
        FROM transaction_benchmarks
        WHERE naics_code = ${naicsCode}
        GROUP BY naics_code, industry
      `;
    } else {
      stats = await sql`
        SELECT
          naics_code, industry,
          COUNT(*) as sample_size,
          ROUND(AVG(multiple)::numeric, 2) as avg_multiple,
          ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY multiple)::numeric, 2) as median_multiple,
          ROUND(AVG(days_to_close)::numeric, 0) as avg_days_to_close
        FROM transaction_benchmarks
        GROUP BY naics_code, industry
        HAVING COUNT(*) >= 3
        ORDER BY COUNT(*) DESC
        LIMIT 20
      `;
    }

    return res.json(stats);
  } catch (err: any) {
    console.error('Benchmark stats error:', err.message);
    return res.status(500).json({ error: 'Failed to get benchmark statistics' });
  }
});

// ─── Usage tracking ──────────────────────────────────────────

flywheelRouter.get('/usage', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const days = Math.min(parseInt(req.query.days as string || '30', 10), 90);

    const usage = await sql`
      SELECT date, input_tokens, output_tokens, tool_calls, deliverables_generated, intelligence_queries
      FROM usage_tracking
      WHERE user_id = ${userId} AND date >= CURRENT_DATE - ${days}::integer
      ORDER BY date DESC
    `;

    const [totals] = await sql`
      SELECT
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(tool_calls) as total_tool_calls,
        SUM(deliverables_generated) as total_deliverables,
        SUM(intelligence_queries) as total_queries
      FROM usage_tracking
      WHERE user_id = ${userId} AND date >= CURRENT_DATE - ${days}::integer
    `;

    return res.json({ daily: usage, totals: totals || {} });
  } catch (err: any) {
    console.error('Usage tracking error:', err.message);
    return res.status(500).json({ error: 'Failed to get usage data' });
  }
});

// ─── Ground truth submission ─────────────────────────────────

flywheelRouter.post('/ground-truth', async (req, res) => {
  try {
    const { dealId, dataType, predictedValue, actualValue, period } = req.body;

    if (!dataType || actualValue === undefined) {
      return res.status(400).json({ error: 'dataType and actualValue are required' });
    }

    const variancePct = predictedValue && predictedValue !== 0
      ? ((actualValue - predictedValue) / predictedValue) * 100
      : null;

    const [entry] = await sql`
      INSERT INTO ground_truth_data (deal_id, data_type, predicted_value, actual_value, variance_pct, period)
      VALUES (${dealId || null}, ${dataType}, ${predictedValue || null}, ${actualValue}, ${variancePct}, ${period || null})
      RETURNING id
    `;

    return res.status(201).json({ id: entry.id, variancePct });
  } catch (err: any) {
    console.error('Ground truth error:', err.message);
    return res.status(500).json({ error: 'Failed to submit ground truth data' });
  }
});

// ─── AI accuracy metrics ─────────────────────────────────────

flywheelRouter.get('/ground-truth/accuracy', async (req, res) => {
  try {
    const stats = await sql`
      SELECT
        data_type,
        COUNT(*) as sample_size,
        ROUND(AVG(ABS(variance_pct))::numeric, 2) as mean_absolute_error_pct,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ABS(variance_pct))::numeric, 2) as median_error_pct,
        ROUND(AVG(variance_pct)::numeric, 2) as mean_bias_pct
      FROM ground_truth_data
      WHERE predicted_value IS NOT NULL AND actual_value IS NOT NULL
      GROUP BY data_type
      ORDER BY COUNT(*) DESC
    `;

    return res.json(stats);
  } catch (err: any) {
    console.error('Accuracy metrics error:', err.message);
    return res.status(500).json({ error: 'Failed to get accuracy metrics' });
  }
});

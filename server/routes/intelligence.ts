/**
 * Intelligence Routes — Market data, SBA analysis, intelligence reports
 */
import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { fetchCBPData, fetchFREDData, calculateSBABankability, generateMarketOverview } from '../services/marketDataService.js';
import { generateIntelligenceReport } from '../services/generators/intelligenceReport.js';
import { debitWallet, getBalance } from '../services/walletService.js';

export const intelligenceRouter = Router();
intelligenceRouter.use(requireAuth);

// ─── Get market overview ─────────────────────────────────────

intelligenceRouter.get('/intelligence/market-overview', async (req, res) => {
  try {
    const { naicsCode, stateCode, countyCode } = req.query;

    if (!naicsCode || !stateCode) {
      return res.status(400).json({ error: 'naicsCode and stateCode are required' });
    }

    const overview = await generateMarketOverview(
      naicsCode as string,
      stateCode as string,
      countyCode as string || undefined,
    );

    return res.json(overview);
  } catch (err: any) {
    console.error('Market overview error:', err.message);
    return res.status(500).json({ error: 'Failed to generate market overview' });
  }
});

// ─── SBA bankability check ───────────────────────────────────

intelligenceRouter.post('/intelligence/sba-analysis', async (req, res) => {
  try {
    const { purchasePrice, ebitda, sde, downPaymentPct, loanTermYears } = req.body;

    if (!purchasePrice || (!ebitda && !sde)) {
      return res.status(400).json({ error: 'purchasePrice and ebitda or sde are required' });
    }

    const analysis = await calculateSBABankability({
      purchasePrice,
      ebitdaOrSde: ebitda || sde,
      downPaymentPct,
      loanTermYears,
    });

    return res.json(analysis);
  } catch (err: any) {
    console.error('SBA analysis error:', err.message);
    return res.status(500).json({ error: 'Failed to calculate SBA analysis' });
  }
});

// ─── Get FRED economic indicators ────────────────────────────

intelligenceRouter.get('/intelligence/economic-indicators', async (req, res) => {
  try {
    const indicators = await sql`
      SELECT series_id, title, latest_value, latest_date, previous_value, change_pct, updated_at
      FROM fred_indicators
      ORDER BY series_id
    `;

    return res.json(indicators);
  } catch (err: any) {
    console.error('Economic indicators error:', err.message);
    return res.status(500).json({ error: 'Failed to get economic indicators' });
  }
});

// ─── Refresh FRED data ───────────────────────────────────────

intelligenceRouter.post('/intelligence/refresh-fred', async (req, res) => {
  try {
    const indicators = await sql`SELECT series_id FROM fred_indicators`;
    const results: Record<string, any> = {};

    for (const ind of indicators) {
      const data = await fetchFREDData(ind.series_id);
      results[ind.series_id] = data;
    }

    return res.json({ refreshed: Object.keys(results).length, data: results });
  } catch (err: any) {
    console.error('FRED refresh error:', err.message);
    return res.status(500).json({ error: 'Failed to refresh FRED data' });
  }
});

// ─── Census CBP lookup ───────────────────────────────────────

intelligenceRouter.get('/intelligence/cbp', async (req, res) => {
  try {
    const { naicsCode, stateCode, countyCode } = req.query;

    if (!naicsCode || !stateCode) {
      return res.status(400).json({ error: 'naicsCode and stateCode are required' });
    }

    const data = await fetchCBPData(
      naicsCode as string,
      stateCode as string,
      countyCode as string || undefined,
    );

    if (!data) return res.status(404).json({ error: 'No data found for this industry and geography' });

    return res.json(data);
  } catch (err: any) {
    console.error('CBP lookup error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch CBP data' });
  }
});

// ─── List intelligence reports for user ──────────────────────

intelligenceRouter.get('/intelligence/reports', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const reports = await sql`
      SELECT id, deal_id, report_type, naics_code, geography, status, price_charged_cents,
             created_at, completed_at
      FROM intelligence_reports
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return res.json(reports);
  } catch (err: any) {
    console.error('List intelligence reports error:', err.message);
    return res.status(500).json({ error: 'Failed to list intelligence reports' });
  }
});

// ─── Get specific report ─────────────────────────────────────

intelligenceRouter.get('/intelligence/reports/:reportId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const reportId = parseInt(req.params.reportId, 10);

    const [report] = await sql`
      SELECT * FROM intelligence_reports
      WHERE id = ${reportId} AND user_id = ${userId}
    `;

    if (!report) return res.status(404).json({ error: 'Report not found' });

    return res.json(report);
  } catch (err: any) {
    console.error('Get intelligence report error:', err.message);
    return res.status(500).json({ error: 'Failed to get report' });
  }
});

// ─── Generate intelligence report ────────────────────────────

intelligenceRouter.post('/intelligence/reports/generate', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { dealId, naicsCode, stateCode, countyCode, reportType } = req.body;

    if (!naicsCode || !stateCode) {
      return res.status(400).json({ error: 'naicsCode and stateCode are required' });
    }

    // Optional: get deal data for enriched report
    let dealData: any = {};
    if (dealId) {
      const [deal] = await sql`SELECT * FROM deals WHERE id = ${dealId}`;
      if (deal) {
        dealData = {
          purchasePrice: deal.asking_price,
          ebitda: deal.ebitda,
          sde: deal.sde,
          revenue: deal.revenue,
          industry: deal.industry,
          businessName: deal.business_name,
          league: deal.league,
        };
      }
    }

    // Charge for report (2500 cents = $25)
    const reportPrice = 2500;
    const balance = await getBalance(userId);
    if (balance < reportPrice) {
      return res.status(402).json({
        error: 'Insufficient wallet balance',
        required: reportPrice,
        balance,
        requiredDisplay: `$${(reportPrice / 100).toFixed(2)}`,
        balanceDisplay: `$${(balance / 100).toFixed(2)}`,
      });
    }
    await debitWallet(userId, reportPrice, `Intelligence Report: ${naicsCode} in ${stateCode}`);

    // Create report record
    const [reportRecord] = await sql`
      INSERT INTO intelligence_reports (user_id, deal_id, report_type, naics_code, geography, status, price_charged_cents)
      VALUES (${userId}, ${dealId || null}, ${reportType || 'market_intelligence'}, ${naicsCode}, ${stateCode}, 'generating', ${reportPrice})
      RETURNING id
    `;

    // Generate report
    const content = await generateIntelligenceReport({
      naicsCode,
      stateCode,
      countyCode,
      ...dealData,
    });

    // Save completed report
    await sql`
      UPDATE intelligence_reports
      SET status = 'completed', content = ${JSON.stringify(content)}::jsonb, completed_at = NOW()
      WHERE id = ${reportRecord.id}
    `;

    return res.status(201).json({
      reportId: reportRecord.id,
      status: 'completed',
      priceCharged: reportPrice,
      content,
    });
  } catch (err: any) {
    console.error('Generate intelligence report error:', err.message);
    return res.status(500).json({ error: 'Failed to generate intelligence report' });
  }
});

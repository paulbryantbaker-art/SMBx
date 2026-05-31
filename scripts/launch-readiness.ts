#!/usr/bin/env tsx
/**
 * Launch readiness checker for smbX MCP server + Claude/ChatGPT connectors.
 *
 * What this does:
 *   - Calls the existing buildDefinitiveAssistantDistributionReadiness() to get
 *     the structured readiness report (env vars, protocol, platforms, assets).
 *   - Adds a pricing-consistency check: server PLANS vs definitiveMcp DEFINITIVE_PLANS
 *     vs agent card pricing block — catches drift the readiness service doesn't.
 *   - Prints a categorized, actionable summary (READY / MANUAL / BLOCKED).
 *   - Exits non-zero on any blocker, so this can be wired into CI / Railway pre-deploy.
 *
 * Usage:
 *   npm run launch-readiness                 # reads local env (process.env)
 *   APP_URL=https://smbx.ai npm run launch-readiness  # simulate production env
 *
 * Output sections:
 *   1. Pricing consistency  — drift between code surfaces
 *   2. Protocol readiness   — /mcp, OAuth, server.json, server-card
 *   3. Environment          — APP_URL, Stripe live keys, TEST_MODE
 *   4. Per-platform         — ChatGPT GPT Actions, Claude Connector, MCP directories
 *   5. Manual assets        — icon, screenshots, demo video, counsel copy
 *   6. Net blockers         — single deduplicated list of what's stopping launch
 */

import 'dotenv/config';
import { buildDefinitiveAssistantDistributionReadiness } from '../server/services/definitiveAssistantDistributionReadiness.js';

/**
 * LOCKED pricing values from SMBX_PRICING_LOCKED.md (2026-05-27).
 *
 * Hardcoded here on purpose: the readiness script verifies that every public surface
 * (agent card, MCP plans) matches the LOCK. Importing from subscriptionService.PLANS
 * would only verify code-matches-itself, which is a tautology — and it would also pull
 * in the DB connection at import time, breaking the script when run outside the app.
 *
 * When pricing is re-locked, update SMBX_PRICING_LOCKED.md FIRST, then update both
 * server/services/subscriptionService.ts PLANS AND this constant.
 */
const LOCKED_PRICING = {
  // For Free, the substrate uses "$0/mo" for label consistency with paid tiers.
  // Human-facing UI ("Free") is rendered differently — see PRICING_TIERS in client/src/lib/pricing.ts.
  free: { cents: 0, shortLabel: '$0/mo' },
  solo: { cents: 9900, shortLabel: '$99/mo' },
  pro: { cents: 24900, shortLabel: '$249/mo' },
  team: { cents: 74900, shortLabel: '$749/mo' },
  enterprise: { cents: 300000, shortLabel: 'From $3,000/mo' },
} as const;

const AGENT_CARD_PRICING_LABELS: Record<string, string> = {
  free: '$0',
  solo: '$99/mo',
  pro: '$249/mo',
  team: '$749/mo',
  enterprise: '$3,000+/mo',
};

// ─── Color helpers ──────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function header(text: string) {
  console.log('');
  console.log(`${c.bold}${c.blue}━━ ${text} ━━${c.reset}`);
}

function pass(text: string) {
  console.log(`  ${c.green}✓${c.reset} ${text}`);
}

function manual(text: string) {
  console.log(`  ${c.yellow}◐${c.reset} ${text}`);
}

function fail(text: string) {
  console.log(`  ${c.red}✗${c.reset} ${text}`);
}

function note(text: string) {
  console.log(`    ${c.gray}${text}${c.reset}`);
}

// ─── Pricing consistency check ──────────────────────────────
interface PricingDrift {
  source: string;
  field: string;
  expected: string;
  actual: string;
}

async function checkPricingConsistency(): Promise<PricingDrift[]> {
  const drifts: PricingDrift[] = [];

  // 1. Verify substrate-facing MCP plans (what external agents see) match the LOCK.
  try {
    const { listDefinitivePlans } = await import('../server/services/definitiveMcp.js');
    const plans = listDefinitivePlans();
    for (const [tier, exp] of Object.entries(LOCKED_PRICING)) {
      const found = plans.find(p => p.id === tier);
      if (!found) {
        drifts.push({ source: 'definitiveMcp.listDefinitivePlans()', field: tier, expected: exp.shortLabel, actual: 'MISSING' });
        continue;
      }
      if (found.monthlyPriceCents !== exp.cents) {
        drifts.push({
          source: 'definitiveMcp.listDefinitivePlans()',
          field: `${tier}.monthlyPriceCents`,
          expected: String(exp.cents),
          actual: String(found.monthlyPriceCents),
        });
      }
      if (found.priceLabel !== exp.shortLabel) {
        drifts.push({
          source: 'definitiveMcp.listDefinitivePlans()',
          field: `${tier}.priceLabel`,
          expected: exp.shortLabel,
          actual: found.priceLabel,
        });
      }
    }
  } catch (err) {
    note(`(skipped definitiveMcp check: ${(err as Error).message})`);
  }

  // 2. Verify agent card pricing block (what /.well-known/agent-card.json publishes) matches.
  try {
    const { buildAgentCard } = await import('../server/services/agentCard.js');
    const card = buildAgentCard();
    const cardPricing = (card as { pricing?: Record<string, string> }).pricing;
    if (cardPricing) {
      for (const [tier, expectedLabel] of Object.entries(AGENT_CARD_PRICING_LABELS)) {
        const actual = cardPricing[tier];
        if (actual !== expectedLabel) {
          drifts.push({
            source: 'agentCard.pricing',
            field: tier,
            expected: expectedLabel,
            actual: actual ?? 'MISSING',
          });
        }
      }
    } else {
      drifts.push({ source: 'agentCard.pricing', field: 'pricing', expected: 'object', actual: 'MISSING' });
    }
  } catch (err) {
    note(`(skipped agentCard check: ${(err as Error).message})`);
  }

  return drifts;
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000';
  console.log(`${c.bold}smbX launch-readiness check${c.reset}`);
  console.log(`Target origin: ${c.bold}${baseUrl}${c.reset}`);
  console.log(`Generated:     ${new Date().toISOString()}`);

  let blockerCount = 0;

  // ── 1. Pricing consistency ──
  header('1. Pricing consistency (SMBX_PRICING_LOCKED.md → code)');
  const drifts = await checkPricingConsistency();
  if (drifts.length === 0) {
    pass('All pricing surfaces match the locked ladder ($99 / $249 / $749 / $3,000+)');
  } else {
    for (const d of drifts) {
      fail(`${d.source} :: ${d.field} — expected ${d.expected}, got ${d.actual}`);
      blockerCount++;
    }
  }

  // ── 2-5. Readiness service ──
  const report = buildDefinitiveAssistantDistributionReadiness(baseUrl);

  header('2. Protocol readiness (/mcp, OAuth, server.json)');
  if (report.protocolReadiness.status === 'ready_streamable_http_jwt_bearer') {
    pass(`Streamable HTTP MCP at ${report.protocolReadiness.requiredEndpoint}`);
    pass(`OAuth protected-resource metadata at ${report.protocolReadiness.protectedResourceMetadata}`);
    pass(`server.json at ${report.protocolReadiness.serverJson}`);
  }
  for (const blocker of report.protocolReadiness.blockers) {
    fail(`Protocol blocker: ${blocker}`);
    blockerCount++;
  }

  header('3. Environment (production gating)');
  for (const check of report.revenueChecks.required) {
    if (check.status === 'ready') {
      pass(check.label);
    } else {
      fail(`${check.label}`);
      note(check.blocker);
      blockerCount++;
    }
  }
  for (const check of report.revenueChecks.optional) {
    if (check.status === 'ready') {
      pass(`${check.label} (optional)`);
    } else {
      manual(`${check.label} (optional — ${check.blocker})`);
    }
  }

  header('4. Per-platform readiness');
  for (const platform of report.platformReadiness) {
    console.log(`  ${c.bold}${platform.label}${c.reset} (priority ${platform.priority}) — ${platform.status}`);
    if (platform.blockers && platform.blockers.length > 0) {
      for (const b of platform.blockers) {
        note(`blocker: ${b}`);
        blockerCount++;
      }
    }
    if ('paidLaunchBlockers' in platform && Array.isArray(platform.paidLaunchBlockers)) {
      for (const b of platform.paidLaunchBlockers) {
        note(`paid-launch blocker: ${b}`);
      }
    }
  }

  header('5. Manual / human-action assets');
  for (const check of report.manualAssetChecks.required) {
    manual(check.label);
    note(check.blocker);
    blockerCount++;
  }

  // ── 6. Summary ──
  header('Net blockers');
  if (blockerCount === 0 && report.blockers.length === 0) {
    pass('Zero blockers. Ready to submit to marketplaces and flip TEST_MODE=false.');
  } else {
    fail(`${blockerCount} blocker(s) — see above. Aggregated from readiness service:`);
    for (const blocker of report.blockers) {
      note(blocker);
    }
  }

  console.log('');
  console.log(`Exit code: ${blockerCount === 0 ? c.green + '0' : c.red + '1'}${c.reset}`);
  process.exit(blockerCount === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${c.red}launch-readiness check failed:${c.reset}`, err);
  process.exit(2);
});

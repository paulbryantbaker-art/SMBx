/**
 * crmOutreachSeed.ts — seed the CLIENT PIPELINE from the outreach plan
 * (2026-08-06, Paul: "for seeding crm data into the app, we can start here",
 * followed by the plan bundle upload).
 *
 * SOURCE OF TRUTH: `content/crm-seed/` — the 2026-08-05 buy-side outreach
 * plan (91 contacts · 81 organizations · 6 waves · 27 steps · 12 templates ·
 * 4 events · 15 research-queue items), produced by two research passes and
 * shipped in the repo verbatim. The Google-Sheets workbook and the CSVs are
 * the same dataset; the CSVs are canonical here.
 *
 * MAPPING LAWS:
 * - bucket → kind + disqualified. CLIENT and CLIENT+REFERRAL are 'acquirer'
 *   (the ranked board); REFERRAL is 'service_provider' (reachable, never
 *   ranked — capital providers, lenders, counsel, QofE); and
 *   ECOSYSTEM_DO_NOT_PITCH lands as kind 'other' WITH `disqualified` set, so
 *   the 13 register-intelligence rows can never be messaged by accident —
 *   the same column the register import uses for "not a client".
 * - tier (A/B/C) → grade. The plan's conviction ranking, human-set.
 * - buyside_signal + signal_date → evidence, verbatim (citation discipline).
 * - wave → next_action_on = the wave's start date (Waves tab), so the due
 *   index and Today surface the calendar the plan encodes. 'ONGOING' → null.
 * - A contact's next_action seeds the ACCOUNT's next_action only where the
 *   account has none — the import asymmetry: seeds propose, humans own.
 * - Unnamed records (verification_status NAMED INDIVIDUAL REQUIRED, 16 rows)
 *   create/enrich the account but NO contact row — inventing people is the
 *   failure mode the plan explicitly avoided. Their ask lands as the
 *   account's next_action and a Research-needed activity instead.
 * - Waves/steps/templates/events are NOT forced into CRM tables — they have
 *   no schema home yet (the campaign build, anticipated by migration 115).
 *   They ship in content/crm-seed/ for that build; nothing is silently
 *   dropped: the seed report names what was deferred.
 *
 * IDEMPOTENT: accounts upsert on (user_id, lower(firm)) with pipeline fields
 * (stage/owner/next_action/archived) never touched on UPDATE; contacts
 * ON CONFLICT DO NOTHING; activity rows are keyed by subject and skipped
 * when present. Running the seed twice changes nothing the second time.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '../db.js';

/** Minimal RFC-4180 CSV: quoted fields, embedded commas/quotes/newlines,
 *  BOM stripped. Returns row objects keyed by the header row. */
export function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let cur: string[] = [], field = '', inQ = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQ) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { cur.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      cur.push(field); field = '';
      if (cur.some(v => v.trim() !== '')) rows.push(cur);
      cur = [];
    } else field += ch;
  }
  cur.push(field);
  if (cur.some(v => v.trim() !== '')) rows.push(cur);
  if (!rows.length) return [];
  const head = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const o: Record<string, string> = {};
    head.forEach((h, i) => { o[h] = (r[i] ?? '').trim(); });
    return o;
  });
}

function seedDir(): string | null {
  const candidates = [
    path.join(process.cwd(), 'content/crm-seed'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content/crm-seed'),
  ];
  return candidates.find(p => existsSync(path.join(p, '01_contacts.csv'))) ?? null;
}

function normDomain(s: string | undefined | null): string | null {
  if (!s || !s.trim()) return null;
  return s.trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '')
    .split(/[/?#]/)[0] || null;
}

function kindFor(bucket: string): string {
  if (bucket === 'REFERRAL') return 'service_provider';
  if (bucket === 'ECOSYSTEM_DO_NOT_PITCH') return 'other';
  return 'acquirer'; // CLIENT, CLIENT+REFERRAL
}

/** Labeled lines for fields that have no column of their own — kept in notes
 *  so nothing from the research is dropped in silence. */
function packNotes(r: Record<string, string>, extra: [string, string][]): string | null {
  const lines: string[] = [];
  if (r.notes) lines.push(r.notes);
  for (const [label, v] of extra) if (v) lines.push(`${label}: ${v}`);
  return lines.length ? lines.join('\n') : null;
}

async function activityOnce(accountId: number, userId: number, subject: string, body: string, occurredAt?: string) {
  const [existing] = await sql`
    SELECT id FROM crm_activity WHERE account_id = ${accountId} AND subject = ${subject} LIMIT 1
  `;
  if (existing) return false;
  await sql`
    INSERT INTO crm_activity (account_id, user_id, kind, subject, body, occurred_at)
    VALUES (${accountId}, ${userId}, 'note', ${subject}, ${body}, ${occurredAt ?? new Date().toISOString()})
  `;
  return true;
}

export interface SeedReport {
  accountsCreated: number;
  accountsUpdated: number;
  contactsAdded: number;
  activitiesAdded: number;
  unnamedParked: number;
  doNotPitch: number;
  deferred: string;
}

export async function seedOutreachBoard(userId: number): Promise<SeedReport> {
  const dir = seedDir();
  if (!dir) throw new Error('content/crm-seed is missing — the plan bundle is not on this deploy');
  const read = (f: string) => parseCsv(readFileSync(path.join(dir, f), 'utf8'));

  const orgs = read('02_organizations.csv');
  const contacts = read('01_contacts.csv');
  const waves = read('03_outreach_waves.csv');
  const queue = read('07_research_queue.csv');

  const waveStart: Record<string, string> = {};
  for (const w of waves) if (w.wave_id && /^\d{4}-\d{2}-\d{2}$/.test(w.start_date)) waveStart[w.wave_id] = w.start_date;

  const report: SeedReport = {
    accountsCreated: 0, accountsUpdated: 0, contactsAdded: 0,
    activitiesAdded: 0, unnamedParked: 0, doNotPitch: 0,
    deferred: 'waves, sequence steps, templates and events ship in content/crm-seed/ for the campaign build — not forced into CRM tables',
  };
  const accountIdByFirm = new Map<string, number>();

  const upsertAccount = async (r: Record<string, string>) => {
    const firm = (r.firm || '').trim();
    if (!firm) return null;
    const key = firm.toLowerCase();
    const bucket = r.bucket || '';
    const doNot = bucket === 'ECOSYSTEM_DO_NOT_PITCH';
    const vals = {
      user_id: userId,
      firm,
      kind: kindFor(bucket),
      website: r.firm_website || r.website || null,
      domain: normDomain(r.firm_website || r.website),
      hq_city: r.city || null,
      hq_state: r.state || null,
      segment: r.segment || null,
      grade: r.tier || null,
      evidence: r.buyside_signal
        ? (r.signal_date ? `${r.buyside_signal} (signal: ${r.signal_date})` : r.buyside_signal)
        : null,
      source_url: r.source_url || null,
      disqualified: doNot
        ? 'ECOSYSTEM_DO_NOT_PITCH — register intelligence / potential exit counterparty; never pitched (outreach plan 2026-08-05)'
        : null,
      notes: packNotes(r, [
        ['Bucket', bucket],
        ['Firm type', r.firm_type || ''],
        ['AUM / fund size', r.aum_or_fund_size || ''],
        ['Check size', r.check_size || ''],
        ['EBITDA range', r.ebitda_range || ''],
        ['Vertical fit', r.vertical_fit || ''],
        ['Internal corp dev', r.internal_corpdev || ''],
        ['Confidence', r.confidence || ''],
      ]),
    };
    const [row] = await sql`
      INSERT INTO crm_accounts ${sql(vals)}
      ON CONFLICT (user_id, lower(firm)) DO UPDATE SET
        kind = EXCLUDED.kind,
        website = COALESCE(EXCLUDED.website, crm_accounts.website),
        domain = COALESCE(EXCLUDED.domain, crm_accounts.domain),
        hq_city = COALESCE(EXCLUDED.hq_city, crm_accounts.hq_city),
        hq_state = COALESCE(EXCLUDED.hq_state, crm_accounts.hq_state),
        segment = COALESCE(EXCLUDED.segment, crm_accounts.segment),
        grade = COALESCE(EXCLUDED.grade, crm_accounts.grade),
        evidence = COALESCE(EXCLUDED.evidence, crm_accounts.evidence),
        source_url = COALESCE(EXCLUDED.source_url, crm_accounts.source_url),
        disqualified = COALESCE(EXCLUDED.disqualified, crm_accounts.disqualified),
        notes = COALESCE(EXCLUDED.notes, crm_accounts.notes),
        updated_at = NOW()
      RETURNING id, (created_at = updated_at) AS is_new
    `;
    if (row?.is_new) report.accountsCreated++; else report.accountsUpdated++;
    if (doNot) report.doNotPitch++;
    accountIdByFirm.set(key, row.id);
    return row.id as number;
  };

  // Organizations first (the fuller org-level records), then contacts —
  // which can introduce firms the org sheet lacks and enrich the rest.
  for (const r of orgs) await upsertAccount(r);

  const recordFirm = new Map<string, string>(); // record_id → firm (for the research queue)
  for (const r of contacts) {
    const firm = (r.firm || '').trim();
    if (!firm) continue;
    if (r.record_id) recordFirm.set(r.record_id, firm.toLowerCase());
    const accountId = accountIdByFirm.get(firm.toLowerCase()) ?? await upsertAccount(r);
    if (!accountId) continue;

    const name = (r.full_name || '').trim();
    const unnamed = !name || /NAMED INDIVIDUAL REQUIRED/i.test(r.verification_status || '');
    if (unnamed) {
      report.unnamedParked++;
    } else {
      const hasPrimary = (await sql`
        SELECT 1 FROM crm_contacts WHERE account_id = ${accountId} AND is_primary LIMIT 1
      `).length > 0;
      const [c] = await sql`
        INSERT INTO crm_contacts (account_id, name, title, email, phone, is_primary, source_url, notes)
        VALUES (
          ${accountId}, ${name}, ${r.title || null}, ${r.email || null}, ${r.phone || null},
          ${!hasPrimary},
          ${r.source_url || null},
          ${packNotes({ notes: '' }, [
            ['Record', r.record_id || ''],
            ['Warm path', r.warm_path || ''],
            ['Channel', r.channel || ''],
            ['Template', r.template_id || ''],
            ['Verification', r.verification_status || ''],
          ])}
        )
        ON CONFLICT (account_id, lower(name)) DO NOTHING
        RETURNING id
      `;
      if (c) report.contactsAdded++;
    }

    // The plan's per-record action seeds the account ONLY where the account
    // has none — a re-run never overwrites what a human set since.
    const nextAction = (r.next_action || '').trim();
    const due = waveStart[(r.wave || '').trim()] ?? null;
    if (nextAction) {
      await sql`
        UPDATE crm_accounts SET
          next_action = COALESCE(next_action, ${unnamed ? `[NAME THE PERSON FIRST] ${nextAction}` : nextAction}),
          next_action_on = COALESCE(next_action_on, ${due}),
          updated_at = NOW()
        WHERE id = ${accountId} AND user_id = ${userId}
      `;
    }

    // Provenance + the hook, once per record, into the touch log.
    if (r.outreach_hook || r.wave) {
      const added = await activityOnce(
        accountId, userId,
        `Outreach plan 2026-08-05 [${r.record_id || name || firm}]`,
        [
          r.bucket ? `Bucket ${r.bucket} · tier ${r.tier || '—'} · wave ${r.wave || '—'} · priority ${r.priority || '—'}` : '',
          r.outreach_hook ? `Hook: ${r.outreach_hook}` : '',
          r.warm_path ? `Warm path: ${r.warm_path}` : '',
        ].filter(Boolean).join('\n'),
        '2026-08-05T12:00:00Z',
      );
      if (added) report.activitiesAdded++;
    }
  }

  // Research queue → a Research-needed note on the linked account.
  for (const q of queue) {
    const firmKey = (recordFirm.get(q.linked_record || '') ?? (q.firm || '').toLowerCase()).trim();
    const accountId = accountIdByFirm.get(firmKey);
    if (!accountId) continue;
    const added = await activityOnce(
      accountId, userId,
      `Research needed [${q.queue_id}]`,
      [`${q.what_is_needed}`, q.why_it_matters ? `Why: ${q.why_it_matters}` : '', q.suggested_source ? `Suggested source: ${q.suggested_source}` : ''].filter(Boolean).join('\n'),
      '2026-08-05T12:00:00Z',
    );
    if (added) report.activitiesAdded++;
  }

  return report;
}

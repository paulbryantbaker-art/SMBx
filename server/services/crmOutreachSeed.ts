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
 * - CAMPAIGN TABLES (2026-08-07, the campaign build migration 115 promised —
 *   Paul: "let's get everything built out before we seed data"): waves, steps,
 *   templates and events now load into crm_waves / crm_sequence_steps /
 *   crm_templates / crm_events (migration 120), and every step's
 *   target_records expression is EXPANDED into crm_touches — the queue. The
 *   expression parser and the merge renderer live in house/outreach.ts, pure
 *   and tested, because a silent mis-parse queues the wrong Tier A contact.
 *   Targets that cannot be resolved are NAMED in the report, never dropped.
 *   Disqualified accounts and unsubscribed contacts are excluded at
 *   queue-build time (and re-checked at send time).
 * - source_key stamps the plan's record ids (ORG-014, CAP-001) onto accounts
 *   and contacts so target expressions resolve by id, not just by firm name.
 *
 * IDEMPOTENT: accounts upsert on (user_id, lower(firm)) with pipeline fields
 * (stage/owner/next_action/archived) never touched on UPDATE; contacts
 * ON CONFLICT DO NOTHING; activity rows are keyed by subject and skipped
 * when present; campaign rows upsert by their plan keys; touches land under
 * a step+account+contact+event identity index. Running the seed twice
 * changes nothing the second time.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '../db.js';
import { parseTargets, expandRange, unescapeBody } from '../../house/outreach.js';

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
  /** campaign machine (migration 120) */
  wavesLoaded: number;
  templatesLoaded: number;
  stepsLoaded: number;
  eventsLoaded: number;
  touchesQueued: number;
  /** queue-time exclusions: disqualified account or unsubscribed contact */
  touchesExcluded: number;
  /** "S-014: QQQ-001" — every target token that resolved to nothing. Empty is
   *  the goal; non-empty is a research task, never a silent drop. */
  targetsUnmatched: string[];
}

export async function seedOutreachBoard(userId: number): Promise<SeedReport> {
  const dir = seedDir();
  if (!dir) throw new Error('content/crm-seed is missing — the plan bundle is not on this deploy');
  const read = (f: string) => parseCsv(readFileSync(path.join(dir, f), 'utf8'));

  const orgs = read('02_organizations.csv');
  const contacts = read('01_contacts.csv');
  const waves = read('03_outreach_waves.csv');
  const steps = read('04_sequence_steps.csv');
  const templates = read('05_message_templates.csv');
  const events = read('06_events.csv');
  const queue = read('07_research_queue.csv');

  const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;
  const isoOrNull = (s: string | undefined) =>
    s && /^\d{4}-\d{2}-\d{2}$/.test(s.trim()) ? s.trim() : null;

  const waveStart: Record<string, string> = {};
  for (const w of waves) if (w.wave_id && /^\d{4}-\d{2}-\d{2}$/.test(w.start_date)) waveStart[w.wave_id] = w.start_date;

  const report: SeedReport = {
    accountsCreated: 0, accountsUpdated: 0, contactsAdded: 0,
    activitiesAdded: 0, unnamedParked: 0, doNotPitch: 0,
    wavesLoaded: 0, templatesLoaded: 0, stepsLoaded: 0, eventsLoaded: 0,
    touchesQueued: 0, touchesExcluded: 0, targetsUnmatched: [],
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
      source_key: r.org_id || null,
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
        source_key = COALESCE(crm_accounts.source_key, EXCLUDED.source_key),
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
      /* DO UPDATE only to backfill source_key on rows an earlier seed created
         before migration 120 existed — every other column stays untouched, so
         the run is still a no-op the second time. xmax = 0 distinguishes a
         fresh insert from that backfill for the count. */
      const [c] = await sql`
        INSERT INTO crm_contacts (account_id, name, title, email, phone, is_primary, source_url, source_key, notes)
        VALUES (
          ${accountId}, ${name}, ${r.title || null}, ${r.email || null}, ${r.phone || null},
          ${!hasPrimary},
          ${r.source_url || null},
          ${r.record_id || null},
          ${packNotes({ notes: '' }, [
            ['Record', r.record_id || ''],
            ['Warm path', r.warm_path || ''],
            ['Channel', r.channel || ''],
            ['Template', r.template_id || ''],
            ['Verification', r.verification_status || ''],
          ])}
        )
        ON CONFLICT (account_id, lower(name)) DO UPDATE SET
          source_key = COALESCE(crm_contacts.source_key, EXCLUDED.source_key)
        RETURNING id, (xmax = 0) AS is_new
      `;
      if (c?.is_new) report.contactsAdded++;
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

  /* ── the campaign machine (migration 120) ────────────────────────────
     Waves → templates → events → steps (FK order), then every step's
     target expression expands into crm_touches. Content columns refresh
     from the CSVs on re-run; status columns are human-owned and never
     touched by an upsert. */

  const waveIdByKey = new Map<string, number>();
  for (const w of waves) {
    if (!w.wave_id || !w.wave_name) continue;
    const [row] = await sql`
      INSERT INTO crm_waves (user_id, wave_key, name, start_on, end_on, objective, segments, target_contacts, anchor_event, success_metric, dependency)
      VALUES (${userId}, ${w.wave_id}, ${w.wave_name}, ${isoOrNull(w.start_date)}, ${isoOrNull(w.end_date)},
              ${w.primary_objective || null}, ${w.segments_in_play || null}, ${w.target_contacts || null},
              ${w.anchor_event || null}, ${w.success_metric || null}, ${w.dependency || null})
      ON CONFLICT (user_id, wave_key) DO UPDATE SET
        name = EXCLUDED.name, start_on = EXCLUDED.start_on, end_on = EXCLUDED.end_on,
        objective = EXCLUDED.objective, segments = EXCLUDED.segments,
        target_contacts = EXCLUDED.target_contacts, anchor_event = EXCLUDED.anchor_event,
        success_metric = EXCLUDED.success_metric, dependency = EXCLUDED.dependency,
        updated_at = NOW()
      RETURNING id
    `;
    waveIdByKey.set(w.wave_id, row.id);
    report.wavesLoaded++;
  }

  const templateIdByKey = new Map<string, number>();
  for (const t of templates) {
    if (!t.template_id || !t.body) continue;
    const [row] = await sql`
      INSERT INTO crm_templates (user_id, template_key, segment, channel, purpose, subject, body, cta, guardrails)
      VALUES (${userId}, ${t.template_id}, ${t.segment || null}, ${t.channel || null}, ${t.purpose || null},
              ${t.subject_line || null}, ${unescapeBody(t.body)}, ${t.cta || null}, ${t.guardrails || null})
      ON CONFLICT (user_id, template_key) DO UPDATE SET
        segment = EXCLUDED.segment, channel = EXCLUDED.channel, purpose = EXCLUDED.purpose,
        subject = EXCLUDED.subject, body = EXCLUDED.body, cta = EXCLUDED.cta,
        guardrails = EXCLUDED.guardrails, updated_at = NOW()
      RETURNING id
    `;
    templateIdByKey.set(t.template_id, row.id);
    report.templatesLoaded++;
  }

  const eventIdByKey = new Map<string, number>();
  for (const e of events) {
    if (!e.event_id || !e.event_name) continue;
    const [row] = await sql`
      INSERT INTO crm_events (user_id, event_key, name, date_text, on_date, location, registration_status, priority, target_records, objective, prep_deadline, notes)
      VALUES (${userId}, ${e.event_id}, ${e.event_name}, ${e.date || null},
              ${ISO_DATE.test(e.date || '') ? (e.date || '').slice(0, 10) : null},
              ${e.location || null}, ${e.registration_status || null}, ${e.priority || null},
              ${e.target_records || null}, ${e.objective || null}, ${e.prep_deadline || null}, ${e.notes || null})
      ON CONFLICT (user_id, event_key) DO UPDATE SET
        name = EXCLUDED.name, date_text = EXCLUDED.date_text, on_date = EXCLUDED.on_date,
        location = EXCLUDED.location, registration_status = EXCLUDED.registration_status,
        priority = EXCLUDED.priority, target_records = EXCLUDED.target_records,
        objective = EXCLUDED.objective, prep_deadline = EXCLUDED.prep_deadline,
        notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING id
    `;
    eventIdByKey.set(e.event_id, row.id);
    report.eventsLoaded++;
  }

  /* Resolution maps for target expressions — read back from the DB rather
     than carried in memory so a re-run (or a pre-120 seed) resolves the same. */
  const contactRows = await sql`
    SELECT c.id, c.account_id, c.source_key, c.unsubscribed_at,
           a.disqualified, a.segment
    FROM crm_contacts c JOIN crm_accounts a ON a.id = c.account_id
    WHERE a.user_id = ${userId}
  `;
  const accountRows = await sql`
    SELECT id, source_key, disqualified, segment FROM crm_accounts WHERE user_id = ${userId}
  `;
  const contactByKey = new Map<string, any>();
  for (const c of contactRows) if (c.source_key) contactByKey.set(c.source_key, c);
  const accountByKey = new Map<string, any>();
  for (const a of accountRows) if (a.source_key) accountByKey.set(a.source_key, a);
  const norm = (s: string | null) => (s || '').toUpperCase().replace(/\s+/g, '_');
  /* Exact match, or the selector as an UNDERSCORE-DELIMITED prefix — the
     plan writes "All CAPITAL records" meaning CAPITAL_EQUITY + CAPITAL_DEBT.
     The '_' guard keeps this mechanical: "CAPITAL" matches "CAPITAL_DEBT",
     never "CAPITALIZED_X"; free-text cohorts ("All W2 contacts met") still
     land in targetsUnmatched where a human can see them. */
  const segMatch = (data: string | null, seg: string) =>
    norm(data) === seg || norm(data).startsWith(seg + '_');
  const contactsBySegment = (seg: string) => contactRows.filter(c => segMatch(c.segment, seg));
  const accountsBySegment = (seg: string) => accountRows.filter(a => segMatch(a.segment, seg));

  for (const s of steps) {
    if (!s.step_id || !s.action) continue;
    const waveId = waveIdByKey.get(s.wave_id || '') ?? null;
    const templateId = templateIdByKey.get(s.template_id || '') ?? null;
    const weekOf = isoOrNull(s.week_of);
    const [stepRow] = await sql`
      INSERT INTO crm_sequence_steps (user_id, step_key, wave_id, week_of, action, channel, template_id, target_records, objective, owner, success_metric, notes)
      VALUES (${userId}, ${s.step_id}, ${waveId}, ${weekOf}, ${s.action}, ${s.channel || null},
              ${templateId}, ${s.target_records || null}, ${s.objective || null}, ${s.owner || null},
              ${s.success_metric || null}, ${s.notes || null})
      ON CONFLICT (user_id, step_key) DO UPDATE SET
        wave_id = EXCLUDED.wave_id, week_of = EXCLUDED.week_of, action = EXCLUDED.action,
        channel = EXCLUDED.channel, template_id = EXCLUDED.template_id,
        target_records = EXCLUDED.target_records, objective = EXCLUDED.objective,
        owner = EXCLUDED.owner, success_metric = EXCLUDED.success_metric,
        notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING id
    `;
    report.stepsLoaded++;

    /* ── expand target_records → touches ─────────────────────────────── */
    const dueOn = weekOf ?? waveStart[(s.wave_id || '').trim()] ?? null;
    type Target = { accountId: number | null; contactId: number | null; eventId: number | null };
    const targets: Target[] = [];
    const seen = new Set<string>();
    const push = (t: Target, excluded: boolean) => {
      const key = `${t.accountId ?? ''}·${t.contactId ?? ''}·${t.eventId ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (excluded) { report.touchesExcluded++; return; }
      targets.push(t);
    };
    const pushContact = (c: any) =>
      push({ accountId: c.account_id, contactId: c.id, eventId: null }, !!c.disqualified || !!c.unsubscribed_at);
    const pushAccount = (a: any) =>
      push({ accountId: a.id, contactId: null, eventId: null }, !!a.disqualified);
    const resolveId = (id: string): boolean => {
      if (eventIdByKey.has(id)) { push({ accountId: null, contactId: null, eventId: eventIdByKey.get(id)! }, false); return true; }
      if (contactByKey.has(id)) { pushContact(contactByKey.get(id)); return true; }
      if (accountByKey.has(id)) { pushAccount(accountByKey.get(id)); return true; }
      return false;
    };
    for (const sel of parseTargets(s.target_records)) {
      if (sel.kind === 'id') {
        if (!resolveId(sel.id)) report.targetsUnmatched.push(`${s.step_id}: ${sel.id}`);
      } else if (sel.kind === 'range') {
        const ids = expandRange(sel);
        if (!ids.length) { report.targetsUnmatched.push(`${s.step_id}: ${sel.prefix}-${sel.from}…${sel.to} (over cap)`); continue; }
        /* A plan range spans ids that were never issued (REF-001 through
           REF-015 when only 12 REF records exist) — missing members are the
           EXPECTED case inside a range, not an error, so only a range that
           matches NOTHING is reported. */
        const hit = ids.filter(resolveId);
        if (!hit.length) report.targetsUnmatched.push(`${s.step_id}: ${sel.prefix}-${sel.from}…${sel.to} (no matches)`);
      } else if (sel.kind === 'segment') {
        for (const seg of sel.segments) {
          const cs = contactsBySegment(seg);
          cs.forEach(pushContact);
          /* accounts in the segment with NO contact still get an
             account-level touch — the work exists even when the person is
             not yet named. */
          const withContacts = new Set(cs.map(c => c.account_id));
          accountsBySegment(seg).filter(a => !withContacts.has(a.id)).forEach(pushAccount);
          if (!cs.length && !accountsBySegment(seg).length) {
            report.targetsUnmatched.push(`${s.step_id}: All ${seg} records (segment empty)`);
          }
        }
      } else {
        report.targetsUnmatched.push(`${s.step_id}: ${sel.raw}`);
      }
    }
    for (const t of targets) {
      const [ins] = await sql`
        INSERT INTO crm_touches (user_id, step_id, account_id, contact_id, event_id, channel, template_id, due_on)
        VALUES (${userId}, ${stepRow.id}, ${t.accountId}, ${t.contactId}, ${t.eventId},
                ${s.channel || null}, ${templateId}, ${dueOn})
        ON CONFLICT (step_id, COALESCE(account_id, 0), COALESCE(contact_id, 0), COALESCE(event_id, 0))
        DO NOTHING
        RETURNING id
      `;
      if (ins) report.touchesQueued++;
    }
  }

  return report;
}

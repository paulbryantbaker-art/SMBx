import {
  DEFINITIVE_METHODOLOGY_URI,
  DEFINITIVE_METHODOLOGY_VERSION,
  DEFINITIVE_SPEC_URI,
  DEFINITIVE_SPEC_VERSION,
} from '../constants/definitive.js';
import { createDefinitiveHash } from './definitiveAuditPacket.js';
import { resolveDefinitiveMandateContext, type DefinitiveMandateContext } from './definitiveMandateService.js';

export const DEFINITIVE_CORPUS_GRANT_TYPE = 'anonymized_benchmark_observations';

export const DEFINITIVE_CORPUS_OBSERVATION_TYPES = [
  'nwc_peg',
  'add_back',
  'earnout',
  'rwi_policy',
  'indemnity',
  'escrow',
  'financing_terms',
  'valuation_multiple',
  'tax_structure',
  'legal_clause',
  'closing_condition',
  'diligence_finding',
] as const;

export type DefinitiveCorpusObservationType = typeof DEFINITIVE_CORPUS_OBSERVATION_TYPES[number];

export interface SanitizedCorpusObservation {
  sanitized: Record<string, any>;
  redactions: string[];
}

export interface CreateDataRightsGrantInput {
  userId: number;
  organizationId?: number | null;
  billingOrgId?: number | null;
  beneficialCustomerId?: number | null;
  grantType?: string;
  scope?: Record<string, any>;
  source?: string;
  sourceReference?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, any>;
}

export interface RecordCorpusObservationInput {
  userId: number;
  organizationId?: number | null;
  billingOrgId?: number | null;
  beneficialCustomerId?: number | null;
  dealId?: number | null;
  observationType: string;
  observation: Record<string, any>;
  anonymizationBucket?: Record<string, any>;
  sourceArtifactType?: string | null;
  sourceArtifactId?: string | number | null;
  sourceHash?: string | null;
  minReleaseCount?: number | null;
  metadata?: Record<string, any>;
  mandateContext?: DefinitiveMandateContext | null;
}

const PROHIBITED_KEY_PARTS = [
  'partyname',
  'buyername',
  'sellername',
  'companyname',
  'businessname',
  'legalname',
  'personname',
  'contactname',
  'customername',
  'employeename',
  'email',
  'phone',
  'address',
  'ein',
  'taxid',
  'ssn',
  'filename',
  'fileurl',
  'url',
  'rawtext',
  'sourcetext',
  'documenttext',
  'fulltext',
  'transcript',
  'verbatim',
];

const ALLOWED_BUCKET_KEYS = new Set([
  'industry',
  'sector',
  'subSector',
  'naicsCode',
  'geography',
  'region',
  'state',
  'dealSizeBand',
  'revenueBand',
  'ebitdaBand',
  'enterpriseValueBand',
  'league',
  'journey',
  'dealType',
  'year',
  'quarter',
]);

export function listDefinitiveCorpusObservationTypes() {
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    specUri: DEFINITIVE_SPEC_URI,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
    methodologyUri: DEFINITIVE_METHODOLOGY_URI,
    grantType: DEFINITIVE_CORPUS_GRANT_TYPE,
    observationTypes: DEFINITIVE_CORPUS_OBSERVATION_TYPES.map(type => ({
      type,
      structuredOnly: true,
      rawDocumentTextAllowed: false,
      partyIdentifiersAllowed: false,
      minimumReleaseCount: 10,
    })),
  };
}

export function sanitizeCorpusObservation(value: Record<string, any>): SanitizedCorpusObservation {
  const redactions: string[] = [];
  const sanitized = sanitizeRecord(value, redactions);
  return {
    sanitized,
    redactions: [...new Set(redactions)],
  };
}

export function sanitizeAnonymizationBucket(value: Record<string, any> = {}) {
  const bucket: Record<string, any> = {};
  for (const [key, raw] of Object.entries(value || {})) {
    if (!ALLOWED_BUCKET_KEYS.has(key)) continue;
    if (raw == null) continue;
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      bucket[key] = raw;
      continue;
    }
    const text = String(raw).trim();
    if (!text) continue;
    bucket[key] = text.length > 80 ? text.slice(0, 80) : text;
  }
  return bucket;
}

export async function readDefinitiveDataRightsState(input: {
  userId: number;
  organizationId?: number | null;
  billingOrgId?: number | null;
  beneficialCustomerId?: number | null;
}) {
  const context = await resolveContext(input);
  const sql = await getSql();
  const rows = await sql`
    SELECT id, grant_type, status, scope, source, source_reference, effective_at,
           expires_at, revoked_at, metadata, created_at, updated_at
    FROM definitive_data_rights_grants
    WHERE user_id = ${input.userId}
       OR (${context.beneficialCustomerId}::bigint IS NOT NULL AND beneficial_customer_id = ${context.beneficialCustomerId})
    ORDER BY created_at DESC
  `;
  return {
    specVersion: DEFINITIVE_SPEC_VERSION,
    grantType: DEFINITIVE_CORPUS_GRANT_TYPE,
    beneficialCustomerId: context.beneficialCustomerId,
    billingOrgId: context.billingOrgId,
    mandateChain: context.mandateChain,
    active: rows.some(row => isActiveBenchmarkGrant(row)),
    grants: rows.map(formatGrantRow),
  };
}

export async function createDefinitiveDataRightsGrant(input: CreateDataRightsGrantInput) {
  const context = await resolveContext(input);
  const sql = await getSql();
  const grantType = input.grantType || DEFINITIVE_CORPUS_GRANT_TYPE;
  const [row] = await sql`
    INSERT INTO definitive_data_rights_grants (
      user_id, organization_id, beneficial_customer_id, billing_org_id, grant_type,
      status, scope, source, source_reference, accepted_by_user_id, expires_at, metadata
    )
    VALUES (
      ${input.userId},
      ${input.organizationId ?? null},
      ${context.beneficialCustomerId},
      ${input.billingOrgId ?? context.billingOrgId ?? null},
      ${grantType},
      ${grantType === 'research_excluded' ? 'revoked' : 'active'},
      ${sql.json(input.scope || defaultGrantScope())}::jsonb,
      ${input.source || 'user'},
      ${input.sourceReference || null},
      ${input.userId},
      ${input.expiresAt || null},
      ${sql.json(input.metadata || {})}::jsonb
    )
    RETURNING id, grant_type, status, scope, source, source_reference, effective_at,
              expires_at, revoked_at, metadata, created_at, updated_at
  `;
  return {
    ok: true,
    grant: formatGrantRow(row),
    beneficialCustomerId: context.beneficialCustomerId,
    mandateChain: context.mandateChain,
  };
}

export async function revokeDefinitiveDataRightsGrant(input: { userId: number; grantId: number }) {
  const sql = await getSql();
  const [row] = await sql`
    UPDATE definitive_data_rights_grants
    SET status = 'revoked',
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE id = ${input.grantId}
      AND user_id = ${input.userId}
      AND status = 'active'
    RETURNING id, grant_type, status, scope, source, source_reference, effective_at,
              expires_at, revoked_at, metadata, created_at, updated_at
  `;
  if (!row) {
    return {
      ok: false,
      error: 'data_rights_grant_not_found',
      message: 'No active data-rights grant was found for this user and grant id.',
    };
  }
  return { ok: true, grant: formatGrantRow(row) };
}

export async function recordDefinitiveCorpusObservation(input: RecordCorpusObservationInput) {
  if (!isDefinitiveCorpusObservationType(input.observationType)) {
    return {
      ok: false,
      error: 'unsupported_observation_type',
      supportedObservationTypes: DEFINITIVE_CORPUS_OBSERVATION_TYPES,
    };
  }

  const context = input.mandateContext || await resolveContext(input);
  const sql = await getSql();
  const dealContext = input.dealId ? await readOwnedDealForBucket(sql, input.userId, Number(input.dealId)) : null;
  if (input.dealId && !dealContext) {
    return {
      ok: false,
      error: 'deal_not_found',
      message: 'The deal was not found for this user, so no corpus observation was recorded.',
    };
  }

  const grant = await readActiveBenchmarkGrant(sql, {
    userId: input.userId,
    beneficialCustomerId: input.beneficialCustomerId ?? context.beneficialCustomerId,
  });
  if (!grant) {
    return {
      ok: false,
      error: 'data_rights_required',
      tollgate: {
        code: 'data_rights_required',
        yuliaReadable: 'I can use this inside your workspace, but I cannot add it to the anonymized benchmark corpus until a data-rights grant exists.',
        requiredGrantType: DEFINITIVE_CORPUS_GRANT_TYPE,
        rawDocumentTextAllowed: false,
        partyIdentifiersAllowed: false,
      },
      mandateChain: context.mandateChain,
    };
  }

  const { sanitized, redactions } = sanitizeCorpusObservation(input.observation || {});
  if (!hasMeaningfulObservation(sanitized)) {
    return {
      ok: false,
      error: 'empty_structured_observation',
      message: 'The observation did not contain structured benchmark fields after identifiers and raw text were removed.',
      redactions,
    };
  }

  const anonymizationBucket = sanitizeAnonymizationBucket({
    ...dealBucket(dealContext),
    ...(input.anonymizationBucket || {}),
  });
  const minReleaseCount = Math.max(5, Number(input.minReleaseCount || 10));
  const sourceHash = input.sourceHash || createDefinitiveHash({
    sourceArtifactType: input.sourceArtifactType || null,
    sourceArtifactId: input.sourceArtifactId == null ? null : String(input.sourceArtifactId),
    dealId: input.dealId || null,
  });
  const observationHash = createDefinitiveHash({
    observationType: input.observationType,
    observation: sanitized,
    anonymizationBucket,
    sourceHash,
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  });
  const observationId = `OBS.${observationHash.slice(0, 18).toUpperCase()}`;

  const [row] = await sql`
    INSERT INTO definitive_corpus_observations (
      observation_id, user_id, organization_id, beneficial_customer_id, billing_org_id,
      deal_id, grant_id, observation_type, observation, anonymization_bucket,
      source_artifact_type, source_artifact_id, source_hash, observation_hash,
      spec_version, spec_uri, methodology_version, methodology_uri,
      eligibility_status, min_release_count, metadata
    )
    VALUES (
      ${observationId},
      ${input.userId},
      ${input.organizationId ?? null},
      ${context.beneficialCustomerId},
      ${input.billingOrgId ?? context.billingOrgId ?? null},
      ${input.dealId || null},
      ${Number(grant.id)},
      ${input.observationType},
      ${sql.json(sanitized)}::jsonb,
      ${sql.json(anonymizationBucket)}::jsonb,
      ${input.sourceArtifactType || null},
      ${input.sourceArtifactId == null ? null : String(input.sourceArtifactId)},
      ${sourceHash},
      ${observationHash},
      ${DEFINITIVE_SPEC_VERSION},
      ${DEFINITIVE_SPEC_URI},
      ${DEFINITIVE_METHODOLOGY_VERSION},
      ${DEFINITIVE_METHODOLOGY_URI},
      'eligible',
      ${minReleaseCount},
      ${sql.json({
        ...(input.metadata || {}),
        redactions,
        rawDocumentTextAllowed: false,
        partyIdentifiersAllowed: false,
      })}::jsonb
    )
    ON CONFLICT (observation_hash) DO UPDATE SET
      updated_at = NOW()
    RETURNING id, observation_id, observation_type, eligibility_status, observation_hash,
              anonymization_bucket, min_release_count, created_at, updated_at
  `;

  await upsertBenchmarkReleaseControl(sql, input.observationType, anonymizationBucket, minReleaseCount);

  return {
    ok: true,
    observation: formatObservationRow(row),
    redactions,
    sourceHash,
    mandateChain: context.mandateChain,
    releaseControl: {
      minReleaseCount,
      rawDocumentTextAllowed: false,
      partyIdentifiersAllowed: false,
    },
    specVersion: DEFINITIVE_SPEC_VERSION,
    methodologyVersion: DEFINITIVE_METHODOLOGY_VERSION,
  };
}

function isDefinitiveCorpusObservationType(value: string): value is DefinitiveCorpusObservationType {
  return (DEFINITIVE_CORPUS_OBSERVATION_TYPES as readonly string[]).includes(value);
}

function sanitizeRecord(value: unknown, redactions: string[], path = ''): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, any> = {};
  for (const [key, raw] of Object.entries(value as Record<string, any>)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (isProhibitedKey(key)) {
      redactions.push(nextPath);
      continue;
    }
    const sanitized = sanitizeValue(raw, redactions, nextPath);
    if (sanitized !== undefined) out[key] = sanitized;
  }
  return out;
}

function sanitizeValue(value: unknown, redactions: string[], path: string): any {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value
      .map((item, index) => sanitizeValue(item, redactions, `${path}[${index}]`))
      .filter(item => item !== undefined);
  }
  if (typeof value === 'object') return sanitizeRecord(value, redactions, path);
  const text = String(value).trim();
  if (!text) return '';
  if (text.length > 500) {
    redactions.push(`${path}:long_text`);
    return '[removed_long_text]';
  }
  let cleaned = text;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(cleaned)) {
    cleaned = cleaned.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted_email]');
    redactions.push(`${path}:email`);
  }
  if (/\+?\d[\d\s().-]{8,}\d/.test(cleaned)) {
    cleaned = cleaned.replace(/\+?\d[\d\s().-]{8,}\d/g, '[redacted_phone]');
    redactions.push(`${path}:phone`);
  }
  if (/https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.replace(/https?:\/\/\S+/gi, '[redacted_url]');
    redactions.push(`${path}:url`);
  }
  return cleaned;
}

function isProhibitedKey(key: string) {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  return PROHIBITED_KEY_PARTS.some(part => normalized.includes(part));
}

function hasMeaningfulObservation(value: Record<string, any>): boolean {
  return Object.values(value).some(item => {
    if (item == null) return false;
    if (typeof item === 'number' || typeof item === 'boolean') return true;
    if (typeof item === 'string') return item.trim() !== '' && item !== '[removed_long_text]';
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === 'object') return hasMeaningfulObservation(item as Record<string, any>);
    return false;
  });
}

function defaultGrantScope() {
  return {
    allowedObservationTypes: DEFINITIVE_CORPUS_OBSERVATION_TYPES,
    structuredOnly: true,
    rawDocumentTextAllowed: false,
    partyIdentifiersAllowed: false,
    minimumReleaseCount: 10,
  };
}

async function resolveContext(input: {
  userId: number;
  organizationId?: number | null;
  billingOrgId?: number | null;
  beneficialCustomerId?: number | null;
}) {
  if (input.beneficialCustomerId != null) {
    return {
      beneficialCustomerId: input.beneficialCustomerId,
      billingOrgId: input.billingOrgId ?? input.organizationId ?? null,
      mandateId: null,
      agentId: null,
      agentPlatformId: null,
      mandateChain: {
        spec: DEFINITIVE_SPEC_VERSION,
        principal: {
          userId: input.userId,
          beneficialCustomerId: input.beneficialCustomerId,
          organizationId: input.organizationId ?? null,
          billingOrgId: input.billingOrgId ?? input.organizationId ?? null,
        },
        agent: { agentId: null, agentPlatformId: null, sourceAgent: null },
        mandate: { mandateId: null, status: 'human_session', scope: [], requestedScopes: [], expiresAt: null, spendCapCredits: null },
        sourceSurface: 'definitive-corpus',
      },
    } as DefinitiveMandateContext;
  }
  return resolveDefinitiveMandateContext({
    userId: input.userId,
    organizationId: input.organizationId ?? null,
    billingOrgId: input.billingOrgId ?? null,
    sourceSurface: 'definitive-corpus',
    sourceAgent: 'definitive-corpus-service',
    requestedScopes: ['corpus:write', 'data-rights:read'],
  });
}

async function readActiveBenchmarkGrant(sql: any, input: { userId: number; beneficialCustomerId?: number | null }) {
  const [row] = await sql`
    SELECT id, grant_type, status, scope, expires_at
    FROM definitive_data_rights_grants
    WHERE grant_type = ${DEFINITIVE_CORPUS_GRANT_TYPE}
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (
        user_id = ${input.userId}
        OR (${input.beneficialCustomerId ?? null}::bigint IS NOT NULL AND beneficial_customer_id = ${input.beneficialCustomerId ?? null})
      )
    ORDER BY effective_at DESC
    LIMIT 1
  `;
  return row || null;
}

function isActiveBenchmarkGrant(row: any) {
  if (!row) return false;
  if (row.grant_type !== DEFINITIVE_CORPUS_GRANT_TYPE) return false;
  if (row.status !== 'active') return false;
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return false;
  return true;
}

async function readOwnedDealForBucket(sql: any, userId: number, dealId: number) {
  const [row] = await sql`
    SELECT id, journey_type, league, industry, financials, revenue, ebitda, sde
    FROM deals
    WHERE id = ${dealId}
      AND user_id = ${userId}
    LIMIT 1
  `;
  return row || null;
}

function dealBucket(deal: any) {
  if (!deal) return {};
  return {
    industry: deal.industry || undefined,
    league: deal.league || undefined,
    journey: deal.journey_type || undefined,
    revenueBand: centsBand(deal.revenue),
    ebitdaBand: centsBand(deal.ebitda || deal.sde),
  };
}

function centsBand(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const dollars = n / 100;
  if (dollars < 1_000_000) return '<$1M';
  if (dollars < 5_000_000) return '$1M-$5M';
  if (dollars < 10_000_000) return '$5M-$10M';
  if (dollars < 25_000_000) return '$10M-$25M';
  if (dollars < 50_000_000) return '$25M-$50M';
  if (dollars < 100_000_000) return '$50M-$100M';
  if (dollars < 250_000_000) return '$100M-$250M';
  return '$250M+';
}

async function upsertBenchmarkReleaseControl(sql: any, observationType: string, bucket: Record<string, any>, minReleaseCount: number) {
  const benchmarkKey = createDefinitiveHash({ observationType, bucket });
  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count
    FROM definitive_corpus_observations
    WHERE observation_type = ${observationType}
      AND eligibility_status = 'eligible'
      AND anonymization_bucket = ${sql.json(bucket)}::jsonb
  `;
  const eligibleCount = Number(count || 0);
  const status = eligibleCount >= minReleaseCount ? 'eligible' : 'withheld';
  await sql`
    INSERT INTO definitive_benchmark_release_controls (
      benchmark_key, observation_type, anonymization_bucket, eligible_observation_count,
      min_release_count, release_status, last_counted_at
    )
    VALUES (
      ${benchmarkKey},
      ${observationType},
      ${sql.json(bucket)}::jsonb,
      ${eligibleCount},
      ${minReleaseCount},
      ${status},
      NOW()
    )
    ON CONFLICT (benchmark_key) DO UPDATE SET
      eligible_observation_count = EXCLUDED.eligible_observation_count,
      min_release_count = EXCLUDED.min_release_count,
      release_status = EXCLUDED.release_status,
      last_counted_at = NOW(),
      updated_at = NOW()
  `;
}

function formatGrantRow(row: any) {
  return {
    id: Number(row.id),
    grantType: row.grant_type,
    status: row.status,
    scope: row.scope || {},
    source: row.source,
    sourceReference: row.source_reference,
    effectiveAt: toIso(row.effective_at),
    expiresAt: toIso(row.expires_at),
    revokedAt: toIso(row.revoked_at),
    metadata: row.metadata || {},
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function formatObservationRow(row: any) {
  return {
    id: Number(row.id),
    observationId: row.observation_id,
    observationType: row.observation_type,
    eligibilityStatus: row.eligibility_status,
    observationHash: row.observation_hash,
    anonymizationBucket: row.anonymization_bucket || {},
    minReleaseCount: Number(row.min_release_count || 10),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function toIso(value: unknown) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

async function getSql() {
  const db = await import('../db.js');
  return db.sql;
}

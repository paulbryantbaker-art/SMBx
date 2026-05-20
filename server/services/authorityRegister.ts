import { sql } from '../db.js';

export interface AuthorityRecord {
  authority_id: string;
  cite_tag: string | null;
  category: string;
  authority_type: string;
  jurisdiction: string;
  title: string;
  description: string;
  current_value: string | null;
  citation_text: string | null;
  source_name: string | null;
  source_url: string | null;
  publisher: string | null;
  effective_date: string | null;
  as_of_date: string | null;
  supersedes_authority_id: string | null;
  superseded_by_authority_id: string | null;
  status: string;
  validation_status: string;
  confidence: string | number;
  validated_at: string;
  next_check_due: string | null;
  aliases: unknown[];
  metadata: Record<string, unknown>;
}

export async function lookupAuthority(identifier: string): Promise<AuthorityRecord | null> {
  const key = identifier.trim();
  if (!key) return null;

  const [row] = await sql<AuthorityRecord[]>`
    SELECT
      authority_id,
      cite_tag,
      category,
      authority_type,
      jurisdiction,
      title,
      description,
      current_value,
      citation_text,
      source_name,
      source_url,
      publisher,
      effective_date,
      as_of_date,
      supersedes_authority_id,
      superseded_by_authority_id,
      status,
      validation_status,
      confidence,
      validated_at,
      next_check_due,
      aliases,
      metadata
    FROM authority_register
    WHERE authority_id = ${key}
       OR cite_tag = ${key}
    LIMIT 1
  `;

  return row || null;
}

export async function lookupAuthorities(identifiers: string[]): Promise<AuthorityRecord[]> {
  const keys = [...new Set(identifiers.map(value => value.trim()).filter(Boolean))];
  if (!keys.length) return [];

  return sql<AuthorityRecord[]>`
    SELECT
      authority_id,
      cite_tag,
      category,
      authority_type,
      jurisdiction,
      title,
      description,
      current_value,
      citation_text,
      source_name,
      source_url,
      publisher,
      effective_date,
      as_of_date,
      supersedes_authority_id,
      superseded_by_authority_id,
      status,
      validation_status,
      confidence,
      validated_at,
      next_check_due,
      aliases,
      metadata
    FROM authority_register
    WHERE status = 'active'
      AND (authority_id IN ${sql(keys)} OR cite_tag IN ${sql(keys)})
  `;
}

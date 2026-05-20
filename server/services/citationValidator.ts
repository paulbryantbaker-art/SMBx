import { sql } from '../db.js';
import { lookupAuthorities } from './authorityRegister.js';

export interface CitationValidation {
  tags: string[];
  active: string[];
  missing: string[];
  valid: boolean;
}

const CITATION_TAG_PATTERN = /\[[A-Za-z0-9 .:§/_-]+(?: - [A-Za-z0-9 .:§/_-]+)?\]/g;

export function extractCitationTags(text: string): string[] {
  const matches = text.match(CITATION_TAG_PATTERN) || [];
  return [...new Set(matches)];
}

export async function validateCitationTags(tags: string[]): Promise<CitationValidation> {
  const uniqueTags = [...new Set(tags)].filter(Boolean);
  if (!uniqueTags.length) {
    return { tags: [], active: [], missing: [], valid: true };
  }

  const rows = await sql<{ cite_tag: string }[]>`
    SELECT cite_tag
    FROM citation_registry
    WHERE status = 'active'
      AND cite_tag IN ${sql(uniqueTags)}
  `;
  const authorities = await lookupAuthorities(uniqueTags);
  const active = [
    ...rows.map(row => row.cite_tag),
    ...authorities.flatMap(row => [row.authority_id, row.cite_tag].filter(Boolean) as string[]),
  ];
  const activeSet = new Set(active);
  const missing = uniqueTags.filter(tag => !activeSet.has(tag));

  return {
    tags: uniqueTags,
    active,
    missing,
    valid: missing.length === 0,
  };
}

export async function validateCitationsInText(text: string): Promise<CitationValidation> {
  return validateCitationTags(extractCitationTags(text));
}

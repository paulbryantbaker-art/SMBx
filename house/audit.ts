/**
 * The citation audit — pure, no I/O, no database.
 *
 * Lives in `house/` for the same reason the deck grammar does: the app and a
 * local Claude Code session on Paul's MacBook must run the IDENTICAL check.
 * It used to sit in `server/services/researchLanes.ts`, which imports the
 * Postgres client at module load — so a local CLI could not touch it without
 * dragging a database along.
 *
 * The rules, in Paul's words (2026-07-24):
 *   "It needs to work correctly in all cases we cannot lose citation, and if
 *    we infer a value, we need to be able to explain our inferred value."
 *   "...they're both reported sources — we could say between 600 and 700
 *    million is X answer and cite both sources."
 *
 * So: every figure must appear in a source, or be registered in a Derivations
 * section with its working; every uploaded document must be acknowledged in
 * the Sources register; source URLs must survive; and conflicting sources keep
 * BOTH values — a range citing both endpoints passes, an invented midpoint
 * does not.
 */
export interface CitationAudit {
  ok: boolean;
  /* citations */
  hasSourceRegister: boolean;
  sourcesMissing: string[];
  sourceUrls: number; masterUrls: number;
  /** A CAPPED SAMPLE — read `urlsDroppedCount` for how many there really
   *  are. Found 2026-08-12: this array was sliced to 40 and the CLI printed
   *  the SLICE length, so a master dropping 490 source URLs reported
   *  "40 dropped". A guard that understates what it found is the same
   *  disease as a guard that cannot see. */
  urlsDropped: string[];
  urlsDroppedCount: number;
  /* figures */
  masterFigures: number;
  citedCount: number;
  hasDerivationRegister: boolean;
  derivedRegistered: string[];
  unexplained: string[];
  unexplainedCount: number;
  note: string;
}

/* A backtick, a comma and a semicolon cannot appear in a URL, and all three
   sit against one in prose — `https://x` and "see a, b, c". Found
   2026-08-12: five fire-safety URLs written inside code spans were read
   WITH the closing backtick, so they could never match the master's clean
   copy and reported as dropped forever. */
const URL_RE = /https?:\/\/[^\s)<>\]"'`,;]+/gi;
/** Money, percentages, multiples and magnitudes — the figures that carry a claim. */
// Suffixes ordered longest-first. Bare b/t/m matter: the reports write
// "$180B" as often as "$180 billion", and missing that flagged honest
// work as an unexplained inference. The trailing \b stops "$50 buyers"
// from reading as 50 billion.
//
// `%` IS OUTSIDE THAT \b, and it has to be (2026-08-11, found by verify-spec).
// `\b` is a boundary between a word character and a non-word character, and
// `%` is not a word character — so `%\b` only matches where a percent sign is
// followed by a letter or a digit. "63% of systems", "~60%.", "90%," and
// "74% recurring" all failed to match, which means THE AUDIT NEVER CHECKED A
// PERCENTAGE. Every percentage in every master audited clean by not being
// looked at, and the guarantee the whole practice rests on — "every figure is
// traceable" — silently excluded the most common figure type in this
// collateral. The word-character suffixes still carry their \b; `%` needs none,
// because it cannot run into the following word.
const FIG_RE = /\$?\d[\d,]*\.?\d*\s?(?:(?:billion|million|trillion|bn|mm|b|m|t|k|x)\b|%)|\$\d[\d,]*\.?\d*/gi;

/**
 * Expand ranges so a shared unit attaches to BOTH endpoints.
 *
 * Paul, 2026-07-24, on conflicting sources: "one source says it's 700 million,
 * the other says 600 million… we could say between 600 and 700 million and
 * cite both." Written naturally that is "between $600 and $700 million", where
 * $600 carries no unit of its own — so a naive extractor reads "$600", fails to
 * match the source's "$600 million", and flags honest work as an unexplained
 * inference. Normalising first makes both endpoints checkable.
 */
const expandRanges = (t: string) => t.replace(
  /(\$?\d[\d,]*\.?\d*)\s*(?:–|—|-|\bto\b|\band\b)\s*(\$?\d[\d,]*\.?\d*)(\s?)(billion|million|trillion|bn|mm|b|m|t|k)\b/gi,
  (_m, a, b, sp, unit) => `${a}${sp || ' '}${unit} to ${b}${sp || ' '}${unit}`);

const normUrl = (u: string) => u.replace(/[.,;]+$/, '').replace(/\/$/, '').toLowerCase();
const normFig = (f: string) => f.toLowerCase().replace(/,/g, '').replace(/\s+/g, '')
  .replace(/billion/, 'b').replace(/million/, 'm').replace(/trillion/, 't').replace(/bn/, 'b');

/**
 * Pull a markdown section by heading pattern, up to the next heading.
 *
 * Fixed 2026-08-11: this took the FIRST heading matching the pattern, so a body
 * heading like "## 8.7 Two method flags for whoever reproduces this" hijacked
 * the Sources register — /sources|references|method/i matched it, and every
 * source then reported as unacknowledged. The mirror case is worse: had the
 * hijacked section happened to contain the label words, a document with no
 * register at all would have PASSED. So a heading whose title *is* the register
 * wins over one that merely mentions the word; the loose match stays as the
 * fallback, which keeps every previously-working document working.
 */
function section(md: string, pattern: RegExp): string | null {
  const lines = md.split('\n');
  const isHeading = (l: string) => /^#{1,4}\s/.test(l) && pattern.test(l);
  // Prefer a heading that opens with the register's own name.
  const titular = /^#{1,4}\s*(sources|references|derivations?|derived figures?|assumptions?)\b/i;
  let i = lines.findIndex(l => isHeading(l) && titular.test(l));
  if (i < 0) i = lines.findIndex(isHeading);
  if (i < 0) return null;
  const level = (lines[i].match(/^#+/) || ['#'])[0].length;
  const out: string[] = [];
  for (let j = i + 1; j < lines.length; j++) {
    const m = lines[j].match(/^#+/);
    if (m && m[0].length <= level) break;
    out.push(lines[j]);
  }
  return out.join('\n');
}

/** Distinctive words from a source label, for checking it is acknowledged. */
const labelTokens = (label: string) =>
  label.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3 &&
    !['research', 'report', 'final', 'draft', 'deep', 'analysis', 'market', 'from', 'with', 'this', 'that'].includes(w));

export function auditCitations(
  masterMdIn: string,
  sourceTexts: string[],
  sourceLabels: string[] = [],
): CitationAudit {
  let masterMd = masterMdIn;
  const haystack = expandRanges(sourceTexts.join('\n'));
  masterMd = expandRanges(masterMd);

  /* citations ------------------------------------------------------------ */
  const srcUrls = new Set([...haystack.matchAll(URL_RE)].map(m => normUrl(m[0])));
  const mstUrls = new Set([...masterMd.matchAll(URL_RE)].map(m => normUrl(m[0])));
  const urlsDropped = [...srcUrls].filter(u => !mstUrls.has(u));

  const sourcesSection = section(masterMd, /sources|references|method/i);
  const hasSourceRegister = sourcesSection !== null;

  // A source counts as acknowledged only if it is named IN THE SOURCES
  // REGISTER — not merely because its topic words show up in the body. An
  // earlier version searched the whole document, so a label like "…commercial
  // mechanical" matched the title and a genuinely dropped source passed.
  const registerText = (sourcesSection || '').toLowerCase();
  const sourcesMissing = sourceLabels.filter(label => {
    const toks = labelTokens(label);
    if (!toks.length) return false;              // nothing distinctive to match on
    if (!hasSourceRegister) return true;         // no register at all → all missing
    return !toks.some(t => registerText.includes(t));
  });

  /* figures -------------------------------------------------------------- */
  const srcFigs = new Set([...haystack.matchAll(FIG_RE)].map(m => normFig(m[0])));

  const derivSection = section(masterMd, /derivation|derived figure|assumption/i);
  const hasDerivationRegister = derivSection !== null;
  const registered = new Set(
    derivSection ? [...derivSection.matchAll(FIG_RE)].map(m => normFig(m[0])) : []);

  const bodyMd = derivSection ? masterMd.replace(derivSection, '') : masterMd;
  const seen = new Set<string>();
  const derivedRegistered: string[] = [];
  const unexplained: string[] = [];
  let cited = 0;

  for (const m of bodyMd.matchAll(FIG_RE)) {
    const key = normFig(m[0]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (srcFigs.has(key)) { cited++; continue; }      // stated in a source
    if (registered.has(key)) { derivedRegistered.push(key); continue; }  // explained
    unexplained.push(key);                            // inferred, unexplained
  }

  const ok = unexplained.length === 0 && sourcesMissing.length === 0 && urlsDropped.length === 0;
  const note = ok
    ? `Clean: ${cited} cited, ${derivedRegistered.length} derived with stated working, every source acknowledged.`
    : [
        unexplained.length ? `${unexplained.length} figure(s) appear in no source and are not explained in a Derivations section — an inferred value must state its working: ${unexplained.slice(0, 6).join(', ')}.` : '',
        !hasDerivationRegister && unexplained.length ? 'The master has NO Derivations section at all.' : '',
        sourcesMissing.length ? `${sourcesMissing.length} uploaded document(s) are never acknowledged: ${sourcesMissing.slice(0, 4).join('; ')}.` : '',
        urlsDropped.length ? `${urlsDropped.length} source URL(s) did not carry through.` : '',
        !hasSourceRegister ? 'No Sources section.' : '',
      ].filter(Boolean).join(' ');

  return {
    ok,
    hasSourceRegister, sourcesMissing,
    sourceUrls: srcUrls.size, masterUrls: mstUrls.size,
    urlsDropped: urlsDropped.slice(0, 40), urlsDroppedCount: urlsDropped.length,
    masterFigures: seen.size, citedCount: cited,
    hasDerivationRegister,
    derivedRegistered: derivedRegistered.slice(0, 40),
    unexplained: unexplained.slice(0, 40),
    unexplainedCount: unexplained.length,
    note,
  };
}


/**
 * Which figures in `text` do not appear anywhere in `source`.
 *
 * The narrower half of the audit, for the one-way case: collateral derived
 * from a master document (Paul, 2026-07-25). The full audit asks a master to
 * account for its sources — a Sources register, surviving URLs, a Derivations
 * section. A carousel page is none of those things; the only rule that
 * survives the trip is the one that matters most: a number on the card must
 * be a number in the document.
 *
 * Same FIG_RE, same range expansion, same normalisation as the master audit,
 * deliberately — one notion of "a figure" in the codebase, and it is the one
 * with a test suite behind it.
 */
export function figuresNotIn(text: string, source: string): string[] {
  const have = new Set([...expandRanges(source).matchAll(FIG_RE)].map(m => normFig(m[0])));
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const m of expandRanges(text).matchAll(FIG_RE)) {
    const key = normFig(m[0]);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!have.has(key)) missing.push(m[0]);
  }
  return missing;
}


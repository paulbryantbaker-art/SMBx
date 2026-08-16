/**
 * house/linkedin.ts — PARSE A PASTED LINKEDIN PROFILE, PURE
 *
 * (2026-08-16, Paul, on bringing LI connections into the CRM: "LI
 * unffortuntely makes it very hard to share info" → "Yeah if you could view
 * the LinkedIn page?")
 *
 * THE APP CANNOT VIEW A LINKEDIN PAGE. Any server-side fetch of a profile
 * URL gets the authwall, not the profile — LinkedIn serves content only to a
 * logged-in browser, and working around that is scraping their terms
 * prohibit. What it CAN do is read what Paul, who is looking at the page,
 * copies from it. So the pipeline is: he selects the profile (top card or
 * the whole page), pastes it into the Add-a-person box, and this parser
 * proposes the fields. HE CONFIRMS BEFORE ANYTHING SAVES — the parse
 * prefills inputs, it never writes a row, so a wrong guess is caught by the
 * only person who was looking at the source.
 *
 * PURE HEURISTICS, NO MODEL. A CRM calls no model (THE SPLIT), and a pasted
 * top card has enough structure for string work: name, then headline, then
 * "location · Contact info". Everything the parse cannot find it NAMES in
 * `missing` rather than guessing — a fabricated CRM contact gets EMAILED
 * eventually, which is the worst kind of invented figure.
 *
 * PURE by house doctrine: no fetch, no db, no env, no clock.
 */

export interface ParsedProfile {
  name: string | null;
  /** The raw headline line ("Managing Partner at Cedar Ridge Capital"). */
  headline: string | null;
  /** Split out of the headline when it carries " at " / " @ ". */
  title: string | null;
  company: string | null;
  location: string | null;
  linkedinUrl: string | null;
  /** Fields the parse could NOT establish, named for the UI. */
  missing: string[];
}

/* Chrome lines a full-page copy drags along. Exact match after trimming,
   case-insensitive. Section headers (About, Experience, …) double as STOP
   markers: nothing below them is top-card material. */
const CHROME = new Set([
  'skip to main content', 'home', 'my network', 'jobs', 'messaging',
  'notifications', 'me', 'for business', 'advertise', 'try premium',
  'search', 'connect', 'message', 'follow', 'more', 'pending',
  'contact info', 'view in sales navigator', 'open to', 'add profile section',
  'enhance profile', 'resources', 'saved items',
]);

const STOP_SECTIONS = new Set([
  'about', 'activity', 'experience', 'education', 'skills', 'interests',
  'licenses & certifications', 'recommendations', 'highlights', 'people also viewed',
]);

/** "· 3rd", "1st", "2nd degree connection", "3rd+" — connection-degree noise,
 *  sometimes inline on the name ("Jane Smith · 3rd"). */
const DEGREE_RE = /\s*·?\s*\b(1st|2nd|3rd\+?)(\s+degree\s+connection)?\s*$/i;

const COUNTS_RE = /^\d[\d,+.]*\s*(connections?|followers?|mutual connections?)\b/i;

export function parseLinkedInPaste(text: string): ParsedProfile {
  const out: ParsedProfile = {
    name: null, headline: null, title: null, company: null,
    location: null, linkedinUrl: null, missing: [],
  };
  if (!text || !text.trim()) {
    out.missing = ['name', 'headline', 'location', 'linkedin url'];
    return out;
  }

  /* The URL can sit anywhere in the paste (address bar, contact-info block). */
  const urlMatch = text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%]+)/i);
  if (urlMatch) out.linkedinUrl = `https://www.linkedin.com/in/${urlMatch[1]}`;

  /* A browser-tab copy carries the strongest name signal there is:
     "(3) Jane Smith | LinkedIn". Take it when present. */
  const tabMatch = text.match(/^\s*(?:\(\d+\)\s*)?(.{2,60}?)\s*\|\s*LinkedIn\s*$/im);
  if (tabMatch) out.name = tabMatch[1].trim();

  /* Line pass: trim, drop chrome/noise, stop at the first section header,
     and collapse consecutive duplicates (the page renders the name twice —
     image alt then heading — and a copy keeps both). */
  const lines: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line) continue;
    const lower = line.toLowerCase();
    if (STOP_SECTIONS.has(lower)) break;
    if (CHROME.has(lower)) continue;
    if (COUNTS_RE.test(line)) continue;
    if (/^(1st|2nd|3rd\+?)$/i.test(line)) continue;
    line = line.replace(DEGREE_RE, '').trim();
    line = line.replace(/\s*·\s*contact info\s*$/i, '').trim();
    if (!line) continue;
    if (lines.length && lines[lines.length - 1] === line) continue;
    lines.push(line);
  }

  /* Name: the tab title won; otherwise the first surviving line that reads
     like a person (2–5 words, no digits, sane length). If the tab title
     found it, its position anchors headline/location below. */
  let nameIdx = -1;
  if (out.name) {
    nameIdx = lines.findIndex(l => l === out.name);
  } else {
    nameIdx = lines.findIndex(l =>
      !/\d/.test(l) && l.length <= 60 && l.split(/\s+/).length >= 2 && l.split(/\s+/).length <= 5,
    );
    if (nameIdx >= 0) out.name = lines[nameIdx];
  }

  /* Headline = the line after the name; location = the line after that when
     it reads like a place (contains a comma or "Area"). */
  if (nameIdx >= 0 && lines[nameIdx + 1]) out.headline = lines[nameIdx + 1];
  const locCandidate = nameIdx >= 0 ? lines[nameIdx + 2] : undefined;
  if (locCandidate && (/,/.test(locCandidate) || /\barea\b/i.test(locCandidate)) && locCandidate.length <= 80) {
    out.location = locCandidate;
  }

  /* Title/company out of the headline — only on an explicit joiner, never by
     guessing which noun is the firm. */
  if (out.headline) {
    const m = out.headline.match(/^(.{2,80}?)\s+(?:at|@)\s+(.{2,80})$/);
    if (m) { out.title = m[1].trim(); out.company = m[2].trim(); }
    else out.title = out.headline;
  }

  if (!out.name) out.missing.push('name');
  if (!out.headline) out.missing.push('headline');
  if (!out.location) out.missing.push('location');
  if (!out.linkedinUrl) out.missing.push('linkedin url');
  return out;
}

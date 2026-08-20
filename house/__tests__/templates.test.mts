/**
 * THE TEMPLATE REGISTER — does it describe things that exist?
 *
 * `shared/templates.ts` is the vocabulary that crosses the app↔studio boundary:
 * Paul picks an id in the app, the server validates it, `pull-queue.mjs` prints
 * its renderer and flag, and a Cowork session runs that command. Every link in
 * that chain trusts the register, and nothing else checks it.
 *
 * THIS REPO HAS SHIPPED THAT EXACT DEFECT TWICE and both times it read as
 * enforced while enforcing nothing:
 *
 *   • studio/CLAUDE.md named `verify-spec.mts` for two days before the script
 *     existed — "worse than naming nothing: the rule read as enforced and
 *     nothing was enforcing it."
 *   • `figure-card-monolith` and `figure-card-portal` sat at `status: 'pending'`
 *     with the hint "no builder renders this today; do not hand-roll" for two
 *     days AFTER the figure layout became the one-pager default. A session
 *     reading that would have refused work the builder does by default.
 *
 * So: every renderer must be a file on disk, and every live template must name
 * a real one. A `pending` flag is a claim about a builder and is checkable too.
 *
 * Run: npm run test:templates — pure, no database, no network.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATES, TEMPLATE_IDS, templatesFor, templatesForKind, templateForKind, templateById } from '../../shared/templates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPTS = path.join(ROOT, 'scripts', 'studio');

let pass = 0, total = 0;
const T = (name: string, got: any, want: any) => {
  total++;
  const ok = typeof want === 'function' ? want(got) : JSON.stringify(got) === JSON.stringify(want);
  pass += ok ? 1 : 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '}${name.padEnd(60)} ${typeof got === 'object' ? JSON.stringify(got).slice(0, 66) : String(got).slice(0, 66)}`);
};

console.log('\nEVERY RENDERER IS A FILE ON DISK');
const missing = [...new Set(TEMPLATES.map(t => t.renderer))].filter(r => !existsSync(path.join(SCRIPTS, r)));
T('no template names a builder that is not there', missing, []);
T('…and the register is not empty', TEMPLATES.length > 0, true);

console.log('\nTHE SHAPE HOLDS');
T('ids are unique', TEMPLATES.length, TEMPLATE_IDS.size);
T('every `for` is text or document', TEMPLATES.every(t => t.for === 'text' || t.for === 'document'), true);
T('every status is live or pending', TEMPLATES.every(t => t.status === 'live' || t.status === 'pending'), true);
T('every template carries a label, a desc and a hint', TEMPLATES.every(t => !!t.label?.trim() && !!t.desc?.trim() && !!t.hint?.trim()), true);
T('templateById finds one, and misses cleanly', `${templateById('house-deck')?.renderer} ${templateById('nope')}`, 'build-deck.mts null');

console.log('\nRETIRED MEANS UNPICKABLE, NOT DELETED');
/* The offer document was folded into Portal (2026-08-20); the card deck's
   BUILD.txt: "Paul removed the one-offs and folded the offer document into
   Portal. Do not reinstate either." A row may still name the old id, so the
   entry stays readable and only stops being OFFERED. */
T('offer-docs-light is still in the register', !!templateById('offer-docs-light'), true);
T('…and is retired', templateById('offer-docs-light')?.retired, true);
T('…so no picker offers it', [...templatesFor('text'), ...templatesFor('document')].some(t => t.id === 'offer-docs-light'), false);

console.log('\nTHE MEDIUM MAPS TO A RENDERER FAMILY, IN ONE PLACE');
/* The bug this function exists for: the picker offered a `text` template on an
   `image` slot (a single-image post is exactly what those render) while the
   server compared `t.for` to the KIND and threw on Save. */
T('text  → text', templateForKind('text'), 'text');
T('image → text (a single-image post IS what those render)', templateForKind('image'), 'text');
T('document → document', templateForKind('document'), 'document');
T('video → nothing renders a piece to camera', templateForKind('video'), null);
T('an unknown kind offers nothing rather than guessing', templateForKind('podcast'), null);
T('a video slot is offered no templates at all', templatesForKind('video').length, 0);
T('an image slot is offered the one-page family', templatesForKind('image').every(t => t.for === 'text'), true);

console.log("\nPAUL'S FIVE ARE ALL PICKABLE (studio/TEMPLATES.md)");
/* His menu is Carousel · One page · Monolith · Portal · Report, where Monolith
   and Portal are LOOKS that arrive at either length. Report was missing from
   this register entirely until 2026-08-20 — live in the studio since 08-15 and
   the one of the five the app could not offer. */
const offered = [...templatesFor('text'), ...templatesFor('document')];
const labelled = (word: string) => offered.some(t => new RegExp(word, 'i').test(t.label));
for (const word of ['Carousel', 'One page', 'Monolith', 'Portal', 'Report']) {
  T(`"${word}" is on the menu`, labelled(word), true);
}
T('Monolith comes at BOTH lengths', offered.filter(t => /monolith/i.test(t.label)).map(t => t.for).sort(), ['document', 'text']);
T('Portal comes at BOTH lengths', offered.filter(t => /portal/i.test(t.label)).map(t => t.for).sort(), ['document', 'text']);
T('Report is a document and renders with build-report.mts', `${templateById('report')?.for} ${templateById('report')?.renderer}`, 'document build-report.mts');

console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);

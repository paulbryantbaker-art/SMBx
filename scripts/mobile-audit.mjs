/**
 * mobile-audit — an ADVERSARIAL pass over every public page at phone width.
 *
 * Exists because of 2026-08-08: the first mobile layer fixed what a handful of
 * screenshots happened to show, and Paul's reply was the right one — "I can't
 * take a picture of everything that looks awful." A screenshot only reports the
 * strip you photographed, and only the defect you happened to notice. This
 * looks at every element on every route and hunts specific, named failure
 * classes, so the report is a work list rather than a vibe.
 *
 * What it hunts (each is a real defect seen on this site, not a generic lint):
 *
 *   BLEED     an element whose box runs past the right edge, ignoring anything
 *             an ancestor clips or scrolls (the marquee and the report's wide
 *             registers are deliberate and must not be reported).
 *   GRID      a multi-column grid still standing at phone width. THE headline
 *             defect: three-column cards at 390px is what "looks awful" means.
 *   RAGGED    a text box so narrow the copy breaks to one or two words a line.
 *             This is the symptom a reader actually feels, and it survives
 *             every overflow check because nothing overflows.
 *   SHORTLINE a paragraph whose LINES are wildly uneven — a non-final line
 *             under 62% of the widest. RAGGED measures the box; this measures
 *             the rendered line boxes, which is the only way to see a &nbsp;
 *             gluing a long token and stranding the line before it.
 *   TINY      customer-facing text under Paul's 13px floor.
 *   TAP       an interactive target under 44x44.
 *   CLIP      text cut off inside a box that cannot scroll.
 *   COLLIDE   two text boxes overlapping that are not ancestor/descendant.
 *   VOID      a run of empty vertical space tall enough to read as a hole.
 *
 * Usage:
 *   npm run shoot:mobile                     # audit + strips, 390x844
 *   node scripts/mobile-audit.mjs --strips 0 # report only, much faster
 *   node scripts/mobile-audit.mjs --w 430 --h 932
 *   node scripts/mobile-audit.mjs --only landing
 *
 * Exit code 1 if any defect is found, so this can gate a commit.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const W = Number(arg('w', 390));
const H = Number(arg('h', 844));
const OUT = arg('out', 'mobile-shots');
const STRIPS = arg('strips', '1') !== '0';
const ONLY = arg('only', '');
const MAX_STRIPS = Number(arg('maxstrips', 26));

const ROUTES = [
  ['/', 'landing'],
  ['/about', 'about'],
  ['/industries', 'industries'],
  ['/track-record', 'track-record'],
  ['/research', 'research'],
  ['/research/home-services', 'report-home-services'],
  ['/research/commercial-mep', 'report-commercial-mep'],
  ['/research/dfw-home-services', 'report-dfw'],
  ['/buyers/family-offices', 'seg-family-offices'],
  ['/buyers/independent-sponsors', 'seg-independent-sponsors'],
  ['/buyers/pe-firms', 'seg-pe-firms'],
  ['/buyers/searchers', 'seg-searchers'],
  ['/buyers/operators', 'seg-operators'],
  ['/legal/privacy', 'legal-privacy'],
  ['/legal/terms', 'legal-terms'],
].filter(([, n]) => !ONLY || n.includes(ONLY));

const ROOT = path.resolve('dist/client');
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('dist/client/index.html not found — run `npx vite build` first.');
  process.exit(1);
}

function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const pw = '/opt/pw-browsers';
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw)) {
      const p = path.join(pw, d, 'chrome-linux', 'chrome');
      if (d.startsWith('chromium-') && fs.existsSync(p)) return p;
    }
  }
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(mac)) return mac;
  console.error('No Chromium found — set PUPPETEER_EXECUTABLE_PATH.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf',
};
const srv = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, r));
const port = srv.address().port;

const browser = await puppeteer.launch({ executablePath: findChrome(), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

fs.mkdirSync(OUT, { recursive: true });
const report = [];

for (const [route, name] of ROUTES) {
  await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  // Walk the page once so lazy images and data-rv reveals fire — a no-scroll
  // capture photographs them blank and audits them as zero-size.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1100));

  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    const seen = new Set();
    const push = (kind, el, detail) => {
      const id = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
      const attrs = [...el.attributes].map(a => a.name).filter(n => n.startsWith('data-') && n !== 'data-rv' && n !== 'data-hs');
      const y = Math.round(el.getBoundingClientRect().top + window.scrollY);
      out.push({ kind, id: id + (attrs.length ? `[${attrs.join(',')}]` : ''), y, detail, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 54) });
    };
    // A closed <details> still reports a laid-out box for its content in
    // Chromium (the slot is content-visibility:hidden, but the child answers
    // getBoundingClientRect with a real size). Without this the why-us
    // evidence panels read as eight collisions on a page that renders
    // perfectly — the tool must not invent work.
    const inClosedDetails = el => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (a.tagName === 'DETAILS' && !a.open && !el.closest('summary')) return true;
      }
      return false;
    };
    const vis = el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      return !inClosedDetails(el);
    };
    const clippedByAncestor = el => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ax = getComputedStyle(a).overflowX;
        if (ax === 'hidden' || ax === 'clip' || ax === 'auto' || ax === 'scroll') return true;
      }
      return false;
    };
    // Own text = text this element renders itself, not via element children.
    const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();

    const all = [...document.querySelectorAll('body *')];

    for (const el of all) {
      if (!vis(el)) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fixed = cs.position === 'fixed';

      // ── BLEED ────────────────────────────────────────────────────────────
      if (!fixed && Math.round(r.right - vw) > 1 && !clippedByAncestor(el)) {
        let dup = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (seen.has(a)) { dup = true; break; }
        if (!dup) { seen.add(el); push('BLEED', el, `+${Math.round(r.right - vw)}px past the edge (w ${Math.round(r.width)})`); }
      }

      // ── GRID: a multi-column grid still standing at phone width ──────────
      if (cs.display === 'grid') {
        const tracks = cs.gridTemplateColumns.split(' ').filter(Boolean).map(parseFloat).filter(n => !isNaN(n));
        // A narrow track is only a defect if it is meant to hold PROSE. Index
        // gutters and icon rails are deliberately tiny — `30px 1fr` on the
        // numbered rows is the fix, not the bug — so anything under 60px is
        // read as a gutter and the check runs on the content tracks only.
        const content = tracks.filter(t => t >= 60);
        if (content.length >= 2) {
          const narrowest = Math.min(...content);
          // Under ~165px a cell cannot hold a sentence, which is the actual
          // failure a reader sees: three-column cards at 390px. But the
          // question is "can it hold a SENTENCE", so a grid whose cells carry
          // no prose is exempt — the proof band's 2×2 of numerals reads
          // perfectly at 158px on a 360px screen, and stacking it would make
          // a four-screen band out of a one-screen one.
          const carriesProse = [...el.querySelectorAll('*')].some(d =>
            [...d.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().length > 70);
          if (narrowest < 165 && carriesProse) push('GRID', el, `${content.length} content columns, narrowest ${Math.round(narrowest)}px — ${cs.gridTemplateColumns}`);
        }
      }

      // ── RAGGED: prose in a column too narrow to read ─────────────────────
      const t = ownText(el);
      // Cells inside a register that scrolls sideways are MEANT to be narrow —
      // the table is wider than the phone and the reader pans it. 69 table
      // cells on one report is noise that buries the one real ragged column.
      if (t.length > 70 && !fixed && !clippedByAncestor(el)) {
        const fsz = parseFloat(cs.fontSize) || 16;
        // ~0.5em average glyph advance; under ~22 characters a line the copy
        // breaks to two or three words and reads as a broken column.
        const chars = r.width / (fsz * 0.5);
        if (chars < 22) push('RAGGED', el, `${Math.round(r.width)}px wide at ${fsz}px — about ${Math.round(chars)} characters a line`);
      }

      // ── SHORTLINE: a paragraph whose lines are wildly uneven ─────────────
      // Added 2026-08-09, after Paul circled the phone hero's lede: line one
      // ended at "Whether your 1st or your" and line two ran full width. It
      // reads as truncated, and RAGGED could never see it — RAGGED measures
      // the BOX, and this box is full width. The defect is in the rendered
      // LINES, so this measures them: a Range over the element's own text
      // answers getClientRects() with one rect per line box.
      //
      // Cause, in the case that prompted it: a &nbsp; gluing "100th
      // acquisition" into one 18-character token that could not fit after
      // "Whether your 1st or your", so the whole token wrapped and left the
      // first line 57% full. Non-breaking spaces are the usual culprit, and
      // they are invisible in a diff.
      //
      // Only NON-FINAL lines count (a short last line is normal typesetting),
      // only boxes ≥200px wide (narrower is RAGGED's job), and elements
      // containing <br> are skipped because those breaks are deliberate.
      // Only elements whose content is entirely INLINE: with a block-level
      // descendant the rects below span several blocks, not lines. And the
      // walk must cover EVERY descendant text node, not just direct children
      // — the first version walked direct children only, so any paragraph
      // carrying a <strong> reported the fragments either side of it as
      // separate "lines" and cried wolf 197 times on one report page. A line
      // is a row of rects sharing a top, whoever owns the text.
      // An INLINE element (a <strong> mid-paragraph) starts and ends wherever
      // the parent's text left off, so its first and last rects are fragments
      // of the parent's lines. Measuring them as lines flagged 28 report-body
      // spans that render perfectly — the same reason COLLIDE excludes inline.
      // The parent block gets measured on its own pass anyway.
      if (t.length > 70 && !fixed && r.width >= 200
          && cs.display !== 'inline' && cs.display !== 'contents'
          && !el.querySelector('br, p, div, ul, ol, li, h1, h2, h3, h4, h5, table, section, figure, blockquote')) {
        const lines = [];
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (!n.textContent.trim()) continue;
          const rg = document.createRange();
          rg.selectNodeContents(n);
          for (const lr of rg.getClientRects()) {
            if (lr.width < 1) continue;
            const hit = lines.find(l => Math.abs(l.top - lr.top) < 4);
            if (hit) { hit.left = Math.min(hit.left, lr.left); hit.right = Math.max(hit.right, lr.right); }
            else lines.push({ top: lr.top, left: lr.left, right: lr.right });
          }
        }
        if (lines.length > 1) {
          lines.sort((a, b) => a.top - b.top);
          const widest = Math.max(...lines.map(l => l.right - l.left));
          for (let i = 0; i < lines.length - 1; i++) {
            const w = lines[i].right - lines[i].left;
            if (widest > 0 && w / widest < 0.62) {
              push('SHORTLINE', el, `line ${i + 1} of ${lines.length} fills ${Math.round((w / widest) * 100)}% — check for a non-breaking space`);
              break;
            }
          }
        }
      }

      // ── SQUEEZE: a form field crushed by a sibling that won't wrap ───────
      // Added after the pricing band shipped with a 145px email field that
      // could show "you@" and nothing more. No other check could see it: an
      // input has no text content, so RAGGED skips it, and nothing overflows.
      if (/^(input|select|textarea)$/i.test(el.tagName) && el.type !== 'hidden' && el.type !== 'checkbox' && el.type !== 'radio'
          // A readOnly field is a doorway, not a field — the phone hero bar is
          // readOnly precisely so tapping it opens the sheet instead of a
          // keyboard, and it only ever has to show its own placeholder.
          && !el.readOnly) {
        if (r.width < 200) push('SQUEEZE', el, `field only ${Math.round(r.width)}px wide (placeholder "${el.placeholder || ''}")`);
      }

      // ── TINY: under the 13px customer-facing floor ───────────────────────
      if (t.length > 3) {
        const fsz = parseFloat(cs.fontSize);
        if (fsz && fsz < 12.5) push('TINY', el, `${fsz}px`);
      }

      // ── TAP: interactive target under 44x44 ──────────────────────────────
      if (/^(a|button)$/i.test(el.tagName) && (el.getAttribute('href') || el.tagName === 'BUTTON')) {
        // Inline links inside a paragraph are exempt — they are prose, not
        // controls, and padding them would wreck the line box.
        const inProse = el.parentElement && /^(p|li|span|td|em|strong)$/i.test(el.parentElement.tagName);
        // Round before comparing: a 43.98px box is a 44px target, and
        // reporting 69 of them as failures hides the ones that are really 22.
        const hh = Math.round(r.height), ww = Math.round(r.width);
        if (!inProse && (hh < 44 || ww < 44) && hh > 0) push('TAP', el, `${ww}x${hh}`);
      }

      // ── CLIP: text cut off in a box that cannot scroll ───────────────────
      if (t.length > 0 && cs.overflowX === 'hidden' && el.scrollWidth - el.clientWidth > 2) {
        push('CLIP', el, `${el.scrollWidth - el.clientWidth}px of text cut off`);
      }
    }

    // ── COLLIDE: two text boxes overlapping, neither containing the other ──
    // Inline boxes are excluded: an <em> or <strong> that wraps across two
    // lines reports a rect spanning BOTH full lines, so it legitimately
    // overlaps every sibling inline on those lines. On a long report that is
    // a dozen phantom collisions inside perfectly set prose.
    const texts = all.filter(el => vis(el) && ownText(el).length > 2
        && !/^(inline|contents)$/.test(getComputedStyle(el).display)
        && getComputedStyle(el).position !== 'fixed')
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(o => o.r.width > 8 && o.r.height > 8);
    const overlaps = [];
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 6 && oy > 6) overlaps.push({ a, b, area: Math.round(ox * oy) });
      }
    }
    for (const o of overlaps.sort((x, y) => y.area - x.area).slice(0, 8)) {
      push('COLLIDE', o.a.el, `overlaps "${(o.b.el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)}" by ${o.area}px²`);
    }

    // ── SAMEDEST: several DIFFERENTLY-LABELLED links sharing one destination.
    //    Added 2026-08-08 after Paul: "if I click on any of these I go to book
    //    a call instead." All five who-index cards carried href="#cta", so
    //    five distinct promises landed on the same booking card — the exact
    //    failure the 2026-08-02 lesson already named for the nav dropdown
    //    ("five labels, one destination reads as broken") and which nothing
    //    was watching for anywhere else. Repeated IDENTICAL labels are fine
    //    and common (three "Book a call" buttons is one promise offered three
    //    times), so this counts DISTINCT labels only.
    const byHref = new Map();
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!href || href === '#' || /^(mailto|tel):/.test(href)) continue;
      // Normalise before counting: the same promise appears in the nav, the
      // burger menu and the footer as "Research", "Research →" and
      // "RESEARCH". Three renderings of one link is chrome, not a defect —
      // counting them raw made the check fire on every page and would have
      // trained us to ignore it.
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase()
        .replace(/[\s→›»…\-–—]+$/u, '').slice(0, 40);
      if (!label) continue;
      if (!byHref.has(href)) byHref.set(href, new Set());
      byHref.get(href).add(label);
    }
    for (const [href, labels] of byHref) {
      if (labels.size >= 3) {
        const a = document.querySelector(`a[href="${CSS.escape(href)}"]`);
        if (a) push('SAMEDEST', a, `${labels.size} differently-labelled links all go to ${href} — ${[...labels].slice(0, 3).map(l => `"${l}"`).join(', ')}…`);
      }
    }

    return {
      vw, scrollW: document.documentElement.scrollWidth, docH: document.body.scrollHeight,
      findings: out,
    };
  });

  // ── VOID: a tall run of empty page. Sampled rather than computed, because
  //    "is anything painted here" is a rendering question, not a DOM one.
  const voids = await page.evaluate((vh) => {
    const holes = [];
    const step = 40;
    const w = document.documentElement.clientWidth;
    let runStart = null;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      let painted = false;
      for (const x of [w * 0.15, w * 0.5, w * 0.85]) {
        const el = document.elementFromPoint(x, y - window.scrollY);
        if (el && el !== document.body && el !== document.documentElement) {
          const t = (el.textContent || '').trim();
          if (t || /^(img|svg|video|canvas)$/i.test(el.tagName)) { painted = true; break; }
        }
      }
      if (!painted) { if (runStart === null) runStart = y; }
      else { if (runStart !== null && y - runStart > vh * 0.85) holes.push([runStart, y]); runStart = null; }
      if (y % (step * 12) === 0) window.scrollTo(0, y);
    }
    window.scrollTo(0, 0);
    return holes.slice(0, 6);
  }, H);
  for (const [a, b] of voids) info.findings.push({ kind: 'VOID', id: '(page)', y: a, detail: `${b - a}px of empty page`, text: '' });

  report.push({ route, name, ...info });

  if (STRIPS) {
    const n = Math.min(MAX_STRIPS, Math.ceil(info.docH / H));
    for (let i = 0; i < n; i++) {
      await page.evaluate(y => window.scrollTo(0, y), i * H);
      await new Promise(r => setTimeout(r, 220));
      await page.screenshot({ path: path.join(OUT, `${name}-${String(i).padStart(2, '0')}.png`) });
    }
  }
}

// EVERY KIND push() CAN EMIT MUST BE LISTED HERE. The reporter iterates this
// array, so an unlisted kind is counted in the total and then silently
// dropped from the printout — a new check appears to find nothing. That cost
// a debugging round when SHORTLINE was added (it was firing the whole time).
const ORDER = ['BLEED', 'GRID', 'RAGGED', 'SHORTLINE', 'SQUEEZE', 'SAMEDEST', 'COLLIDE', 'CLIP', 'VOID', 'TAP', 'TINY'];
{
  // Fail loudly rather than under-report if a kind is emitted but unlisted.
  const emitted = new Set(report.flatMap(r => r.findings.map(f => f.kind)));
  const orphan = [...emitted].filter(k => !ORDER.includes(k));
  if (orphan.length) { console.error(`\nAUDIT BUG: kind(s) not in ORDER, would be hidden: ${orphan.join(', ')}`); process.exit(2); }
}
let total = 0;
console.log(`\n════ ADVERSARIAL MOBILE AUDIT @ ${W}×${H} ════`);
for (const r of report) {
  const byKind = {};
  for (const f of r.findings) (byKind[f.kind] ||= []).push(f);
  const n = r.findings.length;
  total += n;
  const bleed = r.scrollW - r.vw;
  console.log(`\n── ${r.route}  (${r.docH}px tall, ${n} finding${n === 1 ? '' : 's'})${bleed > 0 ? `  ⚠ PAGE SCROLLS SIDEWAYS ${bleed}px` : ''}`);
  for (const k of ORDER) {
    const list = byKind[k];
    if (!list) continue;
    console.log(`   ${k} × ${list.length}`);
    for (const f of list.slice(0, 8)) {
      console.log(`     y=${String(f.y).padStart(6)}  ${f.id}`);
      console.log(`               ${f.detail}${f.text ? `   “${f.text}”` : ''}`);
    }
    if (list.length > 8) console.log(`     … and ${list.length - 8} more`);
  }
  if (!n) console.log('   clean');
}
console.log(`\n════ ${total} finding(s) across ${report.length} route(s) ════`);
if (STRIPS) console.log(`Strips → ${OUT}/`);

await browser.close();
srv.close();
process.exit(total ? 1 : 0);

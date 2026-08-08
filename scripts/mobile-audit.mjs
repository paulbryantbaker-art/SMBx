/**
 * mobile-audit — render every public page at phone width and report what
 * actually breaks, rather than guessing from CSS.
 *
 * Two outputs per route:
 *   1. An OVERFLOW REPORT — document.scrollWidth vs viewport, plus the
 *      specific elements whose box extends past the right edge. This is the
 *      thing a screenshot makes you hunt for.
 *   2. Viewport-sized strips down the page, so the layout can be looked at.
 *
 *   node mobile-audit.mjs [--w 390] [--h 844] [--out dir] [--strips 1]
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

const ROUTES = [
  ['/', 'landing'],
  ['/about', 'about'],
  ['/industries', 'industries'],
  ['/research', 'research'],
  ['/track-record', 'track-record'],
].filter(([, n]) => !ONLY || n === ONLY);

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
  '.ico': 'image/x-icon',
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
  // Walk the whole page once so lazy images + data-rv reveals fire, then
  // return to the top — a no-scroll capture photographs them blank.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1200));

  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const over = Math.round(r.right - vw);
      if (over <= 1) continue;
      // Report the OUTERMOST offender only — children inherit the overflow.
      let anc = el.parentElement, dup = false;
      while (anc && anc !== document.body) { if (seen.has(anc)) { dup = true; break; } anc = anc.parentElement; }
      if (dup) continue;
      seen.add(el);
      const id = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
      const attrs = [...el.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(',');
      const path = [];
      for (let a = el.parentElement; a && a !== document.body && path.length < 4; a = a.parentElement) {
        path.unshift(`${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${[...a.attributes].map(x => x.name).filter(n => n.startsWith('data-')).map(n => `[${n}]`).join('')}`);
      }
      bad.push({ id, attrs, over, w: Math.round(r.width), path: path.join(' > '), text: (el.textContent || '').trim().slice(0, 46) });
    }
    // Long unbreakable strings are the other phone killer.
    return {
      vw, scrollW: document.documentElement.scrollWidth, docH: document.body.scrollHeight,
      bad: bad.slice(0, 24),
    };
  });

  report.push({ route, name, ...info });

  if (STRIPS) {
    const n = Math.min(26, Math.ceil(info.docH / H));
    for (let i = 0; i < n; i++) {
      await page.evaluate(y => window.scrollTo(0, y), i * H);
      await new Promise(r => setTimeout(r, 260));
      await page.screenshot({ path: path.join(OUT, `${name}-${String(i).padStart(2, '0')}.png`) });
    }
  }
}

console.log(`\n=== MOBILE AUDIT @ ${W}×${H} ===`);
for (const r of report) {
  const bleed = r.scrollW - r.vw;
  console.log(`\n${r.route}  (doc ${r.docH}px tall)`);
  console.log(`  horizontal: viewport ${r.vw} · scrollWidth ${r.scrollW} ${bleed > 0 ? `→ BLEEDS ${bleed}px` : '→ ok'}`);
  if (r.bad.length) {
    console.log(`  ${r.bad.length} element(s) past the right edge:`);
    for (const b of r.bad) {
      console.log(`    +${String(b.over).padStart(4)}px  w=${String(b.w).padStart(4)}  ${b.id}${b.attrs ? ` [${b.attrs}]` : ''}  ${b.text ? `“${b.text}”` : ''}`);
      console.log(`              in  ${b.path}`);
    }
  }
}
console.log(`\nStrips → ${OUT}/`);

await browser.close();
srv.close();

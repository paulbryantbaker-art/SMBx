/**
 * fold-shot — render the BUILT practice site in headless Chromium and save a
 * screenshot, so a layout change is LOOKED AT before it ships.
 *
 * Exists because of 2026-08-02: six consecutive passes on the phone fold were
 * tuned from CSS values alone and shipped for Paul to render on his phone —
 * he was the feedback loop, and every pass shipped a defect one screenshot
 * would have caught (a dropped declaration, an off-centre pill, a bone strip,
 * a 400px empty scroll zone). The rule this tool enforces by existing:
 * change a fold value → build → shoot at rest AND scrolled → look → ship.
 *
 *   npm run build            # the tool renders dist/client, not source
 *   npm run shoot:fold                                  # 430×932 phone, rest
 *   node scripts/fold-shot.mjs --scroll 760             # mid-transition
 *   node scripts/fold-shot.mjs --w 1440 --h 900 --scale 2   # desktop
 *   node scripts/fold-shot.mjs --w 800 --h 1100         # tablet
 *
 * Output defaults to fold-shots/<w>x<h>-s<scroll>.png (gitignored is fine —
 * these are working files, not fixtures).
 *
 * Chromium: honours PUPPETEER_EXECUTABLE_PATH, then the Playwright cache
 * (/opt/pw-browsers, the cloud environment's pre-install), then the macOS
 * Chrome path. Never downloads anything.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const W = Number(arg('w', 430));
const H = Number(arg('h', 932));
const SCALE = Number(arg('scale', 3));
const SCROLL = Number(arg('scroll', 0));
const URL_PATH = arg('url', '/');
const WAIT = Number(arg('wait', 0));
const OUT = arg('out', path.join('fold-shots', `${W}x${H}-s${SCROLL}.png`));

const ROOT = path.resolve('dist/client');
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('dist/client/index.html not found — run `npm run build` first.');
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
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    f = path.join(ROOT, 'index.html'); // SPA catch-all, same as production
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, r));
const port = srv.address().port;

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE, isMobile: W <= 900, hasTouch: W <= 900 });
await page.goto(`http://localhost:${port}${URL_PATH}`, { waitUntil: 'networkidle0', timeout: 60000 });
// Let fonts settle and the settle-bloom finish fading (it ends transparent).
await new Promise(r => setTimeout(r, 2500));
if (SCROLL) {
  await page.evaluate(y => window.scrollTo(0, y), SCROLL);
  // 900ms for layout; pass --wait 2500 when the shot includes the proof
  // band's count-up, which is time-based and otherwise lands mid-animation.
  await new Promise(r => setTimeout(r, 900 + WAIT));
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT });
console.log(`${W}×${H} @${SCALE}x scroll=${SCROLL} → ${OUT}`);
await browser.close();
srv.close();

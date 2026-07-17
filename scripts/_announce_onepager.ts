/**
 * ONE-OFF: "Open for business" LinkedIn announcement 1-pager (1080×1350) with
 * Paul's photo, in the practice-site brand (coral system, real logo, blackbleed
 * dark band, Schibsted-family sans). Photo resolves from client/public/founder.jpg|png
 * (or scratchpad/founder.jpg); until it exists, renders a clearly-marked placeholder.
 * Renders VARIANT A (light panel + photo right) and VARIANT B (dark texture + photo card).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBrowser } from '../server/services/premiumPdfRenderer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, '../client/public');
const SCRATCH = process.env.SCRATCH || '/tmp';

const CORAL = '#FF385C', CORAL_DEEP = '#E61E4D', INK = '#222222', BODY = '#6A6A6A', DARK = '#141414', WARM = '#FFFDFC';
const SANS = `'Helvetica Neue', Arial, sans-serif`;
const MONO = `'Courier New', monospace`;

const b64 = (p: string, mime: string) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;
const LOGO = b64(path.join(PUB, 'logo-coral-x.png'), 'image/png');
const TEXTURE = b64(path.join(PUB, 'textures/blackbleed.webp'), 'image/webp');

let PHOTO = '';
const ROOT = path.resolve(__dirname, '..');
outer:
for (const dir of [ROOT, path.join(ROOT, 'assets'), PUB, SCRATCH]) {
  for (const c of ['founder.jpg', 'founder.jpeg', 'founder.png']) {
    const p = path.join(dir, c);
    if (existsSync(p)) { PHOTO = b64(p, c.endsWith('png') ? 'image/png' : 'image/jpeg'); break outer; }
  }
}
const photoBlock = (radius: number) => PHOTO
  ? `<img src="${PHOTO}" style="width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block;border-radius:${radius}px">`
  : `<div style="width:100%;height:100%;border-radius:${radius}px;background:repeating-linear-gradient(45deg,#ECE9E6 0 26px,#F5F2EF 26px 52px);display:flex;align-items:center;justify-content:center;text-align:center;padding:40px"><div style="font-family:${MONO};font-size:19px;letter-spacing:0.08em;color:#8A8A8A;text-transform:uppercase;line-height:2">Photo slot<br>drop client/public/founder.jpg<br>and re-render</div></div>`;

const STATS = [
  ['150+', 'Acquisitions closed'],
  ['$5B+', 'Enterprise value added'],
  ['~$21B', 'Transactions touched'],
  ['0', 'Sell-side engagements. Ever.'],
];
const statRow = (dark: boolean) => STATS.map(([n, l]) => `
  <div style="min-width:0">
    <div style="font-family:${SANS};font-weight:800;font-size:44px;letter-spacing:-0.02em;color:${dark ? '#fff' : INK}">${n}</div>
    <div style="font-family:${SANS};font-size:17.5px;font-weight:500;color:${dark ? '#C9C9C9' : BODY};margin-top:6px;line-height:1.35">${l}</div>
  </div>`).join('');

/* VARIANT A — warm-white panel left, full-height photo right, dark footer */
const A = `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:${WARM};overflow:hidden;font-family:${SANS}">
  <div style="position:absolute;inset:0;background:
    radial-gradient(1200px 800px at 8% 0%, rgba(255,56,92,0.05), transparent 60%),
    radial-gradient(900px 700px at 100% 100%, rgba(255,116,119,0.04), transparent 55%)"></div>
  <div style="position:absolute;left:0;top:0;bottom:128px;width:492px;padding:64px 52px 0 64px;display:flex;flex-direction:column">
    <img src="${LOGO}" style="height:44px;width:auto;display:block">
    <div style="margin-top:88px;font-weight:800;font-size:88px;line-height:0.98;letter-spacing:-0.03em;color:${INK}">Open<br>for<br>business.</div>
    <div style="width:76px;height:7px;background:${CORAL};border-radius:99px;margin:44px 0 36px"></div>
    <div style="font-size:25px;line-height:1.5;color:${INK};font-weight:600">Buy-side corporate development for acquirers — retained, conflict-free, through close.</div>
    <div style="margin-top:auto;padding-bottom:56px;display:grid;grid-template-columns:1fr 1fr;gap:40px 28px">${statRow(false)}</div>
  </div>
  <div style="position:absolute;left:516px;top:0;bottom:128px;right:0">${photoBlock(0)}
    <div style="position:absolute;inset:0;background:linear-gradient(90deg, ${WARM} 0%, transparent 9%)"></div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:128px;background:${DARK};display:flex;align-items:center;justify-content:space-between;padding:0 64px">
    <img src="${LOGO}" style="height:50px;width:auto;filter:brightness(0) invert(1)">
    <div style="font-family:${MONO};font-size:20px;letter-spacing:0.1em;color:#FFB3BF;text-transform:uppercase">smbx.ai · Book a call</div>
  </div>
</div>`;

/* VARIANT B — dark textured full page, photo card, white headline */
const B = `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div style="width:1080px;height:1350px;position:relative;background:#141414 url('${TEXTURE}') center/cover;overflow:hidden;font-family:${SANS}">
  <div style="position:absolute;inset:0;background:
    radial-gradient(900px 480px at 50% 0%, rgba(255,56,92,0.16), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.34))"></div>
  <div style="position:relative;height:100%;padding:64px 72px 60px;display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <img src="${LOGO}" style="height:44px;width:auto;filter:brightness(0) invert(1)">
      <div style="font-family:${MONO};font-size:19px;letter-spacing:0.1em;color:#C9C9C9;text-transform:uppercase">Announcement</div>
    </div>
    <div style="margin-top:52px;display:flex;gap:52px;align-items:stretch">
      <div style="width:400px;height:500px;flex:none;box-shadow:0 30px 80px rgba(0,0,0,0.5)">${photoBlock(24)}</div>
      <div style="display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:8px">
        <div style="font-weight:800;font-size:92px;line-height:0.97;letter-spacing:-0.03em;color:#fff">Open<br>for<br>business.</div>
        <div style="width:76px;height:7px;background:${CORAL};border-radius:99px;margin-top:36px"></div>
      </div>
    </div>
    <div style="margin-top:48px;font-size:26px;line-height:1.5;color:#F4F4F4;font-weight:600;max-width:820px">Buy-side corporate development for acquirers — retained, conflict-free, through close.</div>
    <div style="margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">${statRow(true)}</div>
    <div style="margin-top:44px;border-top:1px solid rgba(255,255,255,0.14);padding-top:30px;display:flex;align-items:center;justify-content:space-between">
      <div style="font-family:${MONO};font-size:20px;letter-spacing:0.1em;color:#FFB3BF;text-transform:uppercase">smbx.ai · Book a call</div>
      <div style="font-size:19px;color:#C9C9C9;font-weight:500">Two decades on the buy side</div>
    </div>
  </div>
</div>`;

const browser = await getBrowser();
for (const [name, html] of [['announce-A', A], ['announce-B', B]] as const) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready').catch(() => {});
  await new Promise(r => setTimeout(r, 150));
  writeFileSync(path.join(SCRATCH, `${name}.png`), await page.screenshot({ type: 'png' }));
  await page.close();
  console.log(name, 'rendered', PHOTO ? '(with photo)' : '(PLACEHOLDER — no founder.jpg found)');
}
process.exit(0);

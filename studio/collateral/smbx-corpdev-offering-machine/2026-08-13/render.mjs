/**
 * DETERMINISTIC RENDER — the piece is drawn frame by frame on a virtual clock,
 * not captured off a wall clock.
 *
 * WHY. Recording this page in real time on a CPU-only container produced a
 * measured 2.4 fps through the whole ident and ~18 fps after it: the 940ms
 * throw rendered as TWO frames and then a jump, and every transition in the
 * body arrived jerky. That is not a design problem and no amount of easing
 * fixes it — the browser was never given the frames. Paul, 2026-08-12: "every
 * transition needs to be smoothed out... right now it is very rough."
 *
 * So: CDP Emulation.setVirtualTimePolicy. The clock is paused, advanced by
 * exactly one frame's worth of milliseconds, and a screenshot is taken. CSS
 * transitions, CSS keyframes, setTimeout and requestAnimationFrame all run off
 * that same virtual clock, so every frame lands on its exact intended time
 * whatever the machine is doing. The output is identical on every re-render,
 * which also means Paul can ask for one more pass and get the same piece back
 * plus the change, not a differently-janky take.
 *
 *   PW=<chrome> node render.mjs wide [fps]
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const fmt = process.argv[2] || 'wide';
const FPS = Number(process.argv[3] || 30);
const SIZE = { wide: {width:1920,height:1080}, square:{width:1080,height:1080}, tall:{width:1080,height:1350} }[fmt];
const STEP = 1000 / FPS;
const OUT = `frames-${fmt}`;
rmSync(OUT, {recursive:true, force:true}); mkdirSync(OUT, {recursive:true});

const b = await chromium.launch({ executablePath: process.env.PW, args: [
  /* THE FLAG THAT MAKES THIS WORK. transform and opacity normally animate on
     the compositor thread, which is driven by BeginFrame and ignores virtual
     time entirely — freeze the clock without this and every transition simply
     does not move. Forced onto the main thread, they follow the virtual clock
     like everything else. Verified: a 1000ms linear translate steps exactly
     80px per 200ms of budget. */
  '--disable-threaded-animations',
  '--disable-gpu-vsync', '--disable-frame-rate-limit', '--force-device-scale-factor=1',
] });
const p = await b.newPage({ viewport: SIZE });
const cdp = await p.context().newCDPSession(p);

/* let the page load and the fonts decode on a normal clock, then freeze */
await p.goto(`file:///root/machine/offer-machine.html?fmt=${fmt}`);
await p.waitForFunction(() => window.__armed === true, null, { timeout: 30000 });
await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
await p.evaluate(() => window.__go());

const expired = () => new Promise(r => cdp.once('Emulation.virtualTimeBudgetExpired', r));
let n = 0;
const MAX = Math.round(FPS * Number(process.argv[4] || 60));
while (n < MAX) {
  const done = await p.evaluate(() => window.__done === true);
  const wait = expired();
  await cdp.send('Emulation.setVirtualTimePolicy', {
    policy: 'advance', budget: STEP, maxVirtualTimeTaskStarvationCount: 1_000_000,
  });
  await wait;
  await p.screenshot({ path: `${OUT}/${String(n).padStart(5,'0')}.png`, animations: 'allow' });
  n++;
  if (done) break;                       /* one frame past __done, then stop */
  if (n % 60 === 0) process.stdout.write(`  ${(n/FPS).toFixed(1)}s\n`);
}
await b.close();
writeFileSync(`${OUT}.fps`, String(FPS));
console.log(`rendered ${n} frames @ ${FPS}fps = ${(n/FPS).toFixed(2)}s`);

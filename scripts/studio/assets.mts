/**
 * Studio asset sync — move images between your machine, a Cowork session, and
 * the app's media library. No Google Drive in the middle.
 *
 * Why (Paul, 2026-07-24): "I want to be able to import assets images and etc
 * into the app and not have to use Google Drive." Drive was only ever a
 * courier — it cost a round trip, dropped on files over a few MB, and left two
 * copies of everything. The app's `studio_assets` table is already the media
 * library; this makes it reachable from the command line, so the same image
 * serves an app render and a local `build-deck.mts` run.
 *
 *   push   local files/folders  →  the app library
 *   pull   the app library      →  a local folder (default ./media)
 *   list   what the library holds
 *
 * Setup (once):
 *   export SMBX_API_URL=https://<your-app-host>      # or http://localhost:3000
 *   export SMBX_TOKEN=<a JWT from the app>           # DevTools → Application →
 *                                                    # localStorage → token
 * Usage:
 *   npx tsx scripts/studio/assets.mts list
 *   npx tsx scripts/studio/assets.mts push ~/Downloads/chiller.jpg ./shots/
 *   npx tsx scripts/studio/assets.mts pull --out ./media
 *   npx tsx scripts/studio/assets.mts pull --kind photo --match chiller
 *
 * Only png/jpeg/webp are accepted by the library, ≤12MB each — the same limits
 * the browser upload enforces. Oversized files are reported and skipped rather
 * than failing the whole run.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';

const API = (process.env.SMBX_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.SMBX_TOKEN || '';
const MAX_BYTES = 12 * 1024 * 1024;
const OK_EXT = /\.(png|jpe?g|webp)$/i;
const mimeOf = (p: string) =>
  /\.png$/i.test(p) ? 'image/png' : /\.webp$/i.test(p) ? 'image/webp' : 'image/jpeg';

const args = process.argv.slice(2);
const cmd = args.find(a => !a.startsWith('--')) || 'list';
const flag = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

if (!API || !TOKEN) {
  console.error('Set SMBX_API_URL and SMBX_TOKEN first (see the header of this file).');
  process.exit(1);
}

const auth = { Authorization: `Bearer ${TOKEN}` };

async function api(pathname: string, init: RequestInit = {}): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/research${pathname}`, {
      ...init,
      headers: { ...auth, ...(init.headers || {}) },
    });
  } catch (e) {
    // A dead host, wrong port, or typo'd URL should read like a note, not a
    // stack trace — this runs on Paul's laptop, not in a service.
    console.error(`\nCan't reach ${API} — ${(e as Error).message}`);
    console.error('Check SMBX_API_URL, and that the app is running and reachable from here.');
    process.exit(1);
  }
  if (res.status === 401) { console.error('401 — SMBX_TOKEN is missing, expired, or not a team account.'); process.exit(1); }
  if (res.status === 404) { console.error(`404 at ${pathname} — is SMBX_API_URL pointing at the app root (no /api suffix)?`); process.exit(1); }
  return res;
}

/** Expand file/dir arguments into a flat list of uploadable image paths. */
function collect(inputs: string[]): string[] {
  const out: string[] = [];
  for (const raw of inputs) {
    const p = path.resolve(raw);
    if (!existsSync(p)) { console.warn(`  skip (not found): ${raw}`); continue; }
    if (statSync(p).isDirectory()) {
      for (const f of readdirSync(p)) if (OK_EXT.test(f)) out.push(path.join(p, f));
    } else if (OK_EXT.test(p)) {
      out.push(p);
    } else {
      console.warn(`  skip (not png/jpeg/webp): ${raw}`);
    }
  }
  return out;
}

async function push(inputs: string[]) {
  const files = collect(inputs);
  if (!files.length) { console.error('Nothing to push. Give me files or a folder of png/jpeg/webp.'); process.exit(1); }
  let ok = 0, skipped = 0;
  for (const f of files) {
    const bytes = statSync(f).size;
    if (bytes > MAX_BYTES) {
      console.warn(`  skip (${(bytes / 1048576).toFixed(1)}MB > 12MB): ${path.basename(f)}`);
      skipped++; continue;
    }
    const label = path.basename(f).replace(/\.[a-z0-9]+$/i, '');
    const form = new FormData();
    form.append('file', new Blob([readFileSync(f)], { type: mimeOf(f) }), path.basename(f));
    form.append('label', label);
    const res = await api('/studio/assets', { method: 'POST', body: form });
    if (!res.ok) { console.warn(`  FAILED ${path.basename(f)} — ${res.status} ${await res.text()}`); skipped++; continue; }
    const { id } = await res.json() as { id: number };
    console.log(`  ✓ #${id}  ${label}  (${(bytes / 1024).toFixed(0)}KB)`);
    ok++;
  }
  console.log(`\npushed ${ok}${skipped ? `, skipped ${skipped}` : ''} → ${API}`);
}

async function list(): Promise<any[]> {
  const res = await api('/studio/assets');
  if (!res.ok) { console.error(`list failed: ${res.status}`); process.exit(1); }
  const body = await res.json() as any;
  return Array.isArray(body) ? body : (body.assets || []);
}

async function pull() {
  const out = path.resolve(flag('--out') || 'media');
  const kind = flag('--kind');            // photo | collateral
  const match = flag('--match')?.toLowerCase();
  mkdirSync(out, { recursive: true });
  let assets = await list();
  if (kind) assets = assets.filter(a => a.kind === kind);
  if (match) assets = assets.filter(a => String(a.label || '').toLowerCase().includes(match));
  if (!assets.length) { console.log('No assets matched.'); return; }
  let n = 0;
  for (const a of assets) {
    const res = await api(`/studio/assets/${a.id}/raw`);
    if (!res.ok) { console.warn(`  FAILED #${a.id} — ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = a.mime === 'image/png' ? 'png' : a.mime === 'image/webp' ? 'webp' : 'jpg';
    const safe = String(a.label || `asset-${a.id}`).replace(/[^\w.-]+/g, '-').slice(0, 60);
    const file = path.join(out, `${safe}.${ext}`);
    writeFileSync(file, buf);
    console.log(`  ✓ ${path.basename(file)}  (${(buf.length / 1024).toFixed(0)}KB)`);
    n++;
  }
  console.log(`\npulled ${n} → ${out}\nBuilders resolve ./media by name, so a spec can now say "${path.basename(out)}/<file>" or just the bare filename.`);
}

switch (cmd) {
  case 'push': await push(args.filter(a => !a.startsWith('--') && a !== 'push')); break;
  case 'pull': await pull(); break;
  case 'list': {
    const assets = await list();
    if (!assets.length) { console.log('Library is empty.'); break; }
    console.log(`${assets.length} asset(s) in ${API}:\n`);
    for (const a of assets) {
      const kb = a.bytes ? `${(a.bytes / 1024).toFixed(0)}KB` : '';
      const dim = a.width && a.height ? `${a.width}×${a.height}` : '';
      console.log(`  #${String(a.id).padEnd(4)} ${String(a.kind).padEnd(10)} ${String(a.label).slice(0, 42).padEnd(44)} ${dim.padEnd(11)} ${kb}`);
    }
    break;
  }
  default:
    console.error(`Unknown command "${cmd}". Use: push | pull | list`);
    process.exit(1);
}

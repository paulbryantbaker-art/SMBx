/**
 * The intake card — publicly the "smbX Acquisition Engine" (Paul's copy
 * update, 2026-07-12: the Yulia name stays app-side; this surface speaks as
 * the firm's system). The landing page's core conversion mechanism.
 *
 * Market Map spec (2026-07-12): the visitor describes a thesis; Yulia
 * delivers an 8-block MARKET MAP that assembles in front of them as the
 * model actually writes it (SSE streaming — the reveal is real work made
 * legible, never a staged spinner; JSON fallback typesets the finished map
 * with a short stagger). The artifact reads as institutional research —
 * titled, dated, funnel numbers at display scale, the insight block last and
 * biggest, sources footer, PDF built for the forward. Email is asked only
 * AFTER the map is visible, framed as delivery; the server closes
 * deterministically (lead persisted, honest lane check) the moment an email
 * appears. Full funnel instrumentation, including dwell time on the artifact.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { bookHref, bookTarget, bookRel } from './leads';
import { trackEvent } from '../lib/analytics';

interface FunnelStep { n: string; label: string; }
interface MapData {
  title: string;
  thesis: string;
  verdict: 'PROCEED' | 'PUSHBACK';
  answer: string;
  funnel: FunnelStep[];
  econ: string;
  comp: string;
  insight: string;
  kill: string;
  produces: string;
  sources: string;
}
export type PartialMap = Partial<Omit<MapData, 'funnel'>> & { funnel: FunnelStep[] };
interface Msg { from: 'y' | 'u'; text?: string; map?: MapData; }

const OPENING =
  "Tell us a bit about what you're looking for. Our acquisition engine takes just a couple of minutes to process your criteria and build a preliminary market map. Ready to start?";

/** sessionStorage key for the intake conversation — the session survives
 *  anything that remounts this component (the sample-read tab swap, a reload,
 *  minimize/reopen on mobile). Session-scoped: a fresh visit starts fresh. */
const SS_KEY = 'smbx_intake_v1';

/** The engine emits markdown **bold** and the bubble rendered the literal
 *  asterisks (Paul's 2026-08-03 screenshot). This is the WHOLE parser on
 *  purpose — bold segments only, no library, nothing else interpreted. */
function boldSpans(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((seg, i) => (i % 2 ? <strong key={i}>{seg}</strong> : seg));
}

const HINTS = [
  'Sector & Strategy — "HVAC roll-up in the Southeast"',
  'Size & Geography (e.g., "$2–5M EBITDA, within 4 hours of Atlanta")',
  'Delivery Email (e.g., "director@fund.com")',
  'Generation complete. Your map is being compiled. Book your consultation above.',
];

/** The send button rotates with the step (Paul's copy update, Y-4). */
const SEND_LABELS = ['Continue', 'Generate Map', 'Send', 'Send'];

/** Quick-start chips read the ONE lane register (lanes.ts) — the same
 *  array the landing hunt board renders, so a lane cannot be on the board
 *  and missing here (2026-08-03, Paul: "I don't see Home Services… nor
 *  landscape and hardscaping" — the hand-copied list drifted within a day
 *  of being written; a register cannot).
 *
 *  DESKTOP shows the FEATURED row + an "All lanes →" chip that jumps to
 *  the hunt board (Paul: "is there a better way to present rather than
 *  just a cloud of chat pills?" — six white pills and a door beats
 *  fourteen). The mobile SHEET lists every lane — a scrollable sheet is
 *  where a full list belongs. */
import { HUNT_LANES, FEATURED_LANES } from './lanes';
import OwnerChat, { OwnerLane } from './OwnerChat';
const CHIPS: string[] = HUNT_LANES.map(l => l.nm);

/** Narration for the block currently being written — shown while the map
 *  streams, so the work is legible without pretending anything. System
 *  voice (Acquisition Engine), not a persona. */
const NARRATE: Record<string, string> = {
  TITLE: 'Reviewing your criteria…',
  THESIS: 'Reviewing your criteria…',
  VERDICT: 'Analyzing the market…',
  ANSWER: 'Crafting our honest take…',
  U1: 'Mapping the available universe…',
  U2: 'Finding your size fit…',
  U3: 'Screening for quality…',
  ECON: 'Pulling the financial data…',
  COMP: 'Evaluating the competition…',
  INSIGHT: 'Highlighting potential blind spots…',
  KILL: 'Stress-testing the strategy…',
};

const FIELD_RE = /(?:^|\n)\s*(TITLE|THESIS|VERDICT|ANSWER|U1|U2|U3|ECON|COMP|INSIGHT|KILL):/g;

interface StreamView {
  inMap: boolean;
  preText: string;
  partial: PartialMap | null;
  narration: string | null;
}

/** Incremental parse of the accumulating model text: fields render the moment
 *  they complete (the next header has arrived), never mid-sentence. */
function parseStreaming(acc: string): StreamView {
  const mapStart = acc.indexOf('===MAP===');
  if (mapStart === -1) {
    // Strip a possibly half-arrived marker so it never flashes as prose.
    const preText = acc.replace(/\n?=+[A-Z]*=*\s*$/, '').trim();
    return { inMap: false, preText, partial: null, narration: null };
  }
  const preText = acc.slice(0, mapStart).trim();
  const endIdx = acc.indexOf('===END===');
  const closed = endIdx !== -1;
  const block = closed ? acc.slice(mapStart + 9, endIdx) : acc.slice(mapStart + 9);

  const found: { name: string; start: number; valStart: number }[] = [];
  const re = new RegExp(FIELD_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) found.push({ name: m[1], start: m.index, valStart: m.index + m[0].length });

  const vals: Record<string, string> = {};
  found.forEach((f, i) => {
    const isLast = i === found.length - 1;
    if (isLast && !closed) return; // still being written
    const raw = block.slice(f.valStart, isLast ? undefined : found[i + 1].start);
    vals[f.name] = raw.trim().replace(/\s+/g, ' ');
  });

  const step = (name: string): FunnelStep | null => {
    const raw = vals[name];
    if (!raw) return null;
    const bar = raw.indexOf('|');
    if (bar === -1) return { n: '—', label: raw };
    return { n: raw.slice(0, bar).trim() || '—', label: raw.slice(bar + 1).trim() };
  };
  const partial: PartialMap = {
    title: vals.TITLE,
    thesis: vals.THESIS,
    verdict: vals.VERDICT?.toUpperCase() === 'PUSHBACK' ? 'PUSHBACK' : 'PROCEED',
    answer: vals.ANSWER,
    funnel: [step('U1'), step('U2'), step('U3')].filter((s): s is FunnelStep => s !== null && !!s.label),
    econ: vals.ECON,
    comp: vals.COMP,
    insight: vals.INSIGHT,
    kill: vals.KILL,
  };
  const current = !closed && found.length > 0 ? found[found.length - 1].name : null;
  const narration = closed ? null : (current ? NARRATE[current] : 'Finalizing your market read…');
  return { inMap: true, preText, partial, narration };
}

/** Consume the SSE intake stream. Returns the authoritative final payload;
 *  throws on ANY transport/server failure (the caller retries once over the
 *  plain JSON endpoint). A watchdog aborts the fetch if the stream goes quiet
 *  (no bytes — heartbeats count — for 30s) or runs past 150s total, so a
 *  half-dead connection can never strand the turn in `pending` forever
 *  (Paul, 2026-07-16: "the turn gets stuck and won't continue"). */
async function streamIntake(
  payload: { role: string; content: string }[],
  onAccum: (acc: string) => void,
): Promise<{ reply: string; done: boolean; map: MapData | null }> {
  const ctrl = new AbortController();
  let idleTimer = 0;
  const armIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => ctrl.abort(), 30_000);
  };
  const totalTimer = window.setTimeout(() => ctrl.abort(), 150_000);
  try {
    armIdle();
    const res = await fetch('/api/practice/intake/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: payload }),
      signal: ctrl.signal,
    });
    if (!res.ok || !res.body) throw new Error('transport');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let acc = '';
    let final: { reply: string; done: boolean; map: MapData | null } | null = null;
    for (;;) {
      const { value, done } = await reader.read();
      armIdle();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const eventLine = frame.split('\n').find(l => l.startsWith('event:'));
        const dataLine = frame.split('\n').find(l => l.startsWith('data:'));
        if (!eventLine || !dataLine) continue; // heartbeat comments land here
        const event = eventLine.slice(6).trim();
        let data: any;
        try { data = JSON.parse(dataLine.slice(5)); } catch { continue; }
        if (event === 'delta' && typeof data.t === 'string') {
          acc += data.t;
          onAccum(acc);
        } else if (event === 'final') {
          final = data;
        } else if (event === 'error') {
          throw new Error('server');
        }
      }
    }
    if (!final) throw new Error('incomplete');
    return final;
  } finally {
    clearTimeout(idleTimer);
    clearTimeout(totalTimer);
  }
}

const DOC_DATE = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export function MapDoc({
  map, final = false, staggered = false, onPdf, pdfState, headLabel,
}: {
  map: PartialMap;
  final?: boolean;
  staggered?: boolean;
  onPdf?: () => void;
  pdfState?: 'idle' | 'busy' | 'error';
  headLabel?: string;
}) {
  const pushback = map.verdict === 'PUSHBACK';
  let blockIndex = 0;
  const rise = () => (staggered ? { animationDelay: `${blockIndex++ * 110}ms` } : undefined);

  return (
    <div className="pd-map">
      <div className="map-head" style={rise()}>
        <img src="/logo-green-x.png" alt="smbX.ai" style={{ height: 22, width: 'auto', display: 'block' }} />
        <span className="map-label">{headLabel || `PRELIMINARY MARKET READ · ${DOC_DATE.toUpperCase()}`}</span>
      </div>
      {map.title && <div className="map-title" style={rise()}>{map.title}</div>}
      {map.thesis && <div className="map-thesis" style={rise()}>{map.thesis}</div>}
      {pushback && map.answer && (
        <div className="map-answer" style={rise()}>
          <div className="k">STRAIGHT ANSWER</div>
          <div className="v">{map.answer}</div>
        </div>
      )}
      {map.funnel.length > 0 && (
        <div className="map-funnel" style={rise()}>
          <div className="k">{pushback ? 'THE EVIDENCE' : 'THE UNIVERSE'}</div>
          {map.funnel.map((s, i) => (
            <div className="map-step" key={i} style={staggered ? { animationDelay: `${blockIndex * 110 + i * 110}ms` } : undefined}>
              <div className="n">{s.n}</div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {map.econ && (
        <div className="map-sec" style={rise()}>
          <div className="k">THE ECONOMICS</div>
          <div className="v">{map.econ}</div>
        </div>
      )}
      {map.comp && (
        <div className="map-sec" style={rise()}>
          <div className="k">THE COMPETITIVE PICTURE</div>
          <div className="v">{map.comp}</div>
        </div>
      )}
      {map.insight && (
        <div className="map-insight" style={rise()}>
          <div className="k">{pushback ? 'WHERE CAPITAL WORKS BETTER' : 'WHAT MOST BUYERS MISS'}</div>
          <div className="v">{map.insight}</div>
        </div>
      )}
      {map.kill && (
        <div className="map-sec" style={rise()}>
          <div className="k">WHAT WOULD KILL THIS THESIS</div>
          <div className="v">{map.kill}</div>
        </div>
      )}
      {final && map.produces && (
        <div className="map-sec" style={rise()}>
          <div className="k">WHAT AN ENGAGEMENT PRODUCES</div>
          <div className="v">{map.produces}</div>
        </div>
      )}
      {final && (
        <div className="map-foot" style={rise()}>
          <div className="src">{map.sources}</div>
          {onPdf && (
            <button type="button" className="map-pdf" onClick={onPdf} disabled={pdfState === 'busy'}>
              {pdfState === 'busy' ? 'Preparing…' : pdfState === 'error' ? 'Try the download again' : 'Download the PDF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function YuliaIntake() {
  // Conversation state hydrates from sessionStorage so minimizing the mobile
  // drawer, toggling the sample-read tab, or reloading never wipes a session
  // (Paul, 2026-07-14: "minimize it, the chat experience is gone and started
  // over").
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(SS_KEY) || 'null');
      if (s && Array.isArray(s.messages) && s.messages.length > 0) return s.messages;
    } catch { /* fresh session */ }
    return [{ from: 'y', text: OPENING }];
  });
  const [done, setDone] = useState<boolean>(() => {
    try { return JSON.parse(sessionStorage.getItem(SS_KEY) || 'null')?.done === true; } catch { return false; }
  });
  const [draft, setDraft] = useState<string>(() => {
    try { return JSON.parse(sessionStorage.getItem(SS_KEY) || 'null')?.draft || ''; } catch { return ''; }
  });
  const [pending, setPending] = useState(false);
  const [live, setLive] = useState<StreamView | null>(null);
  const [pdfState, setPdfState] = useState<'idle' | 'busy' | 'error'>('idle');

  /* START OVER (2026-08-03, Paul: "if we mess up or want to cancel out of
     it, have an X in the top right corner of the chat box"). The X abandons
     the session: storage cleared, state back to the opening line, the
     mobile sheet closed. Deliberately NOT offered mid-stream — pending
     disables it so an in-flight map isn't half-orphaned. */
  const [ownerMode, setOwnerMode] = useState(false);
  const [ownerEpoch, setOwnerEpoch] = useState(0);
  const [ownerBusy, setOwnerBusy] = useState(false);
  const ownerLane = useRef<OwnerLane | null | undefined>(undefined);

  const startOver = useCallback(() => {
    if (ownerMode) {
      // In owner mode the X leaves the valuation and hands the card back to
      // the buyer engine; the abandoned owner session is cleared.
      try { localStorage.removeItem('smbx_owner_intake_v1'); } catch { /* fine */ }
      setOwnerMode(false);
      setOpen(false);
      return;
    }
    try { sessionStorage.removeItem(SS_KEY); } catch { /* fine */ }
    setMessages([{ from: 'y', text: OPENING }]);
    setDone(false);
    setDraft('');
    setLive(null);
    setOpen(false);
  }, [ownerMode]);
  // On phones the chat lifts into a slide-up sheet so typing isn't buried in the
  // page under the keyboard (Paul, 2026-07-14: "a drawer that slides up and can
  // be minimized"). Desktop ignores this — the chat stays inline, front-and-center.
  const [open, setOpen] = useState(false);
  // Viewport class as state so the hero bar can render readOnly on phones
  // (readOnly = no keyboard; the tap opens the sheet, whose field then takes
  // focus and summons the keyboard where it belongs).
  const [mobileVP, setMobileVP] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const f = () => setMobileVP(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  const mapTracked = useRef(messages.some(m => m.map)); // never re-count a restored map
  const dwell = useRef<{ start: number; verdict: string } | null>(null);
  const dwellFired = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;

  // Persist every turn (and the in-flight draft) for the life of the tab.
  useEffect(() => {
    try { sessionStorage.setItem(SS_KEY, JSON.stringify({ messages, done, draft })); } catch { /* quota/private mode */ }
  }, [messages, done, draft]);

  const fireDwell = () => {
    if (!dwell.current || dwellFired.current) return;
    dwellFired.current = true;
    trackEvent('practice_map_dwell', {
      seconds: Math.min(600, Math.round((Date.now() - dwell.current.start) / 1000)),
      verdict: dwell.current.verdict,
    });
  };

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') fireDwell(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', fireDwell);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', fireDwell);
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    // While the map streams, follow the newest block; once it lands, present
    // the document from its title — not its tail.
    if (!pending && messages.slice(-2).some(m => m.map)) {
      const docs = el.querySelectorAll<HTMLElement>('.pd-map');
      const doc = docs[docs.length - 1];
      if (doc) {
        el.scrollTop += doc.getBoundingClientRect().top - el.getBoundingClientRect().top - 6;
        return;
      }
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, pending, live]);

  const userTurns = messages.filter(m => m.from === 'u').length;
  const step = done ? 3 : Math.min(userTurns, 2);
  const sendLabel = SEND_LABELS[step];

  // Static staged placeholder (v3 design: the self-typing ghost is retired —
  // the bar reads as one calm, quoted example).
  const hint = HINTS[step];

  // Esc / scrim / chevron all minimize the mobile sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // While the sheet is up, the page behind must not scroll (Paul: "the
  // background can be scrolled through the drawer"). `overflow:hidden` alone
  // does NOT stop iOS Safari touch-scrolling the body — the reliable lock is
  // pinning the body in place (position:fixed at the current scroll offset)
  // and restoring the offset on close. Temporary while open, so it doesn't
  // trip the Safari fixed-background rule.
  useEffect(() => {
    if (!open || !isMobile()) return;
    const y = window.scrollY;
    const body = document.body.style;
    const prev = {
      position: body.position, top: body.top, left: body.left,
      right: body.right, width: body.width, overflow: body.overflow,
    };
    body.position = 'fixed';
    body.top = `-${y}px`;
    body.left = '0';
    body.right = '0';
    body.width = '100%';
    body.overflow = 'hidden';
    return () => {
      body.position = prev.position; body.top = prev.top; body.left = prev.left;
      body.right = prev.right; body.width = prev.width; body.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, [open]);

  // Bottom-sheet touch behavior (Paul, 2026-07-14: "when I swipe down the
  // drawer should minimize, not swipe down the whole screen… I can still drag
  // through the drawer"). One handler owns every touch on the sheet:
  //  • Drag starting on the header/grabber = direct-manipulation drag-to-close:
  //    the sheet follows the finger; past the threshold it minimizes, otherwise
  //    it springs back.
  //  • Drag inside .pd-msgs scrolls the list, EXCEPT at its edges (top+down or
  //    bottom+up), where it's blocked — otherwise iOS chains the gesture into
  //    the page rubber-band / pull-to-refresh (the "drag through the drawer").
  //  • Any other touch on the sheet or scrim moves nothing.
  useEffect(() => {
    if (!open || !isMobile()) return;
    const sheet = sheetRef.current;
    const scrim = scrimRef.current;
    if (!sheet) return;
    let startY = 0;
    let draggingSheet = false;
    let dy = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      dy = 0;
      draggingSheet = !!(e.target as Element | null)?.closest?.('.pd-chat-head');
      if (draggingSheet) sheet.style.transition = 'none';
    };
    const onMove = (e: TouchEvent) => {
      const t = e.target as Element | null;
      if (draggingSheet) {
        dy = Math.max(0, e.touches[0].clientY - startY);
        sheet.style.transform = `translateY(${dy}px)`;
        e.preventDefault();
        return;
      }
      const msgs = t?.closest?.('.pd-msgs') as HTMLElement | null;
      if (!msgs) { e.preventDefault(); return; }
      const delta = e.touches[0].clientY - startY;
      const atTop = msgs.scrollTop <= 0;
      const atBottom = msgs.scrollTop + msgs.clientHeight >= msgs.scrollHeight - 1;
      if ((atTop && delta > 0) || (atBottom && delta < 0)) e.preventDefault();
    };
    const onEnd = () => {
      if (!draggingSheet) return;
      draggingSheet = false;
      sheet.style.transition = '';
      sheet.style.transform = '';
      if (dy > 110) setOpen(false); // past the threshold — let the close transition take it from here
    };
    const onScrimMove = (e: TouchEvent) => e.preventDefault();
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: false });
    sheet.addEventListener('touchend', onEnd);
    sheet.addEventListener('touchcancel', onEnd);
    scrim?.addEventListener('touchmove', onScrimMove, { passive: false });
    // Belt and braces against pull-to-refresh while the drawer owns the screen.
    const html = document.documentElement.style;
    const prevOB = html.overscrollBehaviorY;
    html.overscrollBehaviorY = 'none';
    return () => {
      sheet.removeEventListener('touchstart', onStart);
      sheet.removeEventListener('touchmove', onMove);
      sheet.removeEventListener('touchend', onEnd);
      sheet.removeEventListener('touchcancel', onEnd);
      scrim?.removeEventListener('touchmove', onScrimMove);
      html.overscrollBehaviorY = prevOB;
    };
  }, [open]);

  // Keep the input above the on-screen keyboard: track the visual viewport and
  // hand the keyboard's height to CSS (--pd-kb lifts the sheet's bottom edge).
  useEffect(() => {
    if (!open || !isMobile()) return;
    const vv = window.visualViewport;
    const el = sheetRef.current;
    if (!vv || !el) return;
    const apply = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty('--pd-kb', `${Math.round(kb)}px`);
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      el.style.removeProperty('--pd-kb');
    };
  }, [open]);

  // Opening the sheet: slide up, then try to land focus in the real field.
  const openSheet = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Focus whichever input is actually visible (the hero bar in the resting
  // hero, the card/sheet field once engaged) — focusing a display:none input
  // is a silent no-op.
  const focusActive = () => {
    requestAnimationFrame(() => {
      const el = [inputRef.current, heroInputRef.current].find(n => n && n.offsetParent !== null);
      el?.focus();
    });
  };

  // Other components (the showcase's "Map your market" tab) can ask the drawer
  // to open on phones without reaching into this component.
  useEffect(() => {
    const onAsk = () => { if (isMobile()) openSheet(); };
    window.addEventListener('smbx:open-intake', onAsk);
    return () => window.removeEventListener('smbx:open-intake', onAsk);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The #owners section's chips land HERE: enter owner mode with the picked
  // trade ({key,label}, or {other:true} for a free-text trade), lift the
  // sheet on phones, scroll the card into view on desktop. Each entry
  // remounts OwnerChat (epoch key) so a new pick starts its own thread.
  useEffect(() => {
    const onOwner = (e: Event) => {
      const d = (e as CustomEvent).detail;
      ownerLane.current = d?.key ? { key: d.key, label: d.label } : null;
      // An explicit pick starts fresh — without this, OwnerChat's
      // hydrate-first priority resumes the PREVIOUS lane's saved session
      // and the new pick is silently discarded.
      try { localStorage.removeItem('smbx_owner_intake_v1'); } catch { /* fine */ }
      setOwnerEpoch(n => n + 1);
      setOwnerMode(true);
      if (isMobile()) openSheet();
      else setTimeout(() => document.getElementById('yulia')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
    };
    window.addEventListener('smbx:open-owner', onOwner);
    return () => window.removeEventListener('smbx:open-owner', onOwner);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // A returning owner (magic-link email opens a NEW tab at /#owners, or a
  // reload mid-valuation) resumes into owner mode instead of the buyer
  // engine — but only when the hash says that's what they came for.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('smbx_owner_intake_v1') || 'null');
      if (saved?.a?.lane && window.location.hash === '#owners') {
        ownerLane.current = undefined;
        setOwnerEpoch(n => n + 1);
        setOwnerMode(true);
        if (isMobile()) setOpen(true);
        // Desktop: the hash scroll parks the page at the #owners section —
        // the resumed conversation is at the top. Bring it into view (the
        // timeout outwaits the browser's own hash jump).
        else setTimeout(() => document.getElementById('yulia')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
      }
    } catch { /* fine */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On phones every "#yulia" ask (nav CTA, sticky CTA, hero pills) opens the
  // drawer directly instead of scrolling to an inline card the visitor then
  // has to tap again. Desktop keeps the anchor scroll.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="#yulia"]');
      if (a && isMobile()) { e.preventDefault(); openSheet(); }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggestion chips give the visitor a starting point. A tap SENDS the lane
  // to the engine (v3 design behavior); on a phone it also lifts the sheet so
  // the reply arrives in view.
  const useChip = (text: string) => {
    if (isMobile()) setOpen(true);
    void send(text);
  };

  const trackMap = (verdict: string) => {
    if (mapTracked.current) return;
    mapTracked.current = true;
    dwell.current = { start: Date.now(), verdict };
    trackEvent('practice_map_delivered', { verdict });
  };

  const applyFinal = (data: { reply: string; done: boolean; map: MapData | null }, streamed: boolean) => {
    setMessages(m => {
      const out = [...m];
      if (data.map) out.push({ from: 'y', map: data.map });
      if (data.reply) out.push({ from: 'y', text: data.reply });
      return out;
    });
    if (data.map) trackMap(data.map.verdict);
    if (data.done) {
      setDone(true);
      trackEvent('practice_email_captured');
    }
    void streamed;
  };

  const send = async (given?: string) => {
    const text = (given ?? draft).trim();
    // A tap on the send button with an empty field must never be a silent
    // no-op ("the button doesn't work") — hand focus to the field instead.
    if (!text) { focusActive(); return; }
    if (done || pending) return;
    if (userTurns === 0) trackEvent('practice_intake_started');
    trackEvent('practice_intake_step', { step: userTurns + 1 });
    const next: Msg[] = [...messages, { from: 'u', text }];
    setMessages(next);
    setDraft('');
    setPending(true);
    setLive(null);
    // On desktop the first send morphs the resting hero bar into the
    // conversation card — carry focus into the card's field.
    focusActive();
    const payload = next
      .filter(m => m.text)
      .map(m => ({ role: m.from === 'y' ? 'assistant' : 'user', content: m.text as string }));
    try {
      const data = await streamIntake(payload, acc => setLive(parseStreaming(acc)));
      applyFinal(data, true);
    } catch {
      // The stream broke (idle timeout, dropped connection, server hiccup) —
      // ONE retry over the plain JSON endpoint re-runs the whole turn
      // server-side with the identical payload and an authoritative result.
      // Only if THAT also fails does the visitor see the retry message.
      try {
        setLive(null); // retire any partial streamed render; the JSON turn replaces it
        const res = await fetch('/api/practice/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payload }),
        });
        if (!res.ok) throw new Error(String(res.status));
        applyFinal(await res.json(), false);
      } catch {
        setMessages(m => [...m, { from: 'y', text: 'Connection interrupted — please submit your criteria once more.' }]);
      }
    } finally {
      setPending(false);
      setLive(null);
    }
  };

  const downloadPdf = async (map: MapData) => {
    if (pdfState === 'busy') return;
    setPdfState('busy');
    try {
      const res = await fetch('/api/practice/map-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smbX-market-map.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      trackEvent('practice_map_pdf_downloaded');
      setPdfState('idle');
    } catch {
      setPdfState('error');
    }
  };

  // The map streams into view before the final payload confirms it — count
  // delivery from the first fully-assembled streaming render too.
  const liveMapVisible = pending && live?.inMap && live.partial;

  // Resting = nothing has happened yet. On desktop the resting state is a
  // Gemini-style hero: ONE big input bar with starter chips beneath it — no
  // card chrome, no opening paragraph (the page headline/sub already say it).
  // The conversation card only materializes once the visitor engages (Paul,
  // 2026-07-14 ×3: "too crowded… results are not what I wanted"). On phones
  // the bar is always the doorway — typing happens in the slide-up sheet.
  const resting = userTurns === 0 && !pending && !done && !ownerMode;

  return (
    <div id="yulia" className={`pd-chat-zone${resting ? ' resting' : ''}`}>
      {/* ── The hero bar — desktop resting state AND the mobile doorway. On a
             phone, pointerdown opens the sheet before focus (no keyboard
             behind the sheet); on desktop it's the real input. ── */}
      <div className="pd-chat-hero">
        <div
          className="pd-herobar"
          onClick={() => { if (isMobile()) openSheet(); }}
        >
          {/* The + stands in for the starter chips on phones (Grok grammar,
              Paul 2026-07-16) — it lifts the sheet, where the chips live.
              CSS hides it on desktop, where the chips sit under the bar. */}
          <button
            type="button"
            className="pd-plus"
            aria-label="See starting points"
            onClick={() => { if (isMobile()) openSheet(); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" /></svg>
          </button>
          <input
            ref={heroInputRef}
            readOnly={mobileVP}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder={ownerMode ? 'Tap to continue your valuation' : done ? 'Your map is ready — reopen it' : userTurns > 0 ? 'Tap to continue your session' : mobileVP ? 'What are you buying?' : hint}
            aria-label="Describe your acquisition criteria"
          />
          <button
            type="button"
            className="pd-send"
            onClick={() => { if (isMobile()) openSheet(); else send(); }}
            disabled={pending}
            aria-label={userTurns > 0 || done ? 'Reopen the conversation' : sendLabel}
          >
            {mobileVP ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (userTurns > 0 || done ? 'Reopen' : sendLabel)}
          </button>
        </div>
        {resting && (
          <div className="pd-chips">
            {FEATURED_LANES.map(c => (
              <button type="button" key={c} className="pd-chip" onClick={() => useChip(c)}>
                {c}
              </button>
            ))}
            <a
              className="pd-chip"
              href="#sectors"
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-all-lanes' })}
            >
              All {CHIPS.length} lanes →
            </a>
            {/* The owner funnel's homepage doorway (2026-08-04). A LINK chip,
                not an intake path — the buyer engine stays pure; owners get
                their own chat at /owners. */}
            <a
              className="pd-chip"
              href="#owners"
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'hero-owner-eval' })}
            >
              Own one of these? Get a free valuation →
            </a>
          </div>
        )}
      </div>

      {/* Scrim behind the mobile sheet (CSS-hidden on desktop). */}
      <div ref={scrimRef} className={`pd-chat-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={sheetRef} className={`pd-chat enter${open ? ' open' : ''}`}>
        <div className="pd-chat-head">
          {/* Grab handle — shown only in the mobile sheet. */}
          <span className="pd-chat-grab" aria-hidden="true" />
          <img src="/logo-green-x.png" alt="smbX.ai" style={{ height: 28, width: 'auto', display: 'block' }} />
          <div className="pd-chat-title">{ownerMode ? 'Free Valuation' : 'Acquisition Engine'}</div>
          {/* Minimize — shown only in the mobile sheet. */}
          <button type="button" className="pd-chat-min" onClick={() => setOpen(false)} aria-label="Minimize chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {/* Start over — both breakpoints (minimize keeps the session; the X
              abandons it). Disabled while a map is streaming. */}
          <button type="button" className="pd-chat-x" onClick={startOver} disabled={ownerMode ? ownerBusy : pending} aria-label="Cancel this conversation and start over">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
        </div>
      {/* ── OWNER MODE (Paul: one chat, two brains). The card body swaps
             wholesale: OwnerChat renders the same msgs/chips/inputrow grammar
             as direct children, so the mobile sheet's flex layout treats both
             brains identically. The epoch key restarts a fresh valuation per
             section pick; the X (startOver) returns to the buyer engine. ── */}
      {ownerMode ? (
        <OwnerChat key={ownerEpoch} initialLane={ownerLane.current} onBusy={setOwnerBusy} />
      ) : (
        <>
      <div className="pd-msgs" ref={listRef}>
        {messages.map((m, i) => (
          m.map ? (
            <div className="pd-msgrow" key={i}>
              <MapDoc map={m.map} final staggered={false} onPdf={() => downloadPdf(m.map!)} pdfState={pdfState} />
            </div>
          ) : (
            <div className="pd-msgrow" key={i}>
              <div className={`pd-bub ${m.from === 'y' ? 'pd-bub-y' : 'pd-bub-u'}`}>
                {m.from === 'y' && m.text
                  ? m.text.split('\n\n').map((p, j) => <p key={j} style={{ margin: j === 0 ? 0 : '10px 0 0' }}>{boldSpans(p)}</p>)
                  : m.text}
              </div>
            </div>
          )
        ))}
        {pending && live?.preText && (
          <div className="pd-msgrow">
            <div className="pd-bub pd-bub-y">{boldSpans(live.preText)}</div>
          </div>
        )}
        {liveMapVisible && (
          <div className="pd-msgrow">
            <MapDoc map={live!.partial!} />
          </div>
        )}
        {pending && (
          <div className="pd-msgrow">
            <div className="pd-working">{live?.narration || 'Compiling market data…'}</div>
          </div>
        )}
        {done && (
          <div style={{ display: 'flex', padding: '2px 0 10px' }}>
            <a
              className="pd-pill-primary"
              style={{ padding: '13px 26px' }}
              href={bookHref()}
              target={bookTarget()}
              rel={bookRel()}
              onClick={() => { fireDwell(); trackEvent('practice_booking_clicked', { placement: 'chat-pill' }); }}
            >
              Book your consultation →
            </a>
          </div>
        )}
      </div>
      {userTurns === 0 && !done && (
        <div className="pd-chips">
          {CHIPS.map(c => (
            <button type="button" key={c} className="pd-chip" onClick={() => useChip(c)}>{c}</button>
          ))}
        </div>
      )}
      <div className="pd-chat-inputrow">
        <input
          ref={inputRef}
          className="pd-chat-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder={hint}
          disabled={done}
          aria-label="Describe your acquisition criteria"
        />
        <button type="button" className="pd-send" onClick={() => send()} disabled={done || pending}>{sendLabel}</button>
      </div>
        </>
      )}
      </div>
    </div>
  );
}

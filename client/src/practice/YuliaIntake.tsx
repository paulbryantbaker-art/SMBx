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
import { useEffect, useRef, useState } from 'react';
import { bookHref, bookTarget } from './leads';
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

const HINTS = [
  'Sector & Strategy (e.g., "HVAC roll-up in the Southeast")',
  'Size & Geography (e.g., "$2–5M EBITDA, within 4 hours of Atlanta")',
  'Delivery Email (e.g., "director@fund.com")',
  'Generation complete. Your map is being compiled. Book your consultation above.',
];

/** The send button rotates with the step (Paul's copy update, Y-4). */
const SEND_LABELS = ['Continue', 'Generate Map', 'Send', 'Send'];

/** Before the first message, the input types example theses to itself — the
 *  card visibly wants to be talked to. Honest life: these are placeholder
 *  examples, clearly quoted, never pre-filled input. */
const TYPE_SAMPLES = [
  'HVAC roll-up in the Southeast',
  'Fire & life safety platform, Texas metros',
  'Commercial landscaping, GA and the Carolinas',
  'Managed IT tuck-ins under $10M revenue',
];

/** Quick-start chips — a short label to tap, the fuller thesis it drops in. */
const CHIPS: { label: string; value: string }[] = [
  { label: 'HVAC roll-up', value: 'HVAC roll-up in the Southeast' },
  { label: 'Fire & life safety', value: 'Fire & life safety platform, Texas metros' },
  { label: 'Managed IT tuck-ins', value: 'Managed IT tuck-ins under $10M revenue' },
  { label: 'Commercial landscaping', value: 'Commercial landscaping, GA and the Carolinas' },
];

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

/** Consume the SSE intake stream. Returns the authoritative final payload,
 *  or null if the transport failed before any content arrived (safe to fall
 *  back to the JSON endpoint). Throws after partial content. */
async function streamIntake(
  payload: { role: string; content: string }[],
  onAccum: (acc: string) => void,
): Promise<{ reply: string; done: boolean; map: MapData | null }> {
  const res = await fetch('/api/practice/intake/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload }),
  });
  if (!res.ok || !res.body) throw Object.assign(new Error('transport'), { clean: true });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let acc = '';
  let gotContent = false;
  let final: { reply: string; done: boolean; map: MapData | null } | null = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    for (const frame of frames) {
      const eventLine = frame.split('\n').find(l => l.startsWith('event:'));
      const dataLine = frame.split('\n').find(l => l.startsWith('data:'));
      if (!eventLine || !dataLine) continue;
      const event = eventLine.slice(6).trim();
      let data: any;
      try { data = JSON.parse(dataLine.slice(5)); } catch { continue; }
      if (event === 'delta' && typeof data.t === 'string') {
        gotContent = true;
        acc += data.t;
        onAccum(acc);
      } else if (event === 'final') {
        final = data;
      } else if (event === 'error') {
        throw Object.assign(new Error('server'), { clean: !gotContent });
      }
    }
  }
  if (!final) throw Object.assign(new Error('incomplete'), { clean: !gotContent });
  return final;
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
        <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 22, width: 'auto', display: 'block' }} />
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
  // On phones the chat lifts into a slide-up sheet so typing isn't buried in the
  // page under the keyboard (Paul, 2026-07-14: "a drawer that slides up and can
  // be minimized"). Desktop ignores this — the chat stays inline, front-and-center.
  const [open, setOpen] = useState(false);
  const mapTracked = useRef(messages.some(m => m.map)); // never re-count a restored map
  const dwell = useRef<{ start: number; verdict: string } | null>(null);
  const dwellFired = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Self-typing placeholder until the first message is sent.
  const [ghost, setGhost] = useState<string | null>(null);
  useEffect(() => {
    if (done || userTurns > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGhost(null);
      return;
    }
    let alive = true;
    let timer: number;
    let i = 0, pos = 0, deleting = false;
    const tick = () => {
      if (!alive) return;
      const s = TYPE_SAMPLES[i % TYPE_SAMPLES.length];
      let delay = deleting ? 16 : 46;
      if (!deleting) {
        pos++;
        if (pos >= s.length) { deleting = true; delay = 1700; }
      } else {
        pos--;
        if (pos <= 0) { deleting = false; i++; delay = 420; }
      }
      setGhost(s.slice(0, Math.max(0, pos)));
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 900);
    return () => { alive = false; clearTimeout(timer); };
  }, [done, userTurns]);

  const hint = step === 0 && ghost ? `Sector & Strategy — "${ghost}▏"` : HINTS[step];

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

  // Other components (the showcase's "Map your market" tab) can ask the drawer
  // to open on phones without reaching into this component.
  useEffect(() => {
    const onAsk = () => { if (isMobile()) openSheet(); };
    window.addEventListener('smbx:open-intake', onAsk);
    return () => window.removeEventListener('smbx:open-intake', onAsk);
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

  // Suggestion chips give the visitor a starting point (Paul: "adding direction
  // and input to the chat"). Clicking one drops it in the field, ready to send;
  // on a phone it also lifts straight into the sheet.
  const useChip = (text: string) => {
    setDraft(text);
    if (isMobile()) setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
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

  const send = async () => {
    const text = draft.trim();
    if (!text || done || pending) return;
    if (userTurns === 0) trackEvent('practice_intake_started');
    trackEvent('practice_intake_step', { step: userTurns + 1 });
    const next: Msg[] = [...messages, { from: 'u', text }];
    setMessages(next);
    setDraft('');
    setPending(true);
    setLive(null);
    const payload = next
      .filter(m => m.text)
      .map(m => ({ role: m.from === 'y' ? 'assistant' : 'user', content: m.text as string }));
    try {
      const data = await streamIntake(payload, acc => setLive(parseStreaming(acc)));
      applyFinal(data, true);
    } catch (err: any) {
      if (err?.clean) {
        // Transport failed before content — the plain JSON endpoint still works.
        try {
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
      } else {
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

  return (
    <div id="yulia" className="pd-chat-zone">
      {/* ── Mobile launcher — the home page keeps a chat-input-shaped doorway,
             but typing NEVER happens here: any tap slides the real chat up as
             a bottom sheet (Paul, 2026-07-14: "as soon as the user activates
             the box just go into the slide up view"). Hidden on desktop. ── */}
      <div className="pd-chat-launch" onClick={openSheet}>
        <div className="pd-chat-head">
          <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 28, width: 'auto', display: 'block' }} />
          <div className="pd-chat-title">Acquisition Engine</div>
        </div>
        <div className="pd-launch-body">
          {userTurns > 0
            ? 'Your session is in progress.'
            : 'Tell us a bit about what you’re looking for — we’ll build a preliminary market map in minutes.'}
        </div>
        {userTurns === 0 && !done && (
          <div className="pd-chips">
            {CHIPS.map(c => (
              <button
                type="button"
                key={c.value}
                className="pd-chip"
                onClick={e => { e.stopPropagation(); useChip(c.value); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" className="pd-chat-inputrow pd-launch-input" onClick={openSheet}>
          <span className="ph">{done ? 'Your map is ready — reopen it' : userTurns > 0 ? 'Tap to continue your session' : hint}</span>
          <span className="pd-send" aria-hidden="true">{userTurns > 0 || done ? 'Reopen' : sendLabel}</span>
        </button>
      </div>

      {/* Scrim behind the mobile sheet (CSS-hidden on desktop). */}
      <div ref={scrimRef} className={`pd-chat-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={sheetRef} className={`pd-chat${open ? ' open' : ''}`}>
        <div className="pd-chat-head">
          {/* Grab handle — shown only in the mobile sheet. */}
          <span className="pd-chat-grab" aria-hidden="true" />
          <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 28, width: 'auto', display: 'block' }} />
          <div className="pd-chat-title">Acquisition Engine</div>
          {/* Minimize — shown only in the mobile sheet. */}
          <button type="button" className="pd-chat-min" onClick={() => setOpen(false)} aria-label="Minimize chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
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
                  ? m.text.split('\n\n').map((p, j) => <p key={j} style={{ margin: j === 0 ? 0 : '10px 0 0' }}>{p}</p>)
                  : m.text}
              </div>
            </div>
          )
        ))}
        {pending && live?.preText && (
          <div className="pd-msgrow">
            <div className="pd-bub pd-bub-y">{live.preText}</div>
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
              rel={bookTarget() ? 'noreferrer' : undefined}
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
            <button type="button" key={c.value} className="pd-chip" onClick={() => useChip(c.value)}>{c.label}</button>
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
        <button type="button" className="pd-send" onClick={send} disabled={done || pending}>{sendLabel}</button>
      </div>
      </div>
    </div>
  );
}

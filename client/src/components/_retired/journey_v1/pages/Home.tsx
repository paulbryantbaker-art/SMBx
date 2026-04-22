/**
 * Home.tsx — rebuilt per the April 2026 site spec (§1).
 *
 * The front door. Deliberately short. The primary conversion action
 * (the chat input) is at the top. Sections below build context for
 * users who scroll before typing.
 *
 * Structure (top → bottom, inside the canvas):
 *   1. HeroInput       — H1 + subtitle + inline ChatDock + 4 chips
 *   2. TrustRow        — data source attribution, small muted
 *   3. CardGrid (6)    — WHAT YULIA DOES
 *   4. Pillars (3)     — EVERY DEAL. THREE THINGS THAT MATTER.
 *   5. PillRow (4)     — YULIA WORKS FOR
 *   6. BottomCTA       — quiet invitation + second inline ChatDock
 *
 * No dark hero band, no app-card grid, no h-rail of 9 capabilities —
 * all retired by the new spec. The h-page container + SectionNav are
 * preserved so the sticky dot-rail still works.
 */
import { useEffect, useRef } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import SectionNav, { type Section } from '../shell/SectionNav';
import {
  HeroInput, TrustRow, SectionLabel, CardGrid, Pillars, PillRow, BottomCTA,
  type Card, type Pillar, type RolePill,
} from '../shell/JourneyPrimitives';

const HOME_SECTIONS: readonly Section[] = [
  { id: 'hero',     label: 'Yulia' },
  { id: 'does',     label: 'What Yulia does' },
  { id: 'pillars',  label: 'Three truths' },
  { id: 'who',      label: 'Who Yulia is for' },
  { id: 'cta',      label: 'Start' },
];

const HERO_HINTS: readonly string[] = [
  'Screen a deal in 90 seconds…',
  'Find the add-backs hiding in your financials…',
  'Draft a CIM from a conversation…',
  'Model an SBA structure under SOP 50 10 8…',
  'Build your LP update in 20 minutes…',
  "What's this business actually worth…",
];

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

export default function Home({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  /* Reveal on scroll. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('.h-anim');
    if (!targets.length) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    return () => io.disconnect();
  }, []);

  /* Seed a chat message into the side ChatDock (and the page's inline
     ChatDock, via onSend). Both routes morph the page into chat mode. */
  const seed = (text: string) => onSend(text);

  /* Chip handlers — map label → journey-entry seed. */
  const chipSeed = (chip: string) => {
    const map: Record<string, string> = {
      "I'm selling": "I want to sell my business.",
      "I'm buying": "I want to buy a business.",
      "I'm raising": "I need to raise capital.",
      "I just closed a deal": "We just closed an acquisition.",
    };
    seed(map[chip] ?? chip);
  };

  /* ── SECTION 3: capability cards ── */
  const capabilityCards: readonly Card[] = [
    {
      icon: <Glyph name="search" />,
      title: 'Find the hidden money',
      proof: 'Add-back analysis. $1.1M average found. 20 minutes.',
      onClick: () => seed('Find the add-backs hiding in my financials.'),
    },
    {
      icon: <Glyph name="score" />,
      title: 'Score any deal in 90 seconds',
      proof: '7 dimensions. Pursue or pass before you spend a dollar.',
      onClick: () => seed('Score a deal for me.'),
    },
    {
      icon: <Glyph name="reg" />,
      title: 'Rebuild what SBA SOP 50 10 8 broke',
      proof: 'Capital stacks, seller notes, equity injection. Current rules.',
      onClick: () => seed('Rebuild my SBA capital stack under SOP 50 10 8.'),
    },
    {
      icon: <Glyph name="doc" />,
      title: 'Draft the CIM',
      proof: '25–40 pages. 30 minutes from a 20-minute conversation.',
      onClick: () => seed('Draft my CIM.'),
    },
    {
      icon: <Glyph name="loi" />,
      title: 'Draft the LOI',
      proof: 'Attorney-ready. First draft from deal context.',
      onClick: () => seed('Draft an LOI for the deal I just pasted.'),
    },
    {
      icon: <Glyph name="memo" />,
      title: 'Write the LP update',
      proof: 'IC memos, LP updates, board decks. 20 minutes.',
      onClick: () => seed('Write my LP update.'),
    },
  ];

  /* ── SECTION 4: three pillars ── */
  const pillars: readonly Pillar[] = [
    {
      kicker: 'Pillar 1',
      heading: 'Sell for more',
      body: 'What buyers pay comes from what sellers can show. Yulia finds the value hiding in your financials, builds the documents, and runs the process.',
      ctaLabel: 'Tell Yulia about your business',
      onCta: () => onNavigate('sell'),
    },
    {
      kicker: 'Pillar 2',
      heading: 'Buy right',
      body: 'The best deals go to the fastest screeners. Yulia scores any deal in 90 seconds, models the structure, and stress-tests the guarantee.',
      ctaLabel: 'Paste a deal for Yulia',
      onCta: () => onNavigate('buy'),
    },
    {
      kicker: 'Pillar 3',
      heading: 'Do it faster',
      body: 'Every practitioner is racing the same clock. Yulia does the analyst and associate work. You run the deal.',
      ctaLabel: 'Show me what Yulia does',
      onCta: () => onNavigate('how-it-works'),
    },
  ];

  /* ── SECTION 5: four role pills ── */
  const rolePills: readonly RolePill[] = [
    { title: 'Sellers',  body: '$5M EBITDA and up. Exit planning through close.',
      onClick: () => onNavigate('sell') },
    { title: 'Buyers',   body: 'Search funders, independent sponsors, PE, corp dev, principal buyers.',
      onClick: () => onNavigate('buy') },
    { title: 'Advisors', body: "Brokers, M&A boutiques, solo bankers. Yulia is the analyst you don't have.",
      onClick: () => onNavigate('sell') },
    { title: 'Investors', body: 'Family offices, fundless sponsors, LP groups. Evaluation through portfolio ops.',
      onClick: () => onNavigate('buy') },
  ];

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / home"
      canvasTitle="The AI deal team"
      canvasBadge="Free"
      chat={{
        title: 'Yulia',
        status: 'Ready',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'READY',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. Tell me what you're working on and I'll take it from there. Sell, buy, raise, integrate — one conversation covers all of it.",
        reply: "One line — <em>\"I'm thinking about selling,\"</em> <em>\"we just closed on a deal\"</em> — and I pick the journey and start.",
        chips: [] as const,
        placeholder: 'Tell Yulia what you need…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See what Yulia does',
          onClick: () => document.getElementById('does')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="home" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>
        <SectionNav sections={HOME_SECTIONS} />

        {/* §1 HERO */}
        <HeroInput
          heading={<>The AI deal team.</>}
          subtitle="Valuations. CIMs. Deal scoring. Financial models. Due diligence. LOIs. Everything an investment bank delivers — without the retainer."
          placeholder="Tell Yulia what you're working on…"
          typewriterHints={HERO_HINTS}
          chips={["I'm selling", "I'm buying", "I'm raising", "I just closed a deal"]}
          onChipClick={chipSeed}
          onSend={onSend}
        />

        {/* §2 TRUST ROW */}
        <TrustRow>
          Built on U.S. Census · Bureau of Labor Statistics · FRED · SEC EDGAR · SBA · IRS SOI
        </TrustRow>

        {/* §3 WHAT YULIA DOES */}
        <div id="does" style={{ marginTop: 48 }}>
          <SectionLabel>What Yulia does</SectionLabel>
          <CardGrid cards={capabilityCards} />
        </div>

        {/* §4 THREE PILLARS */}
        <div id="pillars" style={{ marginTop: 72 }}>
          <SectionLabel>Every deal. Three things that matter.</SectionLabel>
          <Pillars pillars={pillars} />
        </div>

        {/* §5 FOR WHOM */}
        <div id="who" style={{ marginTop: 72 }}>
          <SectionLabel>Yulia works for</SectionLabel>
          <PillRow pills={rolePills} />
        </div>

        {/* §6 BOTTOM CLOSE */}
        <BottomCTA
          heading="The first conversation is free. The first deliverable is free."
          subtitle="Start when you're ready."
          placeholder="Tell Yulia what you're working on…"
          onSend={onSend}
        />
      </div>
    </JourneyShell>
  );
}

/* ── Monochrome functional glyphs for the capability cards. ─────── */
function Glyph({ name }: { name: 'search' | 'score' | 'reg' | 'doc' | 'loi' | 'memo' }) {
  const common = {
    width: 18, height: 18, viewBox: '0 0 24 24',
    fill: 'none' as const, stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'search':
      return (
        <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" /><line x1="20" y1="20" x2="15" y2="15" /></svg>
      );
    case 'score':
      return (
        <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><polyline points="7 13 10 16 17 9" /></svg>
      );
    case 'reg':
      return (
        <svg {...common}><path d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M16 3v4h4" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="14" y2="16" /></svg>
      );
    case 'doc':
      return (
        <svg {...common}><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M15 3v4h4" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /><line x1="8" y1="9" x2="12" y2="9" /></svg>
      );
    case 'loi':
      return (
        <svg {...common}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="3 8 12 14 21 8" /></svg>
      );
    case 'memo':
      return (
        <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="7" y1="10" x2="17" y2="10" /><polyline points="7 14 11 17 17 11" /></svg>
      );
  }
}

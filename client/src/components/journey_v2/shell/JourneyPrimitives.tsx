/**
 * JourneyPrimitives.tsx — shared components per the April 2026 build spec (§6).
 *
 * Exports:
 *   SectionLabel  — small uppercase kicker
 *   ProblemBlock  — H2 + prose, used for "the problem" section
 *   ZigzagHero    — copy column + visual column, alternating direction
 *   CardGrid      — uniform 3×2 grid with clickable cards
 *   Pillars       — Home §4 vertical narrative stack
 *   PillRow       — Home §5 role pills
 *   Timeline      — expandable phase cards with spine (Sell §7, Buy §8, Int §3)
 *   StatRow       — three stats side-by-side
 *   InteractiveBlock — wrapper for estimators + previews
 *   BottomCTA     — invitation block at page end with inline ChatDock
 *   AlertBanner   — SBA-style regulatory alert (Buy §7)
 *   HeroInput     — headline + subtitle + inline ChatDock + chat chips
 *   TrustRow      — small attribution strip
 *
 * All components use classes from journey-primitives.css (.jp-*).
 * None of them hard-code layout widths — they assume they're rendered
 * inside a .h-page container that already sets the max-width.
 */

import { useState, type ReactNode } from 'react';
import ChatDock from '../../shared/ChatDock';

/* ── 1) SectionLabel ───────────────────────────────────────────── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="jp-label">{children}</div>;
}


/* ── 2) ProblemBlock ───────────────────────────────────────────── */
export function ProblemBlock({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="jp-problem h-anim">
      <h2 className="jp-problem__h">{heading}</h2>
      <div className="jp-problem__body">{children}</div>
    </section>
  );
}


/* ── 3) ZigzagHero ─────────────────────────────────────────────── */
export function ZigzagHero({
  reverse,
  heading,
  children,
  visual,
  id,
}: {
  /** When true, visual goes LEFT and copy goes RIGHT on desktop. */
  reverse?: boolean;
  heading: string;
  children: ReactNode;
  visual: ReactNode;
  id?: string;
}) {
  return (
    <section className="jp-zig h-anim" data-reverse={reverse ? 'true' : 'false'} id={id}>
      <div className="jp-zig__copy">
        <h2 className="jp-zig__h">{heading}</h2>
        <div className="jp-zig__body">{children}</div>
      </div>
      <div className="jp-zig__visual">{visual}</div>
    </section>
  );
}


/* ── 4) CardGrid ───────────────────────────────────────────────── */
export type Card = {
  icon?: ReactNode;
  title: string;
  proof: string;
  footnote?: string;
  onClick?: () => void;
};
export function CardGrid({ cards, id }: { cards: readonly Card[]; id?: string }) {
  return (
    <div className="jp-cards h-anim" id={id}>
      {cards.map((c, i) => (
        <button
          key={i}
          type="button"
          className="jp-card"
          onClick={c.onClick}
        >
          {c.icon && <div className="jp-card__icon">{c.icon}</div>}
          <div className="jp-card__title">{c.title}</div>
          <div className="jp-card__proof">{c.proof}</div>
          {c.footnote && <div className="jp-card__foot">{c.footnote}</div>}
        </button>
      ))}
    </div>
  );
}


/* ── 5) Pillars (Home §4) ──────────────────────────────────────── */
export type Pillar = {
  kicker: string;
  heading: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
};
export function Pillars({ pillars }: { pillars: readonly Pillar[] }) {
  return (
    <div className="jp-pillars h-anim">
      {pillars.map((p, i) => (
        <div key={i} className="jp-pillar">
          <div className="jp-pillar__k">{p.kicker}</div>
          <h3 className="jp-pillar__h">{p.heading}</h3>
          <p className="jp-pillar__body">{p.body}</p>
          <button type="button" className="jp-pillar__cta" onClick={p.onCta}>
            {p.ctaLabel} →
          </button>
        </div>
      ))}
    </div>
  );
}


/* ── 6) PillRow (Home §5) ──────────────────────────────────────── */
export type RolePill = { title: string; body: string; onClick: () => void };
export function PillRow({ pills }: { pills: readonly RolePill[] }) {
  return (
    <div className="jp-pills h-anim">
      {pills.map((p, i) => (
        <button key={i} type="button" className="jp-pill" onClick={p.onClick}>
          <strong>{p.title}</strong>
          <span>{p.body}</span>
        </button>
      ))}
    </div>
  );
}


/* ── 7) Timeline ───────────────────────────────────────────────── */
export type Phase = {
  node: string;          /* e.g., "01", "Day 0" */
  kicker: string;        /* e.g., "Phase 1 — UNDERSTAND (Months 1-2) — Free" */
  heading: string;       /* short title */
  summary: string;       /* one-paragraph summary */
  deliverables?: string; /* pipe-separated deliverables revealed when expanded */
};
export function Timeline({ phases, id }: { phases: readonly Phase[]; id?: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="jp-tl h-anim" id={id}>
      <div className="jp-tl__track" data-phases={phases.length}>
        {phases.map((p, i) => (
          <div
            key={i}
            className="jp-tl__phase"
            data-open={openIdx === i ? 'true' : 'false'}
          >
            <div className="jp-tl__node">{p.node}</div>
            <div className="jp-tl__k">{p.kicker}</div>
            <h4 className="jp-tl__t">{p.heading}</h4>
            <p className="jp-tl__s">{p.summary}</p>
            {p.deliverables && (
              <>
                <button
                  type="button"
                  className="jp-tl__open"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  aria-expanded={openIdx === i}
                >
                  {openIdx === i ? 'Hide deliverables' : 'Show deliverables'}
                  <span>+</span>
                </button>
                <div className="jp-tl__deliverables">{p.deliverables}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


/* ── 8) StatRow ────────────────────────────────────────────────── */
export type Stat = { value: string; label: string };
export function StatRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <div className="jp-stats h-anim">
      {stats.map((s, i) => (
        <div key={i} className="jp-stat">
          <div className="jp-stat__v">{s.value}</div>
          <div className="jp-stat__l">{s.label}</div>
        </div>
      ))}
    </div>
  );
}


/* ── 9) InteractiveBlock ───────────────────────────────────────── */
export function InteractiveBlock({
  heading,
  subtitle,
  children,
  id,
}: {
  heading: string;
  subtitle?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="jp-int h-anim" id={id}>
      <div className="jp-int__head">
        <h3 className="jp-int__h">{heading}</h3>
        {subtitle && <p className="jp-int__s">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}


/* ── 10) BottomCTA ─────────────────────────────────────────────── */
export function BottomCTA({
  heading,
  subtitle,
  placeholder,
  onSend,
  id,
}: {
  heading: string;
  subtitle: string;
  placeholder: string;
  onSend: (content: string) => void;
  id?: string;
}) {
  return (
    <section className="jp-close h-anim" id={id ?? 'cta'}>
      <h2 className="jp-close__h">{heading}</h2>
      <p className="jp-close__s">{subtitle}</p>
      <div className="jp-close__dock">
        <ChatDock variant="hero" placeholder={placeholder} onSend={onSend} rows={2} />
      </div>
    </section>
  );
}


/* ── 11) AlertBanner (Buy §7) ─────────────────────────────────── */
export function AlertBanner({
  kicker,
  heading,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  ctaLabel,
  onCta,
  id,
}: {
  kicker: string;
  heading: string;
  leftTitle: string;
  leftItems: readonly string[];
  rightTitle: string;
  rightItems: readonly string[];
  ctaLabel: string;
  onCta: () => void;
  id?: string;
}) {
  return (
    <section className="jp-alert h-anim" id={id}>
      <div className="jp-alert__k">{kicker}</div>
      <h3 className="jp-alert__h">{heading}</h3>
      <div className="jp-alert__cols">
        <div className="jp-alert__col">
          <div className="jp-alert__col-h">{leftTitle}</div>
          <ul>{leftItems.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </div>
        <div className="jp-alert__col">
          <div className="jp-alert__col-h">{rightTitle}</div>
          <ul>{rightItems.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </div>
      </div>
      <button type="button" className="jp-int__cta" style={{ marginTop: 20 }} onClick={onCta}>
        {ctaLabel}
      </button>
    </section>
  );
}


/* ── 12) HeroInput ─────────────────────────────────────────────── */
export function HeroInput({
  kicker,
  heading,
  subtitle,
  placeholder,
  typewriterHints,
  chips,
  onChipClick,
  onSend,
  id,
}: {
  kicker?: string;
  heading: ReactNode;
  subtitle: string;
  placeholder: string;
  typewriterHints?: readonly string[];
  chips?: readonly string[];
  onChipClick?: (chip: string) => void;
  onSend: (content: string) => void;
  id?: string;
}) {
  return (
    <section className="jp-hero h-anim" id={id ?? 'hero'}>
      {kicker && <SectionLabel>{kicker}</SectionLabel>}
      <h1 className="jp-hero__h">{heading}</h1>
      <p className="jp-hero__s">{subtitle}</p>
      <div className="jp-hero__dock">
        <ChatDock
          variant="hero"
          placeholder={placeholder}
          typewriterHints={typewriterHints ? [...typewriterHints] : undefined}
          onSend={onSend}
          rows={2}
        />
      </div>
      {chips && chips.length > 0 && (
        <div className="jp-hero__chips">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              className="jp-hero__chip"
              onClick={() => onChipClick?.(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}


/* ── 13) TrustRow ──────────────────────────────────────────────── */
export function TrustRow({ children }: { children: ReactNode }) {
  return <div className="jp-trust">{children}</div>;
}


/* ── 14) BigStat — Sell §2 quiet visual ────────────────────────── */
export function BigStat({ children }: { children: ReactNode }) {
  return <div className="jp-big-stat">{children}</div>;
}

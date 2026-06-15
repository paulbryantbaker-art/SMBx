/* ============================================================================
   AskYuliaHome.tsx — the HOME surface (chat is home). Yulia opens with a
   proactive daily briefing: what needs you, market intelligence on live deals,
   and pipeline momentum — rendered as rich cards inside her first turn, with the
   composer front and center. Clicking anything routes into the deal workspace.

   Faithful port of Test 33 / today.jsx → presentational TSX. All data arrives
   via typed props; the integration layer wires real data later.
   ============================================================================ */
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Ic, YuliaMark, Avatar, Btn, IconBtn, Chip } from "../primitives";
import type { IcName } from "../primitives";
import { YuliaMsg, Composer } from "../chrome";

/* ---- data shapes ---- */
export interface NeedItem {
  /** icon glyph name (e.g. "check", "st_analyze", "doc") */
  icon?: IcName;
  title: string;
  /** optional inline detail after the deal/stage (e.g. "7.4× → 24.6% IRR") */
  sub?: string;
  deal: string;
  stage: string;
  time: string;
  action: string;
  /** opaque id the surface forwards to onReview */
  id?: string;
}

export interface IntelItem {
  title: string;
  sub: string;
  /** what this intel affects (e.g. "Project Vela · Project Atlas") */
  affects: string;
  action: string;
  id?: string;
}

export interface DealRowItem {
  name: string;
  target: string;
  /** stage index into the StagePips lane: 0 Sourcing · 1 Analysis · 2 Closing · 3 Post */
  idx: number;
  /** last agent action line */
  last: string;
  lastTime: string;
  id?: string;
}

export interface AskYuliaHomeProps {
  userName: string;
  /** dateline above the greeting, e.g. "Monday · June 15 · 8:42 AM" */
  greeting?: string;
  /** Yulia's opening briefing lede (rich) — falls back to an honest empty state */
  briefingLede?: ReactNode;
  /** timestamp on Yulia's opening turn */
  briefingTime?: string;
  needs: NeedItem[];
  intel: IntelItem[];
  deals: DealRowItem[];
  suggestions: string[];
  onAsk: (prompt: string) => void;
  onOpenDeal: (id: string) => void;
  onReview: (item: NeedItem | IntelItem) => void;
  /** optional: overview / clock chrome affordances */
  onNav?: (dest: string) => void;
  composerPlaceholder?: string;
}

/* ---- pipeline stage pips ---- */
export function StagePips({ idx = 1 }: { idx?: number }) {
  const labels = ["Sourcing", "Analysis", "Closing", "Post"];
  return (
    <div className="mck-row" style={{ gap: 5 }}>
      {labels.map((l, i) => (
        <span
          key={l}
          title={l}
          style={{
            width: i === idx ? 16 : 7,
            height: 7,
            borderRadius: 4,
            background: i < idx ? "var(--ink-3)" : i === idx ? "var(--accent)" : "var(--surface-3)",
            transition: "all .2s",
          }}
        />
      ))}
    </div>
  );
}

/* ---- "needs you" row ---- */
export function NeedCard({
  icon = "check",
  title,
  sub,
  deal,
  stage,
  time,
  action,
  onClick,
}: {
  icon?: IcName;
  title: string;
  sub?: string;
  deal: string;
  stage: string;
  time: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="mck-card"
      onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "13px 15px", display: "flex", alignItems: "center", gap: 13, transition: "border-color .12s" }}
    >
      <span className="mck-task-ic" style={{ width: 28, height: 28, borderRadius: 8 }}>
        <Ic name={icon} size={14} />
      </span>
      <span className="mck-col" style={{ gap: 3, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</span>
        <span className="mck-row" style={{ gap: 7, color: "var(--ink-3)", fontSize: 11.5 }}>
          <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>{deal}</span>
          <span>·</span>
          <span>{stage}</span>
          {sub && (
            <>
              <span>·</span>
              <span>{sub}</span>
            </>
          )}
        </span>
      </span>
      <span className="mck-msg-time" style={{ flex: "0 0 auto" }}>{time}</span>
      <span className="mck-btn mck-btn-ghost mck-btn-sm" style={{ flex: "0 0 auto" }}>
        {action}
        <Ic name="chevRight" size={13} />
      </span>
    </button>
  );
}

/* ---- market intelligence row (Yulia-surfaced, honest) ---- */
export function IntelCard({
  title,
  sub,
  affects,
  action,
  onClick,
}: {
  title: string;
  sub: string;
  affects: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="mck-card"
      onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "14px 16px", display: "flex", gap: 13, alignItems: "flex-start", transition: "border-color .12s" }}
    >
      <YuliaMark size={26} />
      <span className="mck-col" style={{ gap: 5, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</span>
        <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>{sub}</span>
        <span className="mck-row" style={{ gap: 7, marginTop: 4 }}>
          <span className="mck-eyebrow">Affects</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>{affects}</span>
        </span>
      </span>
      <span className="mck-row" style={{ gap: 5, flex: "0 0 auto", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
        {action}
        <Ic name="arrowRight" size={13} />
      </span>
    </button>
  );
}

/* ---- deal pulse row ---- */
export function DealRow({
  name,
  target,
  idx,
  last,
  lastTime,
  onClick,
}: {
  name: string;
  target: string;
  idx: number;
  last: string;
  lastTime: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="mck-card"
      onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "13px 16px", display: "flex", alignItems: "center", gap: 13, transition: "border-color .12s" }}
    >
      <Avatar name={name} tone="c" size={28} />
      <span className="mck-col" style={{ gap: 2, minWidth: 0, width: 180, flex: "0 0 180px" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{target}</span>
      </span>
      <StagePips idx={idx} />
      <span className="mck-row" style={{ gap: 8, marginLeft: "auto", minWidth: 0 }}>
        <Ic name="agent" size={13} style={{ color: "var(--accent)", flex: "0 0 auto" } as CSSProperties} />
        <span style={{ fontSize: 12, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last}</span>
        <span className="mck-msg-time" style={{ flex: "0 0 auto" }}>{lastTime}</span>
      </span>
      <Ic name="chevRight" size={15} style={{ color: "var(--ink-4)", flex: "0 0 auto" } as CSSProperties} />
    </button>
  );
}

/* ---- briefing block header ---- */
function BriefGroup({ title, count, children }: { title: string; count?: number | string | null; children: ReactNode }) {
  return (
    <div className="mck-col" style={{ gap: 10, marginTop: 6 }}>
      <div className="mck-row" style={{ gap: 8 }}>
        <span className="mck-eyebrow">{title}</span>
        {count != null && <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{count}</span>}
      </div>
      <div className="mck-col" style={{ gap: 8 }}>{children}</div>
    </div>
  );
}

/* ---- the Ask Yulia home ---- */
export function AskYuliaHome({
  userName,
  greeting,
  briefingLede,
  briefingTime = "8:42",
  needs,
  intel,
  deals,
  suggestions,
  onAsk,
  onOpenDeal,
  onReview,
  onNav,
  composerPlaceholder = "Ask Yulia, or tell her what to work on…",
}: AskYuliaHomeProps) {
  const open = (id?: string) => id && onOpenDeal(id);
  const [draft, setDraft] = useState("");

  return (
    <div className="mck-col mck-grow" style={{ height: "100%" }}>
      {/* slim home header */}
      <div className="mck-row" style={{ gap: 10, height: 50, flex: "0 0 50px", padding: "0 22px", borderBottom: "1px solid var(--line)" }}>
        <YuliaMark size={23} />
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>Ask Yulia</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>· Home</span>
        <div className="mck-grow" />
        <Btn variant="ghost" size="sm" icon="grid" onClick={() => onNav && onNav("overview")}>Overview</Btn>
        <IconBtn name="clock" onClick={() => onNav && onNav("recents")} />
      </div>

      {/* conversation — Yulia's proactive briefing */}
      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "34px 0 26px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          {greeting && <div className="mck-eyebrow">{greeting}</div>}

          <div className="mck-col" style={{ gap: 7 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", margin: 0 }}>Good morning, {userName}.</h1>
          </div>

          <YuliaMsg time={briefingTime}>
            <div className="mck-prose" style={{ marginBottom: 6 }}>
              {briefingLede ?? (
                <>
                  I worked overnight. <b>{needs.length} {needs.length === 1 ? "thing" : "things"}</b> need you today, I caught <b>{intel.length} market {intel.length === 1 ? "move" : "moves"}</b> on your live deals, and here's where the pipeline stands.
                </>
              )}
            </div>

            <BriefGroup title="Needs your attention" count={needs.length || null}>
              {needs.length === 0 ? (
                <div className="mck-empty">Nothing needs you right now.</div>
              ) : (
                needs.map((n, i) => (
                  <NeedCard
                    key={n.id ?? i}
                    icon={n.icon}
                    title={n.title}
                    sub={n.sub}
                    deal={n.deal}
                    stage={n.stage}
                    time={n.time}
                    action={n.action}
                    onClick={() => (n.id ? open(n.id) : onReview(n))}
                  />
                ))
              )}
            </BriefGroup>

            <BriefGroup title="Market intelligence · surfaced overnight">
              {intel.length === 0 ? (
                <div className="mck-empty">No live feed yet.</div>
              ) : (
                intel.map((it, i) => (
                  <IntelCard
                    key={it.id ?? i}
                    title={it.title}
                    sub={it.sub}
                    affects={it.affects}
                    action={it.action}
                    onClick={() => (it.id ? open(it.id) : onReview(it))}
                  />
                ))
              )}
            </BriefGroup>

            <BriefGroup title="Your deals · pipeline momentum" count={deals.length || null}>
              {deals.length === 0 ? (
                <div className="mck-empty">No deals yet.</div>
              ) : (
                deals.map((d, i) => (
                  <DealRow
                    key={d.id ?? i}
                    name={d.name}
                    target={d.target}
                    idx={d.idx}
                    last={d.last}
                    lastTime={d.lastTime}
                    onClick={() => open(d.id)}
                  />
                ))
              )}
            </BriefGroup>
          </YuliaMsg>
        </div>
      </div>

      {/* composer */}
      <div style={{ flex: "0 0 auto", padding: "0 0 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 28px" }}>
          <div className="mck-row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {suggestions.map((s) => (
              <Chip key={s} icon="spark" onClick={() => onAsk(s)}>{s}</Chip>
            ))}
          </div>
          <Composer value={draft} onChange={setDraft} onSend={(v) => { onAsk(v); setDraft(""); }} placeholder={composerPlaceholder} lawLine />
        </div>
      </div>
    </div>
  );
}

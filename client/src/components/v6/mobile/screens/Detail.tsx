/* V6 Mobile — Deal detail screen.
   App Store app-detail style: floating glass nav + big icon + stats strip +
   tag chips + What's Yulia saying + A closer look (horizontal artifact rail)
   + Confidence & notes. */

import { type CSSProperties, type ReactNode } from "react";
import { YIcon } from "../YIcon";
import { MobileIcon } from "../icons";

interface DetailProps {
  dealId: string;
  dealTitle: string;
  onBack: () => void;
}

export function DetailScreen({ dealId: _dealId, dealTitle, onBack }: DetailProps) {
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 140, position: "relative", background: "var(--mb-bg)" }}>
      <FloatingNav onBack={onBack} />

      {/* Hero block — icon + name + verdict */}
      <div style={D.hero}>
        <YIcon size={108} kind="pursue" radius={24} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <h1 style={D.h1}>{dealTitle}</h1>
          <div style={D.dealMeta}>East Texas &middot; Deal #SMBX-0119</div>
          <div style={{ marginTop: 10 }}>
            <button type="button" className="mb-get-pill solid" style={D.verdictBtn}>Pursue</button>
          </div>
          <div style={D.verdictCaption}>Yulia&rsquo;s verdict</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={D.statsStrip}>
        <Stat top="$1.80M" label="NORM. SDE" sub={<span style={{ color: "var(--mb-accent)" }}>+$760K</span>} divider />
        <Stat top="7.0×"   label="MULTIPLE"  sub="SBA-clear" divider />
        <Stat top="92"     label="FIT SCORE" sub={<Stars n={4.6} />} divider />
        <Stat top="#3"     label="THIS WEEK" sub="of 142" />
      </div>

      {/* Tag chips */}
      <div className="mb-hide-scroll" style={D.tagsRow}>
        {["Industrial", "Services", "Recurring", "SBA-clear", "Sun Belt"].map(t => (
          <div key={t} style={D.tag}>{t}</div>
        ))}
      </div>

      {/* What's Yulia saying */}
      <Section title="What's Yulia saying" chevron>
        <div className="mb-mono" style={D.versionLine}>
          UPDATED 2 MIN AGO &nbsp;&middot;&nbsp; v3
        </div>
        <p style={D.body}>
          Recast is real. $760K of add-backs are clean &mdash; owner comp, family payroll, one-time legal, M&amp;E. The 38% top-5 concentration looks scary on paper but they&rsquo;ve held those accounts 6+ years with zero churn. That&rsquo;s a moat, not a risk. NWC peg is below median; flag for QoE. Drafting the IOI now.
        </p>
      </Section>

      {/* A closer look — horizontal artifact rail */}
      <Section title="A closer look" pad={false}>
        <div className="mb-hide-scroll" style={D.artifactsRow}>
          <ArtifactPreview kind="recast"   title="Recast walk"    big="$1.80M"    sub="P&L normalization · 5 lines" />
          <ArtifactPreview kind="baseline" title="Baseline range" big="$7.2–9.4M" sub="4 scenarios · SBA at $7.8M" />
          <ArtifactPreview kind="buyers"   title="Buyer list"     big="69"        sub="47 strategics · 22 sponsors" />
          <ArtifactPreview kind="ioi"      title="IOI draft"      big="v2"        sub="Aggressive but earnest" />
        </div>
      </Section>

      {/* Confidence & notes */}
      <Section title="Confidence & notes" chevron>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4 }}>
          <div>
            <div style={D.bigNumber}>4.6</div>
            <div style={D.bigNumberSub}>out of 5</div>
          </div>
          <div style={{ flex: 1 }}>
            <Stars n={4.6} size={14} />
            <div style={{ fontSize: 13, color: "var(--mb-ink-3)", marginTop: 4 }}>Yulia&rsquo;s confidence</div>
            <div style={D.confidenceBody}>
              Verdict held across 3 reviews. Concentration risk and NWC peg are the only two reasons confidence isn&rsquo;t 5/5.
            </div>
          </div>
        </div>

        <div style={D.userNote}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Stars n={5} size={11} />
            <span style={{ fontSize: 12, color: "var(--mb-ink-3)" }}>&middot;&nbsp;you, 1d ago</span>
          </div>
          <div style={D.userNoteTitle}>Worth the call. Lining up the SBA pre-qual today.</div>
          <div style={D.userNoteBody}>
            The recast story tracks with what the broker mentioned off-record. I want to see the customer contracts before IOI goes out.
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── Floating glass back/share nav ──────────────────────── */

function FloatingNav({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div style={D.navTopGuard} aria-hidden="true" />
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{ ...D.navBtn, top: 18, left: 16 }}
      >
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button
        type="button"
        aria-label="Share"
        style={{ ...D.navBtn, top: 18, right: 16 }}
      >
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>
    </>
  );
}

/* ─── Stat cell ─────────────────────────────────────────── */

function Stat({ top, label, sub, divider }: { top: string; label: string; sub: ReactNode; divider?: boolean }) {
  return (
    <div style={{
      borderRight: divider ? "0.5px solid var(--mb-line-2)" : "none",
      padding: "0 4px", minWidth: 0,
    }}>
      <div style={D.statLabel}>{label}</div>
      <div style={D.statTop}>{top}</div>
      <div style={D.statSub}>{sub}</div>
    </div>
  );
}

/* ─── Stars (filled / half / empty) ─────────────────────── */

function Stars({ n, size = 12 }: { n: number; size?: number }) {
  const full = Math.floor(n);
  const half = n - full >= 0.3 && n - full <= 0.7;
  return (
    <span style={{ display: "inline-flex", gap: 1.5, color: "var(--mb-ink-1)" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <MobileIcon
          key={i}
          name="star"
          size={size}
          c={i < full ? "var(--mb-ink-1)" : (i === full && half ? "var(--mb-ink-1)" : "var(--mb-ink-5)")}
        />
      ))}
    </span>
  );
}

/* ─── Section ──────────────────────────────────────────── */

function Section({ title, chevron, pad = true, children }: {
  title: string; chevron?: boolean; pad?: boolean; children: ReactNode;
}) {
  return (
    <div style={{
      borderTop: "0.5px solid var(--mb-line-2)",
      padding: pad ? "20px 22px 22px" : "20px 0 22px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: pad ? 0 : "0 22px",
        marginBottom: 10,
      }}>
        <h3 style={D.sectionTitle}>
          {title}
          {chevron && <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Artifact preview card ─────────────────────────────── */

type ArtifactKind = "recast" | "baseline" | "buyers" | "ioi";

// Each artifact card is a texture + tinted overlay (kept for white text
// legibility), except "ioi" which stays as the formal dark slate card —
// textures would weaken the IOI/LOI doc gravitas.
const ARTIFACT_BG: Record<ArtifactKind, string> = {
  recast:
    "linear-gradient(160deg, rgba(48,108,80,0.44) 0%, rgba(18,68,46,0.74) 100%), url('/textures/texture-pursue.png?v=20260503')",
  baseline:
    "linear-gradient(160deg, rgba(60,108,168,0.44) 0%, rgba(25,68,118,0.74) 100%), url('/textures/texture-baseline.png?v=20260503')",
  buyers:
    "linear-gradient(160deg, rgba(95,68,150,0.44) 0%, rgba(60,38,108,0.74) 100%), url('/textures/texture-buyers.png?v=20260503')",
  ioi:
    "linear-gradient(160deg, #3A4150, #1A2233)",
};

function ArtifactPreview({ kind, title, big, sub }: { kind: ArtifactKind; title: string; big: string; sub: string }) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      style={{
        flexShrink: 0, width: 220,
        borderRadius: 18,
        backgroundImage: ARTIFACT_BG[kind],
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff", overflow: "hidden", position: "relative",
        boxShadow: "0 6px 18px -8px rgba(0,0,0,0.2)",
        cursor: "pointer",
      }}
    >
      <div style={{ height: 130, position: "relative" }}>
        <div style={D.artifactGlow} aria-hidden="true" />
        <div className="mb-mono" style={D.artifactCaption}>{title.toUpperCase()}</div>
        <div style={D.artifactBig}>{big}</div>
      </div>
      <div style={D.artifactFooter}>
        <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.3 }}>{sub}</div>
        <button
          type="button"
          className="mb-get-pill dark"
          style={{ padding: "4px 14px", fontSize: 12 }}
        >Open</button>
      </div>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  hero: {
    padding: "60px 22px 18px",
    display: "flex", gap: 14, alignItems: "flex-start",
  },
  h1: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px", lineHeight: 1.1,
    margin: 0, color: "var(--mb-ink)",
    textWrap: "balance",
  },
  dealMeta: { fontSize: 14, color: "var(--mb-ink-3)", marginTop: 4 },
  verdictBtn: { padding: "7px 26px", fontSize: 15 },
  verdictCaption: {
    fontSize: 11, color: "var(--mb-ink-4)", marginTop: 4,
    textAlign: "center", maxWidth: 110,
  },
  statsStrip: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    padding: "4px 22px 18px",
    gap: 0,
  },
  statLabel: {
    fontSize: 10, color: "var(--mb-ink-4)",
    letterSpacing: 0.1, fontWeight: 600,
  },
  statTop: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 18, letterSpacing: "-0.4px",
    color: "var(--mb-ink)", marginTop: 2,
  },
  statSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  tagsRow: {
    display: "flex", gap: 8,
    padding: "0 22px 20px",
    overflowX: "auto",
  },
  tag: {
    padding: "7px 14px", borderRadius: 999,
    background: "var(--mb-card-2)",
    fontSize: 13, color: "var(--mb-ink-1)", fontWeight: 500,
    whiteSpace: "nowrap",
  },
  versionLine: {
    fontSize: 12, color: "var(--mb-ink-4)", marginBottom: 6,
  },
  body: {
    fontSize: 15, color: "var(--mb-ink-1)", lineHeight: 1.45,
    margin: 0, letterSpacing: "-0.1px",
    textWrap: "pretty",
  },
  sectionTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px",
    color: "var(--mb-ink)",
    margin: 0,
    display: "flex", alignItems: "center", gap: 6,
  },
  artifactsRow: {
    display: "flex", gap: 14,
    padding: "4px 22px 4px",
    overflowX: "auto",
  },
  artifactGlow: {
    position: "absolute", top: -30, right: -20,
    width: 140, height: 140, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
  },
  artifactCaption: {
    position: "absolute", bottom: 12, left: 16,
    fontSize: 10, letterSpacing: 0.1,
    color: "#fff",
  },
  artifactBig: {
    position: "absolute", bottom: 24, left: 16,
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 36, letterSpacing: "-1px", lineHeight: 1,
    color: "#fff",
  },
  artifactFooter: {
    padding: "10px 14px 12px",
    background: "rgba(0,0,0,0.18)",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  },
  bigNumber: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 56, letterSpacing: "-2px", lineHeight: 1,
    color: "var(--mb-ink)",
  },
  bigNumberSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  confidenceBody: {
    marginTop: 6, fontSize: 12.5, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  userNote: {
    marginTop: 16, padding: 14,
    background: "var(--mb-card-2)", borderRadius: 14,
  },
  userNoteTitle: {
    fontSize: 14, fontWeight: 600, color: "var(--mb-ink)", marginBottom: 4,
  },
  userNoteBody: {
    fontSize: 13, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  navTopGuard: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 60, background: "transparent", zIndex: 5,
  },
  navBtn: {
    position: "absolute", zIndex: 10,
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
};

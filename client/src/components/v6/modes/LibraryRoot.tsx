import { useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import type { IconName, OpenTab, TabKind } from "../types";
import { V6ModeRootEmpty } from "./ModeRootEmpty";
import { useHomeDeals } from "../../../hooks/useHomeDeals";
import type { User } from "../../../hooks/useAuth";

const FILTERS = ["All · 143", "Starred · 12", "Deals · 87", "Docs · 24", "Analyses · 11", "Memos · 9"];

interface LibItem {
  kind: TabKind;
  title: string;
  sub: string;
  updated: string;
  starred: boolean;
}

const ITEMS: LibItem[] = [
  { kind: "deal",     title: "Big Fake Deal · sample",     sub: "Pursue · 92 fit", updated: "Today",     starred: true  },
  { kind: "doc",      title: "Big Fake Deal · LOI v3",     sub: "Draft",           updated: "3d ago",    starred: true  },
  { kind: "analysis", title: "Big Fake Deal · Recast",     sub: "Live",            updated: "Yesterday", starred: false },
  { kind: "doc",      title: "Q1 thesis memo",             sub: "Final",           updated: "Feb 28",    starred: true  },
  { kind: "deal",     title: "Pest Control · FL",          sub: "Pursue · 84 fit", updated: "2d ago",    starred: false },
  { kind: "analysis", title: "Pest Control · Comps",       sub: "Saved",           updated: "Mar 20",    starred: false },
  { kind: "deal",     title: "Auto repair · 4-loc",        sub: "Closed at $3.2M", updated: "MAR 12",    starred: true  },
  { kind: "doc",      title: "Acme NDA · executed",        sub: "Final",           updated: "Mar 18",    starred: false },
];

export function V6LibraryRoot({ openTab, user }: { openTab: OpenTab; user?: User | null }) {
  const home = useHomeDeals(user ?? null);
  // UX-57: empty state for authed users with no deals — library is empty until
  // they have content to organize.
  if (home.isAuthed && !home.loading && !home.hasData) {
    return <V6ModeRootEmpty
      noun="library entries"
      body="The library is your starred and saved view across all deals, docs, and analyses — populates as you work with Yulia."
    />;
  }
  return _LibraryBody({ openTab });
}

function _LibraryBody({ openTab }: { openTab: OpenTab }) {
  const [active, setActive] = useState(0);

  return (
    <div className="m-fade-up">
      <V6Section
        eyebrow="LIBRARY"
        title="Everything you've touched"
        sub="One place for deals, docs, analyses, and memos."
      >
        <div />
      </V6Section>

      <div role="tablist" aria-label="Filter library" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className="m-state"
            role="tab"
            aria-selected={active === i}
            style={{
              all: "unset",
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              background: active === i ? "var(--m-primary-container)" : "var(--m-surface-2)",
              color: active === i ? "var(--m-on-primary-container)" : "var(--m-on-surface-var)",
              cursor: "pointer",
            }}
          >{t}</button>
        ))}
      </div>

      <div className="m-card" style={{ overflow: "hidden", padding: 0 }}>
        {ITEMS.map((it, i) => (
          <div
            key={`${it.title}-${i}`}
            className="m-state"
            onClick={() => openTab({ kind: it.kind, title: it.title })}
            role="button"
            tabIndex={0}
            aria-label={`${it.title}, ${it.sub}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: it.kind, title: it.title }); } }}
            style={{
              ...L.row,
              borderBottom: i === ITEMS.length - 1 ? "none" : "1px solid var(--m-outline-var)",
            }}
          >
            <V6Icon name={iconForKind(it.kind)} size={14} />
            <div style={L.title}>{it.title}</div>
            <div style={L.sub}>{it.sub}</div>
            <div className="mono" style={L.updated}>{it.updated.toUpperCase()}</div>
            <span aria-label={it.starred ? "Starred" : "Not starred"} style={{
              color: it.starred ? "var(--m-watch)" : "var(--m-outline)", fontSize: 14,
            }}>{it.starred ? "★" : "☆"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function iconForKind(kind: TabKind): IconName {
  if (kind === "deal") return "deal";
  if (kind === "doc") return "doc";
  if (kind === "analysis") return "chart";
  return "library";
}

const L: Record<string, CSSProperties> = {
  row: {
    display: "grid",
    gridTemplateColumns: "32px 2fr 1.4fr 100px 24px",
    alignItems: "center", gap: 16,
    padding: "12px 18px",
    cursor: "pointer",
  },
  title: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  sub: {
    fontSize: 12, color: "var(--m-on-surface-mid)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  updated: {
    fontSize: 10.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em",
  },
};

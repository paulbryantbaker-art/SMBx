import { useState } from "react";
import { V6Icon } from "../icons";
import type { IconName, OpenTab, TabKind } from "../types";

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

export function V6LibraryRoot({ openTab }: { openTab: OpenTab }) {
  const [active, setActive] = useState(0);

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-eyebrow">Library</div>
          <div className="pg-title">Everything you've touched</div>
          <p className="pg-sub">One place for deals, docs, analyses, and memos.</p>
        </div>
      </div>

      <div className="segmented" style={{ flexWrap: "wrap" }}>
        {FILTERS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={`seg ${active === i ? "on" : ""}`}
            role="tab"
            aria-selected={active === i}
            type="button"
          >{t}</button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <table className="wktable">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Title</th>
              <th>Status</th>
              <th className="r">Updated</th>
              <th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it, i) => (
              <tr
                key={`${it.title}-${i}`}
                onClick={() => openTab({ kind: it.kind, title: it.title })}
                role="button"
                aria-label={`${it.title}, ${it.sub}`}
              >
                <td style={{ color: "var(--ink-3)" }}>
                  <V6Icon name={iconForKind(it.kind)} size={14} />
                </td>
                <td>
                  <div className="nm">{it.title}</div>
                </td>
                <td><span className="muted">{it.sub}</span></td>
                <td className="r muted">{it.updated.toUpperCase()}</td>
                <td style={{ textAlign: "center" }}>
                  <span
                    aria-label={it.starred ? "Starred" : "Not starred"}
                    style={{ color: it.starred ? "var(--accent-strong)" : "var(--line-2)", fontSize: 14 }}
                  >{it.starred ? "★" : "☆"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabfoot">
          <span>{ITEMS.length} items</span>
        </div>
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

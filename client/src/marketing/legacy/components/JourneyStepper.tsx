import { type ReactNode } from 'react';

/**
 * JourneyStepper — one reusable, ALL-VISIBLE stage walkthrough, shared by the
 * journey pages (currently /raise R0–R5 and /integrate PMI0–PMI3). It replaces
 * the old tabbed stepper (a `role="tablist"` of stage pills + one reveal panel)
 * with a zig-zag layout: every stage is shown at once, stacked vertically, each
 * stage a row in a 2-column grid whose text/visual sides ALTERNATE per row.
 *
 *   • a thin vertical spine runs down the column with one node per stage — a
 *     premium connecting element that reinforces "stage by stage".
 *   • each row's TEXT side shows the stage `code` (mono accent data label, not
 *     an eyebrow), the `title` (h3), a "What Yulia builds" label + the `build`
 *     line, the `blurb`, and the optional `note` rendered VERBATIM (muted mono —
 *     these are compliance / scope boundaries, e.g. Raise R3
 *     "smbX.ai does not solicit or contact investors on your behalf").
 *   • each row's VISUAL side renders the stage `visual` as-is. The visuals are
 *     heterogeneous but all SELF-FRAME (page-level visuals are wrapped in `.mock`
 *     by the page; InvestorDeckMock / CapTableMock carry their own `.mkt-*`
 *     chrome). So `.zz-visual` is a transparent flow container — it never adds a
 *     card of its own, which avoids double-framing while keeping every row
 *     consistent. A stage with no `visual` lets its text use the full row width.
 *
 * Motion: rows scroll-reveal with a CSS keyframe — even rows slide in from the
 * text side, odd rows from the other side, echoing the zig-zag. CSS animations
 * (with `… both`) settle on their visible end-state reliably even when the tab
 * runs backgrounded and rAF / framer entrance anims freeze. prefers-reduced-
 * motion disables all of it (everything sits at its end-state). Tokens only;
 * styles live in marketing.css under `.zigzag` / `.zz-*`.
 *
 * The prop signature is unchanged so the pages need zero edits; `idBase` is now
 * unused (kept in the props type for source-compat — the rows no longer need
 * ARIA tab ids). `JourneyStage` gains an optional `framed?` flag that is also
 * unused at render time (the transparent-wrapper approach made it unnecessary),
 * kept only so a page may set it without a type error.
 */

export type JourneyStage = {
  code: string;
  title: string;
  /** the "What Yulia builds" line */
  build: string;
  blurb: string;
  /** muted secondary line — used verbatim for boundary / scope notes */
  note?: string;
  /** an optional product mock / chart rendered alongside the copy */
  visual?: ReactNode;
  /**
   * Optional hint that the visual already carries its own frame chrome. Not used
   * by the current renderer (every visual self-frames and `.zz-visual` adds no
   * card), kept so pages can set it without a type error.
   */
  framed?: boolean;
};

export function JourneyStepper({
  title,
  intro,
  stages,
}: {
  title: string;
  intro: string;
  stages: JourneyStage[];
  /** retained for source-compat with the pages; no longer used (was ARIA id prefix) */
  idBase?: string;
}) {
  return (
    <div className="zigzag">
      <div className="jstep-head">
        <h2>{title}</h2>
        <p className="lead jstep-intro">{intro}</p>
      </div>

      {/* the zig-zag track. A thin spine with a node per stage runs down the
          shared column; rows alternate text/visual sides via :nth-child. */}
      <ol className="zz-track" aria-label={title}>
        {stages.map((s, i) => {
          // even rows (0,2,4…) → text left / visual right; odd rows → swapped.
          // The reveal slides each row in from its own text side (left vs right),
          // staggered down the page by index.
          const odd = i % 2 === 1;
          return (
            <li
              key={s.code}
              className={`zz-row${odd ? ' is-odd' : ''}`}
              style={{ ['--zz-i' as string]: String(i) }}
            >
              {/* spine node for this stage (sits over the track spine) */}
              <span className="zz-node" aria-hidden="true">
                <span className="zz-node-dot" />
              </span>

              <div className="zz-text">
                <span className="zz-code mono">{s.code}</span>
                <h3 className="zz-title">{s.title}</h3>
                <div className="zz-build">
                  <span className="zz-build-label mono">What Yulia builds</span>
                  <span className="zz-build-text">{s.build}</span>
                </div>
                <p className="zz-blurb">{s.blurb}</p>
                {s.note && <p className="zz-note mono">{s.note}</p>}
              </div>

              {s.visual && (
                <div className="zz-visual">{s.visual}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

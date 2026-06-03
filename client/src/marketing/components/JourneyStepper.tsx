import { useRef, useState, type ReactNode } from 'react';

/**
 * JourneyStepper — one reusable interactive stage walkthrough, shared by the
 * journey pages (currently /raise R0–R5 and /integrate PMI0–PMI3). It replaces
 * the old static `.stage`/`Stage` rows with an accessible, animated stepper:
 *
 *   • a `role="tablist"` of stage buttons (code + title) — a horizontal,
 *     wrapping rail on desktop; a vertical stack on mobile. Arrow / Home / End
 *     keys move selection; :focus-visible is styled.
 *   • selecting a stage reveals a `role="tabpanel"` showing the stage title, a
 *     "What Yulia builds:" line (the `build`), the `blurb`, an optional muted
 *     `note` (used verbatim for THE LINE / scope boundaries), and an optional
 *     `visual` React node (a product mock / chart).
 *
 * The first stage is selected by default. The panel re-mounts on each selection
 * (`key={active}`) and replays a CSS reveal keyframe; prefers-reduced-motion
 * disables the keyframe (instant swap). Tokens only; styles live in marketing.css
 * under `.jstep*`.
 */

export type JourneyStage = {
  code: string;
  title: string;
  /** the "What Yulia builds:" line */
  build: string;
  blurb: string;
  /** muted secondary line — used verbatim for boundary / scope notes */
  note?: string;
  /** an optional product mock / chart rendered in the panel */
  visual?: ReactNode;
};

export function JourneyStepper({
  title,
  intro,
  stages,
  idBase,
}: {
  title: string;
  intro: string;
  stages: JourneyStage[];
  /** unique prefix so multiple steppers on a page keep distinct ARIA ids */
  idBase: string;
}) {
  const [active, setActive] = useState(0);
  const stage = stages[active] ?? stages[0];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Move selection AND focus to a tab (WAI-ARIA tabs: focus follows arrow keys).
  const go = (i: number) => {
    const next = (i + stages.length) % stages.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="jstep">
      <div className="jstep-head">
        <h2>{title}</h2>
        <p className="lead jstep-intro">{intro}</p>
      </div>

      {/* stage rail — accessible tablist. Horizontal/wrapping on desktop,
          vertical/stacked on mobile. Stage CODES are data labels, not eyebrows. */}
      <div className="jstep-rail" role="tablist" aria-label={title}>
        {stages.map((s, i) => {
          const selected = i === active;
          return (
            <button
              key={s.code}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`jstep-tab${selected ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  go(active + 1);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  go(active - 1);
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  go(0);
                } else if (e.key === 'End') {
                  e.preventDefault();
                  go(stages.length - 1);
                }
              }}
            >
              <span className="jstep-tab-code mono">{s.code}</span>
              <span className="jstep-tab-title">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* panel */}
      <div
        className="mock jstep-panel"
        role="tabpanel"
        id={`${idBase}-panel`}
        aria-labelledby={`${idBase}-tab-${active}`}
        tabIndex={0}
      >
        <div className="mock-bar">
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-dot" />
          <span className="mock-title">{stage.code}</span>
          <span className="mock-tag mono">
            stage {active + 1} / {stages.length}
          </span>
        </div>
        {/* `key={active}` remounts the panel on each selection, replaying the
            CSS reveal keyframe. A CSS animation (not a frame-loop JS animation)
            settles on its visible end-state reliably; reduced motion disables it
            via the `.jstep-anim` media rule. */}
        <div
          key={active}
          className={`jstep-panel-inner jstep-anim${stage.visual ? '' : ' is-solo'}`}
        >
          <div className="jstep-panel-copy">
            <h3 className="jstep-panel-title">{stage.title}</h3>
            <div className="jstep-build">
              <span className="jstep-build-label mono">What Yulia builds</span>
              <span className="jstep-build-text">{stage.build}</span>
            </div>
            <p className="jstep-panel-blurb">{stage.blurb}</p>
            {stage.note && <p className="jstep-panel-note mono">{stage.note}</p>}
          </div>
          {stage.visual && <div className="jstep-panel-visual">{stage.visual}</div>}
        </div>
      </div>
    </div>
  );
}

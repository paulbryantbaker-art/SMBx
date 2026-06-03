import type { ReactNode } from 'react';
import { YuliaLauncher } from '../YuliaChat';
import { enterApp } from '../useEnterApp';

/**
 * ClosingCTA — the one shared closing-CTA primitive for every marketing page.
 *
 * Before this, each page hand-rolled its own end-of-page CTA: five different
 * combinations of padding class, background, and a 16–20ch heading cap, all
 * inside a 1180px `.wrap`. The result read as a small centered island on a
 * site whose heroes are now 1320 / full-bleed.
 *
 * This renders a deliberate full-bleed band (sections are already full-width,
 * like `.dark`) with a soft green glow echoing the hero, a display-scale
 * heading, a wide measure, and the neon `btn-accent` at maximum pop. The band
 * is warm `surface-2` — never dark (would collide with adjacent dark blocks)
 * and never green (would flatten the button).
 *
 * - `launcher` — journey pages (Buy/Sell/Raise/Integrate) surface the Yulia
 *   chat input here as a "start now" affordance, above the button.
 * - `secondary` — an optional dark `btn-ink` action shown before Ask Yulia
 *   (Connectors' "See connector setup").
 */
export function ClosingCTA({
  heading,
  sub,
  launcher = false,
  secondary,
}: {
  heading: ReactNode;
  sub?: ReactNode;
  launcher?: boolean;
  secondary?: { label: ReactNode; onClick?: () => void };
}) {
  return (
    <section className="cta">
      <div className="cta-inner reveal">
        <h2>{heading}</h2>
        {sub ? <p className="cta-sub">{sub}</p> : null}
        {launcher ? (
          <div className="cta-launcher">
            <YuliaLauncher />
          </div>
        ) : null}
        <div className="cta-actions">
          {secondary ? (
            <button
              className="btn btn-ink btn-lg"
              onClick={secondary.onClick ?? (() => enterApp())}
            >
              {secondary.label}
            </button>
          ) : null}
          <button className="btn btn-accent btn-lg" onClick={() => enterApp()}>
            Ask Yulia
          </button>
        </div>
      </div>
    </section>
  );
}

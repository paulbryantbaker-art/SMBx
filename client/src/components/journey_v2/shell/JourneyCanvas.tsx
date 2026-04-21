/**
 * JourneyCanvas — right-floating canvas card per the Claude Design v3
 * handoff. Same elevation recipe as the in-app canvas: white fill,
 * 18px radius, `--v4-shadow-lg`-equivalent stack, 80px top highlight.
 *
 * Structure matches `Sell refined.html`:
 *   .v4-canvas-wrap > .v4-canvas
 *                       > .v4-canvas__head  (breadcrumb row)
 *                       > .v4-canvas__body  (scrollable content)
 *
 * Content lives inside `.v4-canvas__body` with zero padding on journey
 * pages — the editorial system (`.sv-*`, `.jc-*`) handles its own
 * gutters.
 */
import type { ReactNode } from 'react';

interface Props {
  /** Breadcrumb kicker — e.g. "smbx.ai / sell" */
  crumbKicker?: string;
  /** Breadcrumb title — e.g. "Sell a business" */
  crumbTitle?: string;
  /** Right-aligned badge chip — e.g. "Demo · Acme, Inc." */
  crumbBadge?: string;
  children: ReactNode;
}

export default function JourneyCanvas({ crumbKicker, crumbTitle, crumbBadge, children }: Props) {
  const hasCrumb = !!(crumbKicker || crumbTitle || crumbBadge);
  return (
    <div className="v4-canvas-wrap">
      <div className="v4-canvas">
        {hasCrumb && (
          <div className="v4-canvas__head">
            <div className="v4-canvas__crumb">
              {crumbKicker && <span className="v4-canvas__crumb-k">{crumbKicker}</span>}
              {crumbKicker && crumbTitle && <span className="v4-canvas__crumb-sep">·</span>}
              {crumbTitle && <span className="v4-canvas__crumb-t">{crumbTitle}</span>}
              {crumbBadge && <span className="v4-canvas__crumb-badge">{crumbBadge}</span>}
            </div>
          </div>
        )}
        <div className="v4-canvas__body">
          {children}
        </div>
      </div>
    </div>
  );
}

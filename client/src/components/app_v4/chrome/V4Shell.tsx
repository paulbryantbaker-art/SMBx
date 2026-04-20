/**
 * V4Shell — desktop layout wrapper.
 *
 * Four floating regions on the `.v4` backdrop:
 *   • V4Tool   (left,   56→184px when expanded)
 *   • V4Chat   (left-of-canvas, --v4-chat-w wide, resizable 300–620)
 *   • V4Canvas (center, fills remaining space)
 *   • V4Rail   (right,  240→72px when collapsed)
 *
 * CSS custom properties drive the widths so individual components don't
 * need to know layout math. Task #31–34 fill in the real region
 * contents; this file owns the frame.
 */

import type { ReactNode } from 'react';
import type { V4UIState } from '../session';

interface Props {
  ui: V4UIState;
  tool: ReactNode;
  chat: ReactNode;
  canvas: ReactNode;
  rail: ReactNode;
}

export default function V4Shell({ ui, tool, chat, canvas, rail }: Props) {
  const vars: React.CSSProperties = {
    ['--v4-tool-w' as any]: (ui.toolExpanded ? 184 : 56) + 'px',
    ['--v4-chat-w' as any]: ui.chatW + 'px',
    ['--v4-rail-w' as any]: (ui.railShown ? 240 : 72) + 'px',
  };

  return (
    <div
      className="v4-shell"
      data-rail={ui.railShown ? 'shown' : 'hidden'}
      data-tool={ui.toolExpanded ? 'expanded' : 'collapsed'}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--v4-bg)',
        color: 'var(--v4-ink)',
        overflow: 'hidden',
        ...vars,
      }}
    >
      {tool}
      {chat}
      {canvas}
      {rail}
    </div>
  );
}

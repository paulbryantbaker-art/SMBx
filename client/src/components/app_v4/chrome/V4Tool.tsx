/**
 * V4Tool — left vertical floating toolbar.
 *
 * Collapses 56 ↔ 184px. Three stacked regions:
 *   1. Logo (tap to toggle expand/collapse)
 *   2. CREATE: quick actions + Yulia's suggested next action
 *   3. WORKSPACE: ambient surfaces (new chat, inbox, drafts, team)
 *   4. Bottom: trash, account, settings, expand-chevron (when collapsed)
 *
 * Ported from `claude_design/app/project/v4-tool.jsx`. Class names match
 * the source so `shell.css` styles apply verbatim.
 */

import { useState, type ReactNode } from 'react';
import {
  IcChat, IcSchedule, IcDrafts, IcTeam,
  IcNewDeal, IcRundown, IcDCF, IcLOI, IcCompare,
  IcTrash, IcSettings, IcChevronRight, IcSpark,
} from './icons';

export interface NextAction {
  label: string;
  kicker: string;
}

interface Props {
  active?: string;
  onPick?: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
  nextAction?: NextAction | null;
  onNextGo?: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  desc: string;
  shortcut: string;
  icon: ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-deal',    label: 'New deal',  desc: 'Log a new sourced company. Paste a deck, a site, or just a name — Yulia will do the first-pass research.', shortcut: 'N D', icon: <IcNewDeal /> },
  { id: 'new-rundown', label: 'Rundown',   desc: 'Structured brief on any deal — market, traction, moat, team, risks. Linked to live data.',                  shortcut: 'N R', icon: <IcRundown /> },
  { id: 'new-dcf',     label: 'DCF model', desc: 'Live-linked valuation. Tweak growth, margin, WACC and multiple; outputs flow into rundowns.',                 shortcut: 'N M', icon: <IcDCF /> },
  { id: 'new-loi',     label: 'LOI',       desc: 'Term-sheet draft with placeholders. Matches your fund template and fills in counterparty automatically.',      shortcut: 'N L', icon: <IcLOI /> },
  { id: 'compare',     label: 'Compare',   desc: 'Side-by-side scorecard for two or more deals. Customize rows; exports to memo or board deck.',                 shortcut: 'N C', icon: <IcCompare /> },
];

interface AmbientItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const AMBIENT: AmbientItem[] = [
  { id: 'new-chat', label: 'New chat',  icon: <IcChat /> },
  { id: 'inbox',    label: 'Inbox',     icon: <IcSchedule />, badge: 3 },
  { id: 'drafts',   label: 'My drafts', icon: <IcDrafts />,   badge: 2 },
  { id: 'team',     label: 'Team',      icon: <IcTeam /> },
];

export default function V4Tool({ active, onPick, expanded, onToggle, nextAction, onNextGo }: Props) {
  const [hoverQA, setHoverQA] = useState<string | null>(null);

  return (
    <aside className={`v4-tool${expanded ? ' v4-tool--expanded' : ''}`} role="toolbar">
      <button className="v4-tool__logo" onClick={onToggle} title={expanded ? 'Collapse' : 'Expand'} type="button">
        {expanded ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', paddingLeft: 4 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '-0.04em' }}>smbx</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.6 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
        ) : 'sm'}
      </button>
      <div className="v4-tool__sep" />

      {/* Scrolling middle — quick actions + ambient */}
      <div className="v4-tool__list">
        {expanded && (
          <div className="v4-tool__group-h"><span>CREATE</span></div>
        )}

        {nextAction?.label && (
          <button
            type="button"
            className="v4-tool__btn v4-tool__btn--quick v4-tool__btn--yulia"
            onClick={onNextGo}
            onMouseEnter={() => setHoverQA('__yulia')}
            onMouseLeave={() => setHoverQA(null)}
            data-tip={expanded ? undefined : nextAction.label}
          >
            <span className="v4-tool__yulia-ico">
              <IcSpark />
            </span>
            {expanded && (
              <span className="v4-tool__lbl v4-tool__lbl--yulia">
                <span className="v4-tool__yulia-k">Yulia suggests</span>
                <span className="v4-tool__yulia-t">{nextAction.label}</span>
              </span>
            )}
            {hoverQA === '__yulia' && expanded && (
              <div className="v4-tool__pop">
                <div className="v4-tool__pop-kicker">YULIA SUGGESTS · NEXT</div>
                <div className="v4-tool__pop-t">{nextAction.label}</div>
                <div className="v4-tool__pop-d">
                  Yulia surfaces this based on what's open, what's stale, and what typically unblocks you next. Click to run it; she'll fill in context automatically.
                </div>
                <div className="v4-tool__pop-kbd">↵ to run</div>
              </div>
            )}
          </button>
        )}

        {QUICK_ACTIONS.map((it) => (
          <button
            key={it.id}
            type="button"
            className="v4-tool__btn v4-tool__btn--quick"
            data-tip={expanded ? undefined : it.label}
            onClick={() => onPick?.(it.id)}
            onMouseEnter={() => setHoverQA(it.id)}
            onMouseLeave={() => setHoverQA(null)}
          >
            {it.icon}
            {expanded && <span className="v4-tool__lbl">{it.label}</span>}
            {hoverQA === it.id && (
              <div className="v4-tool__pop">
                <div className="v4-tool__pop-t">{it.label}</div>
                <div className="v4-tool__pop-d">{it.desc}</div>
                <div className="v4-tool__pop-kbd">{it.shortcut}</div>
              </div>
            )}
          </button>
        ))}

        {expanded ? (
          <div className="v4-tool__group-h" style={{ marginTop: 14 }}><span>WORKSPACE</span></div>
        ) : (
          <div className="v4-tool__minisep" />
        )}

        {AMBIENT.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`v4-tool__btn${active === it.id ? ' v4-tool__btn--active' : ''}`}
            onClick={() => onPick?.(it.id)}
            data-tip={expanded ? undefined : it.label}
            data-badge={it.badge ?? undefined}
          >
            {it.icon}
            {expanded && <span className="v4-tool__lbl">{it.label}</span>}
          </button>
        ))}
      </div>

      <div className="v4-tool__sep" />

      {/* Bottom: trash, account, settings + expand-chevron when collapsed */}
      <div className="v4-tool__list" style={{ flex: 'none' }}>
        <button type="button" className="v4-tool__btn" data-tip={expanded ? undefined : 'Trash'}>
          <IcTrash />
          {expanded && <span className="v4-tool__lbl">Trash</span>}
        </button>
        <button type="button" className="v4-tool__btn v4-tool__btn--acct" data-tip={expanded ? undefined : 'Paul Delgado'}>
          <span className="v4-tool__acct-av">P</span>
          {expanded && (
            <span className="v4-tool__lbl v4-tool__lbl--acct">
              <span className="v4-tool__acct-n">Paul Delgado</span>
              <span className="v4-tool__acct-s">PRO · Fund I</span>
            </span>
          )}
        </button>
        <button type="button" className="v4-tool__btn" data-tip={expanded ? undefined : 'Settings'}>
          <IcSettings />
          {expanded && <span className="v4-tool__lbl">Settings</span>}
        </button>
        {!expanded && (
          <button type="button" className="v4-tool__btn" onClick={onToggle} data-tip="Expand">
            <IcChevronRight />
          </button>
        )}
      </div>
    </aside>
  );
}

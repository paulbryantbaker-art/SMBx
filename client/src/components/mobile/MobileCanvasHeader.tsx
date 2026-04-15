/**
 * MobileCanvasHeader — sticky Apple Glass breadcrumb bar for the mobile
 * canvas overlay.
 *
 * Notion-pattern: left back-arrow, center "Deal › Doc" breadcrumb, right
 * ⋯ menu. Taps the deal name to jump to that deal in the home tree.
 *
 * Must remain below the fixed top-right account avatar (z-index 55);
 * this header sits at z-40 to align with the canvas overlay it anchors.
 *
 * The ⋯ menu is a minimal Vaul bottom sheet (Close, + Copy link when
 * the doc supports it). Export/Share actions come from each doc's own
 * contextual toolbar (CanvasToolbar) — we don't duplicate them here.
 */

import { useState } from 'react';
import { Drawer } from 'vaul';

interface Props {
  dark: boolean;
  /** Tappable breadcrumb — usually deal business_name. Falls back to null. */
  dealName: string | null;
  /** Current document title. */
  docTitle: string;
  /** Journey accent color for the deal dot (resolved by the parent). */
  accentColor?: string;
  /** Back (close the canvas overlay, return to previous surface). */
  onBack: () => void;
  /** Deal-name click: jump to the deal's section in home tree. */
  onDealTap?: () => void;
  /** Optional: open an external share flow for this doc. Shown in ⋯ menu when present. */
  onShare?: () => void;
  /** Optional: copy a link to this doc. Shown in ⋯ menu when present. */
  onCopyLink?: () => void;
}

export default function MobileCanvasHeader({
  dark,
  dealName,
  docTitle,
  accentColor,
  onBack,
  onDealTap,
  onShare,
  onCopyLink,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const glassBg = dark ? 'rgba(20,22,24,0.72)' : 'rgba(255,255,255,0.82)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const heading = dark ? '#F9F9FC' : '#0f1012';
  const muted = dark ? 'rgba(218,218,220,0.55)' : '#6e6a63';
  const body = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const accent = accentColor ?? (dark ? '#E8709A' : '#D44A78');
  const sheetBg = dark ? '#1a1c1e' : '#ffffff';

  const chevronColor = muted;

  return (
    <>
      <div
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          flexShrink: 0,
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: glassBg,
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          borderBottom: `1px solid ${border}`,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          type="button"
          aria-label="Close document and return"
          className="active:scale-90"
          style={{
            width: 44, height: 44, flexShrink: 0,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {dealName && (
            <>
              <button
                onClick={onDealTap}
                type="button"
                aria-label={`Open ${dealName}`}
                disabled={!onDealTap}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: body,
                  cursor: onDealTap ? 'pointer' : 'default',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  minWidth: 0,
                  maxWidth: '48%',
                  WebkitTapHighlightColor: 'transparent',
                }}
                className="mobile-canvas-header-deal"
              >
                <span
                  aria-hidden
                  style={{
                    width: 6, height: 6, borderRadius: 2,
                    background: accent, flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.005em',
                  }}
                  title={dealName}
                >
                  {dealName}
                </span>
              </button>
              <svg
                aria-hidden
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={chevronColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </>
          )}
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 14,
              fontWeight: 600,
              color: heading,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.005em',
            }}
            title={docTitle}
          >
            {docTitle}
          </span>
        </div>

        {/* ⋯ menu */}
        <button
          onClick={() => setMenuOpen(true)}
          type="button"
          aria-label="Document actions"
          className="active:scale-90"
          style={{
            width: 44, height: 44, flexShrink: 0,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: body,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        <style>{`
          .mobile-canvas-header-deal:not(:disabled):hover {
            background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)'} !important;
          }
        `}</style>
      </div>

      {/* ⋯ actions sheet */}
      <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[100]" style={{ background: 'rgba(15,16,18,0.35)' }} />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[101] outline-none"
            style={{
              background: sheetBg,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              border: `1px solid ${border}`,
              borderBottom: 'none',
              boxShadow: dark
                ? '0 -20px 40px -20px rgba(0,0,0,0.5)'
                : '0 -20px 40px -20px rgba(15,16,18,0.16)',
            }}
          >
            <Drawer.Title className="sr-only">Document actions</Drawer.Title>
            <Drawer.Description className="sr-only">
              Close, share, or copy a link to this document
            </Drawer.Description>

            <div
              aria-hidden
              style={{
                width: 36, height: 4,
                borderRadius: 2,
                background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.14)',
                margin: '8px auto 6px',
              }}
            />

            <div style={{ padding: '8px 8px 18px' }}>
              <MenuRow
                label="Close document"
                icon={(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                )}
                onClick={() => { setMenuOpen(false); onBack(); }}
                heading={heading}
                muted={muted}
                dark={dark}
              />
              {onShare && (
                <MenuRow
                  label="Share"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4" />
                      <path d="M8 8l4-4 4 4" />
                      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                    </svg>
                  )}
                  onClick={() => { setMenuOpen(false); onShare(); }}
                  heading={heading}
                  muted={muted}
                  dark={dark}
                />
              )}
              {onCopyLink && (
                <MenuRow
                  label="Copy link"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 1 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 1 0 7.07 7.07l1.72-1.71" />
                    </svg>
                  )}
                  onClick={() => { setMenuOpen(false); onCopyLink(); }}
                  heading={heading}
                  muted={muted}
                  dark={dark}
                />
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function MenuRow({ label, icon, onClick, heading, muted, dark }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  heading: string;
  muted: string;
  dark: boolean;
}) {
  const hoverBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)';
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 14px',
        borderRadius: 12,
        border: 'none',
        background: 'transparent',
        color: heading,
        cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        textAlign: 'left',
        letterSpacing: '-0.005em',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s ease',
      }}
      className="active:scale-[0.98]"
      onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span aria-hidden style={{ color: muted, display: 'inline-flex', flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

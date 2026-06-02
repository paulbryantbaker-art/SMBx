/* V6 Mobile — Learn sheet.
   Wraps the desktop V6LearnView in a Vaul fullscreen drawer so mobile users
   get the same How it works / Pricing / Compare content without forking the
   copy. Material tokens (--m-*) are :root-scoped, so the desktop styling
   works inside .mobile-root.

   Anchor scroll (capabilities, compare) flows through V6LearnView's existing
   useEffect. Section is initialized once per open. */

import { useEffect, type CSSProperties } from "react";
import { Drawer } from "vaul";
import { V6LearnView } from "../Learn";
import { MobileIcon } from "./icons";

interface LearnSheetProps {
  open: boolean;
  onClose: () => void;
  section: "how" | "pricing";
  anchor?: string;
  onTalkToYulia: (prompt: string) => void;
}

export function LearnSheet({ open, onClose, section, anchor, onTalkToYulia }: LearnSheetProps) {
  // Lock background scroll while open — prevents the underlying Today
  // tab from rubber-banding when the user scrolls inside the sheet.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay style={S.overlay} />
        <Drawer.Content style={S.content}>
          <div style={S.handle} aria-hidden="true" />
          <header style={S.header}>
            <Drawer.Title style={S.title}>About smbX.ai</Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={S.closeBtn}
            >
              <MobileIcon name="close" c="var(--mb-ink-2)" size={22} />
            </button>
          </header>
          <div style={S.scroll}>
            <V6LearnView
              section={section}
              anchor={anchor}
              onTalkToYulia={(prompt) => {
                onTalkToYulia(prompt);
                onClose();
              }}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const S: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 2000,
  },
  content: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: "92vh",
    background: "var(--mb-bg, #FAFAFB)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    zIndex: 2001,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: "var(--mb-line-2, rgba(0,0,0,0.12))",
    margin: "8px auto 4px",
    flexShrink: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px 12px",
    borderBottom: "0.5px solid var(--mb-line-2, rgba(0,0,0,0.08))",
    flexShrink: 0,
  },
  title: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: "-0.01em",
    color: "var(--mb-ink, #1A1B25)",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    padding: 6,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
  },
  scroll: {
    flex: 1,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "16px 14px 32px",
  },
};

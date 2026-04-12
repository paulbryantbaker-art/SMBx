/**
 * MobileSidebar.tsx
 *
 * The single sectioned drawer that holds everything on mobile:
 *   Chats / Docs / Artifacts / Learn / Profile
 *
 * Slides in from the left edge via Vaul. Drag-to-dismiss.
 * Replaces the old AppShell mobile sidebar conditional rendering.
 *
 * Design language: Grok meets Canva — dark, generous whitespace,
 * mono accents, soft pink-tinted borders, spring transitions.
 */

import { Drawer } from 'vaul';
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

export type LearnDest =
  | 'sell'
  | 'buy'
  | 'raise'
  | 'integrate'
  | 'advisors'
  | 'how-it-works'
  | 'pricing';

export type WorkspaceTool =
  | 'documents'
  | 'library'
  | 'analysis'
  | 'sourcing'
  | 'pipeline';

export interface ConvoItem {
  id: number;
  title: string;
  subtitle?: string;
  active?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;

  // Data feeds
  chats: ConvoItem[];

  // Profile
  userName?: string | null;
  userEmail?: string | null;
  isLoggedIn: boolean;

  // Actions
  onNewChat: () => void;
  onChatTap: (id: number) => void;
  onWorkspaceTap: (tool: WorkspaceTool) => void;
  onLearnTap: (dest: LearnDest) => void;
  onProfileTap: () => void;
  onSettingsTap: () => void;
  onSignIn: () => void;
  onDarkModeToggle: () => void;
}

const LEARN_ITEMS: { id: LearnDest; label: string; desc: string }[] = [
  { id: 'sell',         label: 'Sell',          desc: 'Win the mandate, close at top of range' },
  { id: 'buy',          label: 'Buy',           desc: 'Kill 100 bad deals before lunch' },
  { id: 'raise',        label: 'Raise',         desc: 'Get the capital, keep the company' },
  { id: 'integrate',    label: 'Integrate',     desc: 'The deal closed — now make it pay' },
  { id: 'advisors',     label: 'For advisors',  desc: 'Triple your book without adding partners' },
  { id: 'how-it-works', label: 'How it works',  desc: 'Six engines, 22 gates, one conversation' },
  { id: 'pricing',      label: 'Pricing',       desc: 'IB power, software pricing' },
];

const WORKSPACE_ITEMS: { id: WorkspaceTool; label: string; desc: string; icon: string }[] = [
  { id: 'documents', label: 'Documents', desc: 'Tax returns, P&Ls, contracts',          icon: 'description'    },
  { id: 'library',   label: 'Library',   desc: 'Generated CIMs, term sheets, memos',     icon: 'menu_book'     },
  { id: 'analysis',  label: 'Analysis',  desc: 'Open models, valuations, scenarios',     icon: 'analytics'     },
  { id: 'sourcing',  label: 'Sourcing',  desc: 'Acquisition targets, scored & ranked',   icon: 'travel_explore' },
  { id: 'pipeline',  label: 'Pipeline',  desc: 'Active deals across all your journeys',  icon: 'view_kanban'   },
];

export function MobileSidebar({
  open,
  onOpenChange,
  dark,
  chats,
  userName,
  userEmail,
  isLoggedIn,
  onNewChat,
  onChatTap,
  onWorkspaceTap,
  onLearnTap,
  onProfileTap,
  onSettingsTap,
  onSignIn,
  onDarkModeToggle,
}: Props) {
  // Color tokens — Grok-style dark with pink-tinted accents
  const bg        = dark ? '#151617' : '#fefefe';
  const headingC  = dark ? '#f9f9fc' : '#0f1012';
  const bodyC     = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC    = dark ? 'rgba(218,218,220,0.5)'  : '#7c7d80';
  const sectionC  = dark ? 'rgba(218,218,220,0.4)'  : '#9ea0a5';
  const ruleC     = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const pinkC     = dark ? PINK_DARK : PINK;
  const tintBg    = dark ? 'rgba(232,112,154,0.06)' : 'rgba(212,74,120,0.04)';

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        />
        <Drawer.Content
          className="fixed left-0 top-0 bottom-0 z-[101] w-[88vw] max-w-[360px] outline-none flex flex-col"
          style={{
            background: bg,
            borderRight: `1px solid ${ruleC}`,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <Drawer.Title className="sr-only">Menu</Drawer.Title>
          <Drawer.Description className="sr-only">
            Navigate chats, documents, artifacts, and journey pages
          </Drawer.Description>

          {/* Top: brand + new chat */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-5">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: pinkC }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: pinkC }} />
                smbx.ai
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ color: bodyC }}>
                  close
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                onNewChat();
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]"
              style={{
                background: pinkC,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 8px 24px -8px ${pinkC}88`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">edit_square</span>
              New conversation
            </button>
          </div>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 mobile-scroll">
            {/* CHATS — only when logged in (anonymous users have no persisted history) */}
            {isLoggedIn && (
            <Section label="Chats" sectionColor={sectionC} mutedColor={mutedC}>
              {chats.length === 0 ? (
                <EmptyState
                  text="Your conversations will show up here."
                  mutedColor={mutedC}
                />
              ) : (
                chats.slice(0, 12).map((c) => (
                  <DrawerItem
                    key={c.id}
                    onTap={() => {
                      onChatTap(c.id);
                      onOpenChange(false);
                    }}
                    headingColor={headingC}
                    mutedColor={mutedC}
                    pinkColor={pinkC}
                    tintBg={tintBg}
                    active={c.active}
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: c.active ? pinkC : mutedC }}>
                      {c.active ? 'chat_bubble' : 'chat_bubble_outline'}
                    </span>
                    <span className="flex-1 truncate text-[14px] font-medium" style={{ color: headingC }}>
                      {c.title}
                    </span>
                    {c.subtitle && (
                      <span className="text-[10px] font-mono shrink-0" style={{ color: mutedC }}>
                        {c.subtitle}
                      </span>
                    )}
                  </DrawerItem>
                ))
              )}
            </Section>
            )}

            {/* WORKSPACE — only when logged in. Each item launches a full-screen tool sheet. */}
            {isLoggedIn ? (
              <Section label="Workspace" sectionColor={sectionC} mutedColor={mutedC}>
                {WORKSPACE_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
                    onClick={() => {
                      onWorkspaceTap(item.id);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all active:scale-[0.985]"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${ruleC}`,
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: tintBg,
                        border: `1px solid ${dark ? 'rgba(232,112,154,0.18)' : 'rgba(212,74,120,0.16)'}`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ color: pinkC }}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] font-bold leading-tight" style={{ color: headingC }}>
                        {item.label}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: mutedC }}>
                        {item.desc}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: mutedC }}>
                      arrow_forward
                    </span>
                  </motion.button>
                ))}
              </Section>
            ) : (
              <Section label="Workspace" sectionColor={sectionC} mutedColor={mutedC}>
                <button
                  onClick={() => {
                    onSignIn();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all active:scale-[0.985]"
                  style={{
                    background: tintBg,
                    border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.18)'}`,
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: pinkC }}>
                    lock_open
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-bold" style={{ color: headingC }}>
                      Sign in to unlock
                    </p>
                    <p className="text-[11px]" style={{ color: mutedC }}>
                      Documents, library, analysis, sourcing, pipeline
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[14px]" style={{ color: pinkC }}>
                    arrow_forward
                  </span>
                </button>
              </Section>
            )}

            {/* LEARN — only when logged out (logged-in users already chose Yulia) */}
            {!isLoggedIn && (
              <Section label="How Yulia helps" sectionColor={sectionC} mutedColor={mutedC}>
                {LEARN_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.32, 0.72, 0, 1] }}
                    onClick={() => {
                      onLearnTap(item.id);
                      onOpenChange(false);
                    }}
                    className="w-full text-left px-3 py-3 rounded-xl mb-1 active:scale-[0.985] transition-transform"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-headline font-black text-[15px] tracking-tight" style={{ color: headingC }}>
                        {item.label}
                      </span>
                      <span className="material-symbols-outlined text-[14px]" style={{ color: mutedC }}>
                        arrow_outward
                      </span>
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: mutedC }}>
                      {item.desc}
                    </p>
                  </motion.button>
                ))}
              </Section>
            )}
          </div>

          {/* Bottom: profile + settings + dark mode (logged in)
              OR sign-in CTA + dark mode (logged out) */}
          <div
            className="px-5 py-4 shrink-0"
            style={{ borderTop: `1px solid ${ruleC}` }}
          >
            {isLoggedIn ? (
              <>
                {/* Logged in: profile bar + Profile/Settings/Dark mode */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0"
                    style={{
                      background: pinkC,
                      color: 'white',
                    }}
                  >
                    {(userName?.[0] || userEmail?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] truncate" style={{ color: headingC }}>
                      {userName || 'Account'}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: mutedC }}>
                      {userEmail || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BottomButton
                    icon="person"
                    label="Profile"
                    onClick={() => {
                      onProfileTap();
                      onOpenChange(false);
                    }}
                    bodyColor={bodyC}
                    bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)'}
                  />
                  <BottomButton
                    icon="settings"
                    label="Settings"
                    onClick={() => {
                      onSettingsTap();
                      onOpenChange(false);
                    }}
                    bodyColor={bodyC}
                    bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)'}
                  />
                  <BottomButton
                    icon={dark ? 'light_mode' : 'dark_mode'}
                    label=""
                    onClick={onDarkModeToggle}
                    bodyColor={bodyC}
                    bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)'}
                    ariaLabel="Toggle dark mode"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Logged out: sign-in CTA + dark mode toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSignIn();
                      onOpenChange(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full text-[13px] font-bold text-white transition-all active:scale-[0.985]"
                    style={{
                      background: pinkC,
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      boxShadow: `0 8px 24px -8px ${pinkC}88`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    Sign in
                  </button>
                  <BottomButton
                    icon={dark ? 'light_mode' : 'dark_mode'}
                    label=""
                    onClick={onDarkModeToggle}
                    bodyColor={bodyC}
                    bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)'}
                    ariaLabel="Toggle dark mode"
                  />
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ────────────────────────────────────────────────────────── */

function Section({
  label,
  sectionColor,
  mutedColor: _mutedColor,
  children,
}: {
  label: string;
  sectionColor: string;
  mutedColor: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <p
        className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2 px-1"
        style={{ color: sectionColor }}
      >
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function DrawerItem({
  onTap,
  active,
  children,
  headingColor: _headingColor,
  mutedColor: _mutedColor,
  pinkColor,
  tintBg,
}: {
  onTap?: () => void;
  active?: boolean;
  children: ReactNode;
  headingColor: string;
  mutedColor: string;
  pinkColor: string;
  tintBg: string;
}) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.985]"
      style={{
        background: active ? tintBg : 'transparent',
        border: active ? `1px solid ${pinkColor}33` : '1px solid transparent',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function EmptyState({ text, mutedColor }: { text: string; mutedColor: string }) {
  return (
    <p
      className="text-[12px] italic px-3 py-2 leading-relaxed"
      style={{ color: mutedColor }}
    >
      {text}
    </p>
  );
}

function BottomButton({
  icon,
  label,
  onClick,
  bodyColor,
  bg,
  ariaLabel,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  bodyColor: string;
  bg: string;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-[12px] font-bold transition-all active:scale-[0.96]"
      style={{
        background: bg,
        color: bodyColor,
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </button>
  );
}

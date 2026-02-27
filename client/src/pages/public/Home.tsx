import { useState, useRef, useEffect, useCallback } from "react";

const T = {
  cream: "#FAF8F4", fill: "#F3F0EA", white: "#FFFFFF",
  terra: "#D4714E", terraHover: "#BE6342", terraSoft: "#FFF0EB",
  text: "#1A1A18", textMid: "#3D3B37", muted: "#6E6A63", faint: "#A9A49C",
  border: "#DDD9D1",
  shadowCard: "0 1px 4px rgba(26, 26, 24, 0.05)",
  shadowLg: "0 4px 20px rgba(26, 26, 24, 0.08), 0 1px 3px rgba(26, 26, 24, 0.05)",
  shadowXl: "0 8px 32px rgba(26, 26, 24, 0.1), 0 2px 6px rgba(26, 26, 24, 0.05)",
};

const ACTIONS = [
  { key: "sell", label: "Sell my business", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { key: "buy", label: "Buy a business", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
  { key: "raise", label: "Raise capital", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg> },
  { key: "value", label: "Valuation", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { key: "sba", label: "SBA check", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
];

export default function Home() {
  const [view, setView] = useState("desktop");
  const [barsVisible, setBarsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  // Scroll direction detection — attached via onScroll for reliability
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    if (y < 10) {
      setBarsVisible(true);
    } else if (y - lastY.current > 6) {
      setBarsVisible(false);
    } else if (lastY.current - y > 6) {
      setBarsVisible(true);
    }
    lastY.current = y;
  }, []);

  // Reset bars when switching views
  useEffect(() => {
    setBarsVisible(true);
    lastY.current = 0;
  }, [view]);

  const isMobileScroll = view === "mobile-scroll";
  const isMobile = view === "mobile" || isMobileScroll;
  const frameW = view === "desktop" ? 1440 : view === "laptop" ? 1024 : 390;
  const frameH = view === "desktop" ? 900 : view === "laptop" ? 700 : 844;
  const frameScale = view === "desktop" ? 0.52 : view === "laptop" ? 0.68 : 0.62;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: "antialiased", height: "100vh", display: "flex", flexDirection: "column", background: "#E8E4DE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .chip:hover { background: ${T.white} !important; border-color: ${T.border} !important; box-shadow: ${T.shadowCard} !important; color: ${T.text} !important; }
      `}</style>

      {/* Toggle bar */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 16px", background: "#E8E4DE", flexWrap: "wrap" }}>
        {[
          { k: "desktop", l: "Desktop 1440" },
          { k: "laptop", l: "Laptop 1024" },
          { k: "mobile", l: "Mobile 390" },
          { k: "mobile-scroll", l: "\ud83d\udcf1 Scroll Hide Demo" },
        ].map(v => (
          <button key={v.k} onClick={() => setView(v.k)} style={{
            padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, transition: "all 0.15s",
            background: view === v.k ? T.terra : T.white, color: view === v.k ? "#fff" : T.textMid,
          }}>{v.l}</button>
        ))}
      </div>

      {/* Viewport frame */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 16px 16px", overflow: "hidden" }}>
        <div style={{
          width: frameW, height: frameH, maxWidth: "100%", maxHeight: "100%",
          borderRadius: isMobile ? 40 : 12, overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          border: isMobile ? "8px solid #1a1a1a" : "2px solid #ccc",
          background: T.cream, position: "relative",
          transform: `scale(${frameScale})`, transformOrigin: "top center",
          transition: "all 0.3s ease",
        }}>

          {/* TOPBAR */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: isMobile ? "12px 16px" : "12px 48px",
            background: isMobileScroll ? "rgba(250,248,244,0.95)" : T.cream,
            backdropFilter: isMobileScroll ? "blur(12px)" : "none",
            borderBottom: isMobileScroll ? `1px solid ${T.border}` : "none",
            transform: (isMobileScroll && !barsVisible) ? "translateY(-100%)" : "translateY(0)",
            transition: "transform 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isMobileScroll ? (
                <button style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: T.muted, fontSize: 15, fontWeight: 500, padding: "4px 8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back
                </button>
              ) : (
                <button style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMid }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                </button>
              )}
              <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, letterSpacing: "-0.03em", color: T.text }}>
                smb<span style={{ color: T.terra }}>x</span>.ai
              </div>
            </div>
            <button style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", color: T.textMid }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </button>
          </div>

          {/* SCROLL CONTENT */}
          <div
            ref={scrollRef}
            onScroll={isMobileScroll ? handleScroll : undefined}
            style={{
              position: "absolute", inset: 0, overflowY: "auto",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* LANDING HERO */}
            {!isMobileScroll && (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center",
                height: "100%", minHeight: frameH,
                padding: isMobile
                  ? "60px 20px 24px"
                  : `60px 40px ${view === "desktop" ? 40 : 24}px`,
                maxWidth: 1200, margin: "0 auto", width: "100%",
              }}>
                {/* Headline */}
                <h1 style={{
                  fontSize: isMobile ? 40
                    : view === "laptop" ? 64
                    : 88,
                  fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.035em",
                  color: T.text,
                  marginBottom: isMobile ? 16 : view === "laptop" ? 20 : 32,
                  animation: "fadeUp 0.5s ease both",
                }}>
                  Sell a business.<br />Buy a business.<br />Raise capital.
                </h1>

                {/* Subtitle */}
                <p style={{
                  fontSize: isMobile ? 17 : view === "laptop" ? 19 : 23,
                  color: T.muted, lineHeight: 1.5, fontWeight: 400,
                  maxWidth: isMobile ? 320 : view === "laptop" ? 440 : 540,
                  marginBottom: isMobile ? 28 : view === "laptop" ? 40 : 72,
                  animation: "fadeUp 0.5s ease 0.08s both",
                }}>
                  AI-powered M&A advisory. From first question to closing day.
                </p>

                {/* Dock */}
                <div style={{
                  width: "100%",
                  maxWidth: isMobile ? "100%" : view === "laptop" ? 540 : 680,
                  animation: "fadeUp 0.5s ease 0.16s both",
                }}>
                  <div style={{
                    background: T.white,
                    borderRadius: isMobile ? 20 : view === "laptop" ? 22 : 26,
                    boxShadow: T.shadowXl,
                    border: "1.5px solid rgba(212,113,78,0.3)",
                  }}>
                    <div style={{
                      padding: isMobile ? "16px 20px 8px"
                        : view === "laptop" ? "18px 22px 10px"
                        : "24px 28px 12px",
                      fontSize: isMobile ? 16 : view === "laptop" ? 17 : 20,
                      color: T.faint, lineHeight: 1.5,
                    }}>
                      Tell Yulia about your deal...
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: isMobile ? "0 14px 12px"
                        : view === "laptop" ? "0 16px 14px"
                        : "0 20px 18px",
                    }}>
                      <button style={{ width: 36, height: 36, borderRadius: "50%", background: T.fill, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8C877D" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      <div style={{ width: 36, height: 36 }} />
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: isMobile ? 6 : view === "laptop" ? 8 : 10,
                  marginTop: isMobile ? 20 : view === "laptop" ? 28 : 48,
                  animation: "fadeUp 0.5s ease 0.28s both",
                }}>
                  {!isMobile && (
                    <span style={{ fontSize: view === "laptop" ? 13 : 15, color: T.faint, fontWeight: 500, padding: "7px 0", marginRight: 2 }}>Try:</span>
                  )}
                  {ACTIONS.map(c => (
                    <button key={c.key} className="chip" style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: isMobile ? "6px 12px" : view === "laptop" ? "7px 14px" : "9px 18px",
                      borderRadius: 100, background: "transparent",
                      border: "1px solid rgba(221,217,209,0.6)",
                      cursor: "pointer",
                      fontSize: isMobile ? 12 : view === "laptop" ? 13 : 14,
                      fontWeight: 500, color: T.muted, fontFamily: "inherit",
                      transition: "all 0.2s", whiteSpace: "nowrap",
                    }}>
                      <span style={{ color: T.terra, display: "flex" }}>{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* JOURNEY SCROLL CONTENT (mobile demo) */}
            {isMobileScroll && (
              <div style={{ padding: "60px 20px 140px" }}>
                <div style={{ maxWidth: 860, margin: "0 auto" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.terra, marginBottom: 14 }}>BUY-SIDE</div>
                  <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16, color: T.text }}>
                    Find the deal. <span style={{ color: T.terra }}>Know the math.</span>
                  </h1>
                  <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
                    Whether you're a first-time buyer with an SBA loan, a search fund screening 200 targets, or a PE firm running a 12-company roll-up — the question at every stage is the same: does this deal actually work?
                  </p>

                  {/* Yulia insight card */}
                  <div style={{ background: T.terraSoft, borderRadius: 20, padding: 22, marginBottom: 36, border: "1px solid rgba(212,113,78,0.12)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.terra, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>Y</div>
                      <p style={{ fontSize: 15, color: T.text, lineHeight: 1.6, margin: 0 }}>
                        SBA acquisition lending hit <strong>$8.29 billion</strong> in the first 9 months of FY2025 — up 34.58% YoY across 7,003 deals. But June 2025's SOP 50 10 8 changed the rules: <strong>seller notes must now be on full standby for the entire loan term</strong>, and the 10% minimum equity injection is back.
                      </p>
                    </div>
                  </div>

                  {/* Phase sections */}
                  {[
                    { phase: "PHASE 1: SOURCING", title: "Define your thesis.", em: "Find your deal.", cards: ["Acquisition criteria & buyer profile", "Target screening at scale"] },
                    { phase: "PHASE 2: DEAL ANALYSIS", title: "Kill bad deals", em: "in minutes.", cards: ["SBA bankability analysis", "Red flag detection", "Valuation with local intelligence"] },
                    { phase: "PHASE 3: BIDDING", title: "Bid with confidence.", em: "Win the deal.", cards: ["LOI preparation", "Deal structure optimization"] },
                    { phase: "PHASE 4: DUE DILIGENCE", title: "Find everything.", em: "Miss nothing.", cards: ["Quality of earnings deep dive", "Market context during diligence", "Risk identification & mitigation"] },
                  ].map((section, i) => (
                    <div key={i} style={{ marginBottom: 40 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.terra, marginBottom: 10 }}>{section.phase}</div>
                      <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 18, color: T.text }}>
                        {section.title} <span style={{ color: T.terra }}>{section.em}</span>
                      </h2>
                      {section.cards.map((card, j) => (
                        <div key={j} style={{ background: T.white, borderRadius: 18, padding: 20, boxShadow: T.shadowCard, marginBottom: 12 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{card}</h3>
                          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, margin: 0 }}>
                            Tell Yulia what you're looking for — industry, geography, size range, SDE/EBITDA targets, deal structure preferences, and financing approach. She builds your buyer profile and calibrates every analysis to your specific criteria.
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Quote */}
                  <div style={{ background: T.fill, borderRadius: 20, padding: 24, textAlign: "center" }}>
                    <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.6, fontStyle: "italic", margin: "0 0 8px" }}>
                      "SBA acquisition loans default at just 1.93% — 29% lower than non-acquisition SBA loans. The data is on your side if you structure the deal right."
                    </p>
                    <p style={{ fontSize: 12, color: T.faint, fontWeight: 600, margin: 0 }}>Yulia, on SBA-backed acquisitions</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DOCK — scroll-hide on mobile demo */}
          {isMobileScroll && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
              padding: "0 12px 24px",
              background: `linear-gradient(transparent, ${T.cream} 30%)`,
              paddingTop: 20,
              transform: barsVisible ? "translateY(0)" : "translateY(calc(100% + 10px))",
              transition: "transform 0.3s ease",
            }}>
              <div style={{ maxWidth: 860, margin: "0 auto" }}>
                <div style={{
                  background: T.white, borderRadius: 20,
                  boxShadow: T.shadowLg,
                  border: "1.5px solid rgba(212,113,78,0.35)",
                }}>
                  <div style={{ padding: "14px 18px 6px", fontSize: 16, color: T.faint, lineHeight: 1.5 }}>
                    Tell Yulia what you're looking for...
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 10px" }}>
                    <button style={{ width: 34, height: 34, borderRadius: "50%", background: T.fill, border: "none", color: "#8C877D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <div style={{ width: 34, height: 34 }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

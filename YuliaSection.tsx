import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

/* ── Math helpers ── */
function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t);
}
// easeOutCubic for smoother feel
function ease(t: number) {
  return 1 - Math.pow(1 - clamp(t), 3);
}
// Get 0→1 progress within a sub-range of the global progress
function band(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

export default function YuliaSection() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [pastRunway, setPastRunway] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = runwayRef.current;
        if (!el) { ticking = false; return; }
        const rect = el.getBoundingClientRect();
        const navH = 64;
        const scrolled = -(rect.top - navH);
        const total = el.offsetHeight - (window.innerHeight - navH);

        if (scrolled <= 0) {
          setProgress(0);
          setPastRunway(false);
        } else if (scrolled >= total) {
          setProgress(1);
          setPastRunway(true);
        } else {
          setProgress(scrolled / total);
          setPastRunway(false);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── PHASE BREAKDOWN ──
     0.00 → 0.08  Empty cream. Breathing room.
     0.08 → 0.22  "Introducing" fades up
     0.18 → 0.42  "Yulia." scales in from nothing — THE moment
     0.38 → 0.52  "Your AI deal advisor." fades up
     0.48 → 0.62  Stats sweep in
     0.58 → 0.70  Tagline fades in — full composition holds
     0.70 → 0.78  Hold — let them read
     0.78 → 0.92  Everything fades, bg → terra cotta
     0.92 → 1.00  Terra cotta holds, mini bar ready
  */

  const pIntro    = ease(band(progress, 0.08, 0.22));
  const pName     = ease(band(progress, 0.18, 0.42));
  const pSub      = ease(band(progress, 0.38, 0.52));
  const pStats    = ease(band(progress, 0.48, 0.62));
  const pTagline  = ease(band(progress, 0.58, 0.70));
  const pFadeOut  = ease(band(progress, 0.78, 0.92));
  const pColor    = ease(band(progress, 0.80, 0.95));

  // Background: cream → terra cotta
  const bg = `rgb(${Math.round(lerp(250, 218, pColor))},${Math.round(lerp(249, 119, pColor))},${Math.round(lerp(245, 86, pColor))})`;

  // Content fades out while bg shifts
  const contentAlpha = 1 - pFadeOut;

  // Name: starts at 0, grows to massive, holds
  const nameScale = lerp(0.3, 1, pName);
  const nameOpacity = pName;

  return (
    <>
      {/* ── SCROLL RUNWAY ── */}
      <div ref={runwayRef} className="relative" style={{ height: '350vh' }}>

        {/* ── PINNED VIEWPORT ── */}
        <div
          className="sticky top-[64px] overflow-hidden"
          style={{
            height: 'calc(100vh - 64px)',
            backgroundColor: bg,
          }}
        >
          {/* Centered content area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">

            {/* ── INTRODUCING ── */}
            <p
              className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#DA7756] mb-6 md:mb-8"
              style={{
                opacity: pIntro * contentAlpha,
                transform: `translateY(${lerp(30, 0, pIntro)}px)`,
              }}
            >
              Introducing
            </p>

            {/* ── YULIA. ── the hero moment */}
            <h2
              className="font-medium leading-[0.9] tracking-tight"
              style={{
                ...SERIF,
                fontSize: 'clamp(60px, 15vw, 160px)',
                color: `rgba(26,26,24,${contentAlpha})`,
                opacity: nameOpacity,
                transform: `scale(${nameScale})`,
                transformOrigin: 'center center',
                letterSpacing: `${lerp(12, -2, pName)}px`,
                willChange: 'transform, opacity',
              }}
            >
              Yulia.
            </h2>

            {/* ── SUBTITLE ── */}
            <p
              className="text-lg md:text-2xl mt-4 md:mt-6"
              style={{
                color: `rgba(107,105,99,${pSub * contentAlpha})`,
                transform: `translateY(${lerp(20, 0, pSub)}px)`,
              }}
            >
              Your AI deal advisor.
            </p>

            {/* ── STATS ── */}
            <div
              className="flex items-center justify-center gap-10 md:gap-20 mt-10 md:mt-14"
              style={{
                opacity: pStats * contentAlpha,
                transform: `translateY(${lerp(24, 0, pStats)}px)`,
              }}
            >
              {[
                { val: '80+', label: 'Industries' },
                { val: '24/7', label: 'Always On' },
                { val: '90%', label: 'Cost Savings' },
              ].map((s, i) => (
                <div key={s.label} className="text-center" style={{
                  opacity: ease(band(pStats, i * 0.15, 0.6 + i * 0.15)),
                  transform: `translateY(${lerp(16, 0, ease(band(pStats, i * 0.15, 0.6 + i * 0.15)))}px)`,
                }}>
                  <p
                    className="text-3xl md:text-5xl lg:text-6xl font-medium text-[#DA7756] m-0 leading-none"
                    style={SERIF}
                  >
                    {s.val}
                  </p>
                  <p className="text-[10px] md:text-xs text-[#6B6963] mt-2 m-0 uppercase tracking-widest">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* ── TAGLINE ── */}
            <p
              className="text-base md:text-xl italic mt-10 md:mt-14 max-w-md text-center leading-relaxed"
              style={{
                ...SERIF,
                color: `rgba(107,105,99,${pTagline * contentAlpha})`,
                transform: `translateY(${lerp(16, 0, pTagline)}px)`,
              }}
            >
              Now you&apos;ll never wonder if you left money on the table.
            </p>

            {/* ── FINAL MESSAGE (fades in as content fades out) ── */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
              style={{
                opacity: pFadeOut,
                pointerEvents: 'none',
              }}
            >
              <p
                className="text-2xl md:text-4xl font-medium text-white text-center leading-tight max-w-lg"
                style={{
                  ...SERIF,
                  transform: `translateY(${lerp(20, 0, pFadeOut)}px)`,
                }}
              >
                Let&apos;s get to work.
              </p>
              <Link
                href="/signup"
                className="mt-8 bg-white text-[#DA7756] px-8 py-3.5 rounded-full text-lg font-semibold no-underline hover:bg-gray-50 transition-colors shadow-lg"
                style={{
                  opacity: ease(band(pFadeOut, 0.4, 1)),
                  transform: `translateY(${lerp(12, 0, ease(band(pFadeOut, 0.4, 1)))}px)`,
                  pointerEvents: pFadeOut > 0.6 ? 'auto' as const : 'none' as const,
                }}
              >
                Meet Yulia →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── PERSISTENT MINI BAR ── */}
      <div
        className="fixed left-0 right-0 z-50"
        style={{
          top: '64px',
          transform: pastRunway ? 'translateY(0)' : 'translateY(-100%)',
          opacity: pastRunway ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          pointerEvents: pastRunway ? 'auto' : 'none',
        }}
      >
        <div className="bg-[#DA7756] shadow-lg shadow-[#DA7756]/20">
          <div className="max-w-7xl mx-auto h-14 md:h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xl md:text-2xl font-medium text-white" style={SERIF}>
                Yulia.
              </span>
              <span className="text-xs md:text-sm text-white/60 hidden md:inline">
                Your AI deal advisor.
              </span>
            </div>
            <Link
              href="/signup"
              className="bg-white text-[#DA7756] px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold no-underline hover:bg-gray-50 transition-colors"
            >
              Get started →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

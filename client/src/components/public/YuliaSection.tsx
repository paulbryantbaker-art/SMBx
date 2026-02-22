import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function band(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

export default function YuliaSection() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [pastRunway, setPastRunway] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = runwayRef.current;
          if (!el) { ticking = false; return; }
          const rect = el.getBoundingClientRect();
          const navH = 64;
          const runwayH = el.offsetHeight;
          const viewH = window.innerHeight - navH;
          const scrolled = -(rect.top - navH);
          const total = runwayH - viewH;
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
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pIntro    = ease(band(progress, 0.02, 0.12));
  const pName     = ease(band(progress, 0.08, 0.28));
  const pSub      = ease(band(progress, 0.25, 0.35));
  const pStats    = ease(band(progress, 0.32, 0.45));
  const pTagline  = ease(band(progress, 0.42, 0.55));
  const pFadeOut  = ease(band(progress, 0.65, 0.85));
  const pColor    = ease(band(progress, 0.68, 0.88));

  const bgR = Math.round(lerp(250, 218, pColor));
  const bgG = Math.round(lerp(249, 119, pColor));
  const bgB = Math.round(lerp(245, 86, pColor));

  const nameFontSize = pFadeOut > 0
    ? lerp(96, pColor > 0 ? 28 : 72, pFadeOut)
    : lerp(20, 96, pName);

  const cardMaxW = pColor > 0 ? lerp(768, 1280, pColor) : lerp(600, 768, pFadeOut);
  const cardPadding = pColor > 0 ? lerp(48, 14, pColor) : 48;
  const cardRadius = pColor > 0 ? lerp(24, 0, pColor) : 24;
  const contentOpacity = 1 - ease(band(progress, 0.75, 0.9));
  const miniLayout = ease(band(progress, 0.88, 1.0));

  return (
    <>
      <div ref={runwayRef} className="relative" style={{ height: '500vh' }}>
        <div
          className="sticky top-[64px] overflow-hidden flex items-center justify-center"
          style={{
            height: 'calc(100vh - 64px)',
            backgroundColor: `rgb(${bgR},${bgG},${bgB})`,
            transition: 'background-color 0.1s',
          }}
        >
          <div
            className="w-full flex flex-col items-center justify-center text-center px-6"
            style={{ maxWidth: `${cardMaxW}px`, willChange: 'transform' }}
          >
            <div
              className="w-full"
              style={{
                backgroundColor: pFadeOut > 0.2 && pColor < 0.5
                  ? `rgba(255,255,255,${lerp(0, 1, band(pFadeOut, 0.2, 0.6))})`
                  : 'transparent',
                borderRadius: `${cardRadius}px`,
                padding: `${cardPadding}px`,
                boxShadow: pFadeOut > 0.3 && pColor < 0.5
                  ? `0 20px 60px rgba(0,0,0,${lerp(0, 0.08, band(pFadeOut, 0.3, 0.7))})`
                  : 'none',
                display: 'flex',
                flexDirection: miniLayout > 0.5 ? 'row' as const : 'column' as const,
                alignItems: 'center',
                justifyContent: miniLayout > 0.5 ? 'space-between' : 'center',
                gap: miniLayout > 0.5 ? '16px' : '0',
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: miniLayout > 0.5 ? 'row' as const : 'column' as const,
                alignItems: 'center',
                gap: miniLayout > 0.5 ? '12px' : '0',
              }}>
                <p
                  className="text-sm uppercase tracking-[0.25em]"
                  style={{
                    color: '#DA7756',
                    opacity: pIntro * (1 - ease(band(progress, 0.7, 0.85))),
                    transform: `translateY(${lerp(20, 0, pIntro)}px)`,
                    marginBottom: pFadeOut > 0.5 ? '0' : '16px',
                    maxHeight: pFadeOut > 0.8 ? '0' : '40px',
                    overflow: 'hidden',
                  }}
                >
                  Introducing
                </p>

                <h2
                  className="font-medium leading-none"
                  style={{
                    ...SERIF,
                    fontSize: `${Math.max(nameFontSize, 24)}px`,
                    color: pColor > 0.3
                      ? `rgb(${Math.round(lerp(26, 255, band(pColor, 0.3, 0.8)))},${Math.round(lerp(26, 255, band(pColor, 0.3, 0.8)))},${Math.round(lerp(24, 255, band(pColor, 0.3, 0.8)))})`
                      : '#1A1A18',
                    opacity: pName > 0 ? 1 : 0,
                    transform: `scale(${lerp(0.8, 1, Math.min(pName * 2, 1))})`,
                    letterSpacing: `${lerp(8, 0, pName)}px`,
                  }}
                >
                  Yulia.
                </h2>

                <p style={{
                  fontSize: `${lerp(22, 14, pColor)}px`,
                  color: pColor > 0.5 ? 'rgba(255,255,255,0.7)' : '#6B6963',
                  opacity: pSub * (miniLayout > 0.5 ? 1 : (1 - ease(band(progress, 0.8, 0.92)))),
                  transform: `translateY(${lerp(16, 0, pSub)}px)`,
                  marginTop: miniLayout > 0.5 ? '0' : '12px',
                }}>
                  Your AI deal advisor.
                </p>
              </div>

              <Link
                href="/signup"
                className="rounded-full font-semibold no-underline transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: pColor > 0.5 ? '#FFFFFF' : '#DA7756',
                  color: pColor > 0.5 ? '#DA7756' : '#FFFFFF',
                  padding: miniLayout > 0.5 ? '10px 24px' : '16px 40px',
                  fontSize: miniLayout > 0.5 ? '14px' : '18px',
                  opacity: ease(band(progress, 0.88, 1)),
                  pointerEvents: progress > 0.9 ? 'auto' as const : 'none' as const,
                }}
              >
                {miniLayout > 0.5 ? 'Get started \u2192' : 'Meet Yulia \u2192'}
              </Link>
            </div>

            <div
              className="grid grid-cols-3 gap-8 md:gap-16 mt-8 w-full"
              style={{
                maxWidth: '600px',
                opacity: pStats * contentOpacity,
                transform: `translateY(${lerp(30, 0, pStats)}px)`,
                maxHeight: pFadeOut > 0.7 ? '0' : '200px',
                overflow: 'hidden',
              }}
            >
              {[
                { val: '80+', label: 'Industries' },
                { val: '24/7', label: 'Always On' },
                { val: '90%', label: 'Cost Savings' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-4xl md:text-6xl font-medium text-[#DA7756] m-0" style={SERIF}>{s.val}</p>
                  <p className="text-xs md:text-sm text-[#6B6963] mt-2 m-0 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <p
              className="text-xl md:text-2xl italic leading-relaxed mt-8 max-w-lg"
              style={{
                ...SERIF,
                color: '#6B6963',
                opacity: pTagline * contentOpacity,
                transform: `translateY(${lerp(20, 0, pTagline)}px)`,
                maxHeight: pFadeOut > 0.6 ? '0' : '100px',
                overflow: 'hidden',
              }}
            >
              Now you'll never wonder if you left money on the table.
            </p>
          </div>
        </div>
      </div>

      <div
        className="fixed left-0 right-0 z-50 transition-all duration-500 ease-out"
        style={{
          top: '64px',
          transform: pastRunway ? 'translateY(0)' : 'translateY(-100%)',
          opacity: pastRunway ? 1 : 0,
          pointerEvents: pastRunway ? 'auto' : 'none',
        }}
      >
        <div className="bg-[#DA7756] shadow-lg">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium text-white tracking-tight" style={SERIF}>Yulia.</span>
              <span className="text-sm text-white/70 hidden md:inline">Your AI deal advisor.</span>
            </div>
            <Link
              href="/signup"
              className="bg-white text-[#DA7756] px-6 py-2.5 rounded-full text-sm font-semibold no-underline hover:bg-gray-50 transition-colors shadow-sm"
            >
              Get started →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

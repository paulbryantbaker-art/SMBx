import { useRef, useState, useEffect, type ReactNode, type CSSProperties } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';

/* ═══════════════════════════════════════════════
   useReveal — lightweight IntersectionObserver hook
   ═══════════════════════════════════════════════ */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════
   RevealSection — wrapper using useReveal
   ═══════════════════════════════════════════════ */
export function RevealSection({
  children,
  className,
  style,
  threshold = 0.15,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
}) {
  const { ref, visible } = useReveal(threshold);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RevealList — staggered reveal for list items
   ═══════════════════════════════════════════════ */
export function RevealList({
  children,
  className,
  style,
  staggerMs = 50,
}: {
  children: ReactNode[];
  className?: string;
  style?: CSSProperties;
  staggerMs?: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div ref={ref} className={className} style={style}>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.7s ease-out ${i * staggerMs}ms, transform 0.7s ease-out ${i * staggerMs}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ScrollReveal — fade-up when scrolled into view
   ═══════════════════════════════════════════════ */
export function ScrollReveal({
  children,
  delay = 0,
  y = 32,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   StaggerContainer + StaggerItem
   ═══════════════════════════════════════════════ */
export function StaggerContainer({
  children,
  className,
  style,
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   AnimatedCounter — ticks up when in view
   ═══════════════════════════════════════════════ */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   TiltCard — 3D perspective tilt on hover
   ═══════════════════════════════════════════════ */
export function TiltCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, perspective: 800, transformStyle: 'preserve-3d', rotateX, rotateY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   GlowingOrb — ambient floating decoration
   ═══════════════════════════════════════════════ */
export function GlowingOrb({
  color = 'rgba(212,113,78,0.12)',
  size = 320,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  color?: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.15, 0.95, 1.05, 1], opacity: [0, 0.7, 0.5, 0.65, 0.6] }}
      transition={{ duration: 6, delay, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${size / 3}px)`,
        pointerEvents: 'none',
        zIndex: 0,
        top,
        left,
        right,
        bottom,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════
   BeforeAfterSlider — draggable comparison
   ═══════════════════════════════════════════════ */
export function BeforeAfterSlider({
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeContent,
  afterContent,
  className,
}: {
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent: ReactNode;
  afterContent: ReactNode;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updatePos(clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, userSelect: 'none', touchAction: 'none' }}
    >
      {/* After (full) */}
      <div style={{ width: '100%' }}>{afterContent}</div>

      {/* Before (clipped) */}
      <div style={{ position: 'absolute', inset: 0, width: `${pos}%`, overflow: 'hidden' }}>
        <div style={{ width: containerRef.current?.offsetWidth || '100%' }}>{beforeContent}</div>
      </div>

      {/* Divider */}
      <div
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          transform: 'translateX(-50%)',
          width: 4,
          background: '#D4714E',
          cursor: 'col-resize',
          zIndex: 2,
        }}
      >
        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#D4714E',
            border: '3px solid #fff',
            boxShadow: '0 2px 10px rgba(212,113,78,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8L1 8M12 8L15 8M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(26,26,24,0.6)', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 3 }}>{beforeLabel}</span>
      <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, color: '#fff', background: '#D4714E', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 3 }}>{afterLabel}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   InteractiveCalculator — SDE add-back calculator
   ═══════════════════════════════════════════════ */
interface AddBackItem {
  label: string;
  amount: number;
  enabled: boolean;
}

export function InteractiveCalculator({
  baseSDE = 320000,
  multiple = 3.2,
  items: initialItems,
  className,
}: {
  baseSDE?: number;
  multiple?: number;
  items?: AddBackItem[];
  className?: string;
}) {
  const [items, setItems] = useState<AddBackItem[]>(
    initialItems || [
      { label: 'Personal vehicles', amount: 48000, enabled: true },
      { label: 'Family cell phones', amount: 18000, enabled: true },
      { label: 'One-time legal fee', amount: 12000, enabled: true },
      { label: 'Above-market rent to own LLC', amount: 31000, enabled: true },
      { label: 'Personal travel', amount: 15000, enabled: true },
    ]
  );

  const totalAddBacks = items.filter(i => i.enabled).reduce((s, i) => s + i.amount, 0);
  const adjustedSDE = baseSDE + totalAddBacks;
  const valuation = adjustedSDE * multiple;

  const toggle = (idx: number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, enabled: !item.enabled } : item));
  };

  return (
    <div className={className} style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #C5C0B6', padding: '28px 32px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)' }}>INTERACTIVE ADD-BACK CALCULATOR</span>
      <p style={{ fontSize: '13px', color: 'rgba(26,26,24,0.4)', margin: '8px 0 16px' }}>Toggle add-backs to see how they impact valuation</p>

      <div style={{ fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
        <div className="flex justify-between" style={{ color: 'rgba(26,26,24,0.5)', marginBottom: 12 }}>
          <span>Reported SDE</span>
          <span style={{ color: '#1A1A18', fontWeight: 600 }}>${baseSDE.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <button
              key={item.label}
              onClick={() => toggle(i)}
              type="button"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontVariantNumeric: 'tabular-nums',
                transition: 'all 0.2s',
                background: item.enabled ? 'rgba(212,113,78,0.08)' : 'rgba(26,26,24,0.03)',
                color: item.enabled ? '#1A1A18' : 'rgba(26,26,24,0.3)',
              }}
            >
              <span className="flex items-center gap-2">
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: item.enabled ? '2px solid #D4714E' : '2px solid rgba(26,26,24,0.15)',
                  background: item.enabled ? '#D4714E' : 'transparent',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}>
                  {item.enabled && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {item.label}
              </span>
              <span style={{ color: item.enabled ? '#D4714E' : 'rgba(26,26,24,0.25)', fontWeight: 600, flexShrink: 0, marginLeft: 16 }}>
                +${item.amount.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        <motion.div
          layout
          style={{ borderTop: '2px solid rgba(26,26,24,0.12)', marginTop: 16, paddingTop: 16 }}
        >
          <div className="flex justify-between" style={{ fontSize: '16px', fontWeight: 600, color: '#D4714E' }}>
            <span>Adjusted SDE</span>
            <motion.span
              key={adjustedSDE}
              initial={{ scale: 1.15, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${adjustedSDE.toLocaleString()}
            </motion.span>
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: '16px', fontWeight: 600, color: '#D4714E' }}>
            <span>At {multiple}&times;</span>
            <motion.span
              key={valuation}
              initial={{ scale: 1.15, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${(valuation / 1000000).toFixed(2)}M
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DSCRCalculator — interactive DSCR slider
   ═══════════════════════════════════════════════ */
export function DSCRCalculator({ className }: { className?: string }) {
  const [loanAmt, setLoanAmt] = useState(1400000);
  const [rate, setRate] = useState(10.5);
  const [ebitda, setEbitda] = useState(350000);

  const monthlyPayment = loanAmt * (rate / 100 / 12) / (1 - Math.pow(1 + rate / 100 / 12, -120));
  const annualDebt = monthlyPayment * 12;
  const dscr = ebitda / annualDebt;
  const dscrColor = dscr >= 1.25 ? '#22C55E' : dscr >= 1.0 ? '#EAB308' : '#EF4444';

  return (
    <div className={className} style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #C5C0B6', padding: '28px 32px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)' }}>INTERACTIVE DSCR CALCULATOR</span>
      <p style={{ fontSize: '13px', color: 'rgba(26,26,24,0.4)', margin: '8px 0 20px' }}>Drag sliders to model SBA eligibility</p>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-2" style={{ fontSize: '13px' }}>
            <span style={{ color: 'rgba(26,26,24,0.5)' }}>Loan Amount</span>
            <span style={{ fontWeight: 600, color: '#1A1A18' }}>${(loanAmt / 1000000).toFixed(2)}M</span>
          </div>
          <input type="range" min={200000} max={5000000} step={50000} value={loanAmt} onChange={e => setLoanAmt(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <div className="flex justify-between mb-2" style={{ fontSize: '13px' }}>
            <span style={{ color: 'rgba(26,26,24,0.5)' }}>Interest Rate</span>
            <span style={{ fontWeight: 600, color: '#1A1A18' }}>{rate.toFixed(1)}%</span>
          </div>
          <input type="range" min={6} max={15} step={0.25} value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <div className="flex justify-between mb-2" style={{ fontSize: '13px' }}>
            <span style={{ color: 'rgba(26,26,24,0.5)' }}>Annual EBITDA</span>
            <span style={{ fontWeight: 600, color: '#1A1A18' }}>${(ebitda / 1000).toFixed(0)}K</span>
          </div>
          <input type="range" min={100000} max={2000000} step={25000} value={ebitda} onChange={e => setEbitda(+e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <motion.div
        layout
        style={{ borderTop: '2px solid rgba(26,26,24,0.12)', marginTop: 20, paddingTop: 20, textAlign: 'center' }}
      >
        <div style={{ fontSize: '13px', color: 'rgba(26,26,24,0.45)', marginBottom: 4 }}>DSCR</div>
        <motion.div
          key={dscr.toFixed(2)}
          initial={{ scale: 1.1, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: '42px', fontWeight: 700, color: dscrColor, lineHeight: 1 }}
        >
          {dscr.toFixed(2)}&times;
        </motion.div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: dscrColor, marginTop: 4 }}>
          {dscr >= 1.25 ? 'SBA Eligible' : dscr >= 1.0 ? 'Borderline' : 'Below Threshold'}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(26,26,24,0.4)', marginTop: 8 }}>
          Monthly P&I: ${Math.round(monthlyPayment).toLocaleString()} &middot; Annual: ${Math.round(annualDebt).toLocaleString()}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   StatBar — animated stat chips
   ═══════════════════════════════════════════════ */
export function StatBar({
  stats,
  className,
}: {
  stats: { label: string; value: number; prefix?: string; suffix?: string }[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #C5C0B6',
            padding: '16px 24px',
            flex: '1 1 140px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#D4714E', lineHeight: 1.1 }}>
            <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(26,26,24,0.45)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PulseBadge — gently pulsing badge
   ═══════════════════════════════════════════════ */
export function PulseBadge({
  children,
  color = '#22C55E',
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.span
      animate={{ boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 6px ${color}00`] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      style={{
        display: 'inline-block',
        background: color,
        color: '#fff',
        padding: '2px 10px',
        borderRadius: 100,
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════
   MagneticButton — subtle magnetic pull effect
   ═══════════════════════════════════════════════ */
export function MagneticButton({
  children,
  onClick,
  className,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.15);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      type="button"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ ...style, x: springX, y: springY }}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   AnimatedTimeline — scroll-driven progress line
   ═══════════════════════════════════════════════ */
export function AnimatedTimeline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.4'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      {/* Background line */}
      <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 2, background: 'rgba(212,113,78,0.12)' }} />
      {/* Animated fill */}
      <motion.div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 2, background: '#D4714E', transformOrigin: 'top', scaleY }} />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FloatingParticle — tiny floating dots
   ═══════════════════════════════════════════════ */
export function FloatingParticles({ count = 6 }: { count?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${10 + Math.random() * 80}%`,
            y: `${10 + Math.random() * 80}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${10 + Math.random() * 80}%`, `${10 + Math.random() * 80}%`],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            delay: i * 1.2,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            borderRadius: '50%',
            background: '#D4714E',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ZigZagSection — alternating 2-col layout
   ═══════════════════════════════════════════════ */
export function ZigZagSection({
  items,
  className,
}: {
  items: { icon: string; title: string; body: string }[];
  className?: string;
}) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
      {items.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.08}>
          <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
            <div className={i % 2 === 1 ? 'md:[direction:ltr]' : ''}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A18', margin: '0 0 10px' }}>{item.title}</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item.body}</p>
            </div>
            <div className={`flex ${i % 2 === 1 ? 'md:justify-start md:[direction:ltr]' : 'md:justify-end'} justify-center`}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(212,113,78,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0,
              }}>
                {item.icon}
              </div>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BentoGrid — asymmetric mosaic layout
   ═══════════════════════════════════════════════ */
export function BentoGrid({
  items,
  featuredIndex = 0,
  className,
}: {
  items: { icon?: string; title: string; body: string }[];
  featuredIndex?: number | number[];
  className?: string;
}) {
  const featuredSet = new Set(Array.isArray(featuredIndex) ? featuredIndex : [featuredIndex]);
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
      {items.map((item, i) => {
        const featured = featuredSet.has(i);
        return (
          <ScrollReveal key={item.title} delay={i * 0.06}>
            <div style={{
              background: '#FAFAFA',
              borderRadius: 20,
              border: '1px solid rgba(0,0,0,0.04)',
              padding: featured ? '32px 28px' : '24px 28px',
              gridRow: featured ? 'span 2' : undefined,
              height: '100%',
            }}>
              <h3 style={{ fontSize: featured ? '20px' : '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}{item.title}
              </h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{item.body}</p>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FeatureGrid — equal-height multi-column grid
   ═══════════════════════════════════════════════ */
export function FeatureGrid({
  items,
  columns = 2,
  highlight,
  className,
}: {
  items: { title: string; body: string; price?: string; badge?: string }[];
  columns?: 2 | 3;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid gap-4 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${className || ''}`}>
      {items.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.06}>
          <div style={{
            background: '#FAFAFA',
            borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.04)',
            borderLeft: highlight ? '3px solid #D4714E' : undefined,
            padding: '24px 28px',
            height: '100%',
          }}>
            <div className="flex items-start justify-between gap-3">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>
                {item.title}
                {item.badge && <PulseBadge color="#D4714E" style={{ marginLeft: 8 }}>{item.badge}</PulseBadge>}
              </h3>
              {item.price && <span style={{ fontSize: '20px', fontWeight: 700, color: '#D4714E', flexShrink: 0 }}>{item.price}</span>}
            </div>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{item.body}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PullQuote — dramatic large text or number
   ═══════════════════════════════════════════════ */
export function PullQuote({
  text,
  number,
  prefix,
  suffix,
  className,
}: {
  text?: string;
  number?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ textAlign: 'center', padding: '48px 16px' }}>
      {number !== undefined ? (
        <AnimatedCounter
          value={number}
          prefix={prefix}
          suffix={suffix}
          style={{ fontSize: 56, fontWeight: 700, color: '#D4714E', lineHeight: 1 }}
        />
      ) : (
        <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0 }}>{text}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FullBleedSection — clean section break
   ═══════════════════════════════════════════════ */
export function FullBleedSection({
  children,
  tinted = false,
  className,
}: {
  children: ReactNode;
  tinted?: boolean;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{ background: tinted ? '#FAFAFA' : '#FFFFFF', width: '100%' }}
    >
      <div className="max-w-4xl mx-auto px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   NumberedList — 2-col numbered items
   ═══════════════════════════════════════════════ */
export function NumberedList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-x-8 gap-y-4 ${className || ''}`}>
      {items.map((item, i) => (
        <ScrollReveal key={i} delay={i * 0.05}>
          <div className="flex gap-4 items-start">
            <span style={{
              fontSize: '14px', fontWeight: 700, color: '#D4714E',
              minWidth: 28, flexShrink: 0,
              borderLeft: '2px solid rgba(212,113,78,0.2)',
              paddingLeft: 10,
              lineHeight: '1.65',
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

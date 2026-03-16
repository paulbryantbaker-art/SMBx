import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════
   SCROLL REVEAL — fade / slide in when element enters viewport
   ═══════════════════════════════════════════════════════════════════ */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  const initial = {
    opacity: 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
    x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAGGER CONTAINER + ITEM — children animate in sequence
   ═══════════════════════════════════════════════════════════════════ */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.1 }: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — numbers tick up when scrolled into view
   ═══════════════════════════════════════════════════════════════════ */

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const end = value;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = (now - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayed(end * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  const formatted =
    decimals > 0
      ? displayed.toFixed(decimals)
      : Math.round(displayed).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TILT CARD — 3D perspective tilt on hover (desktop only)
   ═══════════════════════════════════════════════════════════════════ */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 });

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GLOWING ORB — ambient animated background decoration
   ═══════════════════════════════════════════════════════════════════ */

interface GlowingOrbProps {
  color?: string;
  size?: number;
  className?: string;
  delay?: number;
}

export function GlowingOrb({ color = '#C96B4F', size = 300, className, delay = 0 }: GlowingOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED TIMELINE — vertical journey with scroll-driven progress
   ═══════════════════════════════════════════════════════════════════ */

export interface GateData {
  id: string;
  title: string;
  desc: string;
  free: boolean;
  price?: string;
}

interface AnimatedTimelineProps {
  gates: GateData[];
  accentColor?: string;
}

export function AnimatedTimeline({ gates, accentColor = '#C96B4F' }: AnimatedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 30%'],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="relative">
      {/* Track */}
      <div className="absolute left-[23px] md:left-[27px] top-0 bottom-0 w-[3px] bg-[#EAE6DF] rounded-full" />
      {/* Progress fill */}
      <motion.div
        className="absolute left-[23px] md:left-[27px] top-0 w-[3px] rounded-full origin-top"
        style={{ scaleY, height: '100%', backgroundColor: accentColor }}
      />

      <div className="space-y-6">
        {gates.map((gate, i) => (
          <TimelineNode key={gate.id} gate={gate} index={i} accent={accentColor} />
        ))}
      </div>
    </div>
  );
}

function TimelineNode({ gate, index, accent }: { gate: GateData; index: number; accent: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
      className="flex gap-5 items-start"
    >
      {/* Node circle */}
      <div className="relative flex-shrink-0 mt-1">
        <motion.div
          className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-full flex items-center justify-center border-[3px] font-black text-sm"
          style={{
            borderColor: gate.free ? '#22c55e' : accent,
            backgroundColor: gate.free ? '#22c55e' : '#fff',
            color: gate.free ? '#fff' : accent,
          }}
          animate={isInView ? { scale: [0.8, 1.05, 1] } : {}}
          transition={{ duration: 0.4, delay: index * 0.08 + 0.2 }}
        >
          {gate.free ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span className="text-xs">{gate.id}</span>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 p-5 rounded-2xl border transition-all duration-500 ${
          isInView ? 'bg-white border-[#EAE6DF] shadow-sm' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <span
            className="text-[11px] font-black tracking-widest uppercase"
            style={{ color: gate.free ? '#22c55e' : accent }}
          >
            {gate.id}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: gate.free ? '#f0fdf4' : '#FFF0EB',
              color: gate.free ? '#16a34a' : accent,
            }}
          >
            {gate.free ? 'FREE' : gate.price || 'PREMIUM'}
          </span>
        </div>
        <h4 className="font-bold text-[17px] mb-1">{gate.title}</h4>
        <p className="text-[#6E6A63] text-sm leading-relaxed">{gate.desc}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BEFORE / AFTER SLIDER — draggable comparison
   ═══════════════════════════════════════════════════════════════════ */

interface BeforeAfterSliderProps {
  beforeContent: ReactNode;
  afterContent: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeContent,
  afterContent,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(clientX - rect.left, rect.width - 5));
    setPosition((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };
    const onUp = () => {
      isDragging.current = false;
    };

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
  }, [handleMove]);

  return (
    <ScrollReveal>
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-3xl border border-[#EAE6DF] select-none shadow-xl ${className ?? ''}`}
        onMouseDown={(e) => {
          isDragging.current = true;
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          isDragging.current = true;
          handleMove(e.touches[0].clientX);
        }}
        style={{ cursor: 'col-resize' }}
      >
        {/* After layer (full) */}
        <div className="w-full">{afterContent}</div>

        {/* Before layer (clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {beforeContent}
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-[#C96B4F]"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#C96B4F] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 6l-4 6 4 6" />
              <path d="M15 6l4 6-4 6" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#C96B4F] text-white text-xs font-bold">
          {afterLabel}
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTERACTIVE SDE CALCULATOR — toggle add-backs, see valuation
   ═══════════════════════════════════════════════════════════════════ */

interface AddBackItem {
  key: string;
  label: string;
  amount: number;
  defaultOn?: boolean;
}

interface InteractiveCalcProps {
  netIncome: number;
  addBacks: AddBackItem[];
  multipleRange: [number, number];
  metricLabel?: string;
}

export function InteractiveCalculator({
  netIncome,
  addBacks,
  multipleRange,
  metricLabel = 'SDE',
}: InteractiveCalcProps) {
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(addBacks.map((a) => [a.key, a.defaultOn ?? false])),
  );

  const totalAddBacks = addBacks
    .filter((a) => active[a.key])
    .reduce((sum, a) => sum + a.amount, 0);
  const sde = netIncome + totalAddBacks;
  const valLow = sde * multipleRange[0];
  const valHigh = sde * multipleRange[1];

  return (
    <ScrollReveal>
      <div className="bg-white rounded-[32px] border border-[#EAE6DF] shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#EAE6DF] bg-gradient-to-r from-[#FDFCFB] to-[#F8F6F1]">
          <div className="text-xs font-black text-[#A9A49C] uppercase tracking-widest mb-2">Interactive {metricLabel} Calculator</div>
          <h3 className="text-2xl font-bold">Toggle add-backs. Watch your value change.</h3>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: toggles */}
            <div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EAE6DF]">
                <span className="text-sm font-bold text-[#6E6A63]">Reported Net Income</span>
                <span className="font-mono font-bold text-lg">${netIncome.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                {addBacks.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      active[item.key]
                        ? 'border-[#C96B4F] bg-[#FFF8F4] shadow-sm'
                        : 'border-[#EAE6DF] bg-white hover:border-[#DDD9D1]'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          active[item.key] ? 'bg-[#C96B4F]' : 'bg-[#EAE6DF]'
                        }`}
                      >
                        {active[item.key] && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-[15px]">{item.label}</span>
                    </div>
                    <span
                      className={`font-mono font-bold transition-colors ${
                        active[item.key] ? 'text-green-600' : 'text-[#A9A49C]'
                      }`}
                    >
                      +${item.amount.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: result */}
            <div className="flex flex-col justify-center">
              <div className="bg-[#F8F6F1] rounded-2xl p-6 border border-[#EAE6DF]">
                <div className="text-xs font-black text-[#A9A49C] uppercase tracking-widest mb-4">Your True {metricLabel}</div>
                <motion.div
                  className="text-5xl md:text-6xl font-black text-[#1A1A18] mb-6"
                  key={sde}
                  initial={{ scale: 1.08, color: '#C96B4F' }}
                  animate={{ scale: 1, color: '#1A1A18' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  ${sde.toLocaleString()}
                </motion.div>

                <div className="h-px bg-[#EAE6DF] mb-4" />

                <div className="text-xs font-black text-[#A9A49C] uppercase tracking-widest mb-2">
                  Enterprise Value Range ({multipleRange[0]}x &ndash; {multipleRange[1]}x)
                </div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    className="text-3xl font-black text-[#C96B4F]"
                    key={valLow}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ${Math.round(valLow).toLocaleString()}
                  </motion.span>
                  <span className="text-[#A9A49C] font-bold">&ndash;</span>
                  <motion.span
                    className="text-3xl font-black text-[#C96B4F]"
                    key={valHigh}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    ${Math.round(valHigh).toLocaleString()}
                  </motion.span>
                </div>
              </div>

              {/* Bump indicator */}
              <AnimatePresence>
                {totalAddBacks > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium"
                  >
                    <strong>+${totalAddBacks.toLocaleString()}</strong> in add-backs identified &mdash; that&apos;s{' '}
                    <strong>${(totalAddBacks * multipleRange[0]).toLocaleString()}&ndash;${(totalAddBacks * multipleRange[1]).toLocaleString()}</strong>{' '}
                    in additional enterprise value.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAT BAR — animated number grid
   ═══════════════════════════════════════════════════════════════════ */

export interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  decimals?: number;
}

interface StatBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatBar({ stats, className }: StatBarProps) {
  return (
    <ScrollReveal className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black text-[#1A1A18] mb-2">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </div>
            <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </ScrollReveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED CHAT DEMO — messages animate in sequence
   ═══════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: ReactNode;
}

interface AnimatedChatDemoProps {
  messages: ChatMessage[];
  className?: string;
}

export function AnimatedChatDemo({ messages, className }: AnimatedChatDemoProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div ref={ref} className={`flex flex-col gap-6 ${className ?? ''}`}>
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{
            duration: 0.5,
            delay: i * 0.4,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className={msg.role === 'user' ? 'self-end' : 'self-start flex gap-4'}
        >
          {msg.role === 'user' ? (
            <div className="bg-[#C96B4F] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
              {msg.content}
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#C96B4F] font-black text-sm shrink-0 shadow-sm mt-1">
                Y
              </div>
              <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed max-w-[85%]">
                {msg.content}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PULSE BADGE — animated notification-style badge
   ═══════════════════════════════════════════════════════════════════ */

export function PulseBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-flex ${className ?? ''}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96B4F] opacity-20" />
      <span className="relative inline-flex items-center">{children}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON — subtle hover attraction effect
   ═══════════════════════════════════════════════════════════════════ */

export function MagneticButton({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.15);
    y.set(dy * 0.15);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </motion.button>
  );
}

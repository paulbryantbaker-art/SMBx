import { Link } from 'wouter';
import { useAuth } from '../../hooks/useAuth';

interface LogoProps {
  className?: string;
  light?: boolean;
  linked?: boolean;
  height?: number;
}

/**
 * Wordmark — the brand diamond (a rotated square ring, the same motif used as
 * the site's list markers and seal mark) + "smbX.ai" set in the house grotesk.
 * Drawn entirely in-system: Schibsted Grotesk is the body face everywhere, the
 * diamond ring is pure border so it sits on ANY surface, and green lives in
 * the mark alone (the Working Paper rule: green is rationed). No box, no
 * image: crisp at any size. `height` drives the type size; `light` flips the
 * ink for dark surfaces.
 */
export default function Logo({ className = '', light = false, linked = true, height = 28 }: LogoProps) {
  const { user } = useAuth();

  const ink = light ? '#FAF9F5' : 'var(--ink, #191813)';
  const sub = light ? 'rgba(250,249,245,.55)' : 'var(--ink-3, #8B867A)';
  const fontSize = Math.round(height * 0.78);
  const gem = Math.max(10, Math.round(height * 0.4));
  const mark = (
    <span
      className={className}
      role="img"
      aria-label="smbX.ai"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(6, Math.round(height * 0.28)),
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: gem,
          height: gem,
          flex: 'none',
          border: `${Math.max(2, Math.round(gem * 0.24))}px solid #2BFF77`,
          borderRadius: Math.max(2, Math.round(gem * 0.18)),
          transform: 'rotate(45deg)',
        }}
      />
      <span
        style={{
          fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
          fontSize,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: ink,
        }}
      >
        smbX<span style={{ color: sub, fontWeight: 600 }}>.ai</span>
      </span>
    </span>
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

import { Link } from 'wouter';
import { useAuth } from '../../hooks/useAuth';

interface LogoProps {
  className?: string;
  light?: boolean;
  linked?: boolean;
  height?: number;
}

/**
 * Text wordmark "smbX.ai" — brand display type, dark ink, with a bolder
 * neon-green capital X as the accent. No box, no image: renders crisp at any
 * size and tunes (color/weight/size) in one line. `height` drives the font
 * size; `light` flips the ink to a light tone for dark surfaces (the green X
 * stays the brand neon, which pops most on dark).
 */
export default function Logo({ className = '', light = false, linked = true, height = 28 }: LogoProps) {
  const { user } = useAuth();

  const ink = light ? '#FAF9F5' : 'var(--ink, #191813)';
  // Bright neon pops on dark; on light surfaces (white/cream nav) #2BFF77 reads
  // faint, so deepen the X to the brand's --mb-accent-2 (#10E060) for contrast.
  const xGreen = light ? '#2BFF77' : '#10E060';
  const fontSize = Math.round(height * 0.86);
  const mark = (
    <span
      className={className}
      role="img"
      aria-label="smbX.ai"
      style={{
        fontFamily: 'var(--font-display, "Schibsted Grotesk", system-ui, sans-serif)',
        fontSize,
        fontWeight: 600,
        letterSpacing: '-0.035em',
        lineHeight: 1,
        color: ink,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      smb<span style={{ color: xGreen, fontWeight: 800 }}>X</span>.ai
    </span>
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

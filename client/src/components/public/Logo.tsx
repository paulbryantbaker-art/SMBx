import { Link } from 'wouter';
import { useAuth } from '../../hooks/useAuth';

interface LogoProps {
  className?: string;
  light?: boolean;
  linked?: boolean;
  height?: number;
}

export default function Logo({ className = '', light = false, linked = true, height = 28 }: LogoProps) {
  const { user } = useAuth();

  // Green "smbX.ai" wordmark badge (dark text on neon-green #2BFF77), corners
  // rounded proportionally to height. `light` retained for API compat but unused.
  void light;
  const mark = (
    <img
      src="/GreenLogo.png"
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, objectFit: 'contain', display: 'block', borderRadius: Math.round(height * 0.2), border: '2px solid #00210F', boxSizing: 'border-box' }}
    />
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

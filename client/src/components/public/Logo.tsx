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

  // Green "smbX.ai" wordmark badge — dark border + rounded corners baked into
  // the asset (GreenLogoBlkBorder.png). `light` retained for API compat, unused.
  void light;
  const mark = (
    <img
      src="/GreenLogoBlkBorder.png"
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, objectFit: 'contain', display: 'block' }}
    />
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

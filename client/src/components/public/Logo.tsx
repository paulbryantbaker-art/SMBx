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

  // New neon "smbX.ai" wordmark. `light` retained for API compat; every current
  // mount is a light surface (the wordmark's text is dark), so it's unused.
  void light;
  const mark = (
    <img
      src="/newNeonLogo.png"
      alt="smbx.ai"
      draggable={false}
      className={className}
      style={{ height, objectFit: 'contain', display: 'block' }}
    />
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

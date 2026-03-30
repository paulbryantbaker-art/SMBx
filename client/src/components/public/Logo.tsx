import { Link } from 'wouter';
import { useAuth } from '../../hooks/useAuth';

interface LogoProps {
  className?: string;
  light?: boolean;
  linked?: boolean;
}

export default function Logo({ className = '', light = false, linked = true }: LogoProps) {
  const { user } = useAuth();

  const mark = (
    <span
      className={`font-bold tracking-tight ${className}`}
      style={{ fontFamily: "var(--sans)", fontSize: '22px', letterSpacing: '-.03em' }}
    >
      <span className={light ? 'text-white' : 'text-[#0D0D0D]'}>smbx</span>
      <span className="text-[#C25572]">.</span>
      <span className={light ? 'text-white' : 'text-[#0D0D0D]'}>ai</span>
    </span>
  );

  if (!linked) return mark;
  return <Link href={user ? '/chat' : '/'} className="no-underline">{mark}</Link>;
}

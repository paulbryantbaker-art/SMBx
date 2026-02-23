import { Link } from 'wouter';

interface LogoProps {
  className?: string;
  light?: boolean;
  linked?: boolean;
}

export default function Logo({ className = '', light = false, linked = true }: LogoProps) {
  const mark = (
    <span
      className={`font-bold tracking-tight ${className}`}
      style={{ fontFamily: "var(--sans)", fontSize: '22px', letterSpacing: '-.03em' }}
    >
      <span className={light ? 'text-white' : 'text-[#1A1A18]'}>smb</span>
      <span className="text-[#DA7756]">x</span>
      <span className={light ? 'text-white' : 'text-[#1A1A18]'}>.ai</span>
    </span>
  );

  if (!linked) return mark;
  return <Link href="/" className="no-underline">{mark}</Link>;
}

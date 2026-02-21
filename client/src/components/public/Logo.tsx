const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = 'text-xl', light = false }: LogoProps) {
  return (
    <span className={`font-semibold ${className}`} style={SERIF}>
      <span className={light ? 'text-white' : 'text-[#1A1A18]'}>smb</span>
      <span className="text-[#DA7756]">x</span>
      <span
        className="text-[#DA7756] inline-block scale-125 origin-bottom"
        style={{ animation: 'logoBreathe 3s ease-in-out infinite' }}
      >
        .
      </span>
      <span className={`font-normal ${light ? 'text-[#A3A3A3]' : 'text-[#6B6963]'}`}>
        ai
      </span>
    </span>
  );
}

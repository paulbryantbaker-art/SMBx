interface Props {
  size?: number;
  className?: string;
}

export default function YuliaAvatar({ size = 32, className = '' }: Props) {
  return (
    <div
      className={`shrink-0 rounded-full bg-[#DA7756] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-white leading-none"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.4, letterSpacing: '-.02em' }}
      >
        Y
      </span>
    </div>
  );
}

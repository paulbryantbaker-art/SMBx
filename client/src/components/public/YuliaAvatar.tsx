interface Props {
  size?: number;
  className?: string;
}

export default function YuliaAvatar({ size = 32, className = '' }: Props) {
  return (
    <div
      className={`shrink-0 rounded-lg bg-[#D4714E] flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: 8 }}
    >
      <span
        className="font-bold text-white leading-none"
        style={{ fontFamily: "var(--sans)", fontSize: 13, letterSpacing: '-.02em' }}
      >
        Y
      </span>
    </div>
  );
}

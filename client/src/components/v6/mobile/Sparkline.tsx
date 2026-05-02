interface SparklineProps {
  values: number[];
  w?: number;
  h?: number;
  c?: string;
}

export function Sparkline({ values, w = 80, h = 22, c = "var(--mb-accent)" }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 2 - norm(v) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

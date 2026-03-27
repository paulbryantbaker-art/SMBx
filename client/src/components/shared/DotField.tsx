import { useEffect, useRef } from 'react';

interface DotFieldProps {
  dark?: boolean;
}

export default function DotField({ dark = false }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Focal point: center-x, ~38% from top (behind hero)
      const fx = w / 2;
      const fy = h * 0.38;

      const baseSpacing = 28;
      const dotColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';

      const cols = Math.ceil(w / baseSpacing) + 4;
      const rows = Math.ceil(h / baseSpacing) + 4;
      const startX = -baseSpacing * 2;
      const startY = -baseSpacing * 2;

      ctx.fillStyle = dotColor;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = startX + c * baseSpacing;
          let y = startY + r * baseSpacing;

          const dx = x - fx;
          const dy = y - fy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(fx * fx + fy * fy);
          const normDist = dist / maxDist;

          // Gravitational pull toward focal point
          const pull = 0.15 / (normDist + 0.3);
          x -= dx * pull * 0.08;
          y -= dy * pull * 0.08;

          // Vertical density gradient
          const verticalFactor = (y - fy) / h;
          if (verticalFactor < 0) {
            const spread = 1 + Math.abs(verticalFactor) * 0.6;
            x = fx + (x - fx) * spread;
            y = fy + (y - fy) * spread;
          } else {
            const compress = 1 - verticalFactor * 0.25;
            x = fx + (x - fx) * compress;
          }

          // Subtle arc near focal area
          const focalProximity = Math.max(0, 1 - dist / (maxDist * 0.5));
          const curveAngle = focalProximity * 0.04;
          const cosA = Math.cos(curveAngle);
          const sinA = Math.sin(curveAngle);
          const rx = dx * cosA - dy * sinA + fx;
          const ry = dx * sinA + dy * cosA + fy;
          x = x * 0.7 + rx * 0.3;
          y = y * 0.7 + ry * 0.3;

          // Dot size: slightly larger near focal point
          const radius = 0.8 + focalProximity * 0.4;

          // Fade out dots close to focal point (clear space for text)
          const clearRadius = Math.min(w, h) * 0.12;
          if (dist < clearRadius) {
            const fade = dist / clearRadius;
            ctx.globalAlpha = fade * fade;
          } else {
            ctx.globalAlpha = 1;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();

    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

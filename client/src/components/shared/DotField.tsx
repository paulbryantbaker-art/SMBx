import { useEffect, useRef } from 'react';

interface DotFieldProps {
  dark?: boolean;
}

export default function DotField({ dark = false }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Focal point: center-x, ~38% from top (behind hero)
      const fx = w / 2;
      const fy = h * 0.38;

      // Base grid spacing
      const baseSpacing = 28;
      const dotColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';

      // Generate dots on a grid, then warp them
      const cols = Math.ceil(w / baseSpacing) + 4;
      const rows = Math.ceil(h / baseSpacing) + 4;
      const startX = -baseSpacing * 2;
      const startY = -baseSpacing * 2;

      ctx.fillStyle = dotColor;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = startX + c * baseSpacing;
          let y = startY + r * baseSpacing;

          // Distance from focal point (normalized)
          const dx = x - fx;
          const dy = y - fy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(fx * fx + fy * fy);
          const normDist = dist / maxDist;

          // Gravitational pull toward focal point — stronger when closer
          const pullStrength = 0.15;
          const pull = pullStrength / (normDist + 0.3);
          x -= dx * pull * 0.08;
          y -= dy * pull * 0.08;

          // Vertical density: dots below focal point get tighter spacing
          const verticalFactor = (y - fy) / h;
          if (verticalFactor < 0) {
            // Above hero: push dots outward (sparser)
            const spread = 1 + Math.abs(verticalFactor) * 0.6;
            x = fx + (x - fx) * spread;
            y = fy + (y - fy) * spread;
          } else {
            // Below hero: pull dots inward (denser)
            const compress = 1 - verticalFactor * 0.25;
            x = fx + (x - fx) * compress;
          }

          // Slight curve: dots near the focal area arc slightly
          const focalProximity = Math.max(0, 1 - dist / (maxDist * 0.5));
          const curveAngle = focalProximity * 0.04;
          const cosA = Math.cos(curveAngle);
          const sinA = Math.sin(curveAngle);
          const rx = dx * cosA - dy * sinA + fx;
          const ry = dx * sinA + dy * cosA + fy;
          x = x * 0.7 + rx * 0.3;
          y = y * 0.7 + ry * 0.3;

          // Dot size: slightly larger near focal point
          const sizeBoost = focalProximity * 0.4;
          const radius = 0.8 + sizeBoost;

          // Fade out dots very close to focal point (clear space for text)
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

    // Draw after a frame so parent has layout
    requestAnimationFrame(draw);

    const onResize = () => requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

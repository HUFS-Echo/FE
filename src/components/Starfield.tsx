import { useEffect, useRef } from 'react';
import { TUNING } from '../config/tuning';

type Props = {
  count: number;
  reducedMotion: boolean;
};

type Star = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  sparkle: boolean;
  tint: number;
};

export function Starfield({ count, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const makeStars = () => {
      stars = Array.from({ length: count }, (_, index) => {
        const sparkle = Math.random() < TUNING.stars.sparkleRatio;
        return {
          x: Math.random(),
          y: Math.random(),
          radius: sparkle
            ? 1.2 + Math.random() * 0.9
            : TUNING.stars.minRadius + Math.random() * (TUNING.stars.maxRadius - TUNING.stars.minRadius),
          phase: Math.random() * Math.PI * 2,
          speed: TUNING.stars.twinkleSpeed * (0.5 + Math.random() * 1.4),
          sparkle,
          tint: index % 7 === 0 ? 1 : 0,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
      draw(0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const drift = reducedMotion ? 0 : time * TUNING.stars.driftSpeed;
        const x = ((star.x + drift * 0.01) % 1) * width;
        const y = ((star.y + drift * 0.003) % 1) * height;
        const twinkle = reducedMotion ? 0.7 : 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase));
        const alpha = twinkle * (star.sparkle ? 0.85 : 0.6);
        const color = star.tint === 1 ? `rgba(160, 205, 255, ${alpha})` : `rgba(214, 229, 255, ${alpha})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (star.sparkle) {
          ctx.strokeStyle = `rgba(210, 232, 255, ${alpha * 0.45})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - star.radius * 3.2, y);
          ctx.lineTo(x + star.radius * 3.2, y);
          ctx.moveTo(x, y - star.radius * 3.2);
          ctx.lineTo(x, y + star.radius * 3.2);
          ctx.stroke();
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      draw(elapsed);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reducedMotion) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count, reducedMotion]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

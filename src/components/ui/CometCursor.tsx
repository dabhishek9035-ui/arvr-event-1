'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TrailPoint = { x: number; y: number; life: number };

function CometCursorLayer({ isDark = true }: { isDark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -300, y: -300 });
  const headVisible = useRef(false);
  const trail = useRef<TrailPoint[]>([]);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  // Add aura-cursor-active to document to hide default OS cursor inside the website
  useEffect(() => {
    document.documentElement.classList.add('aura-cursor-active');
    document.body.classList.add('aura-cursor-active');
    return () => {
      document.documentElement.classList.remove('aura-cursor-active');
      document.body.classList.remove('aura-cursor-active');
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const moveDot = (x: number, y: number) => {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      dot.style.opacity = '1';
    };

    const addPoint = (x: number, y: number) => {
      const last = trail.current[trail.current.length - 1];
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        if (dist > 14) {
          const steps = Math.min(Math.floor(dist / 12), 4);
          for (let s = 1; s <= steps; s++) {
            const factor = s / (steps + 1);
            trail.current.push({
              x: last.x + (x - last.x) * factor,
              y: last.y + (y - last.y) * factor,
              life: 1,
            });
          }
        }
      }
      trail.current.push({ x, y, life: 1 });
      if (trail.current.length > 40) trail.current.shift();
    };

    // Desktop pointer movement
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const x = e.clientX;
      const y = e.clientY;
      mouse.current = { x, y };
      headVisible.current = true;
      moveDot(x, y);
      addPoint(x, y);
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const x = e.clientX;
      const y = e.clientY;
      mouse.current = { x, y };
      headVisible.current = true;
      moveDot(x, y);
    };

    const onPointerLeave = () => {
      headVisible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    // Expand dot slightly when hovering interactive clickable targets
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable = target.closest(
        'a, button, input, select, textarea, [role="button"], label, .btn, .pill, summary, [tabindex]:not([tabindex="-1"])'
      );
      if (dotRef.current) {
        if (isClickable) {
          dotRef.current.classList.add('is-hovering');
        } else {
          dotRef.current.classList.remove('is-hovering');
        }
      }
    };

    // Mobile / Touch screen gestures and hand scroll
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      mouse.current = { x, y };
      headVisible.current = true;
      moveDot(x, y);
      addPoint(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      mouse.current = { x, y };
      headVisible.current = true;
      moveDot(x, y);
      addPoint(x, y);
    };

    const onTouchEnd = () => {
      headVisible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const draw = () => {
      const dark = isDarkRef.current;
      ctx.clearRect(0, 0, w, h);

      const points = trail.current;

      for (let i = 0; i < points.length; i++) {
        points[i].life *= 0.88;
      }
      trail.current = points.filter((p) => p.life > 0.03);

      const core = dark ? '34, 211, 238' : '109, 40, 217'; // Cyan
      const tail = dark ? '168, 85, 247' : '8, 145, 178'; // Purple

      if (points.length >= 2) {
        for (let i = 1; i < points.length; i++) {
          const t = i / (points.length - 1);
          const alpha = t * points[i].life * (dark ? 0.8 : 0.65);
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.strokeStyle = `rgba(${tail}, ${alpha})`;
          ctx.lineWidth = 2 + t * 13;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      }

      if (headVisible.current && mouse.current.x >= 0 && mouse.current.y >= 0) {
        const head = mouse.current;
        const glowR = dark ? 28 : 24;
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, glowR);
        glow.addColorStop(0, `rgba(${core}, ${dark ? 0.95 : 0.85})`);
        glow.addColorStop(0.42, `rgba(${tail}, ${dark ? 0.45 : 0.35})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(head.x, head.y, dark ? 4 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dark ? '#f0fdff' : '#4c1d95';
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerenter', onPointerEnter);
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('pointerover', onPointerOver, { passive: true });

    // Mobile touch listeners for scrolling and finger movement
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerenter', onPointerEnter);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="aura-comet-canvas" aria-hidden="true" />
      <div
        ref={dotRef}
        className={`aura-cursor-dot ${isDark ? 'aura-cursor-dot-dark' : 'aura-cursor-dot-light'}`}
        style={{ opacity: 0 }}
        aria-hidden="true"
      />
    </>
  );
}

export function CometCursor({
  isDark = true,
  enabled = true,
}: {
  isDark?: boolean;
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!enabled || !mounted || typeof document === 'undefined') return null;

  return createPortal(<CometCursorLayer isDark={isDark} />, document.body);
}

export default CometCursor;

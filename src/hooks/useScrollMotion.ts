'use client';

import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import type Lenis from 'lenis';
import { motion, clamp01 } from '@/lib/motion';
import { useStore } from '@/state/store';
import { measureSections, computeSectionState, type SectionRect } from './useSections';

/**
 * The single scroll rAF loop (plan §7). Drives Lenis, computes velocity and
 * section state into the mutable `motion` object, and updates the discrete
 * active-section id (low-frequency state). No React state per frame.
 */
export function useScrollMotion(lenisRef: MutableRefObject<Lenis | null>) {
  useEffect(() => {
    let rects: SectionRect[] = [];
    const measure = () => {
      rects = measureSections();
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    if (document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return; // coarse pointers: no parallax
      motion.mx = (e.clientX / window.innerWidth) * 2 - 1;
      motion.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (lenisRef.current) lenisRef.current.raf(now);

      const dt = Math.max(1, now - last);
      last = now;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;

      if (dy !== 0) motion.velocity = Math.min(3.2, (Math.abs(dy) / dt) * 0.48);
      else motion.velocity *= 0.9;

      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight;
      motion.progress = clamp01(y / Math.max(1, doc - vh));

      const st = useStore.getState();
      if (st.route === 'home') {
        const s = computeSectionState(y, vh, rects);
        motion.sf = s.sf;
        motion.pin3 = s.pin3;
        motion.e3 = s.e3;
        motion.x3 = s.x3;
        motion.pin5 = s.pin5;
        motion.tSkill = s.tSkill;
        if (st.activeSection !== s.activeId) st.setActiveSection(s.activeId);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, [lenisRef]);
}

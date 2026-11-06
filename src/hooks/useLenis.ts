'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import Lenis from 'lenis';
import { useStore } from '@/state/store';

type LenisWindow = Window & { __lenis?: Lenis };

/**
 * Lenis smooth scroll (plan §7.1). Disabled for reduced motion or touch
 * (native scroll); stopped while the drawer is open. The rAF loop that drives
 * `lenis.raf()` lives in `useScrollMotion` — a single loop drives everything.
 */
export function useLenis(enabled: boolean): MutableRefObject<Lenis | null> {
  const ref = useRef<Lenis | null>(null);
  const drawerOpen = useStore((s) => s.drawerOpen);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, syncTouch: false });
    ref.current = lenis;
    (window as LenisWindow).__lenis = lenis;
    return () => {
      lenis.destroy();
      ref.current = null;
      delete (window as LenisWindow).__lenis;
    };
  }, [enabled]);

  useEffect(() => {
    const lenis = ref.current;
    if (!lenis) return;
    if (drawerOpen) lenis.stop();
    else lenis.start();
  }, [drawerOpen, enabled]);

  return ref;
}

/** Anchor scrolling with the header offset; Lenis when available. */
export function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  const lenis = (window as LenisWindow).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollToY(y: number) {
  const lenis = (window as LenisWindow).__lenis;
  if (lenis) lenis.scrollTo(y, { offset: 0 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

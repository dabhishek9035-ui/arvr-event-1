'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore, type QualityTier } from '@/state/store';

/**
 * FPS probe (plan §6.8): skips the first 2.5 s, samples ~3 s, takes the median
 * frame time. Never auto-upgrades; coarse pointers start at medium.
 * Manual override: Alt+Shift+Q cycles tiers.
 */
const TIERS: QualityTier[] = ['high', 'medium', 'low'];

export function useQualityProbe() {
  const done = useRef(false);
  const t0 = useRef(0);
  const dts = useRef<number[]>([]);
  const quality = useStore((s) => s.quality);

  useEffect(() => {
    // Pre-seeded tier (dev/verification knob, same spirit as Alt+Shift+Q)
    try {
      const seeded = localStorage.getItem('arvr-quality');
      if (seeded === 'high' || seeded === 'medium' || seeded === 'low') {
        useStore.getState().setQuality(seeded);
      }
    } catch {
      /* storage unavailable */
    }
    if (window.matchMedia('(pointer: coarse)').matches && useStore.getState().quality === 'high') {
      useStore.getState().setQuality('medium');
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
        const cur = useStore.getState().quality;
        useStore.getState().setQuality(TIERS[(TIERS.indexOf(cur) + 1) % TIERS.length]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((state, dt) => {
    if (done.current) return;
    if (state.clock.elapsedTime < 2.5) {
      dts.current.length = 0;
      t0.current = 0;
      return;
    }
    if (dts.current.length === 0) t0.current = state.clock.elapsedTime;
    dts.current.push(dt);
    if (state.clock.elapsedTime - t0.current < 3) return;

    done.current = true;
    const sorted = [...dts.current].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0.016;
    const fps = 1 / Math.max(median, 1e-4);
    const cur = useStore.getState().quality;
    if (cur === 'high' && fps < 20) useStore.getState().setQuality('low');
    else if (cur === 'high' && fps < 38) useStore.getState().setQuality('medium');
    else if (cur === 'medium' && fps < 20) useStore.getState().setQuality('low');
  });

  return quality;
}

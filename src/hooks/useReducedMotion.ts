'use client';

import { useEffect } from 'react';
import { useStore } from '@/state/store';

/** Syncs prefers-reduced-motion into the store; returns the live value. */
export function useReducedMotion(): boolean {
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useStore.getState().setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return reduced;
}

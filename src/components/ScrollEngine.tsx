'use client';

import { useLenis } from '@/hooks/useLenis';
import { useScrollMotion } from '@/hooks/useScrollMotion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Layout-mounted scroll runtime: one Lenis instance + one rAF loop that feeds
 * the mutable `motion` store (§7). Off entirely under reduced motion.
 */
export default function ScrollEngine() {
  const reduced = useReducedMotion();
  const lenisRef = useLenis(!reduced);
  useScrollMotion(lenisRef);
  return null;
}

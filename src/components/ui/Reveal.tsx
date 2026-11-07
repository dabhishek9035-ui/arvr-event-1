'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useStore } from '@/state/store';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** whileInView reveal (§4.5): y 24 → 0, 0.7 s; opacity-only under reduced motion. */
export default function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const reduced = useStore((s) => s.reducedMotion);
  const phone = typeof window !== 'undefined' && window.innerWidth < 760;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced || phone ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: reduced || phone ? 0.3 : 0.7,
        delay: reduced ? 0 : delay,
        ease: [0.2, 0.75, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

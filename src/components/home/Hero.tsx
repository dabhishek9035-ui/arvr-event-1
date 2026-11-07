'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useStore } from '@/state/store';

/** Section 0: Hero (§9.1). H1 renders as real text immediately (LCP). */

const STATS = [
  { value: '2', label: 'DAYS' },
  { value: '12', label: 'HANDS-ON HOURS' },
  { value: '9', label: 'LABS' },
  { value: 'Quest', label: 'META HEADSETS' },
];

const EASE: [number, number, number, number] = [0.2, 0.75, 0.25, 1];

export default function Hero() {
  const reduced = useStore((s) => s.reducedMotion);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enter = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.2 : 0.8, delay: reduced ? 0 : 0.09 * i, ease: EASE },
  });

  return (
    <section id="top" data-section="top" className="section hero" aria-label="Introduction">
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-planet" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <motion.h1 className="display-xl hero-h1" {...enter(1)}>
            <span>Build worlds.</span>
            <span className="accent-text">Step inside them.</span>
          </motion.h1>
          <motion.p className="lead hero-lead" {...enter(1)}>
            A student club for people who make immersive things. Unity, OpenXR and Meta Quest,
            learned by building.
          </motion.p>
          <motion.div className="hero-cta" {...enter(2)}>
            <Button href="/register" size="md">
              Register now
            </Button>
            <Button href="/#skill-lab" variant="ghost" size="md" arrow={false}>
              Explore the Skill Lab
            </Button>
          </motion.div>
        </div>
      </div>
      <motion.div className="stat-strip" {...enter(3)}>
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="micro stat-label">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

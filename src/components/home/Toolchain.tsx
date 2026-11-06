'use client';

import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Marquee from '@/components/ui/Marquee';
import { MARQUEE_A, MARQUEE_B, POSITIONING } from '@/content/skillLab';

/** Section 6: Toolchain (§9.7) — two full-bleed marquee rows + positioning. */
export default function Toolchain() {
  return (
    <section id="toolchain" data-section="toolchain" className="section toolchain-section">
      <div className="container">
        <Reveal>
          <Eyebrow>06 / TOOLCHAIN</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="h2">
            The stack you&rsquo;ll
            <br />
            <span className="accent-text">leave knowing.</span>
          </h2>
        </Reveal>
      </div>
      <div className="marquee-stack">
        <Marquee items={MARQUEE_A} duration={48} />
        <Marquee items={MARQUEE_B} duration={56} reverse />
      </div>
      <div className="container">
        <Reveal delay={0.1}>
          <p className="lead toolchain-positioning">{POSITIONING}</p>
        </Reveal>
      </div>
    </section>
  );
}

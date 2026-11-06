'use client';

import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import Button from '@/components/ui/Button';

/** Section 8: Join (§9.9) — display-lg closing statement + Register CTA. */
export default function Join() {
  return (
    <section id="join" data-section="join" className="section join-section">
      <div className="container join-inner">
        <Reveal>
          <Eyebrow>08 / JOIN</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-lg join-h2">
            Your first world
            <br />
            <span className="accent-text">starts here.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead join-lead">
            The Skill Lab runs on 19 &amp; 20 November 2026. Register now to save your seat.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Button href="/register" size="lg">
            Register now
          </Button>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="micro join-meta">19–20 NOVEMBER 2026 · TWO DAYS · TWELVE HOURS · META QUEST</p>
        </Reveal>
      </div>
    </section>
  );
}

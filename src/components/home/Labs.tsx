'use client';

import type { PointerEvent } from 'react';
import Reveal from '@/components/ui/Reveal';
import { LABS } from '@/content/programme';
import { useStore } from '@/state/store';

/** Section 4: Labs (§9.5) — 3×3 grid, pointer tilt + radial glare. */

export default function Labs() {
  const reduced = useStore((s) => s.reducedMotion);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--mx', `${(((px + 0.5) * 100)).toFixed(1)}%`);
    el.style.setProperty('--my', `${(((py + 0.5) * 100)).toFixed(1)}%`);
    el.style.transform = `perspective(900px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
  };

  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <section id="labs" data-section="labs" className="section labs-section">
      <div className="container">
        <Reveal delay={0.05}>
          <h2 className="h2">
            Nine labs.
            <br />
            <span className="accent-text">Nine things you build.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">Every lab ends in something you can run, show, or profile.</p>
        </Reveal>
        <div className="labs-grid">
          {LABS.map((lab, i) => (
            <Reveal
              key={lab.index}
              delay={Math.floor(i / 3) * 0.12 + (i % 3) * 0.07}
              className="labs-cell"
            >
              <article className="lab-card glass" onPointerMove={onMove} onPointerLeave={onLeave}>
                <div className="lab-top">
                  <span className={`pill lab-tag-${lab.tag.toLowerCase().replace(' ', '-')}`}>{lab.tag}</span>
                </div>
                <h3 className="h3">{lab.title}</h3>
                <p className="lab-body">{lab.body}</p>
                <div className="lab-result">
                  <span className="micro lab-result-text">→ {lab.result}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

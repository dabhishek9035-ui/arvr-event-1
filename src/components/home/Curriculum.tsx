'use client';

import { useEffect, useRef, useState } from 'react';
import { MODULES, type Module } from '@/content/skillLab';
import { scrollToY } from '@/hooks/useLenis';
import { motion as scrollMotion } from '@/lib/motion';
import { useStore } from '@/state/store';

/**
 * Section 3: Curriculum (§9.4) — pinned horizontal scroll through 9 module
 * cards while the camera flies through 9 corridor gates (pin3 shared).
 * Vertical stacked fallback under 760 px / reduced motion / no JS.
 */

function Head() {
  return (
    <div className="curriculum-head">
      <h2 className="h2">
        Nine modules.
        <br />
        <span className="accent-text">Twelve hours.</span>
      </h2>
    </div>
  );
}

function Card({ m, active, onSelect }: { m: Module; active: boolean; onSelect?: () => void }) {
  const hrs = Number.isInteger(m.hours) ? `${m.hours}` : m.hours.toFixed(1);
  return (
    <article
      className={`module-card glass${active ? ' active' : ''}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
    >
      <div className="module-top">
        <span className="pill module-hours">{hrs} HRS</span>
        <span className="micro module-index">MODULE {String(m.index).padStart(2, '0')}</span>
      </div>
      <span className="module-numeral" aria-hidden="true">
        {m.roman}
      </span>
      <h3 className="h3-lg module-title">{m.title}</h3>
      <p className="module-blurb">{m.blurb}</p>
    </article>
  );
}

export default function Curriculum() {
  const reduced = useStore((s) => s.reducedMotion);
  const pinned = !reduced;

  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned]);

  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    let lastActive = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const track = trackRef.current;
      const bar = barRef.current;
      if (!track || !bar) return;
      const p = scrollMotion.pin3;
      track.style.transform = `translate3d(${(-travel * p).toFixed(2)}px, 0, 0)`;
      bar.style.width = `${(p * 100).toFixed(2)}%`;
      const idx = Math.round(p * (MODULES.length - 1));
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pinned, travel]);

  const jumpToModule = (idx: number) => {
    if (!pinned) return;
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const fraction = idx / Math.max(1, MODULES.length - 1);
    scrollToY(top + fraction * travel);
  };

  if (!pinned) {
    return (
      <section id="curriculum" data-section="curriculum" className="section curriculum-section stacked">
        <div className="container">
          <Head />
          <div className="module-stack">
            {MODULES.map((m) => (
              <Card key={m.index} m={m} active />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hours = MODULES[active]?.cumulative ?? 0;
  const hoursLabel = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      data-section="curriculum"
      className="section curriculum-section"
      style={{ height: `calc(100vh + ${travel}px)` }}
    >
      <div className="curriculum-sticky">
        <Head />
        <div className="curriculum-viewport">
          <div className="module-track" ref={trackRef}>
            {MODULES.map((m, i) => (
              <Card key={m.index} m={m} active={i === active} onSelect={() => jumpToModule(i)} />
            ))}
          </div>
        </div>
        <div className="curriculum-progress">
          <div
            className="progress-track"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const clickP = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
              const idx = Math.round(clickP * (MODULES.length - 1));
              jumpToModule(idx);
            }}
          >
            <div className="progress-fill" ref={barRef} />
          </div>
          <span className="micro progress-counter">
            {String(active + 1).padStart(2, '0')} / 09 · {hoursLabel} / 12 HRS
          </span>
        </div>
      </div>
    </section>
  );
}

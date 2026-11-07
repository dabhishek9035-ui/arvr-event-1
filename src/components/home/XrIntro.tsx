'use client';

import { Glasses, ScanLine, Layers } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { useStore, type XrMode } from '@/state/store';

/** Section 1: What is XR (§9.2). Hover/focus/tap drives the scene (§6.6). */

const CARDS: {
  id: Exclude<XrMode, null>;
  icon: typeof Glasses;
  sub: string;
  title: string;
  body: string;
  focus?: boolean;
}[] = [
  {
    id: 'vr',
    icon: Glasses,
    sub: 'VR · FULLY IMMERSIVE',
    title: 'Virtual Reality',
    body: 'A fully digital world that replaces your surroundings. You are inside the experience. This is the main focus of the Skill Lab.',
    focus: true,
  },
  {
    id: 'ar',
    icon: ScanLine,
    sub: 'AR · DIGITAL OVER REAL',
    title: 'Augmented Reality',
    body: 'Digital content layered onto the real world, seen through a phone or glasses.',
  },
  {
    id: 'mr',
    icon: Layers,
    sub: 'MR · BOTH, INTERACTING',
    title: 'Mixed Reality',
    body: 'Digital objects that understand and react to the real space around you.',
  },
];

export default function XrIntro() {
  const xrMode = useStore((s) => s.xrMode);
  const setXrMode = useStore((s) => s.setXrMode);

  const toggle = (id: Exclude<XrMode, null>) => setXrMode(xrMode === id ? null : id);

  return (
    <section id="xr" data-section="xr" className="section xr-section">
      <div className="container">
        <div className="head-col">
          <Reveal delay={0.05}>
            <h2 className="h2">
              Three ways to
              <br />
              <span className="accent-text">bend reality.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              Extended Reality is the umbrella. Here is the spectrum you&rsquo;ll learn to build
              across.
            </p>
          </Reveal>
        </div>
        <div className="xr-cards">
          {CARDS.map((card, i) => {
            const pressed = xrMode === card.id;
            const Icon = card.icon;
            return (
              <Reveal key={card.id} delay={0.09 * i} className="xr-cell">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={pressed}
                  className={`xr-card ${card.focus ? 'glass glass-featured' : 'glass'}${pressed ? ' pressed' : ''}`}
                  onMouseEnter={() => setXrMode(card.id)}
                  onMouseLeave={() => setXrMode(null)}
                  onFocus={() => setXrMode(card.id)}
                  onBlur={() => setXrMode(null)}
                  onClick={() => toggle(card.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(card.id);
                    }
                  }}
                >
                  {card.focus ? <span className="pill xr-focus-pill">SKILL LAB FOCUS</span> : null}
                  <span className="icon-chip" data-mode={card.id} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.5} />
                  </span>
                  <p className="micro xr-sub">{card.sub}</p>
                  <h3 className="h3 xr-title">{card.title}</h3>
                  <p className="xr-body">{card.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

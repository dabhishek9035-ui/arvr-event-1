'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Info } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import Glass from '@/components/ui/Glass';
import { SKILLS_PATH, OUTCOMES, PREREQS, PREREQ_NOTE } from '@/content/programme';
import { clamp01 } from '@/lib/motion';
import { useStore } from '@/state/store';

/**
 * Section 7: Outcomes (§9.8). 7a: an S-curve SVG path that draws with scroll,
 * 8 skill nodes lighting up. 7b: course outcomes + prerequisites panels.
 * Mobile swaps the SVG for a vertical list.
 */

const PATH_D = 'M 40 110 C 240 26, 330 194, 540 110 S 830 26, 1010 110 S 1210 174, 1256 110';

function SkillsPathSvg() {
  const reduced = useStore((s) => s.reducedMotion);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    for (let i = 0; i < SKILLS_PATH.length; i++) {
      const f = i / (SKILLS_PATH.length - 1);
      const p = path.getPointAtLength(f * len);
      const c = nodeRefs.current[i];
      const t = labelRefs.current[i];
      if (c) {
        c.setAttribute('cx', p.x.toFixed(1));
        c.setAttribute('cy', p.y.toFixed(1));
      }
      if (t) {
        t.setAttribute('x', p.x.toFixed(1));
        t.setAttribute('y', (p.y + (i % 2 === 0 ? -26 : 42)).toFixed(1));
      }
    }
    setPlaced(true);
  }, []);

  useEffect(() => {
    if (!placed) return;
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;
    const len = path.getTotalLength();
    if (reduced) {
      path.style.strokeDashoffset = '0';
      for (let i = 0; i < SKILLS_PATH.length; i++) {
        nodeRefs.current[i]?.setAttribute('fill', 'var(--accent)');
      }
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = clamp01((vh - r.top) / (r.height * 0.85));
      const drawT = clamp01((t - 0.15) / 0.55);
      path.style.strokeDashoffset = `${(len * (1 - drawT)).toFixed(1)}`;
      for (let i = 0; i < SKILLS_PATH.length; i++) {
        const f = i / (SKILLS_PATH.length - 1);
        nodeRefs.current[i]?.setAttribute('fill', drawT >= f ? 'var(--accent)' : 'var(--bg)');
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [placed, reduced]);

  return (
    <div className="skills-path" ref={sectionRef} aria-hidden="false">
      <svg
        className="skills-path-svg"
        viewBox="0 0 1296 220"
        role="img"
        aria-label={`Skills path: ${SKILLS_PATH.join(' → ')}`}
      >
        <path ref={pathRef} d={PATH_D} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        {SKILLS_PATH.map((label, i) => (
          <g key={label}>
            <circle
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              cx={40 + i * 150}
              cy={110}
              r={7}
              fill="var(--bg)"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />
            <text
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="skills-path-label"
              textAnchor="middle"
              aria-hidden="true"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      <ul className="skills-list" aria-label="Skills path">
        {SKILLS_PATH.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Outcomes() {
  return (
    <section id="outcomes" data-section="outcomes" className="section outcomes-section">
      <div className="container">
        <Reveal delay={0.05}>
          <h2 className="h2">
            The skills you
            <br />
            <span className="accent-text">walk away with.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">
            You build every step hands-on during the two days — nothing to set up
            beforehand, and all of it is yours to reuse after the event.
          </p>
        </Reveal>
        <div className="skills-path-wrap">
          <SkillsPathSvg />
        </div>
        <div className="outcomes-grid">
          <Reveal className="outcomes-cell">
            <Glass className="outcomes-panel">
              <p className="micro panel-label">COURSE OUTCOMES</p>
              <div className="co-rows">
                {OUTCOMES.map((co) => (
                  <div className="co-row" key={co.id}>
                    <span className="co-id">{co.id}</span>
                    <p className="co-text">{co.text}</p>
                  </div>
                ))}
              </div>
            </Glass>
          </Reveal>
          <Reveal delay={0.08} className="outcomes-cell">
            <Glass className="outcomes-panel">
              <p className="micro panel-label">BEFORE YOU JOIN</p>
              <div className="prereq-rows">
                {PREREQS.map((p) => (
                  <div className="prereq-row" key={p}>
                    <span className="prereq-check" aria-hidden="true">
                      <Check size={14} strokeWidth={2} />
                    </span>
                    <p className="co-text">{p}</p>
                  </div>
                ))}
              </div>
              <div className="prereq-callout" role="note">
                <Info size={18} strokeWidth={1.5} aria-hidden="true" />
                <p>{PREREQ_NOTE}</p>
              </div>
            </Glass>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

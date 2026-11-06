'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import { useStore } from '@/state/store';

/** Section 2: The Skill Lab (§9.3) — copy + spec sheet with drawing dividers. */

const SPEC_ROWS: { label: string; value: ReactNode }[] = [
  { label: 'DURATION', value: '2 days · 12 training hours' },
  { label: 'CREDITS', value: '1' },
  { label: 'COURSE TYPE', value: 'Skill Lab' },
  { label: 'PRIMARY PLATFORM', value: 'Unity · C#' },
  { label: 'XR PLATFORM', value: 'Meta Quest 3S / 3 / 2' },
  { label: 'XR FRAMEWORK', value: 'OpenXR · XR Interaction Toolkit' },
  { label: 'DELIVERY', value: 'In person · hands-on · project based' },
  { label: 'ASSESSMENT', value: 'Practical exercises and mini-project demonstration' },
  {
    label: 'DATES',
    value: <span className="pill pill-accent">TO BE CONFIRMED BY BMSIT&amp;M</span>,
  },
];

export default function SkillLab() {
  const reduced = useStore((s) => s.reducedMotion);

  return (
    <section id="skill-lab" data-section="skill-lab" className="section skilllab-section">
      <div className="container skilllab-grid">
        <div className="skilllab-copy">
          <Reveal>
            <Eyebrow>02 / THE SKILL LAB</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2">
              Learn it by
              <br />
              <span className="accent-text">building it.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="skilllab-desc">
              A hands-on Skill Lab in designing and developing Extended Reality applications, with
              a primary emphasis on Virtual Reality. You&rsquo;ll build immersive 3D environments,
              add spatial interaction and interfaces, deploy to a standalone Meta Quest headset and
              optimise for real-time.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="numeral-row">
              <div className="numeral-item">
                <span className="numeral accent-text">2</span>
                <span className="micro numeral-label">DAYS</span>
              </div>
              <div className="numeral-item">
                <span className="numeral accent-text">12</span>
                <span className="micro numeral-label">TRAINING HOURS</span>
              </div>
              <div className="numeral-item">
                <span className="numeral accent-text">1</span>
                <span className="micro numeral-label">CREDIT</span>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="spec-wrap">
          <div className="spec-panel glass">
            <div className="spec-head">
              <span className="micro">SPEC SHEET</span>
              <span className="micro spec-head-right">XR SKILL LAB</span>
            </div>
            <div className="spec-rows">
              {SPEC_ROWS.map((row, i) => (
                <div className="spec-row" key={row.label}>
                  <span className="micro spec-label">{row.label}</span>
                  <span className="spec-value">{row.value}</span>
                  <motion.span
                    className="spec-divider"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: reduced ? 0.001 : 0.6,
                      delay: reduced ? 0 : i * 0.06,
                      ease: 'easeOut',
                    }}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

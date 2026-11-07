'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';
import { METHOD_STEPS, XR_DESIGN } from '@/content/skillLab';
import { scrollToY } from '@/hooks/useLenis';
import { motion as scrollMotion } from '@/lib/motion';
import { useStore } from '@/state/store';

/**
 * Section 5: Method (§9.6). 5a is a pinned stepper (height 400vh via an inner
 * .method-pin wrapper the engine measures for pin5); 5b is the XR experience
 * design panel in normal flow after the pin.
 */

function XrDesignPanel() {
  const reduced = useStore((s) => s.reducedMotion);
  const [lit, setLit] = useState(false);
  return (
    <div className="container xr-design-wrap">
      <Reveal>
        <div className="xr-design glass">
          <p className="micro xr-design-label">XR EXPERIENCE DESIGN</p>
          <p className="xr-design-statement">
            {XR_DESIGN.principleLead}
            <span className="accent-text">{XR_DESIGN.principleHighlight}</span>
            {XR_DESIGN.principleTail}
          </p>
          <motion.div
            className={`xr-design-chips${lit || reduced ? ' lit' : ''}`}
            onViewportEnter={() => setLit(true)}
            viewport={{ once: true, amount: 0.4 }}
          >
            {XR_DESIGN.chips.map((chip, i) => (
              <span
                className="xr-chip-wrap"
                key={chip}
                style={{ '--d': `${i * 160}ms` } as React.CSSProperties}
              >
                {i > 0 ? <ArrowRight className="xr-chip-arrow" size={18} strokeWidth={1.5} aria-hidden="true" /> : null}
                <span className="xr-chip">{chip}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </Reveal>
    </div>
  );
}

export default function Method() {
  const reduced = useStore((s) => s.reducedMotion);
  const pinned = !reduced;
  const [active, setActive] = useState(0);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const step = Math.min(5, Math.max(0, Math.floor(scrollMotion.pin5 * 6)));
      if (step !== last) {
        last = step;
        setActive(step);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pinned]);

  const jumpToStep = (i: number) => {
    const el = pinRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + ((i + 0.5) / 6) * travel);
  };

  return (
    <section id="method" data-section="method" className="section method-section">
      {pinned ? (
        <div className="method-pin" ref={pinRef} style={{ height: '320vh' }}>
          <div className="method-sticky">
            <div className="container method-copy">
              <h2 className="h2">
                Six steps.
                <br />
                <span className="accent-text">One loop.</span>
              </h2>
              <div className="method-steps">
                {METHOD_STEPS.map((step, i) => (
                  <button
                    key={step.label}
                    type="button"
                    className={`method-step${i === active ? ' active' : ''}`}
                    aria-current={i === active ? 'step' : undefined}
                    onClick={() => jumpToStep(i)}
                  >
                    <span className="method-step-bar" aria-hidden="true" />
                    <span className="method-step-inner">
                      <span className="method-step-label">{step.label}</span>
                      <span className="method-step-caption">{step.caption}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <h2 className="h2">
            Six steps.
            <br />
            <span className="accent-text">One loop.</span>
          </h2>
          <div className="method-steps stacked">
            {METHOD_STEPS.map((step) => (
              <div key={step.label} className="method-step static">
                <span className="method-step-inner">
                  <span className="method-step-label">{step.label}</span>
                  <span className="method-step-caption">{step.caption}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="xr-design-panel">
        <XrDesignPanel />
      </div>
    </section>
  );
}

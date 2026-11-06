'use client';

import { Check } from 'lucide-react';
import { STEP_LABELS } from '@/lib/registration';

/** 4-segment progress stepper (§10.3). Completed steps click back. */
export default function Stepper({
  current,
  onJump,
}: {
  current: number;
  onJump: (n: number) => void;
}) {
  return (
    <div className="stepper" role="list" aria-label="Registration steps">
      {STEP_LABELS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <button
            key={label}
            type="button"
            role="listitem"
            className={`step-seg ${state}`}
            aria-current={i === current ? 'step' : undefined}
            aria-label={label}
            onClick={() => i < current && onJump(i)}
            disabled={i > current}
          >
            <span className="step-bar" aria-hidden="true" />
            <span className="step-label">
              {state === 'done' ? (
                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              )}
              {label.slice(3)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

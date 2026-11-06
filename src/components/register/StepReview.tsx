'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { useFormContext } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';

/** Step 4: Review (§10.5) — read-only summary + Edit jumps + submit. */

const GROUPS: {
  title: string;
  step: number;
  rows: { label: string; get: (v: RegistrationInput) => string }[];
}[] = [
  {
    title: 'YOU',
    step: 0,
    rows: [
      { label: 'Full name', get: (v) => v.fullName },
      { label: 'Email', get: (v) => v.email },
      { label: 'Mobile number', get: (v) => `+91 ${v.phone}` },
    ],
  },
  {
    title: 'CAMPUS',
    step: 1,
    rows: [
      { label: 'College / institution', get: (v) => v.institution },
      { label: 'USN / student ID', get: (v) => v.usn },
      { label: 'Branch', get: (v) => v.branch || '—' },
      { label: 'Year of study', get: (v) => v.year || '—' },
    ],
  },
  {
    title: 'INTEREST',
    step: 2,
    rows: [
      { label: 'Experience with Unity / VR / 3D', get: (v) => v.experience || '—' },
      { label: 'Programming comfort', get: (v) => v.programming || '—' },
      { label: 'XR applications that excite you', get: (v) => v.interests?.join(', ') || '—' },
      { label: 'Why do you want to join?', get: (v) => v.reason || '—' },
    ],
  },
];

export default function StepReview({
  onBack,
  onSubmit,
}: {
  onBack: (step: number) => void;
  onSubmit: () => void;
}) {
  const { getValues } = useFormContext<RegistrationInput>();
  const values = getValues();
  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={onFormSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        Check your details
      </h2>
      {GROUPS.map((g) => (
        <div className="review-group" key={g.title}>
          <div className="review-head">
            <p className="micro review-title">{g.title}</p>
            <button type="button" className="review-edit" onClick={() => onBack(g.step)}>
              Edit
            </button>
          </div>
          {g.rows.map((r) => (
            <div className="review-row" key={r.label}>
              <span className="micro review-label">{r.label}</span>
              <span className="review-value">{r.get(values)}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="form-footer">
        <Button variant="ghost" size="md" onClick={() => onBack(2)} arrow={false}>
          Back
        </Button>
        <Button type="submit" size="lg" className="btn-grow">
          Submit registration
        </Button>
      </div>
    </form>
  );
}

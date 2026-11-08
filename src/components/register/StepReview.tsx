'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { useFormContext } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';
import { CircleAlert } from 'lucide-react';

const GROUPS: {
  title: string;
  step: number;
  rows: { label: string; get: (v: RegistrationInput) => string }[];
}[] = [
  {
    title: 'YOUR DETAILS',
    step: 0,
    rows: [
      { label: 'Full name', get: (v) => v.fullName },
      { label: 'Email', get: (v) => v.email },
      { label: 'Mobile number', get: (v) => `+91 ${v.phone}` },
      { label: 'GitHub profile', get: (v) => v.githubUrl || '—' },
      { label: 'LinkedIn profile', get: (v) => v.linkedinUrl || '—' },
    ],
  },
  {
    title: 'COLLEGE DETAILS',
    step: 1,
    rows: [
      { label: 'USN', get: (v) => v.usn },
      { label: 'Branch', get: (v) => v.branch || '—' },
      { label: 'Semester', get: (v) => v.semester ? `Semester ${v.semester}` : '—' },
      { label: 'Section', get: (v) => v.section || '—' },
    ],
  },
  {
    title: 'WORKSHOP QUESTIONS',
    step: 2,
    rows: [
      { label: 'Prior experience', get: (v) => v.priorExperience || '—' },
      { label: 'Why do you want to attend?', get: (v) => v.whyAttend || '—' },
      { label: 'Topics of interest', get: (v) => v.interests?.join(', ') || '—' },
      { label: 'Laptop specifications', get: (v) => v.laptopSpecs || '—' },
    ],
  },
];

export default function StepReview({
  onBack,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
  registrationCap,
}: {
  onBack: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  registrationCap: number;
}) {
  const { getValues } = useFormContext<RegistrationInput>();
  const values = getValues();

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) onSubmit();
  };

  return (
    <form onSubmit={onFormSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        Review your details
      </h2>
      <p className="micro" style={{ color: 'var(--muted)', marginBottom: '20px' }}>
        Please check all details before submitting. Capped to {registrationCap} members.
      </p>

      {errorMessage ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(234, 72, 132, 0.12)',
            border: '1px solid var(--danger)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: 'var(--text)',
            fontSize: '14px',
          }}
        >
          <CircleAlert size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {GROUPS.map((g) => (
        <div className="review-group" key={g.title}>
          <div className="review-head">
            <p className="micro review-title">{g.title}</p>
            <button
              type="button"
              className="review-edit"
              onClick={() => onBack(g.step)}
              disabled={isSubmitting}
            >
              Edit
            </button>
          </div>
          {g.rows.map((r) => (
            <div className="review-row" key={r.label}>
              <span className="micro review-label">{r.label}</span>
              <span className="review-value" style={{ wordBreak: 'break-word' }}>
                {r.get(values)}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="form-footer">
        <Button
          variant="ghost"
          size="md"
          onClick={() => onBack(2)}
          arrow={false}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="btn-grow"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting registration...' : 'Submit registration'}
        </Button>
      </div>
    </form>
  );
}

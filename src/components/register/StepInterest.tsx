'use client';

import type { FormEvent } from 'react';
import { Check, ExternalLink, Laptop } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFormContext } from 'react-hook-form';
import {
  PRIOR_EXPERIENCE_OPTIONS,
  EXPLORATION_INTERESTS,
  LAPTOP_SPECS_OPTIONS,
  type RegistrationInput,
} from '@/lib/registration';
import ChipGroup from './ChipGroup';
import ChoiceGroup from './ChoiceGroup';
import { FieldError, WordTextAreaField } from './Field';

/** Step 3: Workshop Questions & Laptop Specs (§10.5) */
export default function StepInterest({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const consentError = getFieldState('consent', formState).error;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        Workshop questions
      </h2>

      {/* Instruction banner — visually distinct from questions */}
      <div className="step-instruction-box">
        <span className="step-instruction-pill">INSTRUCTIONS</span>
        <p className="step-instruction-text">
          Please answer these questions to help us evaluate your registration.
        </p>
      </div>

      <div className="field-rows">
        {/* Question 1: Prior experience */}
        <ChoiceGroup
          name="priorExperience"
          legend="1. Have you had any prior experience with AR/VR/XR, 3D modelling, Unity, Unreal Engine or related technologies?"
          options={PRIOR_EXPERIENCE_OPTIONS}
        />

        {/* Question 2: Why attend (max 100 words) */}
        <WordTextAreaField
          name="whyAttend"
          questionTitle="2. Why do you want to attend this AR/VR/XR workshop?"
          helper="Short answer (maximum 100 words)"
          maxWords={100}
        />

        {/* Question 3: What interested in exploring */}
        <ChipGroup
          name="interests"
          legend="3. What would you be most interested in exploring?"
          options={EXPLORATION_INTERESTS}
          helper="Select one or more topics."
        />

        {/* Question 4: Laptop specs with PDF guide */}
        <div
          className="laptop-specs-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Laptop size={20} style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h3 className="choice-legend" style={{ margin: 0 }}>
              4. Do you have a laptop with the required specs?
            </h3>
          </div>

          <p className="choice-helper" style={{ margin: '0 0 12px 0' }}>
            Required for hands-on sessions. Check specifications below:
          </p>

          <div
            style={{
              fontSize: '13.5px',
              color: 'var(--muted)',
              lineHeight: '1.6',
              marginBottom: '16px',
              paddingLeft: '4px',
            }}
          >
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>RAM:</strong> Minimum 8 GB RAM</li>
              <li><strong>Storage:</strong> Around 50 GB free space on hard disk</li>
              <li><strong>Graphics:</strong> Minimum 4 GB graphics or more</li>
              <li><strong>Software:</strong> Unity software pre-installed</li>
            </ul>
          </div>

          <a
            href="/Installation Of Unity-Bodyclone.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              marginBottom: '18px',
              padding: '8px 14px',
            }}
          >
            <span>View Unity Installation Guide (PDF)</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>

          <ChoiceGroup
            name="laptopSpecs"
            legend="Confirm your laptop specs:"
            options={LAPTOP_SPECS_OPTIONS}
          />
        </div>
      </div>

      <div className="consent-block" style={{ marginTop: '24px' }}>
        <label className="consent">
          <input type="checkbox" className="visually-hidden" {...register('consent')} />
          <span className="consent-box" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
          </span>
          <span>
            I confirm my details are accurate and understand that 40 members will be shortlisted from the 100 registrations.
          </span>
        </label>
        <FieldError message={consentError?.message} />
      </div>

      <div className="form-footer">
        <Button variant="ghost" size="md" onClick={onBack} arrow={false}>
          Back
        </Button>
        <Button type="submit" size="md" className="btn-grow">
          Continue
        </Button>
      </div>
    </form>
  );
}

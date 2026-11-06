'use client';

import type { FormEvent } from 'react';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFormContext } from 'react-hook-form';
import {
  EXPERIENCE_LEVELS,
  PROGRAMMING_LEVELS,
  INTERESTS,
  type RegistrationInput,
} from '@/lib/registration';
import ChipGroup from './ChipGroup';
import ChoiceGroup from './ChoiceGroup';
import { FieldError, TextAreaField } from './Field';

/** Step 3: Interest (§10.5) — experience, programming, interests, consent. */
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
        A bit about your experience
      </h2>
      <div className="field-rows">
        <ChoiceGroup
          name="experience"
          legend="Experience with Unity / VR / 3D"
          options={EXPERIENCE_LEVELS}
        />
        <ChoiceGroup
          name="programming"
          legend="Programming comfort"
          options={PROGRAMMING_LEVELS}
        />
        <ChipGroup
          name="interests"
          legend="XR applications that excite you"
          options={INTERESTS}
          helper="Optional — pick any."
        />
        <TextAreaField name="reason" label="Why do you want to join?" max={400} />
      </div>
      <div className="consent-block">
        <label className="consent">
          <input type="checkbox" className="visually-hidden" {...register('consent')} />
          <span className="consent-box" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
          </span>
          <span>
            I agree that the organisers may contact me about the XR Skill Lab.
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

'use client';

import { Check } from 'lucide-react';
import { useFormContext, type FieldPath } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';
import { FieldError } from './Field';

/** Multi-select chip group (§10.4): real checkboxes, label = pill. */
export default function ChipGroup({
  name,
  legend,
  options,
  helper,
}: {
  name: FieldPath<RegistrationInput>;
  legend: string;
  options: readonly string[];
  helper?: string;
}) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const reg = register(name);

  return (
    <fieldset className={`choice-group${error ? ' has-error' : ''}`}>
      <legend className="micro choice-legend">{legend}</legend>
      <div className="choice-row">
        {options.map((opt) => (
          <label className="choice-pill" key={opt}>
            <input type="checkbox" value={opt} className="visually-hidden" {...reg} />
            <span className="choice-check" aria-hidden="true">
              <Check size={16} strokeWidth={2.5} />
            </span>
            {opt}
          </label>
        ))}
      </div>
      {error?.message ? (
        <FieldError message={error.message} />
      ) : helper ? (
        <p className="field-helper">{helper}</p>
      ) : null}
    </fieldset>
  );
}

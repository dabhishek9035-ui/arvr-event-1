'use client';

import { Check } from 'lucide-react';
import { useFormContext, type FieldPath } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';
import { FieldError } from './Field';

interface ChoiceGroupProps {
  name: FieldPath<RegistrationInput>;
  legend: string;
  options: readonly string[];
  helper?: string;
}

/** Radio pill group: real radios, visually hidden, label = pill. */
export default function ChoiceGroup({
  name,
  legend,
  options,
  helper,
}: ChoiceGroupProps) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const reg = register(name);

  return (
    <fieldset className={`choice-group${error ? ' has-error' : ''}`}>
      <legend className="choice-legend">{legend}</legend>
      {helper ? <p className="choice-helper">{helper}</p> : null}
      <div className="choice-row">
        {options.map((opt) => (
          <label className="choice-pill" key={opt}>
            <input type="radio" value={opt} className="visually-hidden" {...reg} />
            <span className="choice-check" aria-hidden="true">
              <Check size={16} strokeWidth={2.5} />
            </span>
            {opt}
          </label>
        ))}
      </div>
      <FieldError message={error?.message} />
    </fieldset>
  );
}

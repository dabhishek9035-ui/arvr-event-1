'use client';

import { CircleAlert, ChevronDown } from 'lucide-react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';
import { FieldError } from './Field';

/** Native select styled with the same shell + caret (§10.4). */
export default function SelectField({
  name,
  label,
  options,
}: {
  name: FieldPath<RegistrationInput>;
  label: string;
  options: readonly string[];
}) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const value = (useWatch({ name: name as never }) as unknown as string) ?? '';
  const reg = register(name);

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <div className="field-shell select-shell">
        <select
          id={`f-${name}`}
          className={`field-input select-input${value ? ' floated' : ''}`}
          aria-invalid={error ? true : undefined}
          {...reg}
        >
          <option value="" hidden></option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <label className="field-label" htmlFor={`f-${name}`}>
          {label}
        </label>
        <ChevronDown size={18} strokeWidth={1.5} className="field-caret" aria-hidden="true" />
      </div>
      <FieldError message={error?.message} />
    </div>
  );
}

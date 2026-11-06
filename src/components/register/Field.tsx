'use client';

import { CircleAlert, Check } from 'lucide-react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';

/**
 * Floating-label field (§10.4). NO placeholder text — the float is driven by
 * an empty `placeholder=" "` + :placeholder-shown (draft restores float too).
 */

interface FieldProps {
  name: FieldPath<RegistrationInput>;
  label: string;
  type?: string;
  helper?: string;
  prefix?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text' | 'email' | 'tel';
  uppercaseOnBlur?: boolean;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      <CircleAlert size={14} strokeWidth={1.5} aria-hidden="true" /> {message}
    </p>
  );
}

export default function Field({
  name,
  label,
  type = 'text',
  helper,
  prefix,
  autoComplete,
  inputMode,
  uppercaseOnBlur,
}: FieldProps) {
  const { register, getFieldState, formState, setValue } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const valid = Boolean((formState.touchedFields as Record<string, unknown>)[name]) && !error;
  const reg = register(name);

  return (
    <div className={`field${error ? ' has-error' : ''}${prefix ? ' has-prefix' : ''}`}>
      <div className="field-shell">
        {prefix ? <span className="field-prefix">{prefix}</span> : null}
        <input
          id={`f-${name}`}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className="field-input"
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `f-${name}-error` : helper ? `f-${name}-helper` : undefined}
          {...reg}
          onBlur={(e) => {
            reg.onBlur(e);
            if (uppercaseOnBlur) {
              const v = e.currentTarget.value.toUpperCase();
              setValue(name, v as never, { shouldValidate: formState.isSubmitted || undefined });
            }
          }}
        />
        <label className="field-label" htmlFor={`f-${name}`}>
          {label}
        </label>
        {valid ? (
          <Check size={18} strokeWidth={2} className="field-check" aria-hidden="true" />
        ) : null}
      </div>
      {error?.message ? (
        <FieldError message={error.message} />
      ) : helper ? (
        <p className="field-helper" id={`f-${name}-helper`}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

interface TextAreaProps {
  name: FieldPath<RegistrationInput>;
  label: string;
  max: number;
}

export function TextAreaField({ name, label, max }: TextAreaProps) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const value = (useWatch({ name: name as never }) as unknown as string) ?? '';
  const over = value.length > max;
  const reg = register(name);

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <div className="field-shell area-shell">
        <textarea
          id={`f-${name}`}
          className="field-input area-input"
          placeholder=" "
          rows={4}
          aria-invalid={error ? true : undefined}
          {...reg}
        />
        <label className="field-label" htmlFor={`f-${name}`}>
          {label}
        </label>
      </div>
      <div className="area-meta">
        {error?.message ? (
          <FieldError message={error.message} />
        ) : (
          <span className="field-helper">Optional — tell the organisers why you want in.</span>
        )}
        <span className={`area-counter${over ? ' over' : ''}`} aria-hidden="true">
          {value.length} / {max}
        </span>
      </div>
    </div>
  );
}

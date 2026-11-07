'use client';

import { CircleAlert, Check } from 'lucide-react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import { countWords, type RegistrationInput } from '@/lib/registration';

interface FieldProps {
  name: FieldPath<RegistrationInput>;
  label: string;
  type?: string;
  helper?: string;
  prefix?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text' | 'email' | 'tel' | 'url';
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
          style={{ backgroundColor: 'transparent', color: 'var(--text)' }}
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

interface WordTextAreaProps {
  name: FieldPath<RegistrationInput>;
  questionTitle?: string;
  label?: string;
  maxWords: number;
  helper?: string;
}

export function WordTextAreaField({
  name,
  questionTitle,
  label,
  maxWords,
  helper,
}: WordTextAreaProps) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const value = (useWatch({ name: name as never }) as unknown as string) ?? '';
  const currentWords = countWords(value);
  const over = currentWords > maxWords;
  const reg = register(name);

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      {questionTitle ? (
        <div style={{ marginBottom: '8px' }}>
          <p className="choice-legend" style={{ margin: '0 0 4px 0' }}>
            {questionTitle}
          </p>
          {helper ? <p className="choice-helper">{helper}</p> : null}
        </div>
      ) : null}

      <div className="field-shell area-shell">
        <textarea
          id={`f-${name}`}
          className="field-input area-input"
          placeholder={questionTitle ? 'Type your response here...' : ' '}
          rows={4}
          style={{ backgroundColor: 'transparent', color: 'var(--text)' }}
          aria-invalid={error ? true : undefined}
          {...reg}
        />
        {label && !questionTitle ? (
          <label className="field-label" htmlFor={`f-${name}`}>
            {label}
          </label>
        ) : null}
      </div>

      <div
        className="area-meta"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <div>
          {error?.message ? (
            <FieldError message={error.message} />
          ) : !questionTitle && helper ? (
            <span className="field-helper">{helper}</span>
          ) : null}
        </div>
        <span
          className={`area-counter${over ? ' over' : ''}`}
          style={{
            color: over ? 'var(--danger)' : 'var(--muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
          }}
          aria-hidden="true"
        >
          {currentWords} / {maxWords} words
        </span>
      </div>
    </div>
  );
}

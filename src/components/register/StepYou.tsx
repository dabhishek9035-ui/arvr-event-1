'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Field from './Field';

/** Step 1: You (§10.5). Enter submits; validation runs on Continue. */
export default function StepYou({ onContinue }: { onContinue: () => void }) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };
  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        Let&rsquo;s start with you
      </h2>
      <div className="field-rows">
        <Field name="fullName" label="Full name" autoComplete="name" />
        <Field name="email" label="Email" type="email" autoComplete="email" />
        <Field
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+91"
          helper="10-digit mobile number"
        />
      </div>
      <div className="form-footer">
        <Button type="submit" size="md" className="btn-grow">
          Continue
        </Button>
      </div>
    </form>
  );
}

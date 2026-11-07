'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Field from './Field';

/** Step 1: You — Name, Email, Mobile, GitHub URL, LinkedIn URL */
export default function StepYou({ onContinue }: { onContinue: () => void }) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        Let&rsquo;s start with your details
      </h2>
      <p className="step-instruction-text" style={{ marginBottom: '20px' }}>
        Please enter your contact and profile details.
      </p>

      <div className="field-rows">
        <Field
          name="fullName"
          label="Full name"
          autoComplete="name"
          helper="Your first and last name"
        />
        <Field
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          helper="We will send workshop updates here"
        />
        <Field
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+91"
          helper="10-digit mobile number for WhatsApp group"
        />
        <Field
          name="githubUrl"
          label="GitHub profile link"
          type="url"
          autoComplete="url"
          inputMode="url"
          helper="e.g. https://github.com/yourname"
        />
        <Field
          name="linkedinUrl"
          label="LinkedIn profile link"
          type="url"
          autoComplete="url"
          inputMode="url"
          helper="e.g. https://linkedin.com/in/yourname"
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

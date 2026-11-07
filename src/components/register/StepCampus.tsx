'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { BRANCHES, SEMESTERS } from '@/lib/registration';
import Field from './Field';
import SelectField from './SelectField';

/** Step 2: College & Academics — USN, Branch, Semester, Section */
export default function StepCampus({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="step-heading" tabIndex={-1}>
        College details
      </h2>
      <p className="step-instruction-text" style={{ marginBottom: '20px' }}>
        Tell us your academic details.
      </p>

      <div className="field-rows">
        <Field
          name="usn"
          label="USN / Student ID"
          uppercaseOnBlur
          helper="e.g. 1BY21CS001"
        />
        <SelectField
          name="branch"
          label="Branch"
          options={BRANCHES}
        />
        <SelectField
          name="semester"
          label="Semester (3 to 8)"
          options={SEMESTERS}
        />
        <Field
          name="section"
          label="Section"
          uppercaseOnBlur
          helper="e.g. A, B, C or Section name"
        />
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

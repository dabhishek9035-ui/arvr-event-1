'use client';

import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import { BRANCHES, YEARS } from '@/lib/registration';
import Field from './Field';
import SelectField from './SelectField';
import ChoiceGroup from './ChoiceGroup';

/** Step 2: Campus (§10.5). */
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
        Where do you study?
      </h2>
      <div className="field-rows">
        <Field name="institution" label="College / institution" />
        <Field name="usn" label="USN / student ID" uppercaseOnBlur helper="Letters, digits and dashes" />
        <SelectField name="branch" label="Branch" options={BRANCHES} />
        <ChoiceGroup name="year" legend="Year of study" options={YEARS} />
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

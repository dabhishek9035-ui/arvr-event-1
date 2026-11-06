'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Glasses, Wrench } from 'lucide-react';
import Eyebrow from '@/components/ui/Eyebrow';
import {
  registrationSchema,
  DEFAULT_REGISTRATION,
  loadDraft,
  saveDraft,
  clearDraft,
  STEP_FIELDS,
  type RegistrationInput,
} from '@/lib/registration';
import { useStore } from '@/state/store';
import Stepper from './Stepper';
import StepYou from './StepYou';
import StepCampus from './StepCampus';
import StepInterest from './StepInterest';
import StepReview from './StepReview';
import Done from './Done';

/**
 * /register shell (§10). The single backend seam is `onValidSubmit` (§10.7):
 * today it flips status to 'ready' — when a backend exists, replace its body
 * with the network call and map status to submitting | sent | error.
 */
type Status = 'editing' | 'ready';

export default function RegisterShell() {
  const [status, setStatus] = useState<Status>('editing');
  const [step, setStep] = useState(0);
  const setRegStep = useStore((s) => s.setRegStep);
  const reduced = useStore((s) => s.reducedMotion);

  const methods = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_REGISTRATION,
  });
  const { watch, reset, trigger, handleSubmit, getFieldState } = methods;

  // draft persistence (excludes consent), restored on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) reset(draft);
  }, [reset]);

  useEffect(() => {
    const sub = watch((values) => {
      saveDraft(values as RegistrationInput);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  useEffect(() => {
    setRegStep(status === 'ready' ? 4 : step);
  }, [step, status, setRegStep]);

  // focus the step heading after each step change (§10.3)
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.form-card .step-heading');
    el?.focus();
  }, [step, status]);

  const advance = async () => {
    const fields = (STEP_FIELDS[step] ?? []) as (keyof RegistrationInput)[];
    const ok = await trigger(fields);
    if (ok) {
      setStep((s) => Math.min(3, s + 1));
      return;
    }
    const firstInvalid = fields.find((f) => getFieldState(f).error);
    if (firstInvalid) {
      const el = document.querySelector<HTMLElement>(`[name="${String(firstInvalid)}"]`);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  const onValidSubmit = useCallback((data: RegistrationInput) => {
    // §10.7 — THE SEAM. Replace this body with the network call when a
    // backend exists, and map `status` to submitting | sent | error.
    void data;
    clearDraft();
    setStatus('ready');
  }, []);

  const submit = handleSubmit(onValidSubmit);

  return (
    <FormProvider {...methods}>
      {status === 'ready' ? (
        <div className="form-card glass">
          <Done onEdit={() => setStatus('editing')} />
        </div>
      ) : (
        <div className="form-card glass">
          <Stepper current={step} onJump={(n) => n < step && setStep(n)} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: reduced ? 0 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : -24 }}
              transition={{ duration: reduced ? 0.001 : 0.28 }}
            >
              {step === 0 && <StepYou onContinue={advance} />}
              {step === 1 && <StepCampus onBack={() => setStep(0)} onContinue={advance} />}
              {step === 2 && <StepInterest onBack={() => setStep(1)} onContinue={advance} />}
              {step === 3 && <StepReview onBack={(n) => setStep(n)} onSubmit={submit} />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </FormProvider>
  );
}

export function RegisterIntro() {
  return (
    <div className="register-intro">
      <Eyebrow>REGISTER</Eyebrow>
      <h1 className="register-h1">
        Register for the
        <br />
        <span className="accent-text">XR Skill Lab.</span>
      </h1>
      <p className="lead">
        Tell us a bit about you to save your seat for the 2-day, hands-on XR Skill Lab.
      </p>
      <ul className="register-facts">
        <li>
          <Clock size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>2 days · 12 hands-on hours</span>
        </li>
        <li>
          <Glasses size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Meta Quest headsets</span>
        </li>
        <li>
          <Wrench size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Unity, C# and OpenXR</span>
        </li>
      </ul>
      <span className="pill pill-accent register-dates">
        SKILL LAB DATES · TO BE CONFIRMED BY BMSIT&amp;M
      </span>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Glasses, Laptop, Users, Ban } from 'lucide-react';
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
import { CLUB } from '@/config/club';
import { WhatsAppIcon } from '@/components/ui/icons';
import { useLiveRegistrationStats, notifyRegistrationSuccessful } from '@/lib/useLiveRegistrationStats';
import Stepper from './Stepper';
import StepYou from './StepYou';
import StepCampus from './StepCampus';
import StepInterest from './StepInterest';
import StepReview from './StepReview';
import Done, { type SubmittedRegistration } from './Done';

type Status = 'editing' | 'ready';

const STORAGE_KEY = 'arvr_submitted_registration';

export default function RegisterShell() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>('editing');
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredCount, setRegisteredCount] = useState<number | undefined>(undefined);
  const [existingRecord, setExistingRecord] = useState<SubmittedRegistration | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] = useState<string | undefined>(undefined);

  // Live real-time registration stats
  const regStatus = useLiveRegistrationStats();

  const setRegStep = useStore((s) => s.setRegStep);
  const reduced = useStore((s) => s.reducedMotion);

  const methods = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_REGISTRATION,
  });
  const { watch, reset, trigger, handleSubmit, getFieldState, getValues } = methods;

  // Mount guard to completely prevent SSR hydration mismatch & restore existing registration
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SubmittedRegistration;
        if (parsed && (parsed.email || parsed.usn || parsed.fullName || parsed.phone)) {
          setExistingRecord(parsed);
          setIsAlreadyRegistered(true);
          setStatus('ready');

          // Asynchronously verify with Supabase whether this user still exists in the database
          const query = new URLSearchParams();
          if (parsed.email) query.set('email', parsed.email);
          if (parsed.phone) query.set('phone', parsed.phone);
          if (parsed.usn) query.set('usn', parsed.usn);
          query.set('_t', Date.now().toString());

          fetch(`/api/register/check?${query.toString()}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && data.exists === false) {
                // User was cleared from Supabase! Purge stale localStorage and reopen form
                localStorage.removeItem(STORAGE_KEY);
                setExistingRecord(null);
                setIsAlreadyRegistered(false);
                setStatus('editing');
              } else if (data?.registration) {
                setExistingRecord(data.registration);
              }
            })
            .catch(() => {
              /* ignore network check failure */
            });
        }
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const handleClearRegistration = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    clearDraft();
    setExistingRecord(null);
    setIsAlreadyRegistered(false);
    setStatus('editing');
    setStep(0);
  };

  // Draft persistence, restored on mount if not already submitted
  useEffect(() => {
    if (status !== 'ready') {
      const draft = loadDraft();
      if (draft) reset(draft);
    }
  }, [reset, status]);

  useEffect(() => {
    if (status !== 'ready') {
      const sub = watch((values) => {
        saveDraft(values as RegistrationInput);
      });
      return () => sub.unsubscribe();
    }
  }, [watch, status]);

  useEffect(() => {
    setRegStep(status === 'ready' ? 4 : step);
  }, [step, status, setRegStep]);

  // Focus step heading after each step change
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.form-card .step-heading');
    el?.focus();
  }, [step, status]);

  const advance = async () => {
    setSubmitError(null);
    const fields = (STEP_FIELDS[step] ?? []) as (keyof RegistrationInput)[];
    const ok = await trigger(fields);

    if (ok) {
      // If moving from Step 1 (email & phone), check duplicate in database
      if (step === 0) {
        const email = getValues('email');
        const phone = getValues('phone');
        if (email || phone) {
          try {
            const checkUrl = `/api/register/check?email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}&_t=${Date.now()}`;
            const checkRes = await fetch(checkUrl, { cache: 'no-store' });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.exists) {
                // User already registered!
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkData.registration));
                } catch {}
                clearDraft();
                setExistingRecord(checkData.registration);
                setIsAlreadyRegistered(true);
                setAlreadyRegisteredMessage(checkData.message);
                setStatus('ready');
                return;
              }
            }
          } catch {
            /* ignore network pre-check failure */
          }
        }
      }

      // If moving from Step 2 (campus/USN), check USN duplicate in database
      if (step === 1) {
        const usn = getValues('usn');
        if (usn) {
          try {
            const checkUrl = `/api/register/check?usn=${encodeURIComponent(usn)}&_t=${Date.now()}`;
            const checkRes = await fetch(checkUrl, { cache: 'no-store' });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.exists) {
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkData.registration));
                } catch {}
                clearDraft();
                setExistingRecord(checkData.registration);
                setIsAlreadyRegistered(true);
                setAlreadyRegisteredMessage(checkData.message);
                setStatus('ready');
                return;
              }
            }
          } catch {
            /* ignore */
          }
        }
      }

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

  const onValidSubmit = useCallback(async (data: RegistrationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        // If already registered, transition directly to the registration page with details
        if (result.alreadyRegistered && result.existingRegistration) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.existingRegistration));
          } catch {}
          clearDraft();
          setExistingRecord(result.existingRegistration);
          setIsAlreadyRegistered(true);
          setAlreadyRegisteredMessage(result.error);
          setStatus('ready');
          setIsSubmitting(false);
          return;
        }

        setSubmitError(result.error || 'Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Successful registration!
      clearDraft();
      const savedRecord: SubmittedRegistration = {
        fullName: data.fullName,
        usn: data.usn,
        email: data.email,
        phone: data.phone,
        branch: data.branch,
        semester: data.semester,
        section: data.section,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        registeredCount: result.registeredCount,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecord));
      } catch {}

      // Immediately notify live stats system (Zustand + BroadcastChannel + Window Event)
      notifyRegistrationSuccessful(result.registeredCount);

      setExistingRecord(savedRecord);
      setIsAlreadyRegistered(false);
      setRegisteredCount(result.registeredCount);
      setStatus('ready');
    } catch {
      setSubmitError('Unable to connect to the server. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const submit = handleSubmit(onValidSubmit);

  // Initial SSR / pre-mount placeholder
  if (!mounted) {
    return (
      <div
        className="form-card glass"
        style={{
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="micro" style={{ color: 'var(--muted)' }}>
          Loading registration...
        </span>
      </div>
    );
  }

  // If registrations have reached 100 cap and closed (and user hasn't registered)
  if (regStatus?.isClosed && status !== 'ready' && !existingRecord) {
    return (
      <div className="form-card glass" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            borderRadius: '50%',
            background: 'rgba(234, 72, 132, 0.15)',
            color: 'var(--danger)',
            marginBottom: '16px',
          }}
        >
          <Ban size={36} />
        </div>
        <h2 className="step-heading" style={{ fontSize: '28px', marginBottom: '12px' }}>
          Registrations are closed
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 24px' }}>
          We have reached the maximum limit of <strong>100 registrations</strong>.
          Registration is now closed. From the applicants, <strong>40 members will be shortlisted</strong> and notified.
        </p>
        <a
          className="btn btn-whatsapp"
          href={CLUB.whatsappGroup || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ margin: '0 auto', display: 'inline-flex', justifyContent: 'center' }}
        >
          <WhatsAppIcon size={18} />
          <span className="btn-label">Join WhatsApp Group for Updates</span>
        </a>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      {status === 'ready' ? (
        <div className="form-card glass">
          <Done
            data={existingRecord || undefined}
            registeredCount={registeredCount}
            isAlreadyRegistered={isAlreadyRegistered}
            message={alreadyRegisteredMessage}
            onClearRegistration={handleClearRegistration}
          />
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
              {step === 3 && (
                <StepReview
                  onBack={(n) => setStep(n)}
                  onSubmit={submit}
                  isSubmitting={isSubmitting}
                  errorMessage={submitError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </FormProvider>
  );
}

export function RegisterIntro() {
  const [mounted, setMounted] = useState(false);
  const stats = useLiveRegistrationStats();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="register-intro">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <span className="pill pill-accent" style={{ letterSpacing: '0.04em' }}>
          {mounted && stats?.isClosed ? 'REGISTRATIONS CLOSED' : 'CAPPED AT 100 REGISTRATIONS'}
        </span>
        <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text)' }}>
          40 WILL BE SHORTLISTED
        </span>
        {mounted && stats && typeof stats.count === 'number' && stats.count > 0 ? (
          <span
            className="pill"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
            {stats.count} REGISTERED
          </span>
        ) : null}
      </div>

      <h1 className="register-h1">
        Register for the
        <br />
        <span className="accent-text">AR/VR Workshop.</span>
      </h1>
      <p className="lead">
        Build worlds. Step inside them. Join our hands-on 2-day workshop at BMSIT&amp;M to explore Virtual &amp; Augmented Reality.
      </p>

      <ul className="register-facts">
        <li>
          <Clock size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>2 days · 12 hands-on hours</span>
        </li>
        <li>
          <Glasses size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Meta Quest headsets &amp; controllers</span>
        </li>
        <li>
          <Laptop size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>Unity &amp; 3D development</span>
        </li>
        <li>
          <Users size={20} strokeWidth={1.5} aria-hidden="true" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} suppressHydrationWarning>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: mounted && stats?.isClosed ? 'var(--danger)' : '#10b981',
                boxShadow: mounted && stats?.isClosed ? '0 0 8px var(--danger)' : '0 0 8px #10b981',
              }}
              aria-hidden="true"
            />
            <span>
              {mounted && stats
                ? `${stats.count} of ${stats.cap || 100} spots filled (${stats.remaining} remaining)`
                : 'Loading live registrations...'}
            </span>
          </span>
        </li>
      </ul>

      <span className="pill pill-accent register-dates">
        WORKSHOP DATES · 19–20 NOVEMBER 2026
      </span>
    </div>
  );
}

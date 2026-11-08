'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, Users, AlertCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { CLUB } from '@/config/club';
import type { RegistrationData, RegistrationInput } from '@/lib/registration';
import { WhatsAppIcon } from '@/components/ui/icons';

export interface SubmittedRegistration {
  fullName?: string;
  usn?: string;
  email?: string;
  phone?: string;
  branch?: string;
  semester?: string;
  section?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  registeredCount?: number;
}

interface DoneProps {
  onEdit?: () => void;
  registeredCount?: number;
  data?: SubmittedRegistration;
  isAlreadyRegistered?: boolean;
  message?: string;
  onClearRegistration?: () => void;
}

const WHATSAPP_LINK =
  CLUB.whatsappGroup ||
  'https://chat.whatsapp.com/EIkNHN8OQtj5WurMxMhHhm?s=cl&p=a&mlu=4&ilr=4&iam=2';

export default function Done({
  registeredCount,
  data: customData,
  isAlreadyRegistered = false,
  message,
  onClearRegistration,
}: DoneProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formContext = useFormContext<RegistrationInput>();
  
  const formValues = formContext ? (formContext.getValues() as RegistrationData) : undefined;
  const data: SubmittedRegistration = customData || formValues || {};

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="done" style={{ textAlign: 'left', padding: '16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span
          className="done-icon"
          style={{
            background: isAlreadyRegistered ? 'rgba(180, 140, 222, 0.18)' : 'rgba(87, 219, 150, 0.15)',
            color: isAlreadyRegistered ? 'var(--accent-2)' : 'var(--ok)',
            display: 'inline-flex',
            padding: '10px',
            borderRadius: '50%',
          }}
          aria-hidden="true"
        >
          {isAlreadyRegistered ? (
            <AlertCircle size={32} strokeWidth={2} />
          ) : (
            <CheckCircle2 size={32} strokeWidth={2} />
          )}
        </span>
        <div>
          <span
            className="pill pill-accent"
            style={{
              fontSize: '11px',
              marginBottom: '4px',
              background: isAlreadyRegistered ? 'rgba(147, 51, 234, 0.2)' : undefined,
            }}
          >
            {isAlreadyRegistered ? 'ALREADY REGISTERED' : 'REGISTRATION SUBMITTED'}
          </span>
          <h2
            className="step-heading done-heading"
            style={{ fontSize: '26px', margin: 0 }}
            tabIndex={-1}
            ref={headingRef}
          >
            {isAlreadyRegistered ? 'You are already registered!' : 'You are registered!'}
          </h2>
        </div>
      </div>

      {message ? (
        <div
          style={{
            background: 'rgba(234, 72, 132, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: '12px',
            padding: '12px 16px',
            margin: '16px 0',
            color: 'var(--text)',
            fontSize: '14px',
          }}
        >
          {message}
        </div>
      ) : null}

      <div
        style={{
          background: 'rgba(147, 51, 234, 0.08)',
          border: '1px solid var(--line-strong)',
          borderRadius: '14px',
          padding: '16px 20px',
          margin: '20px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Users size={18} style={{ color: 'var(--accent)' }} />
          <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
            Next steps &amp; Shortlisting
          </strong>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>
          Registrations are strictly capped at <strong>100 members</strong>.
          Once 100 members register, <strong>40 members will be shortlisted</strong> for the hands-on workshop based on responses and system requirements.
        </p>
        {registeredCount || data.registeredCount ? (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--accent-2)' }}>
            You are registration #{registeredCount || data.registeredCount} of 100.
          </p>
        ) : null}
      </div>

      <p
        style={{
          margin: '0 0 16px',
          fontSize: '12.5px',
          color: 'var(--muted)',
          lineHeight: 1.55,
        }}
      >
        Note that certificates will only be provided after project submission.
      </p>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--line)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--muted)',
            marginBottom: '12px',
          }}
        >
          Your Submitted Details
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <div>
            <span style={{ color: 'var(--muted)' }}>Name: </span>
            <strong>{data.fullName || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>USN: </span>
            <strong>{data.usn || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Branch: </span>
            <strong>{data.branch || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Semester: </span>
            <strong>{data.semester ? `Sem ${data.semester}` : '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Section: </span>
            <strong>{data.section || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Phone: </span>
            <strong>{data.phone ? `+91 ${data.phone}` : '—'}</strong>
          </div>
        </div>
      </div>

      <div>
        <a
          className="btn btn-whatsapp"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '15px' }}
        >
          <WhatsAppIcon size={20} />
          <span className="btn-label" style={{ fontWeight: 600 }}>
            Join the WhatsApp Group for Announcements
          </span>
        </a>

        {onClearRegistration ? (
          <button
            type="button"
            onClick={onClearRegistration}
            style={{
              marginTop: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '13px',
              textDecoration: 'underline',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center',
              padding: '6px',
              transition: 'color 180ms ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            Not you or want to register again? Start a new registration
          </button>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { FileCheck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { CLUB } from '@/config/club';
import {
  registrationJson,
  registrationSummary,
  type RegistrationData,
  type RegistrationInput,
} from '@/lib/registration';
import { WhatsAppIcon } from '@/components/ui/icons';

/**
 * Done state (§10.7): honest "not sent yet" — WhatsApp group CTA, download /
 * copy / edit. No fake success, no fake IDs.
 */
export default function Done({ onEdit }: { onEdit: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const { getValues } = useFormContext<RegistrationInput>();
  const data = getValues() as RegistrationData;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const download = () => {
    const blob = new Blob([registrationJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arvr-club-registration.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(registrationSummary(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="done">
      <span className="done-icon" aria-hidden="true">
        <FileCheck size={26} strokeWidth={1.5} />
      </span>
      <h2 className="step-heading done-heading" tabIndex={-1} ref={headingRef}>
        Registration ready.
      </h2>
      <p className="done-body">
        This site isn&rsquo;t connected to the workshop&rsquo;s registration system yet, so
        nothing has been sent. Download or copy your details and share them with the organisers.
      </p>
      <a
        className="btn btn-whatsapp"
        href={CLUB.whatsappGroup || '#'}
        target="_blank"
        rel="noreferrer"
      >
        <WhatsAppIcon size={18} />
        <span className="btn-label">Join the WhatsApp group</span>
      </a>
      <div className="done-actions">
        <button type="button" className="btn btn-primary btn-md" onClick={download}>
          <span className="btn-label">Download details (.json)</span>
        </button>
        <button type="button" className="btn btn-ghost btn-md" onClick={copy} aria-live="polite">
          <span className="btn-label">{copied ? 'Copied' : 'Copy summary'}</span>
        </button>
        <button type="button" className="text-link" onClick={onEdit}>
          Edit details
        </button>
      </div>
    </div>
  );
}

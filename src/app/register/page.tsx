import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RegisterIntro } from '@/components/register/RegisterShell';

/**
 * Client-only mount of RegisterShell to prevent SSR hydration mismatches
 * with framer-motion AnimatePresence, sessionStorage draft restoration, and react-hook-form.
 */
const RegisterShell = dynamic(
  () => import('@/components/register/RegisterShell'),
  {
    ssr: false,
    loading: () => (
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
    ),
  }
);

export const metadata: Metadata = {
  title: 'Register · AR/VR Workshop · BMSIT&M',
  description:
    'Register for the hands-on AR/VR Workshop at BMSIT&M. Capped at 100 members, 40 will be shortlisted.',
};

export default function RegisterPage() {
  return (
    <div className="register-page">
      <div className="container register-grid">
        <div className="register-left">
          <RegisterIntro />
        </div>
        <div className="register-right">
          <RegisterShell />
        </div>
      </div>
    </div>
  );
}

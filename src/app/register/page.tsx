import type { Metadata } from 'next';
import RegisterShell, { RegisterIntro } from '@/components/register/RegisterShell';

export const metadata: Metadata = {
  title: 'Register · XR Skill Lab · BMSIT&M',
  description: 'Register for the 2-day, hands-on XR Skill Lab at BMSIT&M.',
};

/** /register (§10): intro column + 4-step form card. */
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

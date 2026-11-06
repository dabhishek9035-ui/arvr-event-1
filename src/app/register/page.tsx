import type { Metadata } from 'next';
import RegisterShell, { RegisterIntro } from '@/components/register/RegisterShell';

export const metadata: Metadata = {
  title: 'Register · AR/VR Club · BMSIT&M',
  description: 'Register for the AR/VR Club and the 2-day XR Skill Lab.',
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

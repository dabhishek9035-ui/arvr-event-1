import type { ComponentType } from 'react';
import Link from 'next/link';
import { CLUB } from '@/config/club';
import { InstagramIcon, LinkedInIcon } from './icons';

/** Footer (§5.3) — reference closing glow + purple identity. Vendor credited once. */
export default function Footer() {
  const socials: { label: string; Icon: ComponentType<{ size?: number }>; href: string }[] = [
    { label: 'Instagram', Icon: InstagramIcon, href: CLUB.social.instagram },
    { label: 'LinkedIn', Icon: LinkedInIcon, href: CLUB.social.linkedin },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={CLUB.logo} alt="AR/VR Hub logo" className="footer-logo" width={56} height={56} />
          <p className="footer-name">{CLUB.name}</p>
          <p className="footer-tag">{CLUB.tagline}</p>
          <div className="footer-social">
            {socials.map(({ label, Icon, href }) =>
              href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${CLUB.name} on ${label}`} className="social-link">
                  <Icon size={20} />
                </a>
              ) : (
                <span key={label} className="social-link is-pending" aria-label={`${label} link coming soon`}>
                  <Icon size={20} />
                </span>
              ),
            )}
          </div>
        </div>
        <div className="footer-col">
          <p className="micro footer-label">Explore</p>
          <Link href="/">Home</Link>
          <Link href="/#programme">Workshop</Link>
          <Link href="/#curriculum">Curriculum</Link>
          <Link href="/#labs">Labs</Link>
        </div>
        <div className="footer-col">
          <p className="micro footer-label">Join</p>
          <Link href="/register">Register</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 AR/VR Hub · BMSIT&amp;M</span>
        <span>Workshop training by Bodyclone Innovations Pvt. Ltd.</span>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import VisorGlyph from './VisorGlyph';

/** Footer (§5.3). Vendor credited by name once (plan §0.1 D9). */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <VisorGlyph size={28} />
          <p className="footer-name">AR/VR Club</p>
          <p className="footer-tag">Build worlds. Step inside them.</p>
        </div>
        <div className="footer-col">
          <p className="micro footer-label">Explore</p>
          <Link href="/">Home</Link>
          <Link href="/#skill-lab">Skill Lab</Link>
          <Link href="/#curriculum">Curriculum</Link>
          <Link href="/#labs">Labs</Link>
        </div>
        <div className="footer-col">
          <p className="micro footer-label">Join</p>
          <Link href="/register">Register</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 AR/VR Club · BMSIT&amp;M</span>
        <span>Skill Lab training by Bodyclone Innovations Pvt. Ltd.</span>
      </div>
    </footer>
  );
}

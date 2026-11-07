import type { Metadata } from 'next';
import { Unbounded, Figtree, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import SceneShell from '@/components/scene/SceneShell';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ScrollEngine from '@/components/ScrollEngine';
import RouteTracker from '@/components/RouteTracker';

const display = Unbounded({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display-src',
  display: 'swap',
});

const body = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-src',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-src',
  display: 'swap',
});

/** Single dark theme — set before first paint (no persisted-theme flash). */
const BOOT = `(function(){document.documentElement.dataset.theme='holo';})();`;

export const metadata: Metadata = {
  title: 'AR/VR Hub · BMSIT&M: Build worlds. Step inside them.',
  description:
    'AR/VR Hub BMSIT&M — explore Augmented & Virtual Reality. Join the 2-day, 12-hour hands-on XR Skill Lab in Unity, OpenXR and Meta Quest.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <SceneShell />
        <RouteTracker />
        <ScrollEngine />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SceneShell from '@/components/scene/SceneShell';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ScrollEngine from '@/components/ScrollEngine';
import RouteTracker from '@/components/RouteTracker';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/** Single dark theme — set before first paint (no persisted-theme flash). */
const BOOT = `(function(){document.documentElement.dataset.theme='holo';})();`;

export const metadata: Metadata = {
  title: 'AR/VR Club · BMSIT&M: Build worlds. Step inside them.',
  description:
    'A student AR/VR club at BMSIT&M. Join the 2-day, 12-hour XR Skill Lab in Unity, OpenXR and Meta Quest.',
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

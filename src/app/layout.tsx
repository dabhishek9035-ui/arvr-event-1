import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SceneShell from '@/components/scene/SceneShell';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import ScrollEngine from '@/components/ScrollEngine';
import RouteTracker from '@/components/RouteTracker';
import ThemeBoot from '@/components/ThemeBoot';

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

/** Sets data-theme from localStorage before first paint — no flash (§4.2). */
const BOOT = `(function(){try{var t=localStorage.getItem('arvr-theme');if(t!=='daylight'&&t!=='holo')t='holo';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='holo';}})();`;

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
        <ThemeBoot />
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

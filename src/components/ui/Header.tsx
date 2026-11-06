'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { CLUB } from '@/config/club';
import { useStore } from '@/state/store';
import VisorGlyph from './VisorGlyph';
import ThemeSwitcher from './ThemeSwitcher';
import LoadBar from './LoadBar';
import Drawer from './Drawer';

/** Fixed glass header (§5.1): brand, 4 links, theme switcher, Register. */
export default function Header() {
  const pathname = usePathname();
  const isRegister = pathname === '/register';
  const activeSection = useStore((s) => s.activeSection);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="AR/VR Club home">
            <VisorGlyph size={32} />
            <span className="brand-text">
              <span className="brand-name">AR/VR CLUB</span>
              <span className="brand-inst">BMSIT&amp;M</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Primary">
            {CLUB.nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-link${!isRegister && activeSection === item.id ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <ThemeSwitcher />
            <Link href="/register" className="btn btn-primary btn-sm header-register">
              Register
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className="burger"
              aria-expanded={drawerOpen}
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <LoadBar />
      </header>
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          burgerRef.current?.focus();
        }}
      />
    </>
  );
}

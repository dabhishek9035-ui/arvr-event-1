'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CLUB } from '@/config/club';
import { useStore } from '@/state/store';

/** Full-screen mobile nav (§5.2): focus trap, Esc close, scroll lock. */
export default function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const setDrawerOpen = useStore((s) => s.setDrawerOpen);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    setDrawerOpen(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>('a[href], button');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      clearTimeout(t);
    };
  }, [open, onClose, setDrawerOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.001 : 0.25 }}
        >
          <button type="button" className="drawer-close" aria-label="Close menu" onClick={onClose}>
            <X size={24} strokeWidth={1.5} />
          </button>
          <nav className="drawer-nav" aria-label="Mobile">
            {CLUB.nav.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.06 * i, duration: 0.4 }}
              >
                <Link href={item.href} onClick={onClose} className="drawer-link">
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.28, duration: 0.4 }}
          >
            <Link href="/register" onClick={onClose} className="btn btn-primary btn-lg btn-full">
              Register
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

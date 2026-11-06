'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/state/store';

/** Keeps `store.route` in sync so the persistent canvas re-rigs per page. */
export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const r = pathname === '/register' ? 'register' : 'home';
    const st = useStore.getState();
    if (st.route !== r) {
      st.setRoute(r);
      st.setActiveSection(r === 'home' ? 'top' : null);
    }
  }, [pathname]);

  return null;
}

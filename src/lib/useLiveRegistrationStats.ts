'use client';

import { useEffect } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useStore, type RegistrationStats } from '@/state/store';

export async function fetchLiveRegistrationStats(): Promise<RegistrationStats | null> {
  try {
    const res = await fetch(`/api/register/status?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (!res.ok) return null;
    const data: RegistrationStats = await res.json();
    useStore.getState().setRegistrationStats(data);
    return data;
  } catch {
    return null;
  }
}

export function notifyRegistrationSuccessful(newCount?: number) {
  useStore.getState().incrementRegistrationCount(newCount);

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('arvr_registrations_channel');
      bc.postMessage({ count: newCount, timestamp: Date.now() });
      bc.close();
    } catch {
      /* ignore */
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('arvr:registration-updated', { detail: { count: newCount } })
    );
  }
}

// Module-level singleton state to ensure ONLY ONE WebSocket subscription and interval exist across all components
let singletonChannel: RealtimeChannel | null = null;
let singletonInterval: ReturnType<typeof setInterval> | null = null;
let singletonBroadcastChannel: BroadcastChannel | null = null;
let activeSubscriberCount = 0;

function handleLocalUpdate(e: Event) {
  const ce = e as CustomEvent<{ count?: number }>;
  if (typeof ce.detail?.count === 'number') {
    useStore.getState().incrementRegistrationCount(ce.detail.count);
  }
  fetchLiveRegistrationStats();
}

function handleVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    fetchLiveRegistrationStats();
  }
}

function handleFocusChange() {
  fetchLiveRegistrationStats();
}

function startLiveSubscription() {
  if (typeof window === 'undefined') return;

  // 1. Initial fetch
  fetchLiveRegistrationStats();

  // 2. Realtime WebSocket channel (only one instance)
  if (!singletonChannel) {
    try {
      const channel = supabase.channel('realtime:registrations-live');
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          () => {
            fetchLiveRegistrationStats();
          }
        )
        .subscribe();
      singletonChannel = channel;
    } catch (err) {
      console.warn('Realtime subscription warning:', err);
    }
  }

  // 3. BroadcastChannel for cross-tab sync
  if (!singletonBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      singletonBroadcastChannel = new BroadcastChannel('arvr_registrations_channel');
      singletonBroadcastChannel.onmessage = (event) => {
        if (typeof event.data?.count === 'number') {
          useStore.getState().incrementRegistrationCount(event.data.count);
        }
        fetchLiveRegistrationStats();
      };
    } catch {
      /* ignore */
    }
  }

  // 4. Polling fallback every 3 seconds
  if (!singletonInterval) {
    singletonInterval = setInterval(fetchLiveRegistrationStats, 3000);
  }

  // 5. Window event listeners
  window.addEventListener('arvr:registration-updated', handleLocalUpdate);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocusChange);
}

function stopLiveSubscription() {
  if (typeof window === 'undefined') return;

  if (singletonInterval) {
    clearInterval(singletonInterval);
    singletonInterval = null;
  }

  if (singletonChannel) {
    try {
      singletonChannel.unsubscribe();
      supabase.removeChannel(singletonChannel);
    } catch {
      /* ignore */
    }
    singletonChannel = null;
  }

  if (singletonBroadcastChannel) {
    try {
      singletonBroadcastChannel.close();
    } catch {
      /* ignore */
    }
    singletonBroadcastChannel = null;
  }

  window.removeEventListener('arvr:registration-updated', handleLocalUpdate);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleFocusChange);
}

/**
 * Hook that keeps the client's registration stats continuously synced in real time.
 * Uses a singleton listener so multiple components on the same page never collide.
 */
export function useLiveRegistrationStats() {
  const stats = useStore((s) => s.registrationStats);

  useEffect(() => {
    activeSubscriberCount++;
    if (activeSubscriberCount === 1) {
      startLiveSubscription();
    } else {
      fetchLiveRegistrationStats();
    }

    return () => {
      activeSubscriberCount = Math.max(0, activeSubscriberCount - 1);
      if (activeSubscriberCount === 0) {
        stopLiveSubscription();
      }
    };
  }, []);

  return stats;
}

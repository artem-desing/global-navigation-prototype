'use client';

import { useEffect, useState } from 'react';

export type SidebarMode = 'adaptive' | 'expanded';

const STORAGE_KEY = 'nav:v:v8:sidebar-mode';
const EVENT_NAME = 'nav:v8:sidebar-mode-change';
const DEFAULT_MODE: SidebarMode = 'adaptive';

export function readSidebarMode(): SidebarMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'adaptive' || raw === 'expanded') return raw;
  } catch {
    /* swallow */
  }
  return DEFAULT_MODE;
}

export function writeSidebarMode(mode: SidebarMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* swallow */
  }
  window.dispatchEvent(new CustomEvent<SidebarMode>(EVENT_NAME, { detail: mode }));
}

/**
 * Subscribes to v8's sidebar-mode preference. The CustomEvent carries changes
 * from the user-menu submenu back to the rail without prop-drilling — same
 * pattern as `src/nav/events.ts` (memory: project_nav_event_bridge).
 */
export function useSidebarMode(): [SidebarMode, (next: SidebarMode) => void] {
  const [mode, setMode] = useState<SidebarMode>(DEFAULT_MODE);
  useEffect(() => {
    setMode(readSidebarMode());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SidebarMode>).detail;
      if (detail === 'adaptive' || detail === 'expanded') setMode(detail);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);
  return [mode, writeSidebarMode];
}

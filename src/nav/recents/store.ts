'use client';

import { useEffect, useState } from 'react';
import type { IconKey } from '@/nav/manifest/icons';

export interface RecentEntry {
  path: string;
  pageLabel: string;
  containerLabel: string | null;
  productLabel: string;
  productIcon?: IconKey;
  recordedAt: number;
}

const RECENTS_EVENT_PREFIX = 'nav-recents-changed';
const MAX_RECENTS = 5;

/** Variant-namespaced storage key — switching variants doesn't pollute recents. */
function storageKey(variantSlug: string): string {
  return `nav:v:${variantSlug}:recents`;
}

/** Per-variant event name — only consumers of THIS variant re-render on writes. */
function eventName(variantSlug: string): string {
  return `${RECENTS_EVENT_PREFIX}:${variantSlug}`;
}

function read(variantSlug: string): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(variantSlug));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentEntry);
  } catch {
    return [];
  }
}

function write(variantSlug: string, entries: RecentEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(variantSlug), JSON.stringify(entries));
  } catch {
    // quota exceeded or storage disabled — ignore in a prototype
  }
}

function isRecentEntry(value: unknown): value is RecentEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === 'string' &&
    typeof v.pageLabel === 'string' &&
    (v.containerLabel === null || typeof v.containerLabel === 'string') &&
    typeof v.productLabel === 'string' &&
    (v.productIcon === undefined || typeof v.productIcon === 'string') &&
    typeof v.recordedAt === 'number'
  );
}

export function recordRecent(variantSlug: string, entry: Omit<RecentEntry, 'recordedAt'>) {
  const current = read(variantSlug);
  const filtered = current.filter((e) => e.path !== entry.path);
  const next = [{ ...entry, recordedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
  write(variantSlug, next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName(variantSlug)));
  }
}

export function useRecents(variantSlug: string): RecentEntry[] {
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setRecents(read(variantSlug));
    const handler = () => setRecents(read(variantSlug));
    const evt = eventName(variantSlug);
    window.addEventListener(evt, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(evt, handler);
      window.removeEventListener('storage', handler);
    };
  }, [variantSlug]);

  return recents;
}

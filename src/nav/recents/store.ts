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

const STORAGE_KEY = 'nav.recents';
const RECENTS_EVENT = 'nav-recents-changed';
const MAX_RECENTS = 5;

function read(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentEntry);
  } catch {
    return [];
  }
}

function write(entries: RecentEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

export function recordRecent(entry: Omit<RecentEntry, 'recordedAt'>) {
  const current = read();
  const filtered = current.filter((e) => e.path !== entry.path);
  const next = [{ ...entry, recordedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
  write(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(RECENTS_EVENT));
  }
}

export function useRecents(): RecentEntry[] {
  const [recents, setRecents] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setRecents(read());
    const handler = () => setRecents(read());
    window.addEventListener(RECENTS_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(RECENTS_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return recents;
}

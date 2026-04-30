'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'nav:v:';
const STORAGE_SUFFIX = ':rail-expanded';

function readExpanded(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${slug}${STORAGE_SUFFIX}`);
    return raw ? (JSON.parse(raw) as boolean) === true : false;
  } catch {
    return false;
  }
}

function writeExpanded(slug: string, value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_PREFIX}${slug}${STORAGE_SUFFIX}`;
    if (value) window.localStorage.setItem(key, JSON.stringify(true));
    else window.localStorage.removeItem(key);
  } catch {
    /* swallow */
  }
}

/**
 * Persisted expand/collapse state for the v4 rail. Default is collapsed
 * (matches the icon-rail experience). The hook reads localStorage on mount
 * via init function so first paint reflects the user's last choice.
 */
export function useExpandedRail(slug: string): readonly [boolean, () => void] {
  const [expanded, setExpanded] = useState<boolean>(() => readExpanded(slug));

  // Re-sync when the variant slug changes (defensive — only matters if a single
  // mount swaps slugs, which today's router doesn't do, but cheap insurance).
  useEffect(() => {
    setExpanded(readExpanded(slug));
  }, [slug]);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      writeExpanded(slug, next);
      return next;
    });
  }, [slug]);

  return [expanded, toggle] as const;
}

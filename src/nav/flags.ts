'use client';

import { useSyncExternalStore } from 'react';
import type { FeatureNode } from './manifest/types';

export interface FlagState {
  /** Controls whether the dev flag panel is visible. Toggled via `?debug=1`. */
  debugMode: boolean;
  /** Unlocks Edge → Configuration → Security Edge. */
  securityEdgeUnlocked: boolean;
}

const STORAGE_KEY = 'wallarm-nav-flags';

const defaultFlags: FlagState = {
  debugMode: false,
  securityEdgeUnlocked: false,
};

let flags: FlagState = defaultFlags;
let initialized = false;
const listeners = new Set<() => void>();

function readInitial(): FlagState {
  const next: FlagState = { ...defaultFlags };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) Object.assign(next, JSON.parse(stored));
  } catch {
    // ignore parse / quota errors — fall back to defaults
  }
  // ?debug=1 in the URL forces debugMode on (so the panel shows up). Stored
  // value can disable it again via the panel's reset button.
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === '1') next.debugMode = true;
  return next;
}

function ensureInitialized() {
  if (!initialized && typeof window !== 'undefined') {
    flags = readInitial();
    initialized = true;
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): FlagState {
  ensureInitialized();
  return flags;
}

function getServerSnapshot(): FlagState {
  // Server-rendered HTML always uses defaults — flag state is hydrated client-side.
  return defaultFlags;
}

export function useFlags(): FlagState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setFlag<K extends keyof FlagState>(key: K, value: FlagState[K]): void {
  flags = { ...flags, [key]: value };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {
      // ignore quota errors
    }
  }
  listeners.forEach((l) => l());
}

export function resetFlags(): void {
  flags = { ...defaultFlags };
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  listeners.forEach((l) => l());
}

/**
 * Compute the effective lock state for a Feature given current flags.
 * A Feature is locked if it has `locked: true` AND its `unlockFlag` (if any)
 * is not currently truthy in the flag state.
 */
export function isFeatureLocked(node: FeatureNode, currentFlags: FlagState): boolean {
  if (!node.locked) return false;
  if (node.unlockFlag) {
    const unlocked = (currentFlags as unknown as Record<string, unknown>)[node.unlockFlag];
    if (unlocked) return false;
  }
  return true;
}

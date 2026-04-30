'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveShellContext } from '@/nav/url';

export interface WorkbenchTab {
  id: string;
  url: string;
  title: string;
}

interface StoredState {
  tabs: WorkbenchTab[];
  activeId: string | null;
  explorerWidth: number;
  explorerCollapsed: boolean;
}

const STORAGE_KEY = 'nav:v:v5:workbench';
const DEFAULT_EXPLORER_WIDTH = 264;
const MIN_EXPLORER_WIDTH = 200;
const MAX_EXPLORER_WIDTH = 480;

const initial: StoredState = {
  tabs: [],
  activeId: null,
  explorerWidth: DEFAULT_EXPLORER_WIDTH,
  explorerCollapsed: false,
};

function readStored(): StoredState {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
      activeId: parsed.activeId ?? null,
      explorerWidth: parsed.explorerWidth ?? DEFAULT_EXPLORER_WIDTH,
      explorerCollapsed: parsed.explorerCollapsed ?? false,
    };
  } catch {
    return initial;
  }
}

function writeStored(state: StoredState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* swallow */
  }
}

export function deriveTabTitle(pathname: string, slug: string): string {
  const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${slug}` });
  if (ctx.mode === 'home') return 'Home';
  if (ctx.mode === 'unknown') return 'Unknown';
  const tail = ctx.breadcrumb[ctx.breadcrumb.length - 1];
  if (!tail) return ctx.manifest.label;
  if (tail.kind === 'product') return tail.label;
  if (tail.kind === 'group') return tail.label;
  if (tail.kind === 'feature') {
    const productLabel =
      ('shortLabel' in ctx.manifest && ctx.manifest.shortLabel) || ctx.manifest.label;
    return `${productLabel} / ${tail.label}`;
  }
  if (tail.kind === 'scope-chip') {
    const productLabel =
      ('shortLabel' in ctx.manifest && ctx.manifest.shortLabel) || ctx.manifest.label;
    return `${productLabel} / ${tail.label}`;
  }
  return ctx.manifest.label;
}

function generateTabId(): string {
  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useWorkbench(slug: string) {
  const [state, setState] = useState<StoredState>(() => readStored());
  const lastSyncedRef = useRef<string | null>(null);

  // Persist on every change.
  useEffect(() => {
    writeStored(state);
  }, [state]);

  /**
   * Open a new tab — or focus an existing one with the same URL. Returns the
   * tab that ended up active so the caller can router.push to its URL.
   */
  const openTab = useCallback(
    (url: string, title: string): WorkbenchTab => {
      let resolvedTab: WorkbenchTab | undefined;
      setState((prev) => {
        const existing = prev.tabs.find((t) => t.url === url);
        if (existing) {
          resolvedTab = existing;
          return { ...prev, activeId: existing.id };
        }
        const tab: WorkbenchTab = { id: generateTabId(), url, title };
        resolvedTab = tab;
        return { ...prev, tabs: [...prev.tabs, tab], activeId: tab.id };
      });
      return resolvedTab as WorkbenchTab;
    },
    [],
  );

  /**
   * Close a tab. Returns the URL of the tab that should become active so the
   * caller can navigate to it (or `null` if the workbench is now empty).
   */
  const closeTab = useCallback((id: string): string | null => {
    let nextUrl: string | null = null;
    setState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const newTabs = prev.tabs.filter((t) => t.id !== id);
      let newActive = prev.activeId;
      if (prev.activeId === id) {
        const right = prev.tabs[idx + 1] ?? prev.tabs[idx - 1] ?? null;
        newActive = right?.id ?? null;
        nextUrl = right?.url ?? null;
      }
      return { ...prev, tabs: newTabs, activeId: newActive };
    });
    return nextUrl;
  }, []);

  const focusTab = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeId: id }));
  }, []);

  /**
   * Sync the active tab's URL with the current pathname. Called from a
   * pathname-watching effect in the shell. If the active tab's url already
   * matches, this no-ops; if it differs, the active tab "drills" to the new
   * URL (mutating in place — same-tab navigation, IDE pattern).
   * If there's no active tab matching the pathname, opens a new tab.
   */
  const syncToPathname = useCallback(
    (pathname: string, title: string) => {
      if (lastSyncedRef.current === pathname) return;
      lastSyncedRef.current = pathname;
      setState((prev) => {
        const matchByUrl = prev.tabs.find((t) => t.url === pathname);
        if (matchByUrl) {
          if (prev.activeId === matchByUrl.id) return prev;
          return { ...prev, activeId: matchByUrl.id };
        }
        const active = prev.tabs.find((t) => t.id === prev.activeId);
        if (active) {
          // Drill within active tab — mutate its URL.
          return {
            ...prev,
            tabs: prev.tabs.map((t) =>
              t.id === active.id ? { ...t, url: pathname, title } : t,
            ),
          };
        }
        // No active tab — adopt this URL as a new tab.
        const tab: WorkbenchTab = { id: generateTabId(), url: pathname, title };
        return { ...prev, tabs: [...prev.tabs, tab], activeId: tab.id };
      });
    },
    [],
  );

  const setExplorerWidth = useCallback((w: number) => {
    const clamped = Math.max(MIN_EXPLORER_WIDTH, Math.min(MAX_EXPLORER_WIDTH, w));
    setState((prev) => ({ ...prev, explorerWidth: clamped }));
  }, []);

  const toggleExplorer = useCallback(() => {
    setState((prev) => ({ ...prev, explorerCollapsed: !prev.explorerCollapsed }));
  }, []);

  const cycleTab = useCallback((dir: 1 | -1): WorkbenchTab | null => {
    let resolved: WorkbenchTab | null = null;
    setState((prev) => {
      if (prev.tabs.length === 0) return prev;
      const idx = prev.tabs.findIndex((t) => t.id === prev.activeId);
      const nextIdx =
        idx === -1
          ? 0
          : (idx + dir + prev.tabs.length) % prev.tabs.length;
      const nextTab = prev.tabs[nextIdx];
      resolved = nextTab;
      return { ...prev, activeId: nextTab.id };
    });
    return resolved;
  }, []);

  const reorderTab = useCallback((id: string, toIndex: number) => {
    setState((prev) => {
      const fromIndex = prev.tabs.findIndex((t) => t.id === id);
      if (fromIndex === -1 || fromIndex === toIndex) return prev;
      const tabs = [...prev.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { ...prev, tabs };
    });
  }, []);

  void slug;

  return {
    tabs: state.tabs,
    activeId: state.activeId,
    explorerWidth: state.explorerWidth,
    explorerCollapsed: state.explorerCollapsed,
    openTab,
    closeTab,
    focusTab,
    syncToPathname,
    setExplorerWidth,
    toggleExplorer,
    cycleTab,
    reorderTab,
  };
}

export type WorkbenchApi = ReturnType<typeof useWorkbench>;

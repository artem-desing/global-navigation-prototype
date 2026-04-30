'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Button } from '@wallarm-org/design-system/Button';
import { RecentsTracker } from '@/nav/recents/recents-tracker';
import { FlagPanel } from '@/nav/shell/flag-panel';
import { GlobalSearch } from '@/nav/search/global-search';
import { useVariant } from '@/nav/variant-context';
import { ActivityBar } from './activity-bar';
import { Explorer } from './explorer';
import { TabStrip } from './tab-strip';
import { AIDock } from './ai-dock';
import { deriveTabTitle, useWorkbench } from './tab-store';

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { slug } = useVariant();
  const workbench = useWorkbench(slug);
  const [searchOpen, setSearchOpen] = useState(false);

  // Pathname → workbench sync. Treats the current URL as either a re-focus on
  // an existing tab, a drill within the active tab, or a brand-new tab when
  // there's nothing matching (e.g., deep-link arrival).
  useEffect(() => {
    if (pathname === '/' || pathname === `/v/${slug}` || pathname === `/v/${slug}/`) {
      // Empty workbench — don't auto-open Home as a tab.
      return;
    }
    workbench.syncToPathname(pathname, deriveTabTitle(pathname, slug));
  }, [pathname, slug, workbench]);

  // Global keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'b' && !e.shiftKey) {
        e.preventDefault();
        workbench.toggleExplorer();
        return;
      }
      if (key === 'w' && !e.shiftKey) {
        if (!workbench.activeId) return;
        e.preventDefault();
        const next = workbench.closeTab(workbench.activeId);
        if (next) router.push(next);
        else router.push(`/v/${slug}/`);
        return;
      }
      if (e.shiftKey && (key === ']' || key === '[')) {
        e.preventDefault();
        const next = workbench.cycleTab(key === ']' ? 1 : -1);
        if (next) router.push(next.url);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [workbench, router, slug]);

  const isHomePath =
    pathname === '/' || pathname === `/v/${slug}` || pathname === `/v/${slug}/`;
  const isEmptyWorkbench = workbench.tabs.length === 0;

  return (
    <div className="flex h-screen">
      <RecentsTracker />
      <GlobalSearch hideTrigger open={searchOpen} onOpenChange={setSearchOpen} />
      <ActivityBar workbench={workbench} onOpenSearch={() => setSearchOpen(true)} />
      {workbench.explorerCollapsed ? null : (
        <Explorer
          workbench={workbench}
          width={workbench.explorerWidth}
          onResize={workbench.setExplorerWidth}
        />
      )}
      <div className="flex flex-1 min-w-0 flex-col">
        <TabStrip workbench={workbench} />
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: 'var(--color-bg-page-bg)' }}
        >
          {isHomePath || isEmptyWorkbench ? (
            <EmptyState onOpenExplorer={() => workbench.toggleExplorer()} />
          ) : (
            children
          )}
        </main>
        <AIDock />
      </div>
      <FlagPanel />
    </div>
  );
}

function EmptyState({ onOpenExplorer }: { onOpenExplorer: () => void }) {
  return (
    <div className="flex h-full items-center justify-center px-24 py-48">
      <div className="flex max-w-lg flex-col items-center gap-12 text-center">
        <Heading size="xl" weight="medium">
          No tabs open
        </Heading>
        <Text size="sm" color="secondary">
          Pick anything in the Explorer to start a tab. Tabs stay open across navigations
          so you can hold several pages side-by-side. Press ⌘K to search, ⌘B to toggle the
          Explorer, ⌘W to close the active tab.
        </Text>
        <div className="flex items-center gap-8">
          <Button variant="secondary" onClick={onOpenExplorer}>
            Toggle Explorer
          </Button>
        </div>
      </div>
    </div>
  );
}

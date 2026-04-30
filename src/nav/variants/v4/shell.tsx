'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { TopBar } from '@/nav/variants/v0/top-bar';
import { Breadcrumb } from '@/nav/variants/v0/breadcrumb';
import { SecondColumn } from '@/nav/variants/v0/second-column';
import { FlagPanel } from '@/nav/shell/flag-panel';
import { AIAssistantPanel } from '@/nav/shell/ai-assistant-panel';
import { RecentsTracker } from '@/nav/recents/recents-tracker';
import { resolveShellContext } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { Rail } from './rail';

export function Shell({ children }: { children: ReactNode }) {
  const [aiOpen, setAIOpen] = useState(false);
  const pathname = usePathname();
  const { slug } = useVariant();
  // Two cases get a persistent second column in v4:
  //   1. Settings — its tree always lives in the column (the rail item is just
  //      a single Link that lands on /settings/profile).
  //   2. A drilled scope (e.g. inside a specific data plane) — the inner nav
  //      moves out of the rail's hover/inline tree and into the column.
  // Everywhere else, products use the rail's hover-menu (collapsed) or inline
  // top-level tree (expanded), and the page goes full-bleed.
  const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${slug}` });
  const showSecondColumn =
    pathname.startsWith(`/v/${slug}/settings`) ||
    (ctx.mode === 'product' && ctx.backHref !== null);

  return (
    <div className="flex h-screen">
      <RecentsTracker />
      <div className="flex flex-1 min-w-0 flex-col">
        <TopBar aiOpen={aiOpen} onToggleAI={() => setAIOpen((v) => !v)} />
        <div className="relative flex flex-1 min-h-0">
          <Rail />
          {showSecondColumn ? <SecondColumn /> : null}
          <main
            className="flex-1 overflow-auto"
            style={{ backgroundColor: 'var(--color-bg-page-bg)' }}
          >
            <Breadcrumb />
            {children}
          </main>
        </div>
      </div>
      <AIAssistantPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      <FlagPanel />
    </div>
  );
}

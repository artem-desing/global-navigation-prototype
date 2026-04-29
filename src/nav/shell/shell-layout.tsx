import type { ReactNode } from 'react';
import { TopBar } from './top-bar';
import { Rail } from './rail';
import { SecondColumn } from './second-column';
import { Breadcrumb } from './breadcrumb';
import { FlagPanel } from './flag-panel';
import { RecentsTracker } from '@/nav/recents/recents-tracker';

export function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <RecentsTracker />
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Rail />
        <SecondColumn />
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: 'var(--color-bg-page-bg)' }}
        >
          <Breadcrumb />
          {children}
        </main>
      </div>
      <FlagPanel />
    </div>
  );
}

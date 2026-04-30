'use client';

import { useState, type ReactNode } from 'react';
import { TopBar } from './top-bar';
import { Rail } from './rail';
import { SecondColumn } from './second-column';
import { Breadcrumb } from './breadcrumb';
import { FlagPanel } from '@/nav/shell/flag-panel';
import { AIAssistantPanel } from '@/nav/shell/ai-assistant-panel';
import { RecentsTracker } from '@/nav/recents/recents-tracker';

export function Shell({ children }: { children: ReactNode }) {
  const [aiOpen, setAIOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <RecentsTracker />
      <div className="flex flex-1 min-w-0 flex-col">
        <TopBar aiOpen={aiOpen} onToggleAI={() => setAIOpen((v) => !v)} />
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
      </div>
      <AIAssistantPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      <FlagPanel />
    </div>
  );
}

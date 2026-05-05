'use client';

import { useState, type ReactNode } from 'react';
import { TopBar } from '@/nav/variants/v0/top-bar';
import { SecondColumn } from '@/nav/variants/v0/second-column';
import { FlagPanel } from '@/nav/shell/flag-panel';
import { AIAssistantPanel } from '@/nav/shell/ai-assistant-panel';
import { RecentsTracker } from '@/nav/recents/recents-tracker';
import { Rail } from './rail';

export function Shell({ children }: { children: ReactNode }) {
  const [aiOpen, setAIOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <RecentsTracker />
      <div className="flex flex-1 min-w-0 flex-col">
        <TopBar aiOpen={aiOpen} onToggleAI={() => setAIOpen((v) => !v)} />
        <div className="relative flex flex-1 min-h-0">
          <Rail />
          <SecondColumn />
          <main
            className="flex-1 overflow-auto"
            style={{ backgroundColor: 'var(--color-bg-page-bg)' }}
          >
            {children}
          </main>
        </div>
      </div>
      <AIAssistantPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      <FlagPanel />
    </div>
  );
}

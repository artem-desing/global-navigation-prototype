'use client';

import Link from 'next/link';
import { Activity } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { GlobalSearch } from '@/nav/search/global-search';
import { Sparkles } from '@/nav/manifest/custom-icons';
import { TenantSwitcher } from '@/nav/shell/tenant-switcher';
import { WallarmWordmark } from './wordmark';
import { Breadcrumb } from './breadcrumb';

export interface TopBarProps {
  aiOpen: boolean;
  onToggleAI: () => void;
}

export function TopBar({ aiOpen, onToggleAI }: TopBarProps) {
  return (
    <header
      className="flex h-48 shrink-0 items-center justify-between gap-16 border-b px-16"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <div className="flex flex-1 min-w-0 items-center gap-12">
        {/*
         * Wordmark = escape hatch to the variant picker. Hidden door is
         * deliberate for the prototype phase; revisit before any real-product
         * use (memory: project_wordmark_as_picker_escape_hatch).
         */}
        <Link
          href="/"
          aria-label="Switch prototype variant"
          title="Switch prototype variant"
          className="flex shrink-0 items-center rounded-md px-4 py-2 transition-colors hover:bg-[var(--color-bg-light-primary)]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <WallarmWordmark />
        </Link>
        <Breadcrumb inline />
      </div>

      <div className="flex shrink-0 items-center gap-12">
        <div className="w-[240px]">
          <GlobalSearch />
        </div>
        <TenantSwitcher />

        <div
          className="flex items-center gap-6 rounded-md px-8 py-4"
          aria-label="Usage limits"
          style={{ color: 'var(--color-text-warning)' }}
        >
          <Activity size="sm" aria-hidden />
          <Text size="sm" color="inherit">
            limits
          </Text>
        </div>

        {/*
         * Hide the trigger while the panel is open — the panel has its own
         * header with a close affordance, so showing both reads as duplication.
         */}
        {aiOpen ? null : (
          <button
            type="button"
            onClick={onToggleAI}
            className="flex items-center gap-6 rounded-md px-8 py-4 transition-colors"
            aria-label="Open AI assistant"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Sparkles size="sm" />
            <Text size="sm" color="secondary">
              AI assistant
            </Text>
          </button>
        )}
      </div>

    </header>
  );
}

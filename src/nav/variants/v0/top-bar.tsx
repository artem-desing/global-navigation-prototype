'use client';

import Link from 'next/link';
import { Activity } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';
import { GlobalSearch } from '@/nav/search/global-search';
import { Sparkles, Bell } from '@/nav/manifest/custom-icons';
import { TenantSwitcher } from '@/nav/shell/tenant-switcher';
import { getTopBarUtilityManifests } from '@/nav/manifest/registry';
import { resolveIcon, type IconKey } from '@/nav/manifest/icons';
import { WallarmWordmark } from './wordmark';
import { Breadcrumb } from './breadcrumb';

export interface TopBarProps {
  aiOpen: boolean;
  onToggleAI: () => void;
  /**
   * When false, suppresses the inline breadcrumb (and its leading divider)
   * inside the top bar. v8 renders the breadcrumb above the page title in
   * main instead — closer to the real-product implementation than the
   * top-bar-inline variant.
   */
  showBreadcrumb?: boolean;
}

// Tooltip labels for top-bar utility icon buttons. `id` matches the utility
// manifest id; the visible label intentionally diverges from `manifest.label`
// where the conversational tooltip reads better than the rail label (Docs →
// Quick help).
const TOP_BAR_UTILITY_TOOLTIPS: Record<string, string> = {
  docs: 'Quick help',
};

export function TopBar({ aiOpen, onToggleAI, showBreadcrumb = true }: TopBarProps) {
  const topBarUtilities = getTopBarUtilityManifests();
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
        {showBreadcrumb ? <Breadcrumb inline /> : null}
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

        {topBarUtilities.map((u) => (
          <TopBarUtilityButton
            key={u.id}
            href={u.externalUrl ?? '#'}
            iconKey={u.icon}
            label={u.label}
            tooltip={TOP_BAR_UTILITY_TOOLTIPS[u.id] ?? u.label}
          />
        ))}

        {/*
         * "What's new" — placeholder button. No logic wired; here to anchor the
         * shape of the chrome until announcements/notifications get a real
         * destination.
         */}
        <Tooltip openDelay={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="What's new"
              onClick={() => {
                /* noop — placeholder until announcements ship */
              }}
              className="flex h-32 w-32 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-light-primary)]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Bell size="sm" />
            </button>
          </TooltipTrigger>
          <TooltipContent>What&apos;s new</TooltipContent>
        </Tooltip>

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

interface TopBarUtilityButtonProps {
  href: string;
  iconKey: IconKey;
  label: string;
  tooltip: string;
}

function TopBarUtilityButton({ href, iconKey, label, tooltip }: TopBarUtilityButtonProps) {
  const IconComponent = resolveIcon(iconKey);
  return (
    <Tooltip openDelay={300}>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (opens in new tab)`}
          className="flex h-32 w-32 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-light-primary)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {IconComponent ? <IconComponent size="sm" aria-hidden /> : null}
        </a>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

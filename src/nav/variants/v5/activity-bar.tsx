'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Search as SearchIcon,
} from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuTrigger,
} from '@wallarm-org/design-system/DropdownMenu';
import {
  getProductManifests,
  getPlatformUtilityManifests,
} from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { Z_RAIL_OVERLAY } from '@/nav/z-index';
import { WallarmWordmark } from '@/nav/variants/v0/wordmark';
import { deriveTabTitle, type WorkbenchApi } from './tab-store';

const BAR_WIDTH = 48;
const ITEM_SIZE = 32;

interface ActivityBarProps {
  workbench: WorkbenchApi;
  onOpenSearch: () => void;
}

export function ActivityBar({ workbench, onOpenSearch }: ActivityBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { slug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();

  const segments = pathname.split('/').filter(Boolean);
  const activeId = segments[2] ?? 'home';

  const navigate = (url: string) => {
    const title = deriveTabTitle(url, slug);
    workbench.openTab(url, title);
    router.push(url);
  };

  return (
    <nav
      aria-label="Activity bar"
      className="shrink-0 flex flex-col items-center gap-4 border-r py-8"
      style={{
        width: BAR_WIDTH,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
        zIndex: Z_RAIL_OVERLAY,
      }}
    >
      <Link
        href="/"
        aria-label="Switch prototype variant"
        title="Switch prototype variant"
        className="flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-light-primary)]"
        style={{
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          color: 'var(--color-text-primary)',
        }}
      >
        <WallarmMonogram />
      </Link>

      <div
        role="separator"
        aria-orientation="horizontal"
        className="my-4 h-[1px]"
        style={{
          width: 24,
          backgroundColor: 'var(--color-border-primary-light)',
        }}
      />

      <ActivityItem
        label="Home"
        active={activeId === 'home'}
        onClick={() => navigate(`/v/${slug}/`)}
      >
        <HomeIcon size="md" aria-hidden />
      </ActivityItem>

      <ActivityItem label="Search (⌘K)" active={false} onClick={onOpenSearch}>
        <SearchIcon size="md" aria-hidden />
      </ActivityItem>

      <RecentActivityItem onSelect={() => { /* handled inside */ }} />

      <div
        role="separator"
        aria-orientation="horizontal"
        className="my-4 h-[1px]"
        style={{
          width: 24,
          backgroundColor: 'var(--color-border-primary-light)',
        }}
      />

      {products.map((p) => {
        const Icon = resolveIcon(p.icon);
        return (
          <ActivityItem
            key={p.id}
            label={p.label}
            active={activeId === p.id}
            onClick={() => navigate(withVariantPrefix(slug, `/${p.id}/${p.defaultLandingId}`))}
          >
            {Icon ? <Icon size="md" aria-hidden /> : null}
          </ActivityItem>
        );
      })}

      <div className="flex-1" />

      <div
        role="separator"
        aria-orientation="horizontal"
        className="my-4 h-[1px]"
        style={{
          width: 24,
          backgroundColor: 'var(--color-border-primary-light)',
        }}
      />

      {utilities.map((u) => (
        <UtilityActivityItem
          key={u.id}
          utility={u}
          active={activeId === u.id}
          onNavigate={navigate}
        />
      ))}
    </nav>
  );
}

interface ActivityItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ActivityItem({ label, active, onClick, children }: ActivityItemProps) {
  return (
    <ActivityTooltip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
        className="relative flex shrink-0 items-center justify-center rounded-md transition-colors"
        style={{
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          backgroundColor: active ? 'var(--color-bg-primary)' : undefined,
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '';
          }
        }}
      >
        {active ? (
          <span
            aria-hidden
            className="absolute left-0 rounded-r"
            style={{
              top: 4,
              bottom: 4,
              width: 2,
              backgroundColor: 'var(--color-border-brand)',
            }}
          />
        ) : null}
        {children}
      </button>
    </ActivityTooltip>
  );
}

function RecentActivityItem({ onSelect }: { onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
      closeOnSelect
      positioning={{ placement: 'right-start', gutter: 8 }}
    >
      <ActivityTooltip label="Recent">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Recent"
            className="flex shrink-0 items-center justify-center rounded-md transition-colors"
            style={{
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <HistoryIcon size="md" aria-hidden />
          </button>
        </DropdownMenuTrigger>
      </ActivityTooltip>
      <DropdownMenuContent>
        <RecentsMenuItems
          onItemSelect={() => {
            setOpen(false);
            onSelect();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UtilityActivityItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  onNavigate: (url: string) => void;
}

function UtilityActivityItem({ utility, active, onNavigate }: UtilityActivityItemProps) {
  const router = useRouter();
  const { slug } = useVariant();
  const Icon = resolveIcon(utility.icon);
  const [open, setOpen] = useState(false);

  if (utility.externalUrl) {
    return (
      <ActivityTooltip label={`${utility.label} (opens in new tab)`}>
        <a
          href={utility.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${utility.label} (opens in new tab)`}
          className="flex shrink-0 items-center justify-center rounded-md transition-colors"
          style={{
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '';
          }}
        >
          {Icon ? <Icon size="md" aria-hidden /> : null}
        </a>
      </ActivityTooltip>
    );
  }

  if (utility.previewMode === 'dropdown') {
    const features = utility.sidebar.filter(
      (n): n is Extract<typeof n, { type: 'feature' }> => n.type === 'feature',
    );
    const isAvatar = utility.id === 'user';
    const initials = isAvatar ? getInitials(utility.label) : null;
    return (
      <DropdownMenu
        open={open}
        onOpenChange={setOpen}
        closeOnSelect
        positioning={{ placement: 'right-end', gutter: 8 }}
      >
        <ActivityTooltip label={utility.label}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={utility.label}
              className="flex shrink-0 items-center justify-center rounded-md transition-colors"
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              {isAvatar ? (
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: 'var(--color-bg-light-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <Text size="xs" weight="medium" color="inherit">
                    {initials}
                  </Text>
                </span>
              ) : Icon ? (
                <Icon size="md" aria-hidden />
              ) : null}
            </button>
          </DropdownMenuTrigger>
        </ActivityTooltip>
        <DropdownMenuContent>
          {features.map((feature) => {
            const FeatureIcon = resolveIcon(feature.icon);
            return (
              <DropdownMenuItem
                key={feature.id}
                value={feature.id}
                onSelect={() => {
                  setOpen(false);
                  router.push(withVariantPrefix(slug, `/${utility.id}/${feature.id}`));
                }}
              >
                {FeatureIcon ? (
                  <DropdownMenuItemIcon>
                    <FeatureIcon size="sm" aria-hidden />
                  </DropdownMenuItemIcon>
                ) : null}
                <DropdownMenuItemContent>
                  <DropdownMenuItemText>{feature.label}</DropdownMenuItemText>
                </DropdownMenuItemContent>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <ActivityItem
      label={utility.label}
      active={active}
      onClick={() => onNavigate(withVariantPrefix(slug, `/${utility.id}/${utility.defaultLandingId}`))}
    >
      {Icon ? <Icon size="md" aria-hidden /> : null}
    </ActivityItem>
  );
}

function ActivityTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <div
      className="relative flex"
      onMouseEnter={() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(true), 300);
      }}
      onMouseLeave={() => {
        if (timer.current) clearTimeout(timer.current);
        setOpen(false);
      }}
      onPointerDown={() => {
        if (timer.current) clearTimeout(timer.current);
        setOpen(false);
      }}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 ml-8 -translate-y-1/2 whitespace-nowrap rounded-md py-4 px-8"
          style={{
            backgroundColor: 'var(--color-component-tooltip-bg)',
            color: 'var(--color-text-primary-alt-fixed)',
            zIndex: 60,
          }}
        >
          <Text
            size="xs"
            weight="medium"
            color="inherit"
            lineHeight="tight"
            style={{ whiteSpace: 'nowrap' }}
          >
            {label}
          </Text>
        </span>
      ) : null}
    </div>
  );
}

function WallarmMonogram() {
  // Tiny crop of the Wallarm wordmark — just the orange chevron, used as a
  // monogram in the 32×32 activity-bar slot.
  return (
    <svg width={20} height={14} viewBox="0 0 35 21" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 6.15962L14.511 0V8.76245L27.9133 3.07335V10.1036L35.0689 7.06641V12.0551L27.9133 15.0926V12.4277L14.4971 18.1223V14.0185L0 20.1723V6.15962Z"
        fill="#FF441C"
      />
    </svg>
  );
}

void WallarmWordmark; // keep import for future extension

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

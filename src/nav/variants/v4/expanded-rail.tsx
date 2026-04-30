'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft,
  History as HistoryIcon,
  Home as HomeIcon,
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
import type {
  CategoryNode,
  FeatureNode,
  GroupNode,
  Manifest,
  ProductManifest,
  PlatformUtilityManifest,
  SidebarNode,
} from '@/nav/manifest/types';
import { resolveShellContext, type ShellContext } from '@/nav/url';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { Z_RAIL_OVERLAY } from '@/nav/z-index';

const RAIL_WIDTH_PX = 256;

interface ExpandedRailProps {
  onToggle: () => void;
}

export function ExpandedRail({ onToggle }: ExpandedRailProps) {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();

  const segments = pathname.split('/').filter(Boolean);
  const activeId = segments[2] ?? 'home';
  // Top-level feature inside the active product/utility (segments[3]). Used to
  // highlight e.g. "Data planes" in the Edge section even when the user has
  // drilled deeper into a specific data plane — that drill lives in the
  // SecondColumn now, not in the rail.
  const activeTopLevelFeatureId = segments[3];

  const shellCtx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });

  const [recentOpen, setRecentOpen] = useState(false);

  return (
    <nav
      aria-label="Global root navigation"
      className="shrink-0 flex flex-col border-r"
      style={{
        width: RAIL_WIDTH_PX,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
        zIndex: Z_RAIL_OVERLAY,
      }}
    >
      <div className="flex flex-1 flex-col overflow-y-auto py-12">
        <div className="flex flex-col gap-2 px-12">
          <TopLink
            href={variantHomePath(variantSlug)}
            label="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
          />
          <RecentTrigger open={recentOpen} onOpenChange={setRecentOpen} />
        </div>

        <Separator />

        <div className="flex flex-col gap-16">
          {products.map((product) => (
            <ManifestSection
              key={product.id}
              manifest={product}
              isActive={activeId === product.id}
              activeTopLevelFeatureId={activeTopLevelFeatureId}
              shellCtx={shellCtx}
            />
          ))}
        </div>
      </div>

      <div
        className="flex flex-col gap-2 border-t px-12 py-12"
        style={{ borderColor: 'var(--color-border-primary-light)' }}
      >
        {utilities.map((utility) => (
          <UtilityRow
            key={utility.id}
            utility={utility}
            isActive={activeId === utility.id}
            shellCtx={shellCtx}
          />
        ))}
      </div>

      <div
        className="flex flex-col gap-2 border-t px-12 py-8"
        style={{ borderColor: 'var(--color-border-primary-light)' }}
      >
        <ToggleRow onToggle={onToggle} />
      </div>
    </nav>
  );
}

function Separator() {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className="mx-12 my-16 h-[1px]"
      style={{ backgroundColor: 'var(--color-border-primary-light)' }}
    />
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-12 pb-4 uppercase tracking-wide">
      <Text size="xs" weight="medium" color="secondary">
        {children}
      </Text>
    </div>
  );
}

interface TopLinkProps {
  href: string;
  label: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  active: boolean;
  trailing?: React.ReactNode;
}

function TopLink({ href, label, IconComponent, active, trailing }: TopLinkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-32 items-center gap-8 rounded-md px-8 transition-colors"
      style={{
        backgroundColor: active
          ? 'var(--color-bg-primary)'
          : hovered
            ? 'var(--color-bg-light-primary)'
            : undefined,
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: 20 }}>
        {IconComponent ? <IconComponent size="sm" aria-hidden /> : null}
      </span>
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
        {label}
      </Text>
      {trailing}
    </Link>
  );
}

function RecentTrigger({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect
      positioning={{ placement: 'right-start', gutter: 8 }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Recent"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex h-32 w-full items-center gap-8 rounded-md px-8 text-left transition-colors"
          style={{
            backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="flex shrink-0 items-center justify-center" style={{ width: 20 }}>
            <HistoryIcon size="sm" aria-hidden />
          </span>
          <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
            Recent
          </Text>
          <ChevronRightIcon size="xs" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <RecentsMenuItems onItemSelect={() => onOpenChange(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ManifestSectionProps {
  manifest: ProductManifest | PlatformUtilityManifest;
  isActive: boolean;
  activeTopLevelFeatureId?: string;
  shellCtx: ShellContext;
}

/**
 * One product (or rich utility) rendered as a header + top-level features.
 * The expanded rail always shows the product's top-level sidebar; when the
 * user has drilled into a scope, that scope's inner nav lives in the
 * SecondColumn (see shell.tsx) instead of being duplicated here.
 */
function ManifestSection({
  manifest,
  isActive,
  activeTopLevelFeatureId,
  shellCtx,
}: ManifestSectionProps) {
  const { slug: variantSlug } = useVariant();
  void shellCtx;
  const activeFeatureId = isActive ? activeTopLevelFeatureId : undefined;
  const hrefBuilder = useMemo(
    () => (featureId: string) =>
      withVariantPrefix(variantSlug, `/${manifest.id}/${featureId}`),
    [manifest.id, variantSlug],
  );

  return (
    <div className="flex flex-col">
      <SectionHeader>{manifest.shortLabel ?? manifest.label}</SectionHeader>
      <V4Tree
        nodes={manifest.sidebar}
        activeFeatureId={activeFeatureId}
        hrefBuilder={hrefBuilder}
      />
    </div>
  );
}

/**
 * v4-tuned sidebar tree. Differs from v0's SidebarTree by:
 * - Taller rows (h-36 vs ~28px) so the expanded rail breathes like Cloudflare /
 *   Apollo references rather than feeling like a packed list.
 * - Top-level features carry their manifest icon (when set) on the left to add
 *   a per-row visual cue and break the "all-text" wall.
 * - Group toggles render the same row chrome as features, but with a chevron
 *   on the right that flips between right (collapsed) and down (open).
 * - Nested children indent with a left border line (same v0 pattern, kept).
 */
interface V4TreeProps {
  nodes: SidebarNode[];
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  depth?: number;
}

function V4Tree({ nodes, activeFeatureId, hrefBuilder, depth = 0 }: V4TreeProps) {
  return (
    <ul className="flex flex-col gap-1 px-8">
      {nodes.map((node) => (
        <V4NodeRow
          key={node.id}
          node={node}
          activeFeatureId={activeFeatureId}
          hrefBuilder={hrefBuilder}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function V4NodeRow({
  node,
  activeFeatureId,
  hrefBuilder,
  depth,
}: {
  node: SidebarNode;
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  depth: number;
}) {
  if (node.type === 'category') return <V4CategoryRow node={node} />;
  if (node.type === 'group')
    return (
      <V4GroupRow
        node={node}
        activeFeatureId={activeFeatureId}
        hrefBuilder={hrefBuilder}
        depth={depth}
      />
    );
  return (
    <V4FeatureRow
      node={node}
      active={node.id === activeFeatureId}
      hrefBuilder={hrefBuilder}
      depth={depth}
    />
  );
}

function V4CategoryRow({ node }: { node: CategoryNode }) {
  return (
    <li className="px-8 pt-12 pb-2 uppercase tracking-wide">
      <Text size="xs" weight="medium" color="secondary">
        {node.label}
      </Text>
    </li>
  );
}

function V4FeatureRow({
  node,
  active,
  hrefBuilder,
  depth,
}: {
  node: FeatureNode;
  active: boolean;
  hrefBuilder: (featureId: string) => string;
  depth: number;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = node.icon ? resolveIcon(node.icon) : undefined;
  // Show icons only at depth 0 — keeps deeper levels visually quieter and
  // matches Cloudflare's "Log Explorer" pattern (icon at top, none below).
  const showIcon = depth === 0;
  return (
    <li>
      <Link
        href={hrefBuilder(node.id)}
        aria-current={active ? 'page' : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-36 items-center gap-8 rounded-md px-8 transition-colors"
        style={{
          backgroundColor: active
            ? 'var(--color-bg-primary)'
            : hovered
              ? 'var(--color-bg-light-primary)'
              : undefined,
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {showIcon ? (
          <span className="flex shrink-0 items-center justify-center" style={{ width: 16 }}>
            {Icon ? <Icon size="sm" aria-hidden /> : null}
          </span>
        ) : null}
        <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
          {node.label}
        </Text>
        {node.badge ? (
          <span
            className="rounded px-6 py-2 text-[10px] font-medium uppercase"
            style={{
              backgroundColor: 'var(--color-bg-light-brand)',
              color: 'var(--color-text-brand)',
            }}
          >
            {node.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function V4GroupRow({
  node,
  activeFeatureId,
  hrefBuilder,
  depth,
}: {
  node: GroupNode;
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  depth: number;
}) {
  const [open, setOpen] = useState(!node.collapsed);
  const [hovered, setHovered] = useState(false);
  const Chevron = open ? ChevronDownIcon : ChevronRightIcon;
  const showLeadingIconSlot = depth === 0;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={open}
        className="flex h-36 w-full items-center gap-8 rounded-md px-8 text-left transition-colors"
        style={{
          color: 'var(--color-text-secondary)',
          backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        }}
      >
        {showLeadingIconSlot ? (
          <span className="shrink-0" style={{ width: 16 }} aria-hidden />
        ) : null}
        <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
          {node.label}
        </Text>
        <Chevron size="xs" aria-hidden />
      </button>
      {open ? (
        <div
          className="ml-16 border-l pl-4 mt-1"
          style={{ borderColor: 'var(--color-border-primary-light)' }}
        >
          <V4Tree
            nodes={node.children}
            activeFeatureId={activeFeatureId}
            hrefBuilder={hrefBuilder}
            depth={depth + 1}
          />
        </div>
      ) : null}
    </li>
  );
}

interface UtilityRowProps {
  utility: PlatformUtilityManifest;
  isActive: boolean;
  shellCtx: ShellContext;
}

function UtilityRow({ utility, isActive, shellCtx }: UtilityRowProps) {
  const { slug: variantSlug } = useVariant();
  const IconComponent = resolveIcon(utility.icon);
  void shellCtx;

  if (utility.externalUrl) {
    return (
      <ExternalLink
        href={utility.externalUrl}
        label={utility.label}
        IconComponent={IconComponent}
      />
    );
  }

  if (utility.previewMode === 'dropdown') {
    return <UtilityDropdownRow utility={utility} IconComponent={IconComponent} />;
  }

  // Rich utility (Settings): single row. The utility's full sub-tree appears
  // as a v0-style second column on its page, not inline here.
  return (
    <TopLink
      href={withVariantPrefix(variantSlug, `/${utility.id}/${utility.defaultLandingId}`)}
      label={utility.label}
      IconComponent={IconComponent}
      active={isActive}
    />
  );
}

function ExternalLink({
  href,
  label,
  IconComponent,
}: {
  href: string;
  label: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-32 items-center gap-8 rounded-md px-8 transition-colors"
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: 20 }}>
        {IconComponent ? <IconComponent size="sm" aria-hidden /> : null}
      </span>
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
        {label}
      </Text>
    </a>
  );
}

function UtilityDropdownRow({
  utility,
  IconComponent,
}: {
  utility: PlatformUtilityManifest;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
}) {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const featureItems = useMemo(
    () =>
      utility.sidebar.filter(
        (n): n is Extract<typeof n, { type: 'feature' }> => n.type === 'feature',
      ),
    [utility.sidebar],
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
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={utility.label}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex h-32 w-full items-center gap-8 rounded-md px-8 text-left transition-colors"
          style={{
            backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="flex shrink-0 items-center justify-center" style={{ width: 20 }}>
            {isAvatar ? (
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--color-bg-light-primary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Text size="xs" weight="medium" color="inherit">
                  {initials}
                </Text>
              </span>
            ) : IconComponent ? (
              <IconComponent size="sm" aria-hidden />
            ) : null}
          </span>
          <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
            {utility.label}
          </Text>
          <ChevronRightIcon size="xs" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {featureItems.map((feature) => {
          const FeatureIcon = resolveIcon(feature.icon);
          return (
            <DropdownMenuItem
              key={feature.id}
              value={feature.id}
              onSelect={() => {
                setOpen(false);
                router.push(withVariantPrefix(variantSlug, `/${utility.id}/${feature.id}`));
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

function ToggleRow({ onToggle }: { onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label="Collapse sidebar"
      aria-pressed
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-32 w-full items-center gap-8 rounded-md px-8 text-left transition-colors"
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: 20 }}>
        <ChevronsLeft size="sm" aria-hidden />
      </span>
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
        Collapse sidebar
      </Text>
      <Text size="xs" color="inherit" lineHeight="tight">
        ⌘B
      </Text>
    </button>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

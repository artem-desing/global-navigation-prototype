'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  Home as HomeIcon,
  History as HistoryIcon,
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
import { resolveIcon, type IconKey } from '@/nav/manifest/icons';
import type {
  ProductManifest,
  PlatformUtilityManifest,
  SidebarNode,
} from '@/nav/manifest/types';
import { resolveShellContext, type ShellContext } from '@/nav/url';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { Z_RAIL_OVERLAY } from '@/nav/z-index';
import {
  ChevronsLeft,
  ChevronsRight,
} from '@wallarm-org/design-system/icons';
import { ExpandedRail } from './expanded-rail';
import { useExpandedRail } from './expand-state';

const RAIL_WIDTH_PX = 64;
const TOOLTIP_OPEN_DELAY_MS = 300;
const HOVER_MENU_OPEN_DELAY_MS = 120;
const HOVER_MENU_CLOSE_DELAY_MS = 160;

type IconComponent = React.ComponentType<{
  size?: 'sm' | 'md';
  'aria-hidden'?: boolean;
}>;

export function Rail() {
  const { slug: variantSlug } = useVariant();
  const [expanded, toggleExpanded] = useExpandedRail(variantSlug);

  // ⌘B / Ctrl+B toggles the rail, like Cloudflare. Listen at window level so it
  // works regardless of focus.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleExpanded();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleExpanded]);

  return expanded ? (
    <ExpandedRail onToggle={toggleExpanded} />
  ) : (
    <CollapsedRail onToggle={toggleExpanded} />
  );
}

interface RailModeProps {
  onToggle: () => void;
}

function CollapsedRail({ onToggle }: RailModeProps) {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();

  const segments = pathname.split('/').filter(Boolean);
  const productSlot = segments[2];
  const activeId = productSlot ?? 'home';
  const activeFeatureId = segments[3];
  // ctx drives the drilled-in menu: when the user is inside a scope (a "plane"),
  // ctx.backHref !== null and ctx.sidebar / ctx.header come from that scope.
  const shellCtx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });

  const [recentOpen, setRecentOpen] = useState(false);

  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);

  const focusableCount = 1 /* home */ + 1 /* recent */ + products.length + utilities.length;
  itemRefs.current = itemRefs.current.slice(0, focusableCount);

  const handleRailKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const items = itemRefs.current.filter(
        (n): n is HTMLAnchorElement | HTMLButtonElement => n != null,
      );
      if (items.length === 0) return;
      const currentIndex = items.findIndex((n) => n === document.activeElement);
      e.preventDefault();
      let next: number;
      if (currentIndex < 0) next = 0;
      else if (e.key === 'ArrowDown') next = (currentIndex + 1) % items.length;
      else next = (currentIndex - 1 + items.length) % items.length;
      items[next].focus();
    },
    [],
  );

  let refIndex = -1;
  const assignRef = (node: HTMLAnchorElement | HTMLButtonElement | null) => {
    refIndex += 1;
    itemRefs.current[refIndex] = node;
  };
  refIndex = -1;

  return (
    <nav
      aria-label="Global root navigation"
      onKeyDown={handleRailKeyDown}
      className="shrink-0 flex flex-col justify-between border-r py-12"
      style={{
        width: RAIL_WIDTH_PX,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
        zIndex: Z_RAIL_OVERLAY,
      }}
    >
      <div className="flex flex-col items-stretch gap-4 px-8" data-stack="products">
        <RailItemWithTooltip
          assignRef={assignRef}
          href={variantHomePath(variantSlug)}
          label="Home"
          IconComponent={HomeIcon}
          active={activeId === 'home'}
        />
        <RecentRailItem
          assignRef={assignRef}
          IconComponent={HistoryIcon}
          open={recentOpen}
          onOpenChange={setRecentOpen}
        />
        <div
          role="separator"
          aria-orientation="horizontal"
          className="mx-12 my-8 h-[1px]"
          style={{ backgroundColor: 'var(--color-border-primary-light)' }}
        />
        {products.map((p) => (
          <ProductRailItem
            key={p.id}
            assignRef={assignRef}
            product={p}
            active={activeId === p.id}
            activeFeatureId={activeFeatureId}
            shellCtx={shellCtx}
          />
        ))}
      </div>

      <div className="flex flex-col items-stretch gap-4 px-8" data-stack="bottom">
        {utilities.map((u) => (
          <PlatformUtilityRailItem
            key={u.id}
            assignRef={assignRef}
            utility={u}
            active={activeId === u.id}
            activeFeatureId={activeFeatureId}
            shellCtx={shellCtx}
          />
        ))}
        <RailToggleButton expanded={false} onToggle={onToggle} />
      </div>
    </nav>
  );
}

interface RailToggleButtonProps {
  expanded: boolean;
  onToggle: () => void;
  fullWidth?: boolean;
}

function RailToggleButton({ expanded, onToggle, fullWidth }: RailToggleButtonProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = expanded ? ChevronsLeft : ChevronsRight;
  const label = expanded ? 'Collapse sidebar' : 'Expand sidebar';
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={expanded}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        fullWidth
          ? 'flex h-32 w-full items-center gap-8 rounded-md px-8 transition-colors'
          : 'flex h-32 w-full items-center justify-center rounded-md transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      <Icon size="sm" aria-hidden />
      {fullWidth ? (
        <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
          {label}
        </Text>
      ) : null}
      {fullWidth ? (
        <Text size="xs" color="inherit" lineHeight="tight">
          ⌘B
        </Text>
      ) : null}
    </button>
  );
  if (fullWidth) return button;
  return <RailTooltip label={`${label} (⌘B)`}>{button}</RailTooltip>;
}

interface CommonItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
}

/**
 * Hover label for non-product rail items (Home, external utilities). Local
 * implementation — see v3/rail.tsx for the rationale (WADS Tooltip's asChild
 * chain breaks Ark's positioning anchor when nested inside a DropdownMenu).
 */
function RailTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => cancel(), []);

  return (
    <div
      className="relative flex w-full"
      onMouseEnter={() => {
        cancel();
        timerRef.current = setTimeout(() => setOpen(true), TOOLTIP_OPEN_DELAY_MS);
      }}
      onMouseLeave={() => {
        cancel();
        setOpen(false);
      }}
      onPointerDown={() => {
        cancel();
        setOpen(false);
      }}
      onFocusCapture={() => {
        cancel();
        setOpen(true);
      }}
      onBlurCapture={() => {
        cancel();
        setOpen(false);
      }}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 ml-8 -translate-y-1/2 rounded-md py-4 px-8 whitespace-nowrap"
          style={{
            backgroundColor: 'var(--color-component-tooltip-bg)',
            color: 'var(--color-text-primary-alt-fixed)',
            zIndex: 60,
          }}
        >
          <Text size="xs" weight="medium" color="inherit" lineHeight="tight">
            {label}
          </Text>
        </span>
      ) : null}
    </div>
  );
}

interface RailItemProps extends CommonItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
  active: boolean;
}

function RailItemWithTooltip({ assignRef, href, label, IconComponent, active }: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <RailTooltip label={label}>
      <Link
        ref={assignRef as (node: HTMLAnchorElement | null) => void}
        href={href}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-40 w-full items-center justify-center rounded-md transition-colors"
        style={{
          backgroundColor: active
            ? 'var(--color-bg-primary)'
            : hovered
              ? 'var(--color-bg-light-primary)'
              : undefined,
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </Link>
    </RailTooltip>
  );
}

interface ProductRailItemProps extends CommonItemProps {
  product: ProductManifest | PlatformUtilityManifest;
  active: boolean;
  activeFeatureId?: string;
  shellCtx: ShellContext;
  /** When true, the hover menu anchors to the trigger's bottom and grows up.
   * Used for items in the bottom utility stack (Settings) so the menu doesn't
   * overflow the viewport. */
  growUpward?: boolean;
}

function ProductRailItem({
  assignRef,
  product,
  active,
  activeFeatureId,
  shellCtx,
  growUpward,
}: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  const { slug: variantSlug } = useVariant();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelOpen = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelClose();
    if (menuOpen) return;
    if (openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      setMenuOpen(true);
      openTimerRef.current = null;
    }, HOVER_MENU_OPEN_DELAY_MS);
  }, [cancelClose, menuOpen]);

  const scheduleClose = useCallback(() => {
    cancelOpen();
    if (closeTimerRef.current) return;
    closeTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
      closeTimerRef.current = null;
    }, HOVER_MENU_CLOSE_DELAY_MS);
  }, [cancelOpen]);

  useEffect(
    () => () => {
      cancelOpen();
      cancelClose();
    },
    [cancelOpen, cancelClose],
  );

  const closeImmediately = useCallback(() => {
    cancelOpen();
    cancelClose();
    setMenuOpen(false);
  }, [cancelOpen, cancelClose]);

  return (
    <div
      className="relative flex w-full"
      onMouseEnter={() => {
        setHovered(true);
        scheduleOpen();
      }}
      onMouseLeave={() => {
        setHovered(false);
        scheduleClose();
      }}
    >
      <Link
        ref={assignRef as (node: HTMLAnchorElement | null) => void}
        href={withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`)}
        aria-label={product.label}
        aria-current={active ? 'page' : undefined}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={closeImmediately}
        onFocus={() => {
          cancelClose();
          setMenuOpen(true);
        }}
        onBlur={(e) => {
          // Only close if focus left the trigger AND the menu panel.
          const next = e.relatedTarget as Node | null;
          const wrapper = e.currentTarget.parentElement;
          if (next && wrapper && wrapper.contains(next)) return;
          scheduleClose();
        }}
        className="relative flex h-40 w-full items-center justify-center rounded-md transition-colors"
        style={{
          backgroundColor: active
            ? 'var(--color-bg-primary)'
            : hovered
              ? 'var(--color-bg-light-primary)'
              : undefined,
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </Link>
      {menuOpen ? (
        <SectionHoverMenu
          product={product}
          activeFeatureId={active ? activeFeatureId : undefined}
          shellCtx={active ? shellCtx : undefined}
          onItemClick={closeImmediately}
          growUpward={growUpward}
        />
      ) : null}
    </div>
  );
}

interface SectionHoverMenuProps {
  product: ProductManifest | PlatformUtilityManifest;
  activeFeatureId?: string;
  /** When this product is the active one, the resolved shell context — used to
   * detect drilled-in scope state and render a v0-style sidebar tree. */
  shellCtx?: ShellContext;
  onItemClick: () => void;
  growUpward?: boolean;
}

function SectionHoverMenu({
  product,
  activeFeatureId,
  shellCtx,
  onItemClick,
  growUpward,
}: SectionHoverMenuProps) {
  // shellCtx is no longer consumed here — the drilled (scoped) sidebar moved
  // out of the hover menu and into the persistent SecondColumn (rendered by
  // the v4 shell). The hover menu always shows the product's top-level items.
  void shellCtx;

  return (
    <div
      role="menu"
      aria-label={`${product.label} sections`}
      onClickCapture={(e) => {
        if ((e.target as Element | null)?.closest('a')) onItemClick();
      }}
      className="absolute left-full ml-8 flex flex-col rounded-md py-8 shadow-lg"
      style={{
        top: growUpward ? undefined : 0,
        bottom: growUpward ? 0 : undefined,
        minWidth: 240,
        maxWidth: 320,
        maxHeight: 'calc(100vh - 96px)',
        overflowY: 'auto',
        backgroundColor: 'var(--color-bg-surface-1)',
        border: '1px solid var(--color-border-primary)',
        zIndex: 50,
      }}
    >
      <DefaultMenuContent product={product} activeFeatureId={activeFeatureId} />
    </div>
  );
}

function DefaultMenuContent({
  product,
  activeFeatureId,
}: {
  product: ProductManifest | PlatformUtilityManifest;
  activeFeatureId?: string;
}) {
  const { slug: variantSlug } = useVariant();
  const items = useMemo(() => topLevelItems(product.sidebar), [product.sidebar]);

  return (
    <>
      <div
        className="flex items-baseline justify-between gap-8 px-12 pb-6"
        style={{ borderBottom: '1px solid var(--color-border-primary-light)' }}
      >
        <Text size="xs" weight="bold" color="primary">
          {product.shortLabel ?? product.label}
        </Text>
      </div>
      <div className="flex flex-col py-4">
        {items.map((item) => {
          if (item.kind === 'category' || item.kind === 'group-label') {
            return (
              <div
                key={`${item.kind}:${item.id}`}
                className="px-12 pt-12 pb-4 uppercase tracking-wide"
              >
                <Text size="xs" weight="medium" color="secondary">
                  {item.label}
                </Text>
              </div>
            );
          }
          const FeatureIcon = item.icon ? resolveIcon(item.icon) : undefined;
          return (
            <SectionMenuItem
              key={item.id}
              href={withVariantPrefix(variantSlug, `/${product.id}/${item.id}`)}
              label={item.label}
              IconComponent={FeatureIcon}
              indented={item.indented}
              active={activeFeatureId === item.id}
            />
          );
        })}
      </div>
    </>
  );
}

interface SectionMenuItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
  indented?: boolean;
  active: boolean;
}

function SectionMenuItem({
  href,
  label,
  IconComponent,
  indented,
  active,
}: SectionMenuItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      role="menuitem"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-32 items-center gap-8 rounded-sm transition-colors"
      style={{
        paddingLeft: indented ? 28 : 12,
        paddingRight: 12,
        backgroundColor: active
          ? 'var(--color-bg-primary)'
          : hovered
            ? 'var(--color-bg-light-primary)'
            : undefined,
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {IconComponent ? (
        <span className="flex shrink-0 items-center justify-center" style={{ width: 16 }}>
          <IconComponent size="sm" aria-hidden />
        </span>
      ) : (
        <span className="shrink-0" style={{ width: 16 }} aria-hidden />
      )}
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
        {label}
      </Text>
    </Link>
  );
}

type FlatItem =
  | { kind: 'feature'; id: string; label: string; icon?: IconKey; indented: boolean }
  | { kind: 'group-label'; id: string; label: string }
  | { kind: 'category'; id: string; label: string };

/**
 * Build the default (non-drilled) menu — top-level features only. Children of
 * features are NOT included — those surface in the v0-style scoped menu when
 * the user has drilled into a scope. Top-level groups expose their immediate
 * feature children flat (groups are visual-only, no URL segment).
 */
function topLevelItems(nodes: SidebarNode[]): FlatItem[] {
  const out: FlatItem[] = [];
  for (const node of nodes) {
    if (node.type === 'feature') {
      out.push({
        kind: 'feature',
        id: node.id,
        label: node.label,
        icon: node.icon,
        indented: false,
      });
    } else if (node.type === 'group') {
      out.push({ kind: 'group-label', id: node.id, label: node.label });
      for (const child of node.children) {
        if (child.type === 'feature') {
          out.push({
            kind: 'feature',
            id: child.id,
            label: child.label,
            icon: child.icon,
            indented: false,
          });
        } else if (child.type === 'category') {
          out.push({ kind: 'category', id: child.id, label: child.label });
        }
      }
    } else if (node.type === 'category') {
      out.push({ kind: 'category', id: node.id, label: node.label });
    }
  }
  return out;
}

interface PlatformUtilityRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  activeFeatureId?: string;
  shellCtx: ShellContext;
}

function PlatformUtilityRailItem({
  assignRef,
  utility,
  active,
  activeFeatureId,
  shellCtx,
}: PlatformUtilityRailItemProps) {
  const { slug } = useVariant();
  const IconComponent = resolveIcon(utility.icon);
  // Unused for the rich-utility path but referenced through the type contract;
  // silence the linter without restructuring callers.
  void activeFeatureId;
  void shellCtx;
  if (utility.externalUrl) {
    return (
      <ExternalRailItem
        assignRef={assignRef}
        href={utility.externalUrl}
        label={utility.label}
        IconComponent={IconComponent}
      />
    );
  }
  if (utility.previewMode === 'dropdown') {
    return (
      <UtilityDropdownRailItem
        assignRef={assignRef}
        utility={utility}
        IconComponent={IconComponent}
        active={active}
      />
    );
  }
  // Rich utility (Settings): single tooltip-only item. Clicking navigates to
  // its default landing where the v4 shell renders a second column with the
  // utility's tree. No hover-menu — the second column does the same job.
  return (
    <RailItemWithTooltip
      assignRef={assignRef}
      href={withVariantPrefix(slug, `/${utility.id}/${utility.defaultLandingId}`)}
      label={utility.label}
      IconComponent={IconComponent}
      active={active}
    />
  );
}

interface UtilityDropdownRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  IconComponent?: IconComponent;
  active: boolean;
}

function UtilityDropdownRailItem({
  assignRef,
  utility,
  IconComponent,
  active,
}: UtilityDropdownRailItemProps) {
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
          ref={assignRef as (node: HTMLButtonElement | null) => void}
          type="button"
          aria-label={utility.label}
          aria-current={active ? 'page' : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-40 w-full items-center justify-center rounded-md transition-colors"
          style={{
            backgroundColor: active
              ? 'var(--color-bg-primary)'
              : hovered
                ? 'var(--color-bg-light-primary)'
                : undefined,
            color: active
              ? 'var(--color-text-primary)'
              : 'var(--color-text-secondary)',
          }}
        >
          {isAvatar ? (
            <span
              className="flex h-28 w-28 items-center justify-center rounded-full"
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
            <IconComponent size="md" aria-hidden />
          ) : null}
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

interface ExternalRailItemProps extends CommonItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
}

function ExternalRailItem({ assignRef, href, label, IconComponent }: ExternalRailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <RailTooltip label={`${label} (opens in new tab)`}>
      <a
        ref={assignRef as (node: HTMLAnchorElement | null) => void}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (opens in new tab)`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-40 w-full items-center justify-center rounded-md transition-colors"
        style={{
          backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
          color: 'var(--color-text-secondary)',
        }}
      >
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </a>
    </RailTooltip>
  );
}

interface RecentRailItemProps extends CommonItemProps {
  IconComponent: IconComponent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RecentRailItem({
  assignRef,
  IconComponent,
  open,
  onOpenChange,
}: RecentRailItemProps) {
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
          ref={assignRef as (node: HTMLButtonElement | null) => void}
          type="button"
          aria-label="Recent"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-40 w-full items-center justify-center rounded-md transition-colors"
          style={{
            backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
            color: 'var(--color-text-secondary)',
          }}
        >
          <IconComponent size="md" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <RecentsMenuItems
          onItemSelect={() => {
            onOpenChange(false);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

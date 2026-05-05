'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Home as HomeIcon, History as HistoryIcon } from '@wallarm-org/design-system/icons';
import { PanelLeftDashed as PanelLeftDashedIcon } from '@/nav/manifest/custom-icons';
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
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { SECOND_COLUMN_FOCUS_FLAG } from '@/nav/variants/v0/second-column';

// v7 = "v0 + wide labels toggle, no hover flyout". Two states: narrow (96px
// stacked icon+label, matches v0) and wide (192px horizontal icon+label,
// harvested from v6 `expanded`). ⌘B toggles. Persisted per browser.
//
// Unlike v0, products do NOT preview on hover — to see a product's tree the
// user clicks the product, navigating into it, and the SecondColumn renders
// the tree on the right. Dropdowns (Recent, User menu) open on click. This
// is the explicit ask from Artem 2026-05-05.

const RAIL_NARROW_PX = 96;
const RAIL_WIDE_PX = 192;
const ICON_COL_WIDTH = 28;
const ICON_COL_LEFT = 10;
const TOOLTIP_OPEN_DELAY_MS = 300;
const WIDTH_TRANSITION_MS = 180;

const WIDE_STORAGE_KEY = 'nav:v:v7:wide';

const LEADER_KEY = 'g';
const LEADER_WINDOW_MS = 1500;

// Single-letter shortcuts assigned by product id. Mirror of v0/v6.
const PRODUCT_SHORTCUTS: Record<string, string> = {
  edge: 'E',
  'ai-hypervisor': 'A',
  'infra-discovery': 'I',
  testing: 'T',
};

const HOME_SHORTCUT = 'H';
const RECENT_SHORTCUT = 'R';
const SETTINGS_SHORTCUT = 'S';

type IconComponent = React.ComponentType<{
  size?: 'sm' | 'md';
  'aria-hidden'?: boolean;
}>;

function readWide(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(WIDE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeWide(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WIDE_STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* swallow */
  }
}

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefers;
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function Rail() {
  const pathname = usePathname();
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();
  const prefersReducedMotion = usePrefersReducedMotion();

  const segments = pathname.split('/').filter(Boolean);
  const productSlot = segments[2];
  const activeId = productSlot ?? 'home';

  const [wide, setWide] = useState<boolean>(() => readWide());
  // Recent dropdown open state is hoisted so the `G R` leader-key can open it.
  const [recentOpen, setRecentOpen] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);

  const setWideAndPersist = useCallback((next: boolean) => {
    setWide(next);
    writeWide(next);
  }, []);

  // ⌘B toggles wide. Same chord pattern v4 uses elsewhere in the prototype.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== 'b') return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      setWide((prev) => {
        const next = !prev;
        writeWide(next);
        return next;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Leader-key navigation: G then product letter / utility letter. Mirrors v0.
  const leaderActiveRef = useRef(false);
  const leaderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const cancelLeader = () => {
      leaderActiveRef.current = false;
      if (leaderTimerRef.current) {
        clearTimeout(leaderTimerRef.current);
        leaderTimerRef.current = null;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (!leaderActiveRef.current) {
        if (key === LEADER_KEY) {
          e.preventDefault();
          leaderActiveRef.current = true;
          if (leaderTimerRef.current) clearTimeout(leaderTimerRef.current);
          leaderTimerRef.current = setTimeout(cancelLeader, LEADER_WINDOW_MS);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelLeader();
        return;
      }
      if (key === HOME_SHORTCUT.toLowerCase()) {
        cancelLeader();
        e.preventDefault();
        router.push(variantHomePath(variantSlug));
        return;
      }
      if (key === RECENT_SHORTCUT.toLowerCase()) {
        cancelLeader();
        e.preventDefault();
        setRecentOpen(true);
        // After the portal mounts, dispatch ArrowDown on Ark's Menu.Content
        // node to engage data-highlighted on the first item. .focus() alone
        // isn't enough — same pattern as v0/v6.
        setTimeout(() => {
          const menuContent = document.querySelector<HTMLElement>(
            '[data-scope="menu"][data-part="content"]',
          );
          if (!menuContent) return;
          menuContent.focus();
          menuContent.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowDown',
              code: 'ArrowDown',
              bubbles: true,
              cancelable: true,
            }),
          );
        }, 80);
        return;
      }
      if (key === SETTINGS_SHORTCUT.toLowerCase()) {
        cancelLeader();
        const settings = utilities.find((u) => u.id === 'settings');
        if (!settings) return;
        e.preventDefault();
        sessionStorage.setItem(SECOND_COLUMN_FOCUS_FLAG, '1');
        router.push(
          withVariantPrefix(variantSlug, `/${settings.id}/${settings.defaultLandingId}`),
        );
        return;
      }
      const productId = Object.entries(PRODUCT_SHORTCUTS).find(
        ([, letter]) => letter.toLowerCase() === key,
      )?.[0];
      cancelLeader();
      if (!productId) return;
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      e.preventDefault();
      sessionStorage.setItem(SECOND_COLUMN_FOCUS_FLAG, '1');
      router.push(
        withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`),
      );
    };
    // Capture phase so the leader key fires before Ark UI's portal listeners.
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      cancelLeader();
    };
  }, [products, utilities, router, variantSlug]);

  // Keyboard roving across rail items. Tab puts focus into the rail; arrows
  // cycle. Harvested from v6/rail.tsx:330.
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

  const railWidth = wide ? RAIL_WIDE_PX : RAIL_NARROW_PX;
  const widthTransition = prefersReducedMotion
    ? 'none'
    : `width ${WIDTH_TRANSITION_MS}ms ease-out`;

  return (
    <nav
      ref={railRef}
      aria-label="Global root navigation"
      onKeyDown={handleRailKeyDown}
      className="shrink-0 flex flex-col justify-between border-r py-12"
      style={{
        width: railWidth,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
        transition: widthTransition,
      }}
    >
      <div className="flex flex-col items-stretch gap-4 px-8" data-stack="products">
        <RailItem
          assignRef={assignRef}
          href={variantHomePath(variantSlug)}
          label="Home"
          shortLabel="Home"
          IconComponent={HomeIcon}
          active={activeId === 'home'}
          wide={wide}
          tooltipLabel="Go to Home"
          shortcut={HOME_SHORTCUT}
        />
        <RecentRailItem
          assignRef={assignRef}
          IconComponent={HistoryIcon}
          open={recentOpen}
          onOpenChange={setRecentOpen}
          wide={wide}
          shortcut={RECENT_SHORTCUT}
        />
        <div
          role="separator"
          aria-orientation="horizontal"
          className="mx-8 my-4 h-[1px]"
          style={{ backgroundColor: 'var(--color-border-primary-light)' }}
        />
        {products.map((p) => (
          <ProductRailItem
            key={p.id}
            assignRef={assignRef}
            product={p}
            active={activeId === p.id}
            wide={wide}
          />
        ))}
      </div>

      <div
        className="flex flex-col items-stretch gap-4 px-8"
        data-stack="platform-utilities"
      >
        {utilities.map((u) => (
          <PlatformUtilityRailItem
            key={u.id}
            assignRef={assignRef}
            utility={u}
            active={activeId === u.id}
            wide={wide}
            shortcut={u.id === 'settings' ? SETTINGS_SHORTCUT : undefined}
          />
        ))}
        <div
          role="separator"
          aria-orientation="horizontal"
          className="mx-8 mt-4 mb-0 h-[1px]"
          style={{ backgroundColor: 'var(--color-border-primary-light)' }}
        />
        <WideToggleItem
          assignRef={assignRef}
          wide={wide}
          onToggle={() => setWideAndPersist(!wide)}
        />
      </div>
    </nav>
  );
}

interface CommonItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
  wide: boolean;
}

interface RailItemProps extends CommonItemProps {
  href: string;
  label: string;
  shortLabel: string;
  IconComponent?: IconComponent;
  active: boolean;
  tooltipLabel?: string;
  shortcut?: string;
}

function RailItem({
  assignRef,
  href,
  label,
  shortLabel,
  IconComponent,
  active,
  wide,
  tooltipLabel,
  shortcut,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  const link = (
    <Link
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        wide
          ? 'flex h-40 items-center rounded-md transition-colors'
          : 'flex w-full flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors'
      }
      style={{
        backgroundColor: active
          ? 'var(--color-bg-primary)'
          : hovered
            ? 'var(--color-bg-light-primary)'
            : undefined,
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {wide ? (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          </span>
          <span className="ml-6 truncate" style={{ whiteSpace: 'nowrap' }}>
            <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
              {label}
            </Text>
          </span>
        </>
      ) : (
        <>
          {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          <Text size="xs" color="inherit" align="center" lineHeight="tight">
            {shortLabel}
          </Text>
        </>
      )}
    </Link>
  );
  if (!shortcut && !tooltipLabel) return link;
  return (
    <RailTooltip label={tooltipLabel ?? label} shortcut={shortcut}>
      {link}
    </RailTooltip>
  );
}

interface ProductRailItemProps extends CommonItemProps {
  product: ProductManifest;
  active: boolean;
}

function ProductRailItem({ assignRef, product, active, wide }: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  const { slug: variantSlug } = useVariant();
  const shortcut = PRODUCT_SHORTCUTS[product.id];
  const item = (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`)}
      label={product.label}
      shortLabel={product.shortLabel ?? product.label}
      IconComponent={IconComponent}
      active={active}
      wide={wide}
    />
  );
  if (!shortcut) return item;
  return (
    <RailTooltip label={`Go to ${product.label}`} shortcut={shortcut}>
      {item}
    </RailTooltip>
  );
}

interface PlatformUtilityRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  shortcut?: string;
}

function PlatformUtilityRailItem({
  assignRef,
  utility,
  active,
  wide,
  shortcut,
}: PlatformUtilityRailItemProps) {
  const IconComponent = resolveIcon(utility.icon);
  const { slug: variantSlug } = useVariant();
  if (utility.externalUrl) {
    return (
      <ExternalRailItem
        assignRef={assignRef}
        href={utility.externalUrl}
        label={utility.label}
        shortLabel={utility.shortLabel ?? utility.label}
        IconComponent={IconComponent}
        wide={wide}
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
        wide={wide}
      />
    );
  }
  return (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${utility.id}/${utility.defaultLandingId}`)}
      label={utility.label}
      shortLabel={utility.shortLabel ?? utility.label}
      IconComponent={IconComponent}
      active={active}
      wide={wide}
      tooltipLabel={shortcut ? `Go to ${utility.label}` : undefined}
      shortcut={shortcut}
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
  wide,
}: UtilityDropdownRailItemProps) {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const featureItems = utility.sidebar.filter(
    (n): n is Extract<typeof n, { type: 'feature' }> => n.type === 'feature',
  );
  const isAvatar = utility.id === 'user';
  const initials = isAvatar ? getInitials(utility.label) : null;

  const avatarNode = (
    <span
      className="flex h-36 w-36 items-center justify-center rounded-full"
      style={{ color: 'var(--color-text-primary)' }}
    >
      <Text size="sm" weight="medium" color="inherit">
        {initials}
      </Text>
    </span>
  );

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
          className={
            wide
              ? 'flex h-40 w-full items-center rounded-md text-left transition-colors'
              : 'flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors'
          }
          style={{
            backgroundColor: active
              ? 'var(--color-bg-primary)'
              : hovered
                ? 'var(--color-bg-light-primary)'
                : undefined,
            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {wide ? (
            <>
              <span
                className="flex shrink-0 items-center justify-center"
                style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
              >
                {isAvatar
                  ? avatarNode
                  : IconComponent
                    ? <IconComponent size="md" aria-hidden />
                    : null}
              </span>
              <span className="ml-6 truncate" style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
                  {utility.label}
                </Text>
              </span>
            </>
          ) : isAvatar ? (
            avatarNode
          ) : (
            <>
              {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
              <Text size="xs" color="inherit" align="center" lineHeight="tight">
                {utility.shortLabel ?? utility.label}
              </Text>
            </>
          )}
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

interface RecentRailItemProps extends CommonItemProps {
  IconComponent: IconComponent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcut?: string;
}

function RecentRailItem({
  assignRef,
  IconComponent,
  open,
  onOpenChange,
  wide,
  shortcut,
}: RecentRailItemProps) {
  const [hovered, setHovered] = useState(false);
  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        ref={assignRef as (node: HTMLButtonElement | null) => void}
        type="button"
        aria-label="Recent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={
          wide
            ? 'flex h-40 w-full items-center rounded-md text-left transition-colors'
            : 'flex w-full flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors'
        }
        style={{
          backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
          color: 'var(--color-text-secondary)',
        }}
      >
        {wide ? (
          <>
            <span
              className="flex shrink-0 items-center justify-center"
              style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
            >
              <IconComponent size="md" aria-hidden />
            </span>
            <span className="ml-6 truncate" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
                Recent
              </Text>
            </span>
          </>
        ) : (
          <>
            <IconComponent size="md" aria-hidden />
            <Text size="xs" color="inherit" align="center" lineHeight="tight">
              Recent
            </Text>
          </>
        )}
      </button>
    </DropdownMenuTrigger>
  );
  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect
      positioning={{ placement: 'right-start', gutter: 8 }}
    >
      {shortcut ? (
        <RailTooltip label="Open Recent" shortcut={shortcut}>
          {trigger}
        </RailTooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent className="w-[200px]" style={{ width: 200 }}>
        <RecentsMenuItems onItemSelect={() => onOpenChange(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ExternalRailItemProps extends CommonItemProps {
  href: string;
  label: string;
  shortLabel: string;
  IconComponent?: IconComponent;
}

function ExternalRailItem({
  assignRef,
  href,
  label,
  shortLabel,
  IconComponent,
  wide,
}: ExternalRailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        wide
          ? 'flex h-40 items-center rounded-md transition-colors'
          : 'flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {wide ? (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          </span>
          <span className="ml-6 truncate" style={{ whiteSpace: 'nowrap' }}>
            <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
              {label}
            </Text>
          </span>
        </>
      ) : (
        <>
          {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          <Text size="xs" color="inherit" align="center" lineHeight="tight">
            {shortLabel}
          </Text>
        </>
      )}
    </a>
  );
}

interface WideToggleItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
  wide: boolean;
  onToggle: () => void;
}

function WideToggleItem({ assignRef, wide, onToggle }: WideToggleItemProps) {
  const [hovered, setHovered] = useState(false);
  const button = (
    <button
      ref={assignRef as (node: HTMLButtonElement | null) => void}
      type="button"
      aria-label="Toggle wide labels"
      aria-pressed={wide}
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        wide
          ? 'flex h-40 w-full items-center rounded-md text-left transition-colors'
          : 'flex w-full flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {wide ? (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            <PanelLeftDashedIcon size="md" aria-hidden />
          </span>
          <span className="ml-6 truncate" style={{ whiteSpace: 'nowrap' }}>
            <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
              Wide labels
            </Text>
          </span>
        </>
      ) : (
        <>
          <PanelLeftDashedIcon size="md" aria-hidden />
          <Text size="xs" color="inherit" align="center" lineHeight="tight">
            Wide
          </Text>
        </>
      )}
    </button>
  );
  return (
    <RailTooltip
      label={wide ? 'Hide wide labels' : 'Show wide labels'}
      kbd={['⌘', 'B']}
    >
      {button}
    </RailTooltip>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function RailTooltip({
  label,
  shortcut,
  kbd,
  children,
}: {
  label: string;
  shortcut?: string;
  kbd?: string[];
  children: React.ReactNode;
}) {
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
          className="pointer-events-none absolute left-full top-1/2 ml-8 flex -translate-y-1/2 items-center gap-6 whitespace-nowrap rounded-md py-4 px-8"
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
          {shortcut ? (
            <span className="flex items-center gap-4">
              <Kbd>G</Kbd>
              <Text
                size="xs"
                color="inherit"
                lineHeight="tight"
                style={{ whiteSpace: 'nowrap', opacity: 0.7 }}
              >
                then
              </Text>
              <Kbd>{shortcut}</Kbd>
            </span>
          ) : null}
          {kbd ? (
            <span className="flex items-center gap-4">
              {kbd.map((k, i) => (
                <Kbd key={`${k}-${i}`}>{k}</Kbd>
              ))}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center rounded font-mono"
      style={{
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        fontSize: 10,
        lineHeight: 1,
        fontWeight: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        color: 'inherit',
      }}
    >
      {children}
    </kbd>
  );
}

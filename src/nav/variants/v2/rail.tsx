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
  Pin as PinIcon,
  PinOff as PinOffIcon,
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
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { Z_RAIL_OVERLAY } from '@/nav/z-index';

const RAIL_COLLAPSED_PX = 64;
const RAIL_EXPANDED_PX = 192;
// Icon column: narrow enough to sit close to the label, wide enough to hold
// the user-avatar circle (28px). Icons (20px md) center inside; avatars fill.
// The 10px left margin keeps the icon's visual center at x=32 from the rail's
// left edge — matches the collapsed state so icons don't jump on expand.
const ICON_COL_WIDTH = 28;
const ICON_COL_LEFT = 10;
const OPEN_DELAY_MS = 80;
const CLOSE_DELAY_MS = 200;
const WIDTH_TRANSITION_MS = 180;
const LABEL_FADE_MS = 120;

const PIN_STORAGE_PREFIX = 'nav:v:';
const PIN_STORAGE_SUFFIX = ':rail-pinned';

const RECENT_HOVER_ID = 'recent';

type IconComponent = React.ComponentType<{
  size?: 'sm' | 'md';
  'aria-hidden'?: boolean;
}>;

function readPinned(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(`${PIN_STORAGE_PREFIX}${slug}${PIN_STORAGE_SUFFIX}`);
    return raw ? (JSON.parse(raw) as boolean) === true : false;
  } catch {
    return false;
  }
}

function writePinned(slug: string, value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${PIN_STORAGE_PREFIX}${slug}${PIN_STORAGE_SUFFIX}`;
    if (value) window.localStorage.setItem(key, JSON.stringify(true));
    else window.localStorage.removeItem(key);
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

export function Rail() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();
  const prefersReducedMotion = usePrefersReducedMotion();

  const segments = pathname.split('/').filter(Boolean);
  const productSlot = segments[2];
  const activeId = productSlot ?? 'home';

  // Pin: read synchronously on mount via init function so first paint is
  // expanded if the user previously pinned. Avoids collapse-flash.
  const [pinned, setPinned] = useState<boolean>(() => readPinned(variantSlug));
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);
  /**
   * Set briefly when the rail collapses due to a navigation. Radix dropdowns
   * restore focus to their trigger when a menu item is picked — which lands
   * focus back inside the rail and would re-trigger the focus-in handler.
   * The flag tells the focus-in handler to ignore that event and stay
   * collapsed.
   */
  const suppressFocusInRef = useRef(false);
  const suppressFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expanded = pinned || hoverOpen || focusOpen;
  const menuOpen = recentOpen;

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const cancelOpen = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    if (pinned || menuOpen) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHoverOpen(false);
      hideTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [pinned, menuOpen]);

  const requestExpand = useCallback(() => {
    cancelHide();
    if (hoverOpen || pinned) return;
    if (openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      setHoverOpen(true);
      openTimerRef.current = null;
    }, OPEN_DELAY_MS);
  }, [hoverOpen, pinned, cancelHide]);

  const handleRailMouseEnter = useCallback(() => {
    requestExpand();
  }, [requestExpand]);

  const handleRailMouseLeave = useCallback(() => {
    cancelOpen();
    scheduleHide();
  }, [cancelOpen, scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (suppressFocusInRef.current) return;
    cancelHide();
    setFocusOpen(true);
  }, [cancelHide]);

  const handleFocusOut = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget as Node | null;
      if (next && railRef.current && railRef.current.contains(next)) return;
      // Tab out → close after CLOSE_DELAY_MS (matches mouse close).
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setFocusOpen(false);
        hideTimerRef.current = null;
      }, CLOSE_DELAY_MS);
    },
    [],
  );

  // Cleanup timers on unmount.
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (suppressFocusTimerRef.current) clearTimeout(suppressFocusTimerRef.current);
    };
  }, []);

  // Build the focusable item list once per render so arrow keys can navigate.
  // Order: Home, Recent, products, utilities, pin (when expanded).
  // Pin is included in arrow navigation so keyboard users can reach it.
  const focusableCount =
    1 /* home */ + 1 /* recent */ + products.length + utilities.length + (expanded ? 1 : 0);
  itemRefs.current = itemRefs.current.slice(0, focusableCount);

  const handleRailKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Esc collapses; if pinned, unpin-and-collapse in one keystroke.
        if (pinned) {
          writePinned(variantSlug, false);
          setPinned(false);
        }
        setFocusOpen(false);
        setHoverOpen(false);
        // Move focus out of the rail so the user lands back on canvas.
        if (railRef.current && document.activeElement instanceof HTMLElement) {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }
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
    [pinned, variantSlug],
  );

  // After a navigation selection (rail item click or dropdown menu pick),
  // collapse to the icon-only rest state so the user can see the second-tier
  // sidebar without first moving the cursor off the rail. Pin survives —
  // a pinned user explicitly opted into the always-expanded state.
  const collapseRail = useCallback(() => {
    cancelOpen();
    cancelHide();
    setHoverOpen(false);
    setFocusOpen(false);
    // Suppress the next ~150ms of focus-in events so a dropdown's focus
    // restore-to-trigger doesn't re-expand the rail.
    suppressFocusInRef.current = true;
    if (suppressFocusTimerRef.current) clearTimeout(suppressFocusTimerRef.current);
    suppressFocusTimerRef.current = setTimeout(() => {
      suppressFocusInRef.current = false;
      suppressFocusTimerRef.current = null;
    }, 150);
  }, [cancelOpen, cancelHide]);

  const togglePin = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      writePinned(variantSlug, next);
      if (next) {
        // Cancel any pending close so pin wins immediately.
        cancelHide();
      } else {
        // Unpinning: drop focus-driven expansion AND blur the pin button so a
        // subsequent mouseleave collapses the rail. Without this, focus stays
        // on the (just-clicked) pin button → focusOpen sticks at true → rail
        // never collapses until the user clicks outside.
        setFocusOpen(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
      return next;
    });
  }, [variantSlug, cancelHide]);

  const railWidth = expanded ? RAIL_EXPANDED_PX : RAIL_COLLAPSED_PX;
  const widthTransition = prefersReducedMotion
    ? 'none'
    : `width ${WIDTH_TRANSITION_MS}ms ease-out`;

  // Roving ref assigner.
  let refIndex = -1;
  const assignRef = (node: HTMLAnchorElement | HTMLButtonElement | null) => {
    refIndex += 1;
    itemRefs.current[refIndex] = node;
  };
  // Reset on each render — tracking by allocation order.
  refIndex = -1;

  return (
    <>
      {/*
       * Spacer in document flow. Width tracks the rail's *committed* state:
       * pinned → 240px so the rest of the layout shifts right (Intercom-style);
       * unpinned → 64px so a transient hover-expand overlays without pushing.
       * Width transitions in lockstep with the rail itself.
       */}
      <div
        aria-hidden
        className="shrink-0"
        style={{
          width: pinned ? RAIL_EXPANDED_PX : RAIL_COLLAPSED_PX,
          transition: widthTransition,
        }}
      />
      <nav
        ref={railRef}
        aria-label="Global root navigation"
        aria-expanded={expanded}
        onMouseEnter={handleRailMouseEnter}
        onMouseLeave={handleRailMouseLeave}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        onKeyDown={handleRailKeyDown}
        className="absolute left-0 top-0 bottom-0 flex flex-col justify-between border-r py-12"
        style={{
          width: railWidth,
          backgroundColor: 'var(--color-bg-surface-1)',
          borderColor: 'var(--color-border-primary-light)',
          transition: widthTransition,
          zIndex: Z_RAIL_OVERLAY,
          overflow: 'hidden',
        }}
      >
        <div
          className="flex flex-1 flex-col items-stretch gap-4 px-8"
          data-stack="products"
        >
          <RailItem
            assignRef={assignRef}
            href={variantHomePath(variantSlug)}
            label="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
            expanded={expanded}
            prefersReducedMotion={prefersReducedMotion}
            onNavigate={collapseRail}
          />
          <RecentRailItem
            assignRef={assignRef}
            IconComponent={HistoryIcon}
            open={recentOpen}
            onOpenChange={setRecentOpen}
            expanded={expanded}
            prefersReducedMotion={prefersReducedMotion}
            onNavigate={collapseRail}
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
              expanded={expanded}
              prefersReducedMotion={prefersReducedMotion}
              onNavigate={collapseRail}
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
              expanded={expanded}
              prefersReducedMotion={prefersReducedMotion}
              onMenuOpenChange={(open) => {
                // Suppress close timer while a utility dropdown is open by
                // re-using recentOpen as the menu-open flag is only Recent in
                // this prototype. Utility dropdowns are short-lived so we
                // simply cancel any pending close while the menu is open.
                if (open) cancelHide();
              }}
              onNavigate={collapseRail}
            />
          ))}
        </div>

        {/*
         * Pin: tiny corner overlay. Rendered LAST so it paints above the
         * first item's hover/active background without z-index gymnastics.
         * Z-index added defensively in case future stacking contexts shift.
         * 20×20 hit target with a 16px ("sm") icon — small enough to read as
         * a meta-control rather than a navigation item.
         */}
        {expanded ? (
          <button
            type="button"
            ref={assignRef}
            aria-pressed={pinned}
            aria-label={pinned ? 'Unpin navigation' : 'Pin navigation'}
            title={pinned ? 'Unpin navigation' : 'Pin navigation'}
            onClick={togglePin}
            className="absolute flex items-center justify-center rounded-sm transition-colors"
            style={{
              top: 6,
              right: 6,
              width: 20,
              height: 20,
              zIndex: 1,
              backgroundColor: pinned ? 'var(--color-bg-light-primary)' : 'transparent',
              color: pinned
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
              opacity: prefersReducedMotion ? 1 : 1,
              transition: prefersReducedMotion
                ? 'none'
                : `opacity ${LABEL_FADE_MS}ms ease-out ${WIDTH_TRANSITION_MS - LABEL_FADE_MS}ms`,
            }}
            onMouseEnter={(e) => {
              if (!pinned) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!pinned) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            {pinned ? (
              <PinOffIcon size="sm" aria-hidden />
            ) : (
              <PinIcon size="sm" aria-hidden />
            )}
          </button>
        ) : null}
      </nav>
    </>
  );
}

interface CommonItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
  expanded: boolean;
  prefersReducedMotion: boolean;
  /** Called after a navigation selection so the rail can collapse to rest. */
  onNavigate?: () => void;
}

interface RailItemProps extends CommonItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
  active: boolean;
}

function RailItem({
  assignRef,
  href,
  label,
  IconComponent,
  active,
  expanded,
  prefersReducedMotion,
  onNavigate,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex h-40 items-center rounded-md transition-colors"
      style={{
        backgroundColor: active
          ? 'var(--color-bg-primary)'
          : hovered
            ? 'var(--color-bg-light-primary)'
            : undefined,
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
      >
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </span>
      <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
        {label}
      </RailLabel>
    </Link>
  );
}

interface ProductRailItemProps extends CommonItemProps {
  product: ProductManifest;
  active: boolean;
}

function ProductRailItem({
  assignRef,
  product,
  active,
  expanded,
  prefersReducedMotion,
  onNavigate,
}: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  const { slug: variantSlug } = useVariant();
  return (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`)}
      label={product.label}
      IconComponent={IconComponent}
      active={active}
      expanded={expanded}
      prefersReducedMotion={prefersReducedMotion}
      onNavigate={onNavigate}
    />
  );
}

interface PlatformUtilityRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

function PlatformUtilityRailItem({
  assignRef,
  utility,
  active,
  expanded,
  prefersReducedMotion,
  onMenuOpenChange,
  onNavigate,
}: PlatformUtilityRailItemProps) {
  const IconComponent = resolveIcon(utility.icon);
  const { slug: variantSlug } = useVariant();
  if (utility.externalUrl) {
    return (
      <ExternalRailItem
        assignRef={assignRef}
        href={utility.externalUrl}
        label={utility.label}
        IconComponent={IconComponent}
        expanded={expanded}
        prefersReducedMotion={prefersReducedMotion}
        onNavigate={onNavigate}
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
        expanded={expanded}
        prefersReducedMotion={prefersReducedMotion}
        onOpenChange={onMenuOpenChange}
        onNavigate={onNavigate}
      />
    );
  }
  return (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${utility.id}/${utility.defaultLandingId}`)}
      label={utility.label}
      IconComponent={IconComponent}
      active={active}
      expanded={expanded}
      prefersReducedMotion={prefersReducedMotion}
      onNavigate={onNavigate}
    />
  );
}

interface UtilityDropdownRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  IconComponent?: IconComponent;
  active: boolean;
  onOpenChange: (open: boolean) => void;
}

function UtilityDropdownRailItem({
  assignRef,
  utility,
  IconComponent,
  active,
  expanded,
  prefersReducedMotion,
  onOpenChange,
  onNavigate,
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
      onOpenChange={(o) => {
        setOpen(o);
        onOpenChange(o);
      }}
      closeOnSelect
      positioning={{ placement: 'right-end', gutter: 8 }}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={assignRef as (node: HTMLButtonElement | null) => void}
          type="button"
          aria-label={utility.label}
          aria-current={active ? 'page' : undefined}
          title={utility.label}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-40 items-center rounded-md transition-colors"
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
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
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
          </span>
          <RailLabel
            expanded={expanded}
            prefersReducedMotion={prefersReducedMotion}
          >
            {utility.label}
          </RailLabel>
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
                onNavigate?.();
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

function ExternalRailItem({
  assignRef,
  href,
  label,
  IconComponent,
  expanded,
  prefersReducedMotion,
  onNavigate,
}: ExternalRailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      title={`${label} (opens in new tab)`}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex h-40 items-center rounded-md transition-colors"
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
      >
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </span>
      <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
        {label}
      </RailLabel>
    </a>
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
  expanded,
  prefersReducedMotion,
  onNavigate,
}: RecentRailItemProps) {
  const [hovered, setHovered] = useState(false);
  // Recent carve-out: this trigger does NOT expand the rail. It bubbles
  // mouseenter to the parent <nav> via DOM, but we stopPropagation so
  // requestExpand is never reached from this item.
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
          title="Recent"
          onMouseEnter={(e) => {
            // Carve-out: don't expand the rail just because Recent is hovered.
            e.stopPropagation();
            setHovered(true);
          }}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-40 items-center rounded-md transition-colors"
          style={{
            backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            <IconComponent size="md" aria-hidden />
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            Recent
          </RailLabel>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <RecentsMenuItems
          onItemSelect={() => {
            onOpenChange(false);
            onNavigate?.();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RailLabelProps {
  expanded: boolean;
  prefersReducedMotion: boolean;
  children: React.ReactNode;
}

function RailLabel({ expanded, prefersReducedMotion, children }: RailLabelProps) {
  return (
    <span
      aria-hidden={!expanded}
      className="ml-6 truncate"
      style={{
        opacity: prefersReducedMotion ? (expanded ? 1 : 0) : expanded ? 1 : 0,
        transition: prefersReducedMotion
          ? 'none'
          : `opacity ${LABEL_FADE_MS}ms ease-out ${WIDTH_TRANSITION_MS - LABEL_FADE_MS}ms`,
        pointerEvents: expanded ? 'auto' : 'none',
        whiteSpace: 'nowrap',
        color: 'inherit',
      }}
    >
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight">
        {children}
      </Text>
    </span>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

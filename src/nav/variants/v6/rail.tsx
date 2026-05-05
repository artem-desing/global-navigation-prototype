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
  Check as CheckIcon,
} from '@wallarm-org/design-system/icons';
import { PanelLeftDashed as PanelLeftDashedIcon } from '@/nav/manifest/custom-icons';
import { Text } from '@wallarm-org/design-system/Text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuLabel,
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
import { Z_RAIL_OVERLAY } from '@/nav/z-index';

type RailMode = 'expanded' | 'collapsed' | 'hover';

const RAIL_COLLAPSED_PX = 64;
const RAIL_EXPANDED_PX = 192;
const ICON_COL_WIDTH = 28;
const ICON_COL_LEFT = 10;
const OPEN_DELAY_MS = 80;
const CLOSE_DELAY_MS = 200;
const WIDTH_TRANSITION_MS = 180;
const LABEL_FADE_MS = 120;
const TOOLTIP_OPEN_DELAY_MS = 300;

const MODE_STORAGE_PREFIX = 'nav:v:';
const MODE_STORAGE_SUFFIX = ':rail-mode';

const LEADER_KEY = 'g';
const LEADER_WINDOW_MS = 1500;

// Single-letter shortcuts assigned by product id. First letters chosen to be
// unique across products. If a future product collides, reassign here.
const PRODUCT_SHORTCUTS: Record<string, string> = {
  edge: 'E',
  'ai-hypervisor': 'A',
  'infra-discovery': 'I',
  testing: 'T',
};

// Utility shortcuts: H = home, R = open Recent menu, S = settings.
const HOME_SHORTCUT = 'H';
const RECENT_SHORTCUT = 'R';
const SETTINGS_SHORTCUT = 'S';

type IconComponent = React.ComponentType<{
  size?: 'sm' | 'md';
  'aria-hidden'?: boolean;
}>;

function readMode(slug: string): RailMode {
  if (typeof window === 'undefined') return 'collapsed';
  try {
    const raw = window.localStorage.getItem(`${MODE_STORAGE_PREFIX}${slug}${MODE_STORAGE_SUFFIX}`);
    if (raw === 'expanded' || raw === 'collapsed' || raw === 'hover') return raw;
  } catch {
    /* fall through */
  }
  return 'collapsed';
}

function writeMode(slug: string, value: RailMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${MODE_STORAGE_PREFIX}${slug}${MODE_STORAGE_SUFFIX}`, value);
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

  const [mode, setMode] = useState<RailMode>(() => readMode(variantSlug));
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);
  const suppressFocusInRef = useRef(false);
  const suppressFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-expand only fires in 'hover' mode. In 'expanded' the rail is always
  // wide; in 'collapsed' it never widens.
  const expanded =
    mode === 'expanded' || (mode === 'hover' && (hoverOpen || focusOpen));
  const menuOpen = recentOpen || controlOpen;

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
    if (mode !== 'hover' || menuOpen) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHoverOpen(false);
      hideTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [mode, menuOpen]);

  const requestExpand = useCallback(() => {
    if (mode !== 'hover') return;
    cancelHide();
    if (hoverOpen) return;
    if (openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      setHoverOpen(true);
      openTimerRef.current = null;
    }, OPEN_DELAY_MS);
  }, [mode, hoverOpen, cancelHide]);

  const handleRailMouseEnter = useCallback(() => {
    requestExpand();
  }, [requestExpand]);

  const handleRailMouseLeave = useCallback(() => {
    cancelOpen();
    scheduleHide();
  }, [cancelOpen, scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (mode !== 'hover') return;
    if (suppressFocusInRef.current) return;
    cancelHide();
    setFocusOpen(true);
  }, [mode, cancelHide]);

  const handleFocusOut = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (mode !== 'hover') return;
      const next = e.relatedTarget as Node | null;
      if (next && railRef.current && railRef.current.contains(next)) return;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setFocusOpen(false);
        hideTimerRef.current = null;
      }, CLOSE_DELAY_MS);
    },
    [mode],
  );

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (suppressFocusTimerRef.current) clearTimeout(suppressFocusTimerRef.current);
    };
  }, []);

  // When mode changes, clean up transient hover/focus state so we don't carry
  // a stuck "expanded" feel from the prior mode.
  useEffect(() => {
    setHoverOpen(false);
    setFocusOpen(false);
    cancelHide();
    cancelOpen();
  }, [mode, cancelHide, cancelOpen]);

  // Leader-key navigation: press G, then within ~1.5s press the product letter.
  // Esc cancels. Ignored while typing into a form field.
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
      // Leader is active — consume the next key.
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelLeader();
        return;
      }
      // Utility shortcuts first.
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
        // After the portal mounts, focus Ark's Menu.Content node and dispatch
        // ArrowDown there. Ark binds its keyboard handler to that element and
        // will set data-highlighted on the first item — the visible "selected
        // row" cue. Simply focusing a menuitem doesn't engage Ark's highlight.
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
    // Capture phase so the leader key fires before Ark UI's portal listeners
    // (e.g. while a Menu is open, Ark would otherwise consume the keydown).
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      cancelLeader();
    };
  }, [products, utilities, router, variantSlug]);

  const focusableCount =
    1 /* home */ + 1 /* recent */ + products.length + utilities.length + 1 /* sidebar control */;
  itemRefs.current = itemRefs.current.slice(0, focusableCount);

  const handleRailKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && mode === 'hover') {
        e.preventDefault();
        setFocusOpen(false);
        setHoverOpen(false);
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
    [mode],
  );

  // After a navigation, collapse 'hover' rail back to rest. Other modes do
  // nothing — they're stable resting states.
  const collapseRail = useCallback(() => {
    if (mode !== 'hover') return;
    cancelOpen();
    cancelHide();
    setHoverOpen(false);
    setFocusOpen(false);
    suppressFocusInRef.current = true;
    if (suppressFocusTimerRef.current) clearTimeout(suppressFocusTimerRef.current);
    suppressFocusTimerRef.current = setTimeout(() => {
      suppressFocusInRef.current = false;
      suppressFocusTimerRef.current = null;
    }, 150);
  }, [mode, cancelOpen, cancelHide]);

  const setModeAndPersist = useCallback(
    (next: RailMode) => {
      setMode(next);
      writeMode(variantSlug, next);
    },
    [variantSlug],
  );

  // Rail is always overlay-positioned (absolute) so the spacer width controls
  // the layout and the rail can transition independently. Spacer width tracks
  // the *committed* state — hover-expansion overlays without pushing.
  const committedWidth = mode === 'expanded' ? RAIL_EXPANDED_PX : RAIL_COLLAPSED_PX;
  const railWidth = expanded ? RAIL_EXPANDED_PX : RAIL_COLLAPSED_PX;
  const widthTransition = prefersReducedMotion
    ? 'none'
    : `width ${WIDTH_TRANSITION_MS}ms ease-out`;

  let refIndex = -1;
  const assignRef = (node: HTMLAnchorElement | HTMLButtonElement | null) => {
    refIndex += 1;
    itemRefs.current[refIndex] = node;
  };
  refIndex = -1;

  // Tooltip behavior:
  // - 'collapsed' mode → labels live in tooltips; show shortcut chip when known.
  // - 'hover' / 'expanded' → no tooltip; expanded labels are inline.
  const tooltipsEnabled = mode === 'collapsed';

  return (
    <>
      <div
        aria-hidden
        className="shrink-0"
        style={{ width: committedWidth, transition: widthTransition }}
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
          // 'hover' mode needs overflow:hidden so labels clip cleanly during
          // the width transition. 'collapsed' must NOT clip — tooltips pop out
          // to the right and would otherwise be cut off. 'expanded' is fully
          // wide so there's nothing to clip.
          overflow: mode === 'hover' ? 'hidden' : 'visible',
        }}
      >
        <div className="flex flex-1 flex-col items-stretch gap-4 px-8" data-stack="products">
          <RailItem
            assignRef={assignRef}
            href={variantHomePath(variantSlug)}
            label="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
            expanded={expanded}
            tooltipsEnabled={tooltipsEnabled}
            prefersReducedMotion={prefersReducedMotion}
            shortcut={HOME_SHORTCUT}
            onNavigate={collapseRail}
          />
          <RecentRailItem
            assignRef={assignRef}
            IconComponent={HistoryIcon}
            open={recentOpen}
            onOpenChange={setRecentOpen}
            expanded={expanded}
            tooltipsEnabled={tooltipsEnabled}
            prefersReducedMotion={prefersReducedMotion}
            shortcut={RECENT_SHORTCUT}
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
              tooltipsEnabled={tooltipsEnabled}
              prefersReducedMotion={prefersReducedMotion}
              shortcut={PRODUCT_SHORTCUTS[p.id]}
              onNavigate={collapseRail}
            />
          ))}
        </div>

        <div
          className="flex flex-col items-stretch gap-4 px-8"
          data-stack="bottom"
        >
          {utilities.map((u) => (
            <PlatformUtilityRailItem
              key={u.id}
              assignRef={assignRef}
              utility={u}
              active={activeId === u.id}
              expanded={expanded}
              tooltipsEnabled={tooltipsEnabled}
              prefersReducedMotion={prefersReducedMotion}
              shortcut={u.id === 'settings' ? SETTINGS_SHORTCUT : undefined}
              onMenuOpenChange={(open) => {
                if (open) cancelHide();
              }}
              onNavigate={collapseRail}
            />
          ))}
          <div
            role="separator"
            aria-orientation="horizontal"
            className="mx-12 mt-8 mb-4 h-[1px]"
            style={{ backgroundColor: 'var(--color-border-primary-light)' }}
          />
          <SidebarControlItem
            assignRef={assignRef}
            mode={mode}
            onSelect={setModeAndPersist}
            open={controlOpen}
            onOpenChange={setControlOpen}
            expanded={expanded}
            tooltipsEnabled={tooltipsEnabled}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </nav>
    </>
  );
}

interface CommonItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
  expanded: boolean;
  tooltipsEnabled: boolean;
  prefersReducedMotion: boolean;
  onNavigate?: () => void;
}

interface RailItemProps extends CommonItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
  active: boolean;
  shortcut?: string;
}

function RailItem({
  assignRef,
  href,
  label,
  IconComponent,
  active,
  expanded,
  tooltipsEnabled,
  prefersReducedMotion,
  shortcut,
  onNavigate,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  const link = (
    <Link
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={tooltipsEnabled ? undefined : label}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        tooltipsEnabled
          ? 'relative flex h-40 w-full items-center justify-center rounded-md transition-colors'
          : 'relative flex h-40 items-center rounded-md transition-colors'
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
      {tooltipsEnabled ? (
        IconComponent ? (
          <IconComponent size="md" aria-hidden />
        ) : null
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            {label}
          </RailLabel>
        </>
      )}
    </Link>
  );
  if (!tooltipsEnabled) return link;
  return (
    <RailTooltip label={`Go to ${label}`} shortcut={shortcut}>
      {link}
    </RailTooltip>
  );
}

interface ProductRailItemProps extends CommonItemProps {
  product: ProductManifest;
  active: boolean;
  shortcut?: string;
}

function ProductRailItem({
  assignRef,
  product,
  active,
  expanded,
  tooltipsEnabled,
  prefersReducedMotion,
  shortcut,
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
      tooltipsEnabled={tooltipsEnabled}
      prefersReducedMotion={prefersReducedMotion}
      shortcut={shortcut}
      onNavigate={onNavigate}
    />
  );
}

interface PlatformUtilityRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  shortcut?: string;
  onMenuOpenChange: (open: boolean) => void;
}

function PlatformUtilityRailItem({
  assignRef,
  utility,
  active,
  expanded,
  tooltipsEnabled,
  prefersReducedMotion,
  shortcut,
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
        tooltipsEnabled={tooltipsEnabled}
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
        tooltipsEnabled={tooltipsEnabled}
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
      tooltipsEnabled={tooltipsEnabled}
      prefersReducedMotion={prefersReducedMotion}
      shortcut={shortcut}
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
  tooltipsEnabled,
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

  const iconNode = isAvatar ? (
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
  ) : null;

  const trigger = (
    <button
      ref={assignRef as (node: HTMLButtonElement | null) => void}
      type="button"
      aria-label={utility.label}
      aria-current={active ? 'page' : undefined}
      title={tooltipsEnabled ? undefined : utility.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        tooltipsEnabled
          ? 'relative flex h-40 w-full items-center justify-center rounded-md transition-colors'
          : 'relative flex h-40 items-center rounded-md transition-colors'
      }
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
      {tooltipsEnabled ? (
        iconNode
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            {iconNode}
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            {utility.label}
          </RailLabel>
        </>
      )}
    </button>
  );

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
      {tooltipsEnabled ? (
        <RailTooltip label={utility.label}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </RailTooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
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
  tooltipsEnabled,
  prefersReducedMotion,
  onNavigate,
}: ExternalRailItemProps) {
  const [hovered, setHovered] = useState(false);
  const link = (
    <a
      ref={assignRef as (node: HTMLAnchorElement | null) => void}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      title={tooltipsEnabled ? undefined : `${label} (opens in new tab)`}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={
        tooltipsEnabled
          ? 'relative flex h-40 w-full items-center justify-center rounded-md transition-colors'
          : 'relative flex h-40 items-center rounded-md transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {tooltipsEnabled ? (
        IconComponent ? (
          <IconComponent size="md" aria-hidden />
        ) : null
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            {label}
          </RailLabel>
        </>
      )}
    </a>
  );
  if (!tooltipsEnabled) return link;
  return <RailTooltip label={`${label} (opens in new tab)`}>{link}</RailTooltip>;
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
  expanded,
  tooltipsEnabled,
  prefersReducedMotion,
  shortcut,
  onNavigate,
}: RecentRailItemProps) {
  const [hovered, setHovered] = useState(false);
  const trigger = (
    <button
      ref={assignRef as (node: HTMLButtonElement | null) => void}
      type="button"
      aria-label="Recent"
      title={tooltipsEnabled ? undefined : 'Recent'}
      onMouseEnter={(e) => {
        // Carve-out: don't expand the rail just because Recent is hovered.
        e.stopPropagation();
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={
        tooltipsEnabled
          ? 'relative flex h-40 w-full items-center justify-center rounded-md transition-colors'
          : 'relative flex h-40 items-center rounded-md transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {tooltipsEnabled ? (
        <IconComponent size="md" aria-hidden />
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            <IconComponent size="md" aria-hidden />
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            Recent
          </RailLabel>
        </>
      )}
    </button>
  );
  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect
      positioning={{ placement: 'right-start', gutter: 8 }}
    >
      {tooltipsEnabled ? (
        <RailTooltip label="Open Recent" shortcut={shortcut}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </RailTooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="w-[200px]" style={{ width: 200 }}>
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

interface SidebarControlItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
  mode: RailMode;
  onSelect: (next: RailMode) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expanded: boolean;
  tooltipsEnabled: boolean;
  prefersReducedMotion: boolean;
}

function SidebarControlItem({
  assignRef,
  mode,
  onSelect,
  open,
  onOpenChange,
  expanded,
  tooltipsEnabled,
  prefersReducedMotion,
}: SidebarControlItemProps) {
  const [hovered, setHovered] = useState(false);
  const trigger = (
    <button
      ref={assignRef as (node: HTMLButtonElement | null) => void}
      type="button"
      aria-label="Sidebar mode"
      title={tooltipsEnabled ? undefined : 'Sidebar mode'}
      onMouseEnter={(e) => {
        // Carve-out: don't expand the rail just because the control is hovered.
        e.stopPropagation();
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={
        tooltipsEnabled
          ? 'relative flex h-40 w-full items-center justify-center rounded-md transition-colors'
          : 'relative flex h-40 items-center rounded-md transition-colors'
      }
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {tooltipsEnabled ? (
        <PanelLeftDashedIcon size="md" aria-hidden />
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: ICON_COL_WIDTH, marginLeft: ICON_COL_LEFT }}
          >
            <PanelLeftDashedIcon size="md" aria-hidden />
          </span>
          <RailLabel expanded={expanded} prefersReducedMotion={prefersReducedMotion}>
            Sidebar
          </RailLabel>
        </>
      )}
    </button>
  );
  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect
      positioning={{ placement: 'right-end', gutter: 8 }}
    >
      {tooltipsEnabled ? (
        <RailTooltip label="Sidebar mode">
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </RailTooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent className="w-[200px]" style={{ width: 200 }}>
        <DropdownMenuLabel>
          <Text size="xs" weight="medium" color="secondary">
            Sidebar mode
          </Text>
        </DropdownMenuLabel>
        <ModeOption
          label="Collapsed"
          selected={mode === 'collapsed'}
          onSelect={() => onSelect('collapsed')}
        />
        <ModeOption
          label="Expand on hover"
          selected={mode === 'hover'}
          onSelect={() => onSelect('hover')}
        />
        <ModeOption
          label="Expanded"
          selected={mode === 'expanded'}
          onSelect={() => onSelect('expanded')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModeOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  // Mirrors the WADS Select Menu visual: selected row gets the
  // `states-primary-active` overlay and a Check icon at the right.
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={selected ? 'bg-states-primary-active' : undefined}
    >
      <DropdownMenuItemContent>
        <DropdownMenuItemText>{label}</DropdownMenuItemText>
      </DropdownMenuItemContent>
      <span className="flex-1" aria-hidden />
      {selected ? (
        <DropdownMenuItemIcon>
          <CheckIcon size="sm" aria-hidden />
        </DropdownMenuItemIcon>
      ) : null}
    </DropdownMenuItem>
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

/**
 * Hover label for rail items in 'collapsed' mode. Implemented locally for the
 * same reason as v3: nesting WADS Tooltip inside a DropdownMenuTrigger asChild
 * breaks Ark anchoring. Renders a label and an optional shortcut chip
 * ("G then E").
 */
function RailTooltip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
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
        </span>
      ) : null}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  // Renders inside the dark tooltip — use a translucent overlay so the chip
  // contrasts with the tooltip bg, and inherit the tooltip's light text color.
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

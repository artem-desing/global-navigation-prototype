'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home as HomeIcon, History as HistoryIcon } from '@wallarm-org/design-system/icons';
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
import { useRouter } from 'next/navigation';
import {
  getManifest,
  getProductManifests,
  getRailUtilityManifests,
} from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { HoverPreview } from './hover-preview';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { SECOND_COLUMN_FOCUS_FLAG } from './second-column';

const RECENT_HOVER_ID = 'recent';

const HOVER_HIDE_DELAY_MS = 150;
const TOOLTIP_OPEN_DELAY_MS = 300;

const LEADER_KEY = 'g';
const LEADER_WINDOW_MS = 1500;

// Single-letter shortcuts assigned by product id. Mirror of v6's table — keep
// in sync if a product letter changes there.
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
  const utilities = getRailUtilityManifests();

  // Leader-key navigation: press G, then within ~1.5s press the product letter.
  // Esc cancels. Ignored while typing into a form field. Mirrors v6.
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
        setHoveredId(RECENT_HOVER_ID);
        // After the portal mounts, focus Ark's Menu.Content node and dispatch
        // ArrowDown there. Ark binds its keyboard handler to that element and
        // will set data-highlighted on the first item.
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
  // Pathname under a variant is `/v/<slug>/<productId>/...`. The third segment
  // (index 2) is the product/utility id; absent → we're on the variant home.
  const segments = pathname.split('/').filter(Boolean);
  const productSlot = segments[2];
  const activeId = productSlot ?? 'home';

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingNavSlot, setPendingNavSlot] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pendingNavSlot === null) return;
    if (productSlot === pendingNavSlot) {
      setHoveredId(null);
      setPendingNavSlot(null);
      return;
    }
    const t = setTimeout(() => {
      setHoveredId(null);
      setPendingNavSlot(null);
    }, 600);
    return () => clearTimeout(t);
  }, [pendingNavSlot, productSlot]);

  const showPreview = (id: string) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHoveredId(id);
  };

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHoveredId(null);
      hideTimerRef.current = null;
    }, HOVER_HIDE_DELAY_MS);
  };

  const cancelHide = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  return (
    <>
      <nav
        aria-label="Global root navigation"
        className="flex w-96 shrink-0 flex-col justify-between border-r py-12"
        style={{
          backgroundColor: 'var(--color-bg-surface-1)',
          borderColor: 'var(--color-border-primary-light)',
        }}
      >
        <div className="flex flex-col items-stretch gap-4 px-8" data-stack="products">
          <RailItem
            href={variantHomePath(variantSlug)}
            label="Home"
            shortLabel="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
            tooltipLabel="Go to Home"
            shortcut={HOME_SHORTCUT}
          />
          <RecentRailItem
            IconComponent={HistoryIcon}
            open={hoveredId === RECENT_HOVER_ID}
            onOpenChange={(o) => {
              if (!o) setHoveredId(null);
            }}
            onTriggerEnter={() => showPreview(RECENT_HOVER_ID)}
            onTriggerLeave={scheduleHide}
            onContentEnter={cancelHide}
            onContentLeave={scheduleHide}
            onItemSelect={() => setHoveredId(null)}
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
              product={p}
              active={activeId === p.id}
              onHoverEnter={() => {
                if (activeId !== p.id) showPreview(p.id);
              }}
              onHoverLeave={scheduleHide}
            />
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-4 px-8" data-stack="platform-utilities">
          {utilities.map((u) => (
            <PlatformUtilityRailItem
              key={u.id}
              utility={u}
              active={activeId === u.id}
              hoveredId={hoveredId}
              shortcut={u.id === 'settings' ? SETTINGS_SHORTCUT : undefined}
              onHoverEnter={() => {
                if (!u.externalUrl && activeId !== u.id) showPreview(u.id);
              }}
              onHoverLeave={scheduleHide}
              onContentEnter={cancelHide}
              onContentLeave={scheduleHide}
              onDropdownClose={() => setHoveredId(null)}
              onItemSelect={() => setHoveredId(null)}
            />
          ))}
        </div>
      </nav>

      {(() => {
        if (!hoveredId || hoveredId === RECENT_HOVER_ID) return null;
        const m = getManifest(hoveredId);
        if (m?.type === 'platform-utility' && m.previewMode === 'dropdown') return null;
        return (
          <HoverPreview
            productId={hoveredId}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
            onFeatureSelect={() => {
              cancelHide();
              setPendingNavSlot(hoveredId);
            }}
          />
        );
      })()}
    </>
  );
}

interface RecentRailItemProps {
  IconComponent: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onItemSelect: () => void;
  shortcut?: string;
}

function RecentRailItem({
  IconComponent,
  open,
  onOpenChange,
  onTriggerEnter,
  onTriggerLeave,
  onContentEnter,
  onContentLeave,
  onItemSelect,
  shortcut,
}: RecentRailItemProps) {
  const [hovered, setHovered] = useState(false);
  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label="Recent"
        onMouseEnter={() => {
          setHovered(true);
          onTriggerEnter();
        }}
        onMouseLeave={() => {
          setHovered(false);
          onTriggerLeave();
        }}
        className="flex w-full flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
        style={{
          backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
          color: 'var(--color-text-secondary)',
        }}
      >
        <IconComponent size="md" aria-hidden />
        <Text size="xs" color="inherit" align="center" lineHeight="tight">
          Recent
        </Text>
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
      <DropdownMenuContent
        onMouseEnter={onContentEnter}
        onMouseLeave={onContentLeave}
        className="w-[200px]"
        style={{ width: 200 }}
      >
        <RecentsMenuItems onItemSelect={onItemSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ProductRailItemProps {
  product: ProductManifest;
  active: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

function ProductRailItem({ product, active, onHoverEnter, onHoverLeave }: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  const { slug: variantSlug } = useVariant();
  const shortcut = PRODUCT_SHORTCUTS[product.id];
  const item = (
    <RailItem
      href={withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`)}
      label={product.label}
      shortLabel={product.shortLabel ?? product.label}
      IconComponent={IconComponent}
      active={active}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    />
  );
  if (!shortcut) return item;
  return (
    <RailTooltip label={`Go to ${product.label}`} shortcut={shortcut}>
      {item}
    </RailTooltip>
  );
}

interface PlatformUtilityRailItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  hoveredId: string | null;
  shortcut?: string;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onDropdownClose: () => void;
  onItemSelect: () => void;
}

function PlatformUtilityRailItem({
  utility,
  active,
  hoveredId,
  shortcut,
  onHoverEnter,
  onHoverLeave,
  onContentEnter,
  onContentLeave,
  onDropdownClose,
  onItemSelect,
}: PlatformUtilityRailItemProps) {
  const IconComponent = resolveIcon(utility.icon);
  const { slug: variantSlug } = useVariant();
  if (utility.externalUrl) {
    return (
      <ExternalRailItem
        href={utility.externalUrl}
        label={utility.label}
        shortLabel={utility.shortLabel ?? utility.label}
        IconComponent={IconComponent}
      />
    );
  }
  if (utility.previewMode === 'dropdown') {
    return (
      <UtilityDropdownRailItem
        utility={utility}
        IconComponent={IconComponent}
        active={active}
        open={hoveredId === utility.id}
        onOpenChange={(o) => {
          if (!o) onDropdownClose();
        }}
        onTriggerEnter={onHoverEnter}
        onTriggerLeave={onHoverLeave}
        onContentEnter={onContentEnter}
        onContentLeave={onContentLeave}
        onItemSelect={onItemSelect}
      />
    );
  }
  return (
    <RailItem
      href={withVariantPrefix(variantSlug, `/${utility.id}/${utility.defaultLandingId}`)}
      label={utility.label}
      shortLabel={utility.shortLabel ?? utility.label}
      IconComponent={IconComponent}
      active={active}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      tooltipLabel={shortcut ? `Go to ${utility.label}` : undefined}
      shortcut={shortcut}
    />
  );
}

interface UtilityDropdownRailItemProps {
  utility: PlatformUtilityManifest;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onItemSelect: () => void;
}

function UtilityDropdownRailItem({
  utility,
  IconComponent,
  active,
  open,
  onOpenChange,
  onTriggerEnter,
  onTriggerLeave,
  onContentEnter,
  onContentLeave,
  onItemSelect,
}: UtilityDropdownRailItemProps) {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const [hovered, setHovered] = useState(false);
  const featureItems = utility.sidebar.filter(
    (n): n is Extract<typeof n, { type: 'feature' }> => n.type === 'feature',
  );
  const isAvatar = utility.id === 'user';
  const initials = isAvatar ? getInitials(utility.label) : null;
  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect
      positioning={{ placement: 'right-end', gutter: 8 }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={utility.label}
          aria-current={active ? 'page' : undefined}
          onMouseEnter={() => {
            setHovered(true);
            onTriggerEnter();
          }}
          onMouseLeave={() => {
            setHovered(false);
            onTriggerLeave();
          }}
          className="flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
          style={{
            backgroundColor: active
              ? 'var(--color-bg-primary)'
              : hovered
                ? 'var(--color-bg-light-primary)'
                : undefined,
            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {isAvatar ? (
            <span
              className="flex h-36 w-36 items-center justify-center rounded-full"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <Text size="sm" weight="medium" color="inherit">
                {initials}
              </Text>
            </span>
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
      <DropdownMenuContent onMouseEnter={onContentEnter} onMouseLeave={onContentLeave}>
        {featureItems.map((feature) => {
          const FeatureIcon = resolveIcon(feature.icon);
          return (
            <DropdownMenuItem
              key={feature.id}
              value={feature.id}
              onSelect={() => {
                onItemSelect();
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

interface RailItemProps {
  href: string;
  label: string;
  shortLabel: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  active: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tooltipLabel?: string;
  shortcut?: string;
}

function RailItem({
  href,
  label,
  shortLabel,
  IconComponent,
  active,
  onMouseEnter,
  onMouseLeave,
  tooltipLabel,
  shortcut,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  const link = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => {
        setHovered(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onMouseLeave?.();
      }}
      className="flex w-full flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
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
      <Text size="xs" color="inherit" align="center" lineHeight="tight">
        {shortLabel}
      </Text>
    </Link>
  );
  if (!shortcut && !tooltipLabel) return link;
  return (
    <RailTooltip label={tooltipLabel ?? label} shortcut={shortcut}>
      {link}
    </RailTooltip>
  );
}

interface ExternalRailItemProps {
  href: string;
  label: string;
  shortLabel: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
}

function ExternalRailItem({ href, label, shortLabel, IconComponent }: ExternalRailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
      style={{
        backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        color: 'var(--color-text-secondary)',
      }}
    >
      {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      <Text size="xs" color="inherit" align="center" lineHeight="tight">
        {shortLabel}
      </Text>
    </a>
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

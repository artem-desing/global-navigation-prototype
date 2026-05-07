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
  getRailUtilityManifests,
} from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';
import { Z_RAIL_OVERLAY } from '@/nav/z-index';

const RAIL_WIDTH_PX = 64;
const TOOLTIP_OPEN_DELAY_MS = 300;

type IconComponent = React.ComponentType<{
  size?: 'sm' | 'md';
  'aria-hidden'?: boolean;
}>;

export function Rail() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getRailUtilityManifests();

  const segments = pathname.split('/').filter(Boolean);
  const productSlot = segments[2];
  const activeId = productSlot ?? 'home';

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
        <RailItem
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
          />
        ))}
      </div>

      <div className="flex flex-col items-stretch gap-4 px-8" data-stack="platform-utilities">
        {utilities.map((u) => (
          <PlatformUtilityRailItem
            key={u.id}
            assignRef={assignRef}
            utility={u}
            active={activeId === u.id}
          />
        ))}
      </div>
    </nav>
  );
}

interface CommonItemProps {
  assignRef: (node: HTMLAnchorElement | HTMLButtonElement | null) => void;
}

interface RailItemProps extends CommonItemProps {
  href: string;
  label: string;
  IconComponent?: IconComponent;
  active: boolean;
}

/**
 * Hover label for rail items. Implemented locally instead of via WADS Tooltip
 * because nesting `TooltipTrigger asChild` inside `DropdownMenuTrigger asChild`
 * (Recent + utility menus) breaks Ark's positioning anchor — the dropdown
 * lands at viewport (0,0). A flat hover-state span sidesteps the asChild chain.
 * Visual styling mirrors WADS Tooltip tokens.
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

function RailItem({ assignRef, href, label, IconComponent, active }: RailItemProps) {
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
  product: ProductManifest;
  active: boolean;
}

function ProductRailItem({ assignRef, product, active }: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  const { slug: variantSlug } = useVariant();
  return (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${product.id}/${product.defaultLandingId}`)}
      label={product.label}
      IconComponent={IconComponent}
      active={active}
    />
  );
}

interface PlatformUtilityRailItemProps extends CommonItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
}

function PlatformUtilityRailItem({
  assignRef,
  utility,
  active,
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
  return (
    <RailItem
      assignRef={assignRef}
      href={withVariantPrefix(variantSlug, `/${utility.id}/${utility.defaultLandingId}`)}
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
      <RailTooltip label={utility.label}>
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
      </RailTooltip>
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
      <RailTooltip label="Recent">
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
      </RailTooltip>
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

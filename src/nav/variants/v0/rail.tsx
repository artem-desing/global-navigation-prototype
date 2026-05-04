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
  getPlatformUtilityManifests,
} from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { useVariant, variantHomePath, withVariantPrefix } from '@/nav/variant-context';
import { HoverPreview } from './hover-preview';
import { RecentsMenuItems } from '@/nav/recents/recents-preview';

const RECENT_HOVER_ID = 'recent';

const HOVER_HIDE_DELAY_MS = 150;

export function Rail() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();
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
          className="flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
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
      <DropdownMenuContent onMouseEnter={onContentEnter} onMouseLeave={onContentLeave}>
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
  return (
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
}

interface PlatformUtilityRailItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  hoveredId: string | null;
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
}

function RailItem({
  href,
  label,
  shortLabel,
  IconComponent,
  active,
  onMouseEnter,
  onMouseLeave,
}: RailItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
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
      {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      <Text size="xs" color="inherit" align="center" lineHeight="tight">
        {shortLabel}
      </Text>
    </Link>
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

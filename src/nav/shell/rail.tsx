'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home as HomeIcon } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { getProductManifests, getPlatformUtilityManifests } from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';

// Collapsed: just enough to center a 24px icon with 8+8 of stack/item padding.
// Expanded: roomy enough to render the longest product label.
export const RAIL_COLLAPSED_WIDTH_PX = 56;
export const RAIL_EXPANDED_WIDTH_PX = 240;
const STACK_PAD_X_PX = 8;
const ITEM_PAD_X_PX = 8;
const ICON_BOX_PX = 24;
const ITEM_HEIGHT_PX = 40;
const ITEM_GAP_PX = 4;

export function Rail() {
  const pathname = usePathname();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();
  const activeId = pathname === '/' ? 'home' : pathname.split('/')[1];

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative shrink-0"
      style={{ width: `${RAIL_COLLAPSED_WIDTH_PX}px` }}
    >
      <nav
        aria-label="Global root navigation"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="absolute inset-y-0 left-0 z-20 flex flex-col justify-between overflow-hidden"
        style={{
          width: `${expanded ? RAIL_EXPANDED_WIDTH_PX : RAIL_COLLAPSED_WIDTH_PX}px`,
          paddingTop: '8px',
          paddingBottom: '8px',
          transition: 'width 150ms ease-out, box-shadow 150ms ease-out',
          backgroundColor: 'var(--color-bg-surface-1)',
          borderRight: '1px solid var(--color-border-primary-light)',
          boxShadow: expanded ? '4px 0 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div
          data-stack="products"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${ITEM_GAP_PX}px`,
            paddingLeft: `${STACK_PAD_X_PX}px`,
            paddingRight: `${STACK_PAD_X_PX}px`,
          }}
        >
          <RailItem
            href="/"
            label="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
            expanded={expanded}
          />
          {products.map((p) => (
            <ProductRailItem
              key={p.id}
              product={p}
              active={activeId === p.id}
              expanded={expanded}
            />
          ))}
        </div>

        <div
          data-stack="platform-utilities"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${ITEM_GAP_PX}px`,
            paddingLeft: `${STACK_PAD_X_PX}px`,
            paddingRight: `${STACK_PAD_X_PX}px`,
          }}
        >
          {utilities.map((u) => (
            <PlatformUtilityRailItem
              key={u.id}
              utility={u}
              active={activeId === u.id}
              expanded={expanded}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

interface ProductRailItemProps {
  product: ProductManifest;
  active: boolean;
  expanded: boolean;
}

function ProductRailItem({ product, active, expanded }: ProductRailItemProps) {
  const IconComponent = resolveIcon(product.icon);
  return (
    <RailItem
      href={`/${product.id}/${product.defaultLandingId}`}
      label={product.label}
      IconComponent={IconComponent}
      active={active}
      expanded={expanded}
    />
  );
}

interface PlatformUtilityRailItemProps {
  utility: PlatformUtilityManifest;
  active: boolean;
  expanded: boolean;
}

function PlatformUtilityRailItem({ utility, active, expanded }: PlatformUtilityRailItemProps) {
  const IconComponent = resolveIcon(utility.icon);
  if (utility.externalUrl) {
    return (
      <ExternalRailItem
        href={utility.externalUrl}
        label={utility.label}
        IconComponent={IconComponent}
        expanded={expanded}
      />
    );
  }
  return (
    <RailItem
      href={`/${utility.id}/${utility.defaultLandingId}`}
      label={utility.label}
      IconComponent={IconComponent}
      active={active}
      expanded={expanded}
    />
  );
}

interface RailItemProps {
  href: string;
  label: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  active: boolean;
  expanded: boolean;
}

const itemBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: `${ITEM_HEIGHT_PX}px`,
  paddingLeft: `${ITEM_PAD_X_PX}px`,
  paddingRight: `${ITEM_PAD_X_PX}px`,
  gap: '8px',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms ease-out, color 150ms ease-out',
};

const iconBoxStyle: React.CSSProperties = {
  display: 'flex',
  width: `${ICON_BOX_PX}px`,
  height: `${ICON_BOX_PX}px`,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
};

const labelStyle = (expanded: boolean): React.CSSProperties => ({
  opacity: expanded ? 1 : 0,
  transition: 'opacity 120ms ease-out',
  pointerEvents: expanded ? 'auto' : 'none',
});

function RailItem({ href, label, IconComponent, active, expanded }: RailItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={expanded ? undefined : label}
      aria-current={active ? 'page' : undefined}
      style={{
        ...itemBaseStyle,
        backgroundColor: active ? 'var(--color-bg-primary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      <span style={iconBoxStyle}>
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </span>
      <span style={labelStyle(expanded)} aria-hidden={!expanded}>
        <Text size="sm" color="inherit">
          {label}
        </Text>
      </span>
    </Link>
  );
}

interface ExternalRailItemProps {
  href: string;
  label: string;
  IconComponent?: React.ComponentType<{ size?: 'sm' | 'md'; 'aria-hidden'?: boolean }>;
  expanded: boolean;
}

function ExternalRailItem({ href, label, IconComponent, expanded }: ExternalRailItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      title={expanded ? undefined : label}
      style={{
        ...itemBaseStyle,
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
      }}
    >
      <span style={iconBoxStyle}>
        {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      </span>
      <span style={labelStyle(expanded)} aria-hidden={!expanded}>
        <Text size="sm" color="inherit">
          {label}
        </Text>
      </span>
    </a>
  );
}

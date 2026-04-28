'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { Home as HomeIcon } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { getProductManifests, getPlatformUtilityManifests } from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type { ProductManifest, PlatformUtilityManifest } from '@/nav/manifest/types';
import { HoverPreview } from './hover-preview';

const HOVER_HIDE_DELAY_MS = 150;

export function Rail() {
  const pathname = usePathname();
  const products = getProductManifests();
  const utilities = getPlatformUtilityManifests();
  const activeId = pathname === '/' ? 'home' : pathname.split('/')[1];

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        className="flex w-80 shrink-0 flex-col justify-between border-r py-12"
        style={{
          backgroundColor: 'var(--color-bg-surface-1)',
          borderColor: 'var(--color-border-primary-light)',
        }}
      >
        <div className="flex flex-col items-stretch gap-4 px-8" data-stack="products">
          <RailItem
            href="/"
            label="Home"
            shortLabel="Home"
            IconComponent={HomeIcon}
            active={activeId === 'home'}
          />
          {products.map((p) => (
            <ProductRailItem
              key={p.id}
              product={p}
              active={activeId === p.id}
              onHoverEnter={() => showPreview(p.id)}
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
              onHoverEnter={() => {
                if (!u.externalUrl) showPreview(u.id);
              }}
              onHoverLeave={scheduleHide}
            />
          ))}
        </div>
      </nav>

      {hoveredId ? (
        <HoverPreview
          productId={hoveredId}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      ) : null}
    </>
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
  return (
    <RailItem
      href={`/${product.id}/${product.defaultLandingId}`}
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
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

function PlatformUtilityRailItem({
  utility,
  active,
  onHoverEnter,
  onHoverLeave,
}: PlatformUtilityRailItemProps) {
  const IconComponent = resolveIcon(utility.icon);
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
  return (
    <RailItem
      href={`/${utility.id}/${utility.defaultLandingId}`}
      label={utility.label}
      shortLabel={utility.shortLabel ?? utility.label}
      IconComponent={IconComponent}
      active={active}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    />
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
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-bg-primary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      <Text size="xs" color="inherit">
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className="flex flex-col items-center justify-center gap-4 rounded-md px-4 py-8 transition-colors"
      style={{
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
      }}
    >
      {IconComponent ? <IconComponent size="md" aria-hidden /> : null}
      <Text size="xs" color="inherit">
        {shortLabel}
      </Text>
    </a>
  );
}

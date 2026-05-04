'use client';

import { Text } from '@wallarm-org/design-system/Text';
import { getManifest } from '@/nav/manifest/registry';
import { useVariant, withVariantPrefix } from '@/nav/variant-context';
import { SidebarTree } from './sidebar-tree';

interface HoverPreviewProps {
  productId: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFeatureSelect: () => void;
}

export function HoverPreview({
  productId,
  onMouseEnter,
  onMouseLeave,
  onFeatureSelect,
}: HoverPreviewProps) {
  const { slug: variantSlug } = useVariant();
  const manifest = getManifest(productId);
  if (!manifest) return null;

  const hrefBuilder = (featureId: string) =>
    withVariantPrefix(variantSlug, `/${manifest.id}/${featureId}`);

  return (
    <aside
      aria-label={`${manifest.label} preview`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // Anchored next to the rail (w-96 = 96px) and below the top bar (h-48).
      // z-10 puts us above the actual second column when one is mounted.
      className="fixed bottom-0 left-96 top-48 z-10 flex w-[256px] flex-col overflow-y-auto border-r py-12 shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex items-baseline justify-between gap-8 px-12 pb-8">
        <Text size="md" weight="medium" color="primary">
          {manifest.shortLabel ?? manifest.label}
        </Text>
        <Text size="xs" color="secondary">
          preview
        </Text>
      </div>
      <SidebarTree
        nodes={manifest.sidebar}
        activeFeatureId={undefined}
        hrefBuilder={hrefBuilder}
        onFeatureSelect={onFeatureSelect}
      />
    </aside>
  );
}

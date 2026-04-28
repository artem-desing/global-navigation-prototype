'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { edgeManifest } from '@/nav/manifest/edge.manifest';
import type { SidebarNode, FeatureNode } from '@/nav/manifest/types';

interface Tab {
  /** Tab value — matches a top-level data-plane sidebar entry id (feature or group). */
  id: string;
  label: string;
  /** Where clicking the tab navigates. Groups land on their first feature child. */
  targetFeatureId: string;
  /** Feature ids that should highlight this tab as active (group children roll up here). */
  featureIds: string[];
}

const dataPlanesNode = edgeManifest.sidebar.find(
  (n): n is Extract<SidebarNode, { type: 'feature' }> =>
    n.type === 'feature' && n.id === 'data-planes',
);

const TABS: Tab[] = (dataPlanesNode?.children ?? [])
  .map((child): Tab | null => {
    if (child.type === 'feature') {
      return {
        id: child.id,
        label: child.label,
        targetFeatureId: child.id,
        featureIds: [child.id],
      };
    }
    if (child.type === 'group') {
      const featureChildren = child.children.filter(
        (c): c is FeatureNode => c.type === 'feature',
      );
      const first = featureChildren[0];
      if (!first) return null;
      return {
        id: child.id,
        label: child.label,
        targetFeatureId: first.id,
        featureIds: featureChildren.map((c) => c.id),
      };
    }
    return null;
  })
  .filter((t): t is Tab => t !== null);

function findFeatureLabel(featureId: string): string {
  for (const child of dataPlanesNode?.children ?? []) {
    if (child.type === 'feature' && child.id === featureId) return child.label;
    if (child.type === 'group') {
      for (const grandchild of child.children) {
        if (grandchild.type === 'feature' && grandchild.id === featureId) {
          return grandchild.label;
        }
      }
    }
  }
  return featureId;
}

export function DataPlaneFrame({
  dataPlaneId,
  activeFeatureId,
  children,
}: {
  dataPlaneId: string;
  activeFeatureId: string;
  /** Page-specific content to render below the segmented control. Defaults to a placeholder. */
  children?: ReactNode;
}) {
  const router = useRouter();

  const activeTabId =
    TABS.find((t) => t.featureIds.includes(activeFeatureId))?.id ?? TABS[0]?.id ?? 'overview';

  const handleChange = (value: string) => {
    const tab = TABS.find((t) => t.id === value);
    if (!tab) return;
    router.push(`/edge/data-planes/${dataPlaneId}/${tab.targetFeatureId}`);
  };

  const featureLabel = findFeatureLabel(activeFeatureId);

  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          {dataPlaneId}
        </Heading>
        <Text color="secondary">Data plane detail</Text>
      </header>

      <SegmentedControl
        value={activeTabId}
        onChange={handleChange}
        aria-label="Data plane sections"
      >
        {TABS.map((t) => (
          <SegmentedControlItem key={t.id} value={t.id}>
            {t.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {children ?? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-md"
          style={{
            backgroundColor: 'var(--color-bg-surface-2)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <Text color="secondary">
            <code>{featureLabel}</code> placeholder content
          </Text>
        </div>
      )}
    </section>
  );
}

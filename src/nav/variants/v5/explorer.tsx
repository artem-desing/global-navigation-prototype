'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
} from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { getProductManifests } from '@/nav/manifest/registry';
import { resolveIcon } from '@/nav/manifest/icons';
import type {
  CategoryNode,
  FeatureNode,
  GroupNode,
  ProductManifest,
  PlatformUtilityManifest,
  SidebarNode,
} from '@/nav/manifest/types';
import { useVariant, withVariantPrefix } from '@/nav/variant-context';
import { deriveTabTitle, type WorkbenchApi } from './tab-store';

const HEADER_HEIGHT = 48;
const RESIZE_HANDLE_PX = 3;

interface ExplorerProps {
  workbench: WorkbenchApi;
  width: number;
  onResize: (width: number) => void;
}

export function Explorer({ workbench, width, onResize }: ExplorerProps) {
  return (
    <aside
      aria-label="Workbench explorer"
      className="relative shrink-0 flex flex-col border-r"
      style={{
        width,
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <header
        className="flex shrink-0 items-center gap-8 border-b px-12"
        style={{
          height: HEADER_HEIGHT,
          borderColor: 'var(--color-border-primary-light)',
        }}
      >
        <Text size="md" weight="medium" color="primary" grow>
          Explorer
        </Text>
      </header>

      <div className="flex-1 overflow-y-auto py-12">
        <ManifestExplorerTree workbench={workbench} />
      </div>

      <ResizeHandle onResize={onResize} currentWidth={width} />
    </aside>
  );
}

function ManifestExplorerTree({ workbench }: { workbench: WorkbenchApi }) {
  const products = getProductManifests();
  // Utilities (Settings, Help, User) live in the activity bar only — no need
  // to duplicate them in the explorer tree where they'd compete with products
  // for hierarchy.
  return (
    <div className="flex flex-col gap-12">
      {products.map((p) => (
        <ProductSection key={p.id} manifest={p} workbench={workbench} />
      ))}
    </div>
  );
}

function ProductSection({
  manifest,
  workbench,
}: {
  manifest: ProductManifest | PlatformUtilityManifest;
  workbench: WorkbenchApi;
}) {
  const [open, setOpen] = useState(true);
  const Chevron = open ? ChevronDownIcon : ChevronRightIcon;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-28 w-full items-center gap-4 px-12 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Chevron size="xs" aria-hidden />
        <span className="uppercase tracking-wide">
          <Text size="xs" weight="medium" color="secondary">
            {manifest.shortLabel ?? manifest.label}
          </Text>
        </span>
      </button>
      {open ? (
        <ExplorerTree
          nodes={manifest.sidebar}
          productId={manifest.id}
          workbench={workbench}
        />
      ) : null}
    </div>
  );
}

interface ExplorerTreeProps {
  nodes: SidebarNode[];
  productId: string;
  workbench: WorkbenchApi;
  depth?: number;
}

function ExplorerTree({ nodes, productId, workbench, depth = 0 }: ExplorerTreeProps) {
  return (
    <ul className="flex flex-col px-8">
      {nodes.map((node) => (
        <ExplorerNode
          key={node.id}
          node={node}
          productId={productId}
          workbench={workbench}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function ExplorerNode({
  node,
  productId,
  workbench,
  depth,
}: {
  node: SidebarNode;
  productId: string;
  workbench: WorkbenchApi;
  depth: number;
}) {
  if (node.type === 'category') return <ExplorerCategory node={node} />;
  if (node.type === 'group')
    return (
      <ExplorerGroup node={node} productId={productId} workbench={workbench} depth={depth} />
    );
  return (
    <ExplorerFeature
      node={node}
      productId={productId}
      workbench={workbench}
      depth={depth}
    />
  );
}

function ExplorerCategory({ node }: { node: CategoryNode }) {
  return (
    <li className="px-8 pt-8 pb-2 uppercase tracking-wide">
      <Text size="xs" weight="medium" color="secondary">
        {node.label}
      </Text>
    </li>
  );
}

function ExplorerGroup({
  node,
  productId,
  workbench,
  depth,
}: {
  node: GroupNode;
  productId: string;
  workbench: WorkbenchApi;
  depth: number;
}) {
  const [open, setOpen] = useState(!node.collapsed);
  const Chevron = open ? ChevronDownIcon : ChevronRightIcon;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-28 w-full items-center gap-6 rounded-md px-8 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Text size="sm" weight="medium" color="inherit" grow>
          {node.label}
        </Text>
        <Chevron size="xs" aria-hidden />
      </button>
      {open ? (
        <div
          className="ml-12 border-l pl-4"
          style={{ borderColor: 'var(--color-border-primary-light)' }}
        >
          <ExplorerTree
            nodes={node.children}
            productId={productId}
            workbench={workbench}
            depth={depth + 1}
          />
        </div>
      ) : null}
    </li>
  );
}

function ExplorerFeature({
  node,
  productId,
  workbench,
  depth,
}: {
  node: FeatureNode;
  productId: string;
  workbench: WorkbenchApi;
  depth: number;
}) {
  const router = useRouter();
  const { slug } = useVariant();
  const Icon = node.icon ? resolveIcon(node.icon) : undefined;
  const showIcon = depth === 0;
  const url = withVariantPrefix(slug, `/${productId}/${node.id}`);
  const isActive =
    workbench.tabs.find((t) => t.id === workbench.activeId)?.url === url;
  const [hovered, setHovered] = useState(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          const tab = workbench.openTab(url, deriveTabTitle(url, slug));
          router.push(tab.url);
        }}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-28 w-full items-center gap-6 rounded-md px-8 text-left transition-colors"
        style={{
          backgroundColor: isActive
            ? 'var(--color-bg-primary)'
            : hovered
              ? 'var(--color-bg-light-primary)'
              : undefined,
          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {showIcon ? (
          <span
            className="flex shrink-0 items-center justify-center"
            style={{ width: 16 }}
          >
            {Icon ? <Icon size="sm" aria-hidden /> : null}
          </span>
        ) : null}
        <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
          {node.label}
        </Text>
        {node.badge ? (
          <span
            className="rounded px-4 py-2 text-[10px] font-medium uppercase"
            style={{
              backgroundColor: 'var(--color-bg-light-brand)',
              color: 'var(--color-text-brand)',
            }}
          >
            {node.badge}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function ResizeHandle({
  onResize,
  currentWidth,
}: {
  onResize: (width: number) => void;
  currentWidth: number;
}) {
  const [hovered, setHovered] = useState(false);
  const draggingRef = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = currentWidth;
    const onMove = (ev: PointerEvent) => {
      onResize(startWidth + (ev.clientX - startX));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  void draggingRef;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute top-0 bottom-0 cursor-col-resize"
      style={{
        right: -Math.floor(RESIZE_HANDLE_PX / 2),
        width: RESIZE_HANDLE_PX,
        backgroundColor: hovered ? 'var(--color-border-brand)' : 'transparent',
        zIndex: 5,
      }}
    />
  );
}

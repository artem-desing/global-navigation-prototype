'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Lock } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import type { SidebarNode, FeatureNode, GroupNode, CategoryNode } from '@/nav/manifest/types';
import { useFlags, isFeatureLocked } from '@/nav/flags';

export interface SidebarTreeProps {
  nodes: SidebarNode[];
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  onFeatureSelect?: () => void;
}

export function SidebarTree({
  nodes,
  activeFeatureId,
  hrefBuilder,
  onFeatureSelect,
}: SidebarTreeProps) {
  return (
    <ul className="flex flex-col gap-2 px-8">
      {nodes.map((node) => (
        <SidebarNodeRenderer
          key={node.id}
          node={node}
          activeFeatureId={activeFeatureId}
          hrefBuilder={hrefBuilder}
          onFeatureSelect={onFeatureSelect}
        />
      ))}
    </ul>
  );
}

interface NodeRendererProps {
  node: SidebarNode;
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  onFeatureSelect?: () => void;
}

function SidebarNodeRenderer({
  node,
  activeFeatureId,
  hrefBuilder,
  onFeatureSelect,
}: NodeRendererProps) {
  if (node.type === 'category') return <CategoryItem node={node} />;
  if (node.type === 'group')
    return (
      <GroupItem
        node={node}
        activeFeatureId={activeFeatureId}
        hrefBuilder={hrefBuilder}
        onFeatureSelect={onFeatureSelect}
      />
    );
  return (
    <FeatureItem
      node={node}
      active={node.id === activeFeatureId}
      hrefBuilder={hrefBuilder}
      onFeatureSelect={onFeatureSelect}
    />
  );
}

function CategoryItem({ node }: { node: CategoryNode }) {
  return (
    <li className="px-8 pt-12 pb-4 uppercase tracking-wide">
      <Text size="xs" weight="medium" color="secondary">
        {node.label}
      </Text>
    </li>
  );
}

function GroupItem({
  node,
  activeFeatureId,
  hrefBuilder,
  onFeatureSelect,
}: {
  node: GroupNode;
  activeFeatureId: string | undefined;
  hrefBuilder: (featureId: string) => string;
  onFeatureSelect?: () => void;
}) {
  const [open, setOpen] = useState(!node.collapsed);
  const [hovered, setHovered] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={open}
        className="flex w-full items-center gap-6 rounded-md px-8 py-6 text-left transition-colors"
        style={{
          color: 'var(--color-text-secondary)',
          backgroundColor: hovered ? 'var(--color-bg-light-primary)' : undefined,
        }}
      >
        <Text size="sm" weight="medium" color="inherit" grow>
          {node.label}
        </Text>
        <Chevron size="xs" aria-hidden />
      </button>
      {open ? (
        <ul
          className="ml-16 flex flex-col gap-2 border-l pl-8"
          style={{ borderColor: 'var(--color-border-primary-light)' }}
        >
          {node.children.map((child) => (
            <SidebarNodeRenderer
              key={child.id}
              node={child}
              activeFeatureId={activeFeatureId}
              hrefBuilder={hrefBuilder}
              onFeatureSelect={onFeatureSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FeatureItem({
  node,
  active,
  hrefBuilder,
  onFeatureSelect,
}: {
  node: FeatureNode;
  active: boolean;
  hrefBuilder: (featureId: string) => string;
  onFeatureSelect?: () => void;
}) {
  const flags = useFlags();
  const locked = isFeatureLocked(node, flags);
  const [hovered, setHovered] = useState(false);
  if (locked) {
    return (
      <li>
        <span
          aria-disabled
          title="This feature requires an upgrade"
          className="flex items-center gap-8 rounded-md px-8 py-6 cursor-not-allowed"
          style={{ color: 'var(--color-text-disable-primary)' }}
        >
          <Text size="sm" color="inherit" grow>
            {node.label}
          </Text>
          <Lock size="xs" aria-label="Locked" style={{ color: 'var(--color-icon-warning)' }} />
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={hrefBuilder(node.id)}
        aria-current={active ? 'page' : undefined}
        onClick={onFeatureSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-8 rounded-md px-8 py-6 transition-colors"
        style={{
          backgroundColor: active
            ? 'var(--color-bg-primary)'
            : hovered
              ? 'var(--color-bg-light-primary)'
              : undefined,
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        <Text size="sm" color="inherit" grow>
          {node.label}
        </Text>
        {node.badge ? (
          <span
            className="rounded px-6 py-2 text-[10px] font-medium uppercase"
            style={{
              backgroundColor: 'var(--color-bg-light-brand)',
              color: 'var(--color-text-brand)',
            }}
          >
            {node.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

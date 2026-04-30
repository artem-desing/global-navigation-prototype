'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { X as XIcon } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import type { WorkbenchApi } from './tab-store';

const TAB_HEIGHT = 36;
const TAB_MIN_WIDTH = 120;
const TAB_MAX_WIDTH = 200;

interface TabStripProps {
  workbench: WorkbenchApi;
}

export function TabStrip({ workbench }: TabStripProps) {
  const router = useRouter();
  const { tabs, activeId } = workbench;

  if (tabs.length === 0) {
    return (
      <div
        role="tablist"
        aria-label="Open tabs"
        className="flex shrink-0 items-end border-b"
        style={{
          height: TAB_HEIGHT,
          backgroundColor: 'var(--color-bg-surface-2)',
          borderColor: 'var(--color-border-primary-light)',
        }}
      />
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Open tabs"
      className="flex shrink-0 items-stretch overflow-x-auto border-b"
      style={{
        height: TAB_HEIGHT,
        backgroundColor: 'var(--color-bg-surface-2)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={isActive}
            onFocus={() => {
              workbench.focusTab(tab.id);
              router.push(tab.url);
            }}
            onClose={() => {
              const nextUrl = workbench.closeTab(tab.id);
              if (nextUrl) router.push(nextUrl);
            }}
          />
        );
      })}
    </div>
  );
}

function Tab({
  tab,
  isActive,
  onFocus,
  onClose,
}: {
  tab: { id: string; url: string; title: string };
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showClose = isActive || hovered;
  return (
    <div
      role="tab"
      aria-selected={isActive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        if (e.button === 1) {
          // Middle-click closes.
          e.preventDefault();
          onClose();
        }
      }}
      onClick={onFocus}
      className="relative flex shrink-0 cursor-pointer items-center gap-6 px-12 transition-colors"
      style={{
        minWidth: TAB_MIN_WIDTH,
        maxWidth: TAB_MAX_WIDTH,
        backgroundColor: isActive
          ? 'var(--color-bg-page-bg)'
          : hovered
            ? 'var(--color-bg-light-primary)'
            : 'var(--color-bg-surface-2)',
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        borderRight: '1px solid var(--color-border-primary-light)',
      }}
    >
      {isActive ? (
        <span
          aria-hidden
          className="absolute left-0 right-0 top-0"
          style={{ height: 2, backgroundColor: 'var(--color-border-brand)' }}
        />
      ) : null}
      <Text size="sm" weight="medium" color="inherit" lineHeight="tight" truncate grow>
        {tab.title}
      </Text>
      <button
        type="button"
        aria-label={`Close ${tab.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="flex shrink-0 items-center justify-center rounded transition-colors"
        style={{
          width: 20,
          height: 20,
          opacity: showClose ? 1 : 0,
          color: 'var(--color-text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-light-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '';
        }}
      >
        <XIcon size="xs" aria-hidden />
      </button>
    </div>
  );
}

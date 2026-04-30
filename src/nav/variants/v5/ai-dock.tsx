'use client';

import { useState } from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  X as XIcon,
} from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Sparkles } from '@/nav/manifest/custom-icons';

const PEEK_HEIGHT = 32;
const EXPANDED_HEIGHT = 320;

export function AIDock() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      aria-label="AI assistant dock"
      className="shrink-0 flex flex-col border-t"
      style={{
        height: expanded ? EXPANDED_HEIGHT : PEEK_HEIGHT,
        backgroundColor: 'var(--color-bg-surface-2)',
        borderColor: 'var(--color-border-primary-light)',
        transition: 'height 180ms ease-out',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full shrink-0 items-center gap-8 px-16 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
        style={{
          height: PEEK_HEIGHT,
          color: 'var(--color-text-secondary)',
        }}
      >
        <Sparkles size="sm" />
        <Text size="sm" weight="medium" color="inherit" lineHeight="tight" grow>
          AI assistant
        </Text>
        <Text size="xs" color="secondary" lineHeight="tight">
          ⌘J
        </Text>
        {expanded ? (
          <ChevronDownIcon size="xs" aria-hidden />
        ) : (
          <ChevronUpIcon size="xs" aria-hidden />
        )}
      </button>
      {expanded ? (
        <div className="flex flex-1 min-h-0">
          <div
            className="flex flex-1 flex-col items-center justify-center gap-8 p-24"
            style={{ backgroundColor: 'var(--color-bg-surface-1)' }}
          >
            <Heading size="md" weight="medium">
              AI assistant
            </Heading>
            <Text size="sm" color="secondary">
              Placeholder for the bottom-docked AI panel.
            </Text>
          </div>
          <div
            className="flex shrink-0 flex-col gap-4 border-l p-16"
            style={{
              width: 280,
              backgroundColor: 'var(--color-bg-surface-2)',
              borderColor: 'var(--color-border-primary-light)',
            }}
          >
            <span className="uppercase tracking-wide">
              <Text size="xs" weight="medium" color="secondary">
                Context
              </Text>
            </span>
            <Text size="sm" color="secondary">
              Active tab path will surface here.
            </Text>
          </div>
        </div>
      ) : null}
      {expanded ? (
        <button
          type="button"
          aria-label="Collapse AI assistant"
          onClick={() => setExpanded(false)}
          className="absolute right-12 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-bg-light-primary)]"
          style={{
            top: 6,
            width: 20,
            height: 20,
            color: 'var(--color-text-secondary)',
          }}
        >
          <XIcon size="xs" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

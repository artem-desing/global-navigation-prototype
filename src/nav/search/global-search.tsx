'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@wallarm-org/design-system/Dialog';
import { DialogContent } from '@wallarm-org/design-system/Dialog';
import { DialogTitle } from '@wallarm-org/design-system/Dialog';
import { Text } from '@wallarm-org/design-system/Text';
import { Kbd } from '@wallarm-org/design-system/Kbd';
import { Search, ChevronRight } from '@wallarm-org/design-system/icons';
import { resolveIcon } from '@/nav/manifest/icons';
import { useVariant } from '@/nav/variant-context';
import {
  buildSearchIndex,
  filterAndRank,
  getProductRoots,
  type SearchItem,
} from './search-index';

const MAX_RESULTS = 30;
const DIALOG_HEIGHT = 520;

interface Section {
  title?: string;
  items: SearchItem[];
}

export interface GlobalSearchProps {
  /** Controlled open state. If omitted, the component manages its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the built-in search-input trigger button — caller renders its own. */
  hideTrigger?: boolean;
}

export function GlobalSearch({
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: GlobalSearchProps = {}) {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(open) : next;
    if (isControlled) onOpenChange?.(resolved);
    else setInternalOpen(resolved);
  };
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildSearchIndex(variantSlug), [variantSlug]);
  const productRoots = useMemo(() => getProductRoots(index), [index]);

  const sections: Section[] = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed === '') {
      return [{ title: 'Suggested', items: productRoots }];
    }
    return [{ items: filterAndRank(index, trimmed).slice(0, MAX_RESULTS) }];
  }, [query, index, productRoots]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-result-index="${highlight}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = flatItems[highlight];
      if (item) {
        e.preventDefault();
        navigate(item.href);
      }
    }
  };

  const isEmptyResults = query.trim() !== '' && flatItems.length === 0;
  let runningIndex = 0;

  return (
    <>
      {hideTrigger ? null : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        className="flex w-full items-center gap-8 rounded-md border px-12 py-6 text-left transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-light-primary)',
          borderColor: 'var(--color-border-primary-light)',
        }}
      >
        <Search size="sm" aria-hidden style={{ color: 'var(--color-icon-secondary)' }} />
        <Text size="sm" color="secondary" grow>
          Global search
        </Text>
        <Kbd size="small">⌘K</Kbd>
      </button>
      )}

      <Dialog open={open} onOpenChange={setOpen} width={640}>
        <DialogContent>
          <DialogTitle>
            <span className="sr-only">Global search</span>
          </DialogTitle>

          <div
            className="flex flex-col"
            style={{ height: DIALOG_HEIGHT }}
          >
            <div
              className="flex shrink-0 items-center gap-12 border-b px-20"
              style={{
                borderColor: 'var(--color-border-primary-light)',
                height: 56,
              }}
            >
              <Search
                size="md"
                aria-hidden
                style={{ color: 'var(--color-icon-secondary)' }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search products and features…"
                aria-label="Search products and features"
                aria-controls="global-search-listbox"
                aria-activedescendant={
                  flatItems[highlight]
                    ? `global-search-result-${highlight}`
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 border-0 bg-transparent text-base outline-none focus:outline-none"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 16,
                  lineHeight: '24px',
                }}
              />
              <Kbd size="small">esc</Kbd>
            </div>

            <div
              ref={listRef}
              id="global-search-listbox"
              role="listbox"
              aria-label="Search results"
              className="flex-1 min-h-0 overflow-y-auto py-8"
            >
              {isEmptyResults ? (
                <EmptyState
                  message={`No matches for “${query.trim()}”.`}
                />
              ) : (
                sections.map((section, sIdx) => (
                  <SectionBlock
                    key={section.title ?? `unnamed-${sIdx}`}
                    title={section.title}
                  >
                    {section.items.map((item) => {
                      const idx = runningIndex++;
                      return (
                        <ResultRow
                          key={item.id}
                          item={item}
                          active={idx === highlight}
                          onMouseEnter={() => setHighlight(idx)}
                          onClick={() => navigate(item.href)}
                          index={idx}
                        />
                      );
                    })}
                  </SectionBlock>
                ))
              )}
            </div>

            <div
              className="flex shrink-0 items-center justify-end gap-12 border-t px-16 py-8"
              style={{
                borderColor: 'var(--color-border-primary-light)',
                backgroundColor: 'var(--color-bg-light-primary)',
              }}
            >
              <FooterHint kbd="↑↓" label="navigate" />
              <FooterHint kbd="↵" label="open" />
              <FooterHint kbd="esc" label="close" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {title ? (
        <div className="px-20 pt-8 pb-4">
          <Text size="xs" color="secondary" weight="medium">
            {title.toUpperCase()}
          </Text>
        </div>
      ) : null}
      {children}
    </div>
  );
}

interface ResultRowProps {
  item: SearchItem;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  index: number;
}

function ResultRow({ item, active, onMouseEnter, onClick, index }: ResultRowProps) {
  const ProductIcon = resolveIcon(item.productIcon);
  const FeatureIcon = resolveIcon(item.featureIcon);
  const Icon = FeatureIcon ?? ProductIcon;
  const isProductRoot = item.breadcrumb.length === 1;

  return (
    <button
      type="button"
      role="option"
      id={`global-search-result-${index}`}
      aria-selected={active}
      data-result-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className="flex w-full items-center gap-12 px-20 py-8 text-left transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-bg-primary)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {Icon ? <Icon size="sm" aria-hidden /> : null}
      <div className="flex flex-1 min-w-0 flex-col gap-2">
        <Text size="sm" color="inherit" weight="medium">
          {item.label}
        </Text>
        {!isProductRoot ? (
          <BreadcrumbTrail labels={item.breadcrumb.slice(0, -1)} />
        ) : (
          <Text size="xs" color="secondary">
            Product · landing page
          </Text>
        )}
      </div>
      {active ? (
        <ChevronRight
          size="xs"
          aria-hidden
          style={{ color: 'var(--color-icon-secondary)' }}
        />
      ) : null}
    </button>
  );
}

function BreadcrumbTrail({ labels }: { labels: string[] }) {
  return (
    <div className="flex items-center gap-4 min-w-0">
      {labels.map((l, i) => (
        <span key={i} className="flex items-center gap-4 min-w-0">
          <Text size="xs" color="secondary">
            {l}
          </Text>
          {i < labels.length - 1 ? (
            <ChevronRight
              size="xs"
              aria-hidden
              style={{ color: 'var(--color-icon-secondary)' }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center px-16 py-24 text-center">
      <Text size="sm" color="secondary">
        {message}
      </Text>
    </div>
  );
}

function FooterHint({ kbd, label }: { kbd: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <Kbd size="small">{kbd}</Kbd>
      <Text size="xs" color="secondary">
        {label}
      </Text>
    </div>
  );
}

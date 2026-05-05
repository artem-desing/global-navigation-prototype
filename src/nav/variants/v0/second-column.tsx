'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronLeft } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Separator } from '@wallarm-org/design-system/Separator';
import { resolveShellContext } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { SidebarTree } from './sidebar-tree';

/**
 * One-shot signal from the rail's leader-key handler: when set, the next
 * SecondColumn render after a pathname change auto-focuses the first feature
 * link so arrow-key nav works immediately.
 */
export const SECOND_COLUMN_FOCUS_FLAG = 'nav:focus-second-column';

export function SecondColumn() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const asideRef = useRef<HTMLElement | null>(null);

  // The column has its own "viewed path" that can drift above the actual URL,
  // so users can click "< back" to walk up the nav tree without changing the
  // page. Drift resets on any pathname change (feature click commit, browser
  // back/forward, breadcrumb, etc.).
  const [viewedPath, setViewedPath] = useState<string | null>(null);
  useEffect(() => {
    setViewedPath(null);
  }, [pathname]);

  // Auto-focus the first feature link when the leader-key handler raised the
  // flag (e.g. after `g+s` or `g+e`). Cleared after consumption.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SECOND_COLUMN_FOCUS_FLAG) !== '1') return;
    sessionStorage.removeItem(SECOND_COLUMN_FOCUS_FLAG);
    const first = asideRef.current?.querySelector<HTMLAnchorElement>(
      'ul a[href]',
    );
    first?.focus();
  }, [pathname]);

  // ArrowUp/Down move focus between feature links inside the column.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = Array.from(
      asideRef.current?.querySelectorAll<HTMLAnchorElement>('ul a[href]') ?? [],
    );
    if (links.length === 0) return;
    const currentIndex = links.findIndex((n) => n === document.activeElement);
    e.preventDefault();
    let next: number;
    if (currentIndex < 0) next = 0;
    else if (e.key === 'ArrowDown') next = (currentIndex + 1) % links.length;
    else next = (currentIndex - 1 + links.length) % links.length;
    links[next].focus();
  };

  const effectivePath = viewedPath ?? pathname;
  const ctx = resolveShellContext(effectivePath, { variantPrefix: `/v/${variantSlug}` });

  if (ctx.mode !== 'product') return null;

  const isScoped = ctx.backHref !== null;

  return (
    <aside
      ref={asideRef}
      aria-label={`${ctx.header} navigation`}
      className="flex w-[256px] shrink-0 flex-col overflow-y-auto border-r"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
      onKeyDown={onKeyDown}
    >
      {isScoped ? (
        <ScopedHeader
          backLabel={ctx.backLabel ?? 'back'}
          title={ctx.header}
          onBack={() => setViewedPath(ctx.backHref)}
        />
      ) : (
        <UnscopedHeader title={ctx.header} />
      )}
      <SidebarTree
        nodes={ctx.sidebar}
        activeFeatureId={ctx.activeFeatureId}
        hrefBuilder={ctx.hrefBuilder}
      />
    </aside>
  );
}

function UnscopedHeader({ title }: { title: string }) {
  return (
    <div className="px-12 pt-12 pb-8">
      <Text size="md" weight="medium" color="primary">
        {title}
      </Text>
    </div>
  );
}

function ScopedHeader({
  backLabel,
  title,
  onBack,
}: {
  backLabel: string;
  title: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 px-12 pt-12 pb-12">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-4 self-start text-left transition-colors hover:underline"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronLeft size="xs" aria-hidden />
          <Text size="xs" color="inherit">
            {backLabel}
          </Text>
        </button>
        <Heading size="md" weight="medium">
          {title}
        </Heading>
      </div>
      <Separator orientation="horizontal" />
      <div className="pt-8" />
    </>
  );
}

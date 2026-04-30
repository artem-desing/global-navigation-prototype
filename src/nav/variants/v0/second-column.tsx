'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Separator } from '@wallarm-org/design-system/Separator';
import { resolveShellContext } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { SidebarTree } from './sidebar-tree';

export function SecondColumn() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });

  if (ctx.mode !== 'product') return null;

  const isScoped = ctx.backHref !== null;

  return (
    <aside
      aria-label={`${ctx.header} navigation`}
      className="flex w-[256px] shrink-0 flex-col overflow-y-auto border-r"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      {isScoped ? (
        <ScopedHeader backHref={ctx.backHref!} backLabel={ctx.backLabel ?? 'back'} title={ctx.header} />
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
  backHref,
  backLabel,
  title,
}: {
  backHref: string;
  backLabel: string;
  title: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 px-12 pt-12 pb-12">
        <Link
          href={backHref}
          className="flex items-center gap-4 transition-colors hover:underline"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronLeft size="xs" aria-hidden />
          <Text size="xs" color="inherit">
            {backLabel}
          </Text>
        </Link>
        <Heading size="md" weight="medium">
          {title}
        </Heading>
      </div>
      <Separator orientation="horizontal" />
      <div className="pt-8" />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resolveShellContext } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { recordRecent } from './store';

export function RecentsTracker() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();

  useEffect(() => {
    const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });
    if (ctx.mode !== 'product') return;
    if (ctx.manifest.type !== 'product') return;
    if (ctx.page.kind === 'redirect' || ctx.page.kind === 'unknown') return;

    const steps = ctx.breadcrumb;
    const productStep = steps[0];
    if (!productStep || productStep.kind !== 'product') return;
    const last = steps[steps.length - 1];
    if (!last) return;

    recordRecent(variantSlug, {
      path: pathname,
      pageLabel: last.label,
      containerLabel: steps.length >= 3 ? steps[steps.length - 2].label : null,
      productLabel: productStep.label,
      productIcon: ctx.manifest.icon,
    });
  }, [pathname, variantSlug]);

  return null;
}

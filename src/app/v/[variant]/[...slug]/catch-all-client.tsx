'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { resolveShellContext } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { DataPlanesPicker } from '@/nav/shell/scope-pickers/data-planes';
import { ServicesPicker } from '@/nav/shell/scope-pickers/services';
import { RoutesPicker } from '@/nav/shell/scope-pickers/routes';
import { PoliciesPicker } from '@/nav/shell/scope-pickers/policies';
import { HeatmapPage } from '@/nav/shell/feature-pages/heatmap';
import { TestSuitesPage } from '@/nav/shell/feature-pages/test-suites';
import { LockedWarning } from '@/nav/shell/feature-pages/locked-warning';
import { settingsFeaturePages } from '@/nav/shell/feature-pages/settings';

export function CatchAllClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });

  // Static export can't perform server-side redirects, so we redirect on the
  // client. Effect runs only when ctx.page actually wants a redirect; while
  // the redirect is pending we render nothing to avoid flash.
  useEffect(() => {
    if (ctx.mode === 'product' && ctx.page.kind === 'redirect') {
      router.replace(ctx.page.target);
    }
  }, [ctx, router]);

  if (ctx.mode === 'home') return null;
  if (ctx.mode === 'unknown') return <NotFound pathname={pathname} />;

  const page = ctx.page;
  if (page.kind === 'redirect') return null;

  if (page.kind === 'scope-picker') {
    return (
      <ScopePickerDispatch
        scopeRequirement={page.scopeRequirement}
        basePath={page.basePath}
        pathname={pathname}
      />
    );
  }

  if (page.kind === 'feature') {
    // Identify the product/utility that owns this feature page. Segments are
    // ['v', '<variant>', '<productId>', ...] under the variant route shape.
    const productOrUtility = pathname.split('/').filter(Boolean)[2];
    if (productOrUtility === 'ai-hypervisor' && page.feature.id === 'heatmap') {
      return <HeatmapPage />;
    }
    if (productOrUtility === 'settings') {
      const SettingsPage = settingsFeaturePages[page.feature.id];
      if (SettingsPage) return <SettingsPage />;
    }
    if (productOrUtility === 'testing' && page.feature.id === 'test-suites') {
      return <TestSuitesPage />;
    }
    return (
      <PlaceholderPage
        title={page.feature.label}
        subtitle={`Placeholder page for \`${page.path}\`.`}
        unlockFlag={page.feature.unlockFlag}
        showLockWarning={Boolean(page.feature.locked)}
      />
    );
  }

  if (page.kind === 'scope-leaf') {
    return (
      <PlaceholderPage
        title={page.scopeName}
        subtitle={`Resource detail for \`${page.scopeRequirement}=${page.resourceId}\` at \`${page.path}\`. Real fields come from the owning team's mock data.`}
        showLockWarning={false}
      />
    );
  }

  return <NotFound pathname={pathname} />;
}

function ScopePickerDispatch({
  scopeRequirement,
  basePath,
  pathname,
}: {
  scopeRequirement: string;
  basePath: string;
  pathname: string;
}) {
  switch (scopeRequirement) {
    case 'dataplane-id':
      return <DataPlanesPicker basePath={basePath} />;
    case 'service-id':
      return <ServicesPicker basePath={basePath} />;
    case 'route-id': {
      const segments = pathname.split('/').filter(Boolean);
      const servicesIdx = segments.indexOf('services');
      const serviceId = servicesIdx >= 0 ? segments[servicesIdx + 1] : undefined;
      if (!serviceId) return <NotFound pathname={pathname} />;
      return <RoutesPicker basePath={basePath} serviceId={serviceId} />;
    }
    case 'policy-id':
      return <PoliciesPicker basePath={basePath} />;
    default:
      return (
        <PlaceholderPage
          title="Scope picker not implemented"
          subtitle={`No picker for scope requirement \`${scopeRequirement}\` in v0.`}
          showLockWarning={false}
        />
      );
  }
}

function PlaceholderPage({
  title,
  subtitle,
  showLockWarning,
  unlockFlag,
}: {
  title: string;
  subtitle: string;
  showLockWarning: boolean;
  unlockFlag?: string;
}) {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          {title}
        </Heading>
        <Text color="secondary">{subtitle}</Text>
      </header>
      {showLockWarning ? <LockedWarning unlockFlag={unlockFlag} /> : null}
    </section>
  );
}

function NotFound({ pathname }: { pathname: string }) {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          Not found
        </Heading>
        <Text color="secondary">
          No route matches <code>{pathname}</code>. Use the rail to navigate.
        </Text>
      </header>
    </section>
  );
}

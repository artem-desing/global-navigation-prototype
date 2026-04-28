import { notFound, redirect } from 'next/navigation';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { resolveShellContext } from '@/nav/url';
import { DataPlanesPicker } from '@/nav/shell/scope-pickers/data-planes';
import { ServicesPicker } from '@/nav/shell/scope-pickers/services';
import { RoutesPicker } from '@/nav/shell/scope-pickers/routes';
import { PoliciesPicker } from '@/nav/shell/scope-pickers/policies';
import { HeatmapPage } from '@/nav/shell/feature-pages/heatmap';
import { LockedWarning } from '@/nav/shell/feature-pages/locked-warning';

interface RouteParams {
  productOrUtility: string;
  path?: string[];
}

export default async function ProductCatchAllPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { productOrUtility, path = [] } = await params;
  const pathname = `/${[productOrUtility, ...path].join('/')}`;
  const ctx = resolveShellContext(pathname);

  if (ctx.mode === 'unknown') notFound();
  if (ctx.mode === 'home') return null; // shouldn't happen here, but be safe

  const page = ctx.page;

  if (page.kind === 'redirect') {
    redirect(page.target);
  }

  if (page.kind === 'scope-picker') {
    return <ScopePickerDispatch
      scopeRequirement={page.scopeRequirement}
      basePath={page.basePath}
      pathname={pathname}
    />;
  }

  if (page.kind === 'feature') {
    // Per-Feature page overrides — keyed by `${productId}/${featureId}` so the
    // shell stays Manifest-driven but specific Features can render bespoke
    // content. Add new entries here as Feature pages get fleshed out.
    if (productOrUtility === 'ai-hypervisor' && page.feature.id === 'heatmap') {
      return <HeatmapPage />;
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

  // Defensive — shouldn't be reached.
  notFound();
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
      // Routes are scoped to a service-id — extract it from the URL.
      // Pattern: /edge/data-planes/<plane>/services/<service-id>/routes
      const segments = pathname.split('/').filter(Boolean);
      const servicesIdx = segments.indexOf('services');
      const serviceId = servicesIdx >= 0 ? segments[servicesIdx + 1] : undefined;
      if (!serviceId) notFound();
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

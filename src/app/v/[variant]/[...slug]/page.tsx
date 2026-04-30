import { CatchAllClient } from './catch-all-client';
import { getProductManifests, getPlatformUtilityManifests } from '@/nav/manifest/registry';
import { getAllVariants } from '@/nav/variants/registry';
import type { SidebarNode } from '@/nav/manifest/types';
import { dataPlanes } from '@/lib/mock-data/data-planes';
import { edgeServices } from '@/lib/mock-data/services';
import { getRoutesByServiceId } from '@/lib/mock-data/routes';
import { edgePolicies } from '@/lib/mock-data/policies';

interface RouteParams {
  variant: string;
  slug: string[];
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const out: RouteParams[] = [];

  for (const variant of getAllVariants()) {
    for (const m of getProductManifests()) {
      out.push({ variant: variant.slug, slug: [m.id] });
      walkSidebar(variant.slug, m.id, m.sidebar, [], out);
    }
    for (const m of getPlatformUtilityManifests()) {
      if (m.externalUrl) continue;
      out.push({ variant: variant.slug, slug: [m.id] });
      walkSidebar(variant.slug, m.id, m.sidebar, [], out);
    }
  }

  return out;
}

function walkSidebar(
  variantSlug: string,
  productId: string,
  sidebar: SidebarNode[],
  prefix: string[],
  out: RouteParams[],
): void {
  for (const node of sidebar) {
    if (node.type === 'category') continue;
    if (node.type === 'group') {
      walkSidebar(variantSlug, productId, node.children, prefix, out);
      continue;
    }

    const featurePath = [...prefix, node.id];
    out.push({ variant: variantSlug, slug: [productId, ...featurePath] });

    if (node.scopeRequirement) {
      const scopeIds = enumerateScopeIds(node.scopeRequirement, prefix);
      for (const scopeId of scopeIds) {
        const scopedPath = [...featurePath, scopeId];
        out.push({ variant: variantSlug, slug: [productId, ...scopedPath] });
        if (node.children && node.children.length > 0) {
          walkSidebar(variantSlug, productId, node.children, scopedPath, out);
        }
      }
    } else if (node.children && node.children.length > 0) {
      walkSidebar(variantSlug, productId, node.children, featurePath, out);
    }
  }
}

function enumerateScopeIds(scopeRequirement: string, prefix: string[]): string[] {
  switch (scopeRequirement) {
    case 'dataplane-id':
      return dataPlanes.map((p) => p.id);
    case 'service-id':
      return edgeServices.map((s) => s.id);
    case 'route-id': {
      const servicesIdx = prefix.indexOf('services');
      const serviceId = servicesIdx >= 0 ? prefix[servicesIdx + 1] : undefined;
      if (!serviceId) return [];
      return getRoutesByServiceId(serviceId).map((r) => r.id);
    }
    case 'policy-id':
      return edgePolicies.map((p) => p.id);
    default:
      return [];
  }
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  await params;
  return <CatchAllClient />;
}

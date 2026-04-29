import type { Manifest, FeatureNode, SidebarNode } from './manifest/types';
import { getManifest } from './manifest/registry';
import { resolveScopeName } from '@/lib/mock-data/scope-resolver';

export type BreadcrumbStep =
  | { kind: 'product'; label: string; href: string }
  | { kind: 'feature'; label: string; href: string; current: boolean }
  | { kind: 'group'; label: string }
  | {
      kind: 'scope-chip';
      label: string;
      href: string;
      clearHref: string;
      /** Type of scope axis (e.g. 'dataplane-id') — drives the swap-menu options. */
      scopeRequirement: string;
      /** Current resource id occupying this scope slot. */
      resourceId: string;
      /** 0-based index into the URL's path segments where this scope id lives. */
      scopeSegmentIndex: number;
    };

export type PageKind =
  | { kind: 'home' }
  | { kind: 'unknown' }
  | { kind: 'redirect'; target: string }
  | { kind: 'scope-picker'; scopeFeature: FeatureNode; scopeRequirement: string; basePath: string }
  | { kind: 'feature'; feature: FeatureNode; path: string }
  | { kind: 'scope-leaf'; scopeRequirement: string; resourceId: string; scopeName: string; path: string };

export type ShellContext =
  | { mode: 'home'; page: { kind: 'home' } }
  | { mode: 'unknown'; page: { kind: 'unknown' } }
  | {
      mode: 'product';
      manifest: Manifest;
      sidebar: SidebarNode[];
      header: string;
      backHref: string | null;
      /** Label of the parent (whatever level we'd go back to) — e.g. "Data planes". */
      backLabel: string | null;
      activeFeatureId: string | undefined;
      hrefBuilder: (featureId: string) => string;
      breadcrumb: BreadcrumbStep[];
      page: PageKind;
    };

export function resolveShellContext(pathname: string): ShellContext {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return { mode: 'home', page: { kind: 'home' } };

  const productId = segments[0];
  const manifest = getManifest(productId);
  if (!manifest) return { mode: 'unknown', page: { kind: 'unknown' } };

  // Initial state — Product home, level-2 sidebar, no scope.
  let sidebar: SidebarNode[] = manifest.sidebar;
  let header = manifest.shortLabel ?? manifest.label;
  let backHref: string | null = null;
  let backLabel: string | null = null;
  let activeFeatureId: string | undefined = undefined;
  let urlSoFar = `/${manifest.id}`;
  const productHref = `/${manifest.id}/${manifest.defaultLandingId}`;
  const breadcrumb: BreadcrumbStep[] = [
    { kind: 'product', label: manifest.shortLabel ?? manifest.label, href: productHref },
  ];
  let page: PageKind = { kind: 'redirect', target: productHref };

  let i = 1;
  while (i < segments.length) {
    const segment = segments[i];
    const feature = findDirectFeature(sidebar, segment);
    if (!feature) return { mode: 'unknown', page: { kind: 'unknown' } };

    const groupAncestors = findGroupAncestorLabels(sidebar, segment) ?? [];
    for (const label of groupAncestors) {
      breadcrumb.push({ kind: 'group', label });
    }

    const isGated = !!feature.scopeRequirement;
    const hasChildren = !!feature.children && feature.children.length > 0;
    const featureUrl = `${urlSoFar}/${segment}`;

    if (isGated) {
      if (i + 1 < segments.length) {
        // Scope is provided.
        const scopeSegment = segments[i + 1];
        const scopeName = resolveScopeName(feature.scopeRequirement!, scopeSegment);
        const scopeUrl = `${featureUrl}/${scopeSegment}`;

        // Per wireframe Frame 77:5341, the gated Feature label is COLLAPSED into the
        // chip — we don't render `Data planes` separately; just `[Production ×]`.
        breadcrumb.push({
          kind: 'scope-chip',
          label: scopeName,
          href: scopeUrl,
          clearHref: featureUrl, // back to the picker
          scopeRequirement: feature.scopeRequirement!,
          resourceId: scopeSegment,
          scopeSegmentIndex: i + 1, // the scope id sits one past the gated feature
        });

        if (feature.children && feature.children.length > 0) {
          // Drill into the gated Feature's children for level-N+1.
          sidebar = feature.children;
          header = scopeName;
          backHref = featureUrl; // < back returns to the scope picker
          backLabel = feature.label; // e.g. "Data planes"
          urlSoFar = scopeUrl;
          activeFeatureId = undefined;
          i += 2;
          continue;
        }

        // Scope leaf: the gated Feature has no children — the resource IS the destination
        // (e.g. `policies/<policy-id>`). Sidebar stays as the parent's, with the gated
        // Feature highlighted; canvas renders the scope-leaf detail page.
        activeFeatureId = feature.id;
        page = {
          kind: 'scope-leaf',
          scopeRequirement: feature.scopeRequirement!,
          resourceId: scopeSegment,
          scopeName,
          path: scopeUrl,
        };
        return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
      } else {
        // Gated but no scope picked yet → render the scope picker page.
        // Sidebar stays as the parent's; the gated Feature is highlighted.
        activeFeatureId = feature.id;
        breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: true });
        page = {
          kind: 'scope-picker',
          scopeFeature: feature,
          scopeRequirement: feature.scopeRequirement!,
          basePath: featureUrl,
        };
        return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
      }
    } else if (hasChildren) {
      // Unscoped drillable Feature.
      if (i + 1 < segments.length) {
        // Drill into the children.
        breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: false });
        sidebar = feature.children!;
        header = feature.label;
        backHref = urlSoFar; // < back to parent sidebar
        backLabel = manifest.shortLabel ?? manifest.label; // best-effort parent label
        urlSoFar = featureUrl;
        activeFeatureId = undefined;
        i += 1;
        continue;
      } else {
        // Landed on a drillable parent — redirect to its first child.
        const defaultChildId = pickDefaultChild(feature);
        if (defaultChildId) {
          page = { kind: 'redirect', target: `${featureUrl}/${defaultChildId}` };
        } else {
          // No children at all — render the feature as a placeholder.
          activeFeatureId = feature.id;
          breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: true });
          page = { kind: 'feature', feature, path: featureUrl };
        }
        return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
      }
    } else {
      // Terminal Feature.
      activeFeatureId = feature.id;
      breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: true });
      page = { kind: 'feature', feature, path: featureUrl };
      return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
    }
  }

  // Fell off the end of segments without hitting a terminal/picker case.
  // This means we just drilled into a sub-sidebar but no further feature was named.
  // → redirect to the first feature in the current sidebar.
  const defaultId = pickFirstFeatureId(sidebar);
  if (defaultId) {
    page = { kind: 'redirect', target: `${urlSoFar}/${defaultId}` };
  }
  return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
}

function finalize(
  manifest: Manifest,
  sidebar: SidebarNode[],
  header: string,
  backHref: string | null,
  backLabel: string | null,
  activeFeatureId: string | undefined,
  urlSoFar: string,
  breadcrumb: BreadcrumbStep[],
  page: PageKind,
): ShellContext {
  return {
    mode: 'product',
    manifest,
    sidebar,
    header,
    backHref,
    backLabel,
    activeFeatureId,
    hrefBuilder: (featureId) => `${urlSoFar}/${featureId}`,
    breadcrumb,
    page,
  };
}

/**
 * Find a Feature directly under the given sidebar tree. Walks Group nodes
 * (which are visual-only) but does NOT recurse into Feature children — those
 * are level-N+1 and live in their own sidebar after a drill.
 */
export function findDirectFeature(nodes: SidebarNode[], featureId: string): FeatureNode | undefined {
  for (const node of nodes) {
    if (node.type === 'feature' && node.id === featureId) return node;
    if (node.type === 'group') {
      const inGroup = findDirectFeature(node.children, featureId);
      if (inGroup) return inGroup;
    }
  }
  return undefined;
}

/**
 * Walks the sidebar tree to find which group(s) wrap the given feature, in
 * order from outermost to innermost. Returns an empty array when the feature
 * sits at the top level (or isn't found). Used by the breadcrumb to surface
 * inline-expandable group ancestors that don't show up as URL segments.
 */
function findGroupAncestorLabels(nodes: SidebarNode[], featureId: string, trail: string[] = []): string[] | undefined {
  for (const node of nodes) {
    if (node.type === 'feature' && node.id === featureId) return trail;
    if (node.type === 'group') {
      const found = findGroupAncestorLabels(node.children, featureId, [...trail, node.label]);
      if (found) return found;
    }
  }
  return undefined;
}

function pickDefaultChild(feature: FeatureNode): string | undefined {
  if (!feature.children) return undefined;
  return pickFirstFeatureId(feature.children);
}

function pickFirstFeatureId(nodes: SidebarNode[]): string | undefined {
  for (const node of nodes) {
    if (node.type === 'feature') return node.id;
    if (node.type === 'group') {
      const inGroup = pickFirstFeatureId(node.children);
      if (inGroup) return inGroup;
    }
  }
  return undefined;
}

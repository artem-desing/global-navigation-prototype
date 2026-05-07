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

export interface ResolveOptions {
  /**
   * Path segment(s) that prefix every resolved URL — e.g. `/v/v0` for the
   * manifest-driven variant. The resolver strips this from `pathname` before
   * walking, then prepends it to every emitted href so chrome links survive
   * the round-trip. Pass an empty string (default) for unprefixed routes.
   */
  variantPrefix?: string;
}

/**
 * True iff the current page renders second-level navigation — i.e. a product
 * (or settings) manifest is in scope and the SecondColumn paints its tree.
 *
 * v8 reads this to drive its rail width: surfaces *without* a second level
 * (variant home, unknown routes, future no-sidebar pages) keep the rail
 * expanded so labels stay visible; surfaces *with* a second level collapse
 * the rail to icons because the work of naming the destination has moved
 * into the SecondColumn. Other variants can adopt the same rule if/when they
 * grow no-sidebar surfaces.
 */
export function hasSecondLevelNav(ctx: ShellContext): boolean {
  return ctx.mode === 'product';
}

export function resolveShellContext(
  pathname: string,
  options: ResolveOptions = {},
): ShellContext {
  const variantPrefix = options.variantPrefix ?? '';
  const variantSegmentCount = variantPrefix
    ? variantPrefix.split('/').filter(Boolean).length
    : 0;

  const stripped =
    variantPrefix && pathname.startsWith(variantPrefix)
      ? pathname.slice(variantPrefix.length) || '/'
      : pathname;
  const segments = stripped.split('/').filter(Boolean);
  if (segments.length === 0) return { mode: 'home', page: { kind: 'home' } };

  const productId = segments[0];
  const manifest = getManifest(productId);
  if (!manifest) return { mode: 'unknown', page: { kind: 'unknown' } };

  // Sidebar / chrome state — what gets shown in the second column. Drives by
  // gated-scope drills only. Once we hit an unscoped feature with children
  // mid-URL we "freeze" this state: deeper segments still resolve into the
  // breadcrumb and canvas, but the sidebar and active highlight stay put.
  let sidebar: SidebarNode[] = manifest.sidebar;
  let header = manifest.shortLabel ?? manifest.label;
  let backHref: string | null = null;
  let backLabel: string | null = null;
  let activeFeatureId: string | undefined = undefined;
  let urlSoFar = `${variantPrefix}/${manifest.id}`;
  let frozen = false;

  // Traversal state — diverges from sidebar after a freeze. Used purely to
  // walk the URL, build the breadcrumb, and resolve the destination page.
  let traversalNodes: SidebarNode[] = manifest.sidebar;
  let traversalUrl = urlSoFar;

  const productHref = `${variantPrefix}/${manifest.id}/${manifest.defaultLandingId}`;
  const breadcrumb: BreadcrumbStep[] = [
    { kind: 'product', label: manifest.shortLabel ?? manifest.label, href: productHref },
  ];
  let page: PageKind = { kind: 'redirect', target: productHref };

  let i = 1;
  while (i < segments.length) {
    const segment = segments[i];
    const feature = findDirectFeature(traversalNodes, segment);
    if (!feature) return { mode: 'unknown', page: { kind: 'unknown' } };

    const groupAncestors = findGroupAncestorLabels(traversalNodes, segment) ?? [];
    for (const label of groupAncestors) {
      breadcrumb.push({ kind: 'group', label });
    }

    const isGated = !!feature.scopeRequirement;
    const hasChildren = !!feature.children && feature.children.length > 0;
    const featureUrl = `${traversalUrl}/${segment}`;

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
          // Index is reported in FULL pathname coordinates (variantPrefix
          // included) so the breadcrumb's swap-menu can splice the URL
          // directly. `i + 1` is the scope id position in the stripped
          // segments; add the variant prefix's segment count to align.
          scopeSegmentIndex: i + 1 + variantSegmentCount,
        });

        if (feature.children && feature.children.length > 0) {
          // Drill into the gated Feature's children for level-N+1 — but only
          // touch the rendered sidebar if we haven't frozen yet.
          if (!frozen) {
            sidebar = feature.children;
            header = scopeName;
            backHref = featureUrl;
            backLabel = feature.label;
            urlSoFar = scopeUrl;
            activeFeatureId = undefined;
          }
          traversalNodes = feature.children;
          traversalUrl = scopeUrl;
          i += 2;
          continue;
        }

        // Scope leaf: the gated Feature has no children — the resource IS the destination
        // (e.g. `policies/<policy-id>`). When not frozen, sidebar stays as the parent's
        // with the gated Feature highlighted; when frozen, the existing active id wins.
        if (!frozen) activeFeatureId = feature.id;
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
        if (!frozen) activeFeatureId = feature.id;
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
      // Unscoped feature with children. Per the chrome rules, this NEVER drills
      // the sidebar — chrome drills are reserved for scope (gated) selection.
      // The first unscoped-with-children we see freezes the sidebar.
      if (i + 1 < segments.length) {
        breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: false });
        if (!frozen) {
          activeFeatureId = feature.id;
          frozen = true;
        }
        traversalNodes = feature.children!;
        traversalUrl = featureUrl;
        i += 1;
        continue;
      } else {
        // Landed on the parent itself — render it as a feature page. We don't
        // auto-redirect into the first child anymore: chrome drills are scope-
        // only, and the user explicitly clicked this level, so this *is* the
        // destination. Freeze the sidebar here so the current chrome stays.
        if (!frozen) {
          activeFeatureId = feature.id;
          frozen = true;
        }
        breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: true });
        page = { kind: 'feature', feature, path: featureUrl };
        return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
      }
    } else {
      // Terminal Feature.
      if (!frozen) activeFeatureId = feature.id;
      breadcrumb.push({ kind: 'feature', label: feature.label, href: featureUrl, current: true });
      page = { kind: 'feature', feature, path: featureUrl };
      return finalize(manifest, sidebar, header, backHref, backLabel, activeFeatureId, urlSoFar, breadcrumb, page);
    }
  }

  // Fell off the end of segments without hitting a terminal/picker case.
  // → redirect to the first feature reachable from the current traversal level.
  const defaultId = pickFirstFeatureId(traversalNodes);
  if (defaultId) {
    page = { kind: 'redirect', target: `${traversalUrl}/${defaultId}` };
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

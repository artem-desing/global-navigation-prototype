import type { ProductManifest } from './types';

// Verbatim from the AI Hypervisor product screenshot Artem shared 2026-04-28
// (see docs/product-features.md). Ten level-2 Features, two with codename badges.
// Heatmap is the default landing.
export const aiHypervisorManifest: ProductManifest = {
  type: 'product',
  id: 'ai-hypervisor',
  label: 'AI Hypervisor',
  shortLabel: 'AI Hypervisor',
  icon: 'memory',
  defaultLandingId: 'heatmap',
  sidebar: [
    { type: 'feature', id: 'heatmap', label: 'Heatmap' },
    { type: 'feature', id: 'registry', label: 'Registry' },
    {
      type: 'group',
      id: 'topology',
      label: 'Topology',
      collapsed: true,
      children: [
        { type: 'feature', id: 'topology-overview', label: 'Overview' },
        { type: 'feature', id: 'topology-services', label: 'Services' },
        {
          type: 'group',
          id: 'topology-graphs',
          label: 'Graphs',
          collapsed: true,
          children: [
            { type: 'feature', id: 'topology-graphs-flow', label: 'Flow graph' },
            { type: 'feature', id: 'topology-graphs-dependency', label: 'Dependency graph' },
            { type: 'feature', id: 'topology-graphs-traffic', label: 'Traffic graph' },
          ],
        },
      ],
    },
    { type: 'feature', id: 'data-tracks', label: 'Data Tracks' },
    { type: 'feature', id: 'user-tracks', label: 'User Tracks' },
    { type: 'feature', id: 'supply-chain', label: 'Supply Chain' },
    { type: 'feature', id: 'enforcement', label: 'Enforcement' },
    { type: 'feature', id: 'integrations', label: 'Integrations' },
    { type: 'feature', id: 'red-team', label: 'Red Team' },
    { type: 'feature', id: 'debugger', label: 'Debugger' },
  ],
};

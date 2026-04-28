import type { ProductManifest } from './types';

// Verbatim from the AI Hypervisor product screenshot Artem shared 2026-04-28
// (see docs/product-features.md). Ten level-2 Features, two with codename badges.
// Heatmap is the default landing.
export const aiHypervisorManifest: ProductManifest = {
  type: 'product',
  id: 'ai-hypervisor',
  label: 'AI Hypervisor',
  shortLabel: 'AI-H',
  icon: 'folder',
  defaultLandingId: 'heatmap',
  sidebar: [
    { type: 'feature', id: 'heatmap', label: 'Heatmap' },
    { type: 'feature', id: 'registry', label: 'Registry' },
    { type: 'feature', id: 'topology', label: 'Topology' },
    { type: 'feature', id: 'data-tracks', label: 'Data Tracks' },
    { type: 'feature', id: 'user-tracks', label: 'User Tracks' },
    { type: 'feature', id: 'supply-chain', label: 'Supply Chain' },
    { type: 'feature', id: 'enforcement', label: 'Enforcement' },
    { type: 'feature', id: 'integrations', label: 'Integrations' },
    { type: 'feature', id: 'red-team', label: 'Red Team', badge: 'β' },
    // 'Ebbers' is the codename label visible in the screenshot — flagged in
    // product-features.md as "clarify with Product team."
    { type: 'feature', id: 'debugger', label: 'Debugger', badge: 'Ebbers' },
  ],
};

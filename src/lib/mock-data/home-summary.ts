// Cross-Product summary fixtures for the Home dashboard. Counts hand-tuned to
// match the rest of the mock-data fixtures (5 data planes, 3 services, etc.)
// so that drilling in from a card lands on a number that lines up.

export const homeSummary = {
  edge: {
    activeDataPlanes: 5,
    totalServices: 3,
    totalRoutes: 6,
    totalPolicies: 4,
    attacksLast24h: 12,
  },
  aiHypervisor: {
    totalAssets: 2479,
    categories: 5,
    shadowAiFindings: 9,
  },
  infraDiscovery: {
    inventoryItems: 217,
    findingsOpen: 8,
  },
  testing: {
    coveragePercent: 87,
    lastRunHoursAgo: 2,
    passRate: 94,
  },
};

export interface ActivityEvent {
  id: string;
  timeAgo: string;
  event: string;
  surface: 'Edge' | 'AI Hypervisor' | 'Infra Discovery' | 'Testing';
  href?: string;
}

export const recentActivity: ActivityEvent[] = [
  {
    id: 'act-1',
    timeAgo: '3m ago',
    event: 'New AI Agent registered: customer-bot-v2',
    surface: 'AI Hypervisor',
    href: '/ai-hypervisor/registry',
  },
  {
    id: 'act-2',
    timeAgo: '12m ago',
    event: 'Rate-limit policy attached to /payments/charge',
    surface: 'Edge',
    href: '/edge/data-planes/production/services/payments-api/routes/payments-charge/policies',
  },
  {
    id: 'act-3',
    timeAgo: '1h ago',
    event: 'Test suite payments-flow-e2e passed (94%)',
    surface: 'Testing',
    href: '/testing/results',
  },
  {
    id: 'act-4',
    timeAgo: '3h ago',
    event: 'Data plane edge-eu pushed config v23',
    surface: 'Edge',
    href: '/edge/data-planes/edge-eu',
  },
  {
    id: 'act-5',
    timeAgo: '5h ago',
    event: 'Shadow AI detected on inventory-api: GPT-4 client',
    surface: 'AI Hypervisor',
    href: '/ai-hypervisor/heatmap',
  },
];

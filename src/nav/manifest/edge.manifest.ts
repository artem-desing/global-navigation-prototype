import type { ProductManifest } from './types';

export const edgeManifest: ProductManifest = {
  type: 'product',
  id: 'edge',
  label: 'Edge',
  shortLabel: 'EDGE',
  icon: 'folder',
  defaultLandingId: 'overview',
  sidebar: [
    { type: 'feature', id: 'overview', label: 'Overview' },
    {
      type: 'feature',
      id: 'data-planes',
      label: 'Data planes',
      scopeRequirement: 'dataplane-id',
      children: [
        { type: 'feature', id: 'overview', label: 'Overview' },
        { type: 'feature', id: 'nodes', label: 'Nodes' },
        {
          type: 'feature',
          id: 'services',
          label: 'Services',
          scopeRequirement: 'service-id',
          children: [
            // Level-4 sidebar inside a selected service-id:
            {
              type: 'feature',
              id: 'routes',
              label: 'Routes',
              scopeRequirement: 'route-id',
              children: [
                // Level-6 sidebar inside a selected route-id:
                { type: 'feature', id: 'flow', label: 'flow' },
                {
                  type: 'feature',
                  id: 'policies',
                  label: 'policies',
                  scopeRequirement: 'policy-id',
                  // Level-8 = the policy-id detail page (terminal — no further sidebar).
                  children: [],
                },
              ],
            },
            {
              type: 'feature',
              id: 'flows',
              label: 'Flows',
              children: [
                // Drillable but unscoped — selecting "Flows" just swaps to pre/post.
                {
                  type: 'feature',
                  id: 'pre-route',
                  label: 'pre-route',
                  children: [
                    {
                      type: 'feature',
                      id: 'policies',
                      label: 'policies',
                      scopeRequirement: 'policy-id',
                      children: [],
                    },
                  ],
                },
                {
                  type: 'feature',
                  id: 'post-route',
                  label: 'post-route',
                  children: [
                    {
                      type: 'feature',
                      id: 'policies',
                      label: 'policies',
                      scopeRequirement: 'policy-id',
                      children: [],
                    },
                  ],
                },
              ],
            },
            { type: 'feature', id: 'setting', label: 'Setting' },
          ],
        },
        { type: 'feature', id: 'govern', label: 'Govern' },
        {
          type: 'group',
          id: 'operations',
          label: 'Operations',
          collapsed: true,
          children: [
            { type: 'feature', id: 'logs', label: 'Logs' },
            { type: 'feature', id: 'metrics', label: 'Metrics' },
            { type: 'feature', id: 'alerts', label: 'Alerts' },
          ],
        },
        { type: 'feature', id: 'routing-rules', label: 'Routing rules' },
        { type: 'feature', id: 'settings', label: 'Settings' },
      ],
    },
    { type: 'feature', id: 'dashboards', label: 'Dashboards' },
    {
      type: 'group',
      id: 'events',
      label: 'Events',
      collapsed: true,
      children: [
        { type: 'feature', id: 'attacks', label: 'Attacks' },
        { type: 'feature', id: 'incidents', label: 'Incidents' },
        { type: 'feature', id: 'security-issues', label: 'Security Issues' },
        { type: 'feature', id: 'api-sessions', label: 'API Sessions' },
      ],
    },
    {
      type: 'group',
      id: 'api-security',
      label: 'API Security',
      collapsed: true,
      children: [
        { type: 'feature', id: 'api-attack-surface', label: 'API Attack Surface' },
        { type: 'feature', id: 'api-discovery', label: 'API Discovery' },
        { type: 'feature', id: 'api-abuse-prevention', label: 'API Abuse Prevention' },
        { type: 'feature', id: 'api-specifications', label: 'API Specifications' },
      ],
    },
    {
      type: 'group',
      id: 'security-controls',
      label: 'Security controls',
      collapsed: true,
      children: [
        { type: 'feature', id: 'ip-session-lists', label: 'IP & Session Lists' },
        { type: 'feature', id: 'triggers', label: 'Triggers' },
        { type: 'feature', id: 'rules', label: 'Rules' },
        { type: 'feature', id: 'mitigation-controls', label: 'Mitigation Controls' },
        { type: 'feature', id: 'credential-stuffing', label: 'Credential Stuffing' },
      ],
    },
    {
      type: 'group',
      id: 'security-testing',
      label: 'Security Testing',
      collapsed: true,
      children: [
        { type: 'feature', id: 'threat-replay', label: 'Threat Replay' },
        { type: 'feature', id: 'schema-based', label: 'Schema-Based' },
      ],
    },
    {
      type: 'group',
      id: 'configuration',
      label: 'Configuration',
      collapsed: true,
      children: [
        { type: 'feature', id: 'nodes', label: 'Nodes' },
        { type: 'feature', id: 'security-edge', label: 'Security Edge', locked: true, unlockFlag: 'securityEdgeUnlocked' },
        { type: 'feature', id: 'integrations', label: 'Integrations' },
      ],
    },
  ],
};

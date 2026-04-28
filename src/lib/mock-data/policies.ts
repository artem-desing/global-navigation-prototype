export interface EdgePolicy {
  id: string;
  name: string;
  type: 'rate-limit' | 'auth' | 'transform' | 'logging';
  enabled: boolean;
}

// Mock global pool. In v0 we attach the same set wherever a `policies` Feature
// renders (per-route, per-pre-route, per-post-route). Real API would scope each.
export const edgePolicies: EdgePolicy[] = [
  { id: 'policy-rate-limit-100rps', name: 'Rate limit — 100 rps', type: 'rate-limit', enabled: true },
  { id: 'policy-auth-jwt', name: 'Auth — JWT validation', type: 'auth', enabled: true },
  { id: 'policy-strip-pii', name: 'Transform — strip PII', type: 'transform', enabled: false },
  { id: 'policy-access-log', name: 'Logging — access log', type: 'logging', enabled: true },
];

const byId: Record<string, EdgePolicy> = Object.fromEntries(
  edgePolicies.map((p) => [p.id, p]),
);

export function getEdgePolicyById(id: string): EdgePolicy | undefined {
  return byId[id];
}

export interface EdgeService {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  hosts: number;
  lastUpdate: string;
}

// Mock — same set across all planes in v0. Real API would be plane-scoped.
export const edgeServices: EdgeService[] = [
  {
    id: 'auth-api',
    name: 'auth-api',
    description: 'Authentication & session management',
    status: 'active',
    hosts: 3,
    lastUpdate: '12 minutes ago',
  },
  {
    id: 'payments-api',
    name: 'payments-api',
    description: 'Payment processing & billing',
    status: 'active',
    hosts: 5,
    lastUpdate: '1 hour ago',
  },
  {
    id: 'inventory-api',
    name: 'inventory-api',
    description: 'Catalog & inventory management',
    status: 'active',
    hosts: 2,
    lastUpdate: '4 hours ago',
  },
];

const byId: Record<string, EdgeService> = Object.fromEntries(
  edgeServices.map((s) => [s.id, s]),
);

export function getEdgeServiceById(id: string): EdgeService | undefined {
  return byId[id];
}

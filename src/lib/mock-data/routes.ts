export interface EdgeRoute {
  id: string;
  serviceId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  policiesAttached: number;
}

export const edgeRoutes: EdgeRoute[] = [
  // auth-api
  { id: 'auth-login', serviceId: 'auth-api', path: '/login', method: 'POST', policiesAttached: 2 },
  { id: 'auth-logout', serviceId: 'auth-api', path: '/logout', method: 'POST', policiesAttached: 1 },
  // payments-api
  { id: 'payments-charge', serviceId: 'payments-api', path: '/charge', method: 'POST', policiesAttached: 3 },
  { id: 'payments-refund', serviceId: 'payments-api', path: '/refund', method: 'POST', policiesAttached: 2 },
  // inventory-api
  { id: 'inventory-list', serviceId: 'inventory-api', path: '/items', method: 'GET', policiesAttached: 1 },
  { id: 'inventory-update', serviceId: 'inventory-api', path: '/items/:id', method: 'PUT', policiesAttached: 2 },
];

const byId: Record<string, EdgeRoute> = Object.fromEntries(
  edgeRoutes.map((r) => [r.id, r]),
);

export function getEdgeRouteById(id: string): EdgeRoute | undefined {
  return byId[id];
}

export function getRoutesByServiceId(serviceId: string): EdgeRoute[] {
  return edgeRoutes.filter((r) => r.serviceId === serviceId);
}

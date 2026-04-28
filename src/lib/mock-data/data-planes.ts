export interface DataPlane {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  region: string;
  lastUpdate: string;
}

export const dataPlanes: DataPlane[] = [
  {
    id: 'production',
    name: 'Production',
    description: 'Live customer traffic',
    status: 'active',
    region: 'Multi-region',
    lastUpdate: '2 minutes ago',
  },
  {
    id: 'staging',
    name: 'Staging',
    description: 'Pre-prod environment',
    status: 'active',
    region: 'US',
    lastUpdate: '14 minutes ago',
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Developer sandbox',
    status: 'active',
    region: 'US',
    lastUpdate: '1 hour ago',
  },
  {
    id: 'edge-eu',
    name: 'Edge — EU',
    description: 'European edge nodes',
    status: 'active',
    region: 'EU',
    lastUpdate: '3 hours ago',
  },
  {
    id: 'edge-us',
    name: 'Edge — US',
    description: 'North American edge nodes',
    status: 'active',
    region: 'US',
    lastUpdate: '5 hours ago',
  },
];

const dataPlanesById: Record<string, DataPlane> = Object.fromEntries(
  dataPlanes.map((p) => [p.id, p]),
);

export function getDataPlaneById(id: string): DataPlane | undefined {
  return dataPlanesById[id];
}

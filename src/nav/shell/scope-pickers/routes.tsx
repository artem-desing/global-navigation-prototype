import { Text } from '@wallarm-org/design-system/Text';
import { getRoutesByServiceId } from '@/lib/mock-data/routes';
import { ScopePicker, MethodPill } from './scope-picker';

export function RoutesPicker({ basePath, serviceId }: { basePath: string; serviceId: string }) {
  const routes = getRoutesByServiceId(serviceId);
  return (
    <ScopePicker
      title="Routes"
      subtitle={`Routes attached to service \`${serviceId}\`. Click a route to drill into its flow and policies.`}
      items={routes}
      addLabel="ADD new"
      rowHref={(r) => `${basePath}/${r.id}`}
      emptyMessage={`No routes attached to ${serviceId} yet.`}
      columns={[
        {
          key: 'path',
          label: 'Path',
          render: (r) => (
            <Text size="sm" weight="medium" color="primary">
              {r.path}
            </Text>
          ),
        },
        { key: 'method', label: 'Method', render: (r) => <MethodPill method={r.method} /> },
        {
          key: 'service',
          label: 'Service',
          render: (r) => (
            <Text size="sm" color="secondary">
              {r.serviceId}
            </Text>
          ),
        },
        {
          key: 'policies',
          label: 'Policies attached',
          render: (r) => (
            <Text size="sm" color="secondary">
              {r.policiesAttached}
            </Text>
          ),
        },
      ]}
    />
  );
}

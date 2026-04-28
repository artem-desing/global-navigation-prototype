import { Text } from '@wallarm-org/design-system/Text';
import { dataPlanes } from '@/lib/mock-data/data-planes';
import { ScopePicker, StatusPill } from './scope-picker';

export function DataPlanesPicker({ basePath }: { basePath: string }) {
  return (
    <ScopePicker
      title="Data planes"
      subtitle="Pick a data plane to see its inner navigation. Mock data — `+ ADD new` is decorative in v0."
      items={dataPlanes}
      addLabel="ADD new"
      rowHref={(p) => `${basePath}/${p.id}`}
      columns={[
        {
          key: 'name',
          label: 'Name',
          render: (p) => (
            <Text size="sm" weight="medium" color="primary">
              {p.name}
            </Text>
          ),
        },
        {
          key: 'description',
          label: 'Description',
          render: (p) => (
            <Text size="sm" color="secondary">
              {p.description}
            </Text>
          ),
        },
        { key: 'status', label: 'Status', render: (p) => <StatusPill status={p.status} /> },
        {
          key: 'region',
          label: 'Region',
          render: (p) => (
            <Text size="sm" color="secondary">
              {p.region}
            </Text>
          ),
        },
        {
          key: 'lastUpdate',
          label: 'Last update',
          render: (p) => (
            <Text size="sm" color="secondary">
              {p.lastUpdate}
            </Text>
          ),
        },
      ]}
    />
  );
}

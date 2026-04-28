import { Text } from '@wallarm-org/design-system/Text';
import { edgeServices } from '@/lib/mock-data/services';
import { ScopePicker, StatusPill } from './scope-picker';

export function ServicesPicker({ basePath }: { basePath: string }) {
  return (
    <ScopePicker
      title="Services"
      subtitle="Pick a service to drill into its routes, flows, and settings. Mock data."
      items={edgeServices}
      addLabel="ADD new"
      rowHref={(s) => `${basePath}/${s.id}`}
      columns={[
        {
          key: 'name',
          label: 'Name',
          render: (s) => (
            <Text size="sm" weight="medium" color="primary">
              {s.name}
            </Text>
          ),
        },
        {
          key: 'description',
          label: 'Description',
          render: (s) => (
            <Text size="sm" color="secondary">
              {s.description}
            </Text>
          ),
        },
        { key: 'status', label: 'Status', render: (s) => <StatusPill status={s.status} /> },
        {
          key: 'hosts',
          label: 'Hosts',
          render: (s) => (
            <Text size="sm" color="secondary">
              {s.hosts}
            </Text>
          ),
        },
        {
          key: 'lastUpdate',
          label: 'Last update',
          render: (s) => (
            <Text size="sm" color="secondary">
              {s.lastUpdate}
            </Text>
          ),
        },
      ]}
    />
  );
}

import { Text } from '@wallarm-org/design-system/Text';
import { edgePolicies } from '@/lib/mock-data/policies';
import { ScopePicker } from './scope-picker';

export function PoliciesPicker(_: { basePath: string }) {
  return (
    <ScopePicker
      title="Policies"
      subtitle="Policies attached at this hook. Mock data — same pool surfaces wherever a `policies` Feature renders in v0."
      items={edgePolicies}
      addLabel="ATTACH"
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
          key: 'type',
          label: 'Type',
          render: (p) => (
            <Text size="sm" color="secondary">
              {p.type}
            </Text>
          ),
        },
        {
          key: 'enabled',
          label: 'Enabled',
          render: (p) => (
            <Text size="sm" color={p.enabled ? 'primary' : 'secondary'}>
              {p.enabled ? 'Yes' : 'No'}
            </Text>
          ),
        },
      ]}
    />
  );
}

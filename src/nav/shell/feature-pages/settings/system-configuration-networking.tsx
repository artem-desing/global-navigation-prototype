'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { SettingsPageTemplate, KeyValueRow, SimpleTable } from './_template';

interface NetworkRule {
  id: string;
  cidr: string;
  direction: 'inbound' | 'outbound';
  status: 'allow' | 'deny';
  note: string;
}

const rules: NetworkRule[] = [
  { id: 'r-1', cidr: '10.0.0.0/8', direction: 'inbound', status: 'allow', note: 'Internal cluster traffic' },
  { id: 'r-2', cidr: '0.0.0.0/0', direction: 'inbound', status: 'deny', note: 'Default deny' },
  { id: 'r-3', cidr: '93.184.216.0/24', direction: 'outbound', status: 'allow', note: 'Telemetry endpoint' },
];

export function SystemConfigurationNetworkingPage() {
  return (
    <SettingsPageTemplate
      title="System configuration — Networking"
      subtitle="Cluster network policies and outbound allowlists."
    >
      {/* PM: extend with rule creation, a test-from-CIDR utility, and a DNS
         override section. */}
      <Card>
        <div className="flex flex-col">
          <KeyValueRow label="Cluster CIDR" value="10.42.0.0/16" />
          <KeyValueRow label="Service CIDR" value="10.43.0.0/16" />
          <KeyValueRow label="Pod DNS" value="cluster.local" />
          <KeyValueRow label="Outbound proxy" value="None" />
        </div>
      </Card>

      <SimpleTable
        rows={rules}
        rowKey={(r) => r.id}
        columns={[
          {
            header: 'CIDR',
            cell: (r) => (
              <Text size="sm" weight="medium" color="primary">
                {r.cidr}
              </Text>
            ),
          },
          {
            header: 'Direction',
            cell: (r) => (
              <Text size="sm" color="secondary">
                {r.direction}
              </Text>
            ),
          },
          {
            header: 'Status',
            cell: (r) => (
              <Badge
                type="secondary"
                color={r.status === 'allow' ? 'green' : 'red'}
              >
                {r.status}
              </Badge>
            ),
          },
          {
            header: 'Note',
            cell: (r) => (
              <Text size="sm" color="secondary">
                {r.note}
              </Text>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}

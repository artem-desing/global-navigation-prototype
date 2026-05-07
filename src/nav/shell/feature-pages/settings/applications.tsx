'use client';

import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { SettingsPageTemplate, SimpleTable } from './_template';

interface Application {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected';
}

const applications: Application[] = [
  { id: 'slack', name: 'Slack', category: 'Notifications', status: 'connected' },
  { id: 'datadog', name: 'Datadog', category: 'Observability', status: 'connected' },
  { id: 'pagerduty', name: 'PagerDuty', category: 'Incident response', status: 'disconnected' },
  { id: 'github', name: 'GitHub', category: 'Source control', status: 'connected' },
];

export function ApplicationsPage() {
  return (
    <SettingsPageTemplate
      title="Applications"
      subtitle="Third-party applications connected to this workspace."
    >
      {/* PM: this is the inventory view. Add a per-app detail page when you
         define what configuring an integration looks like. */}
      <div className="flex justify-end">
        <Button variant="primary">Connect application</Button>
      </div>

      <SimpleTable
        rows={applications}
        rowKey={(a) => a.id}
        columns={[
          {
            header: 'Application',
            cell: (a) => (
              <Text size="sm" weight="medium" color="primary">
                {a.name}
              </Text>
            ),
          },
          {
            header: 'Category',
            cell: (a) => (
              <Text size="sm" color="secondary">
                {a.category}
              </Text>
            ),
          },
          {
            header: 'Status',
            cell: (a) => (
              <Badge
                type="secondary"
                color={a.status === 'connected' ? 'green' : 'gray'}
              >
                {a.status === 'connected' ? 'Connected' : 'Not connected'}
              </Badge>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}

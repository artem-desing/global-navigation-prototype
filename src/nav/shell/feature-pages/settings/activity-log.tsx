'use client';

import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { SettingsPageTemplate, SimpleTable } from './_template';

interface ActivityEvent {
  id: string;
  when: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical';
}

const events: ActivityEvent[] = [
  {
    id: 'e-1',
    when: '2 minutes ago',
    actor: 'Maria Hernandez',
    action: 'Updated role',
    target: 'priya.s@acme.test → Viewer',
    severity: 'info',
  },
  {
    id: 'e-2',
    when: '14 minutes ago',
    actor: 'CI deployment (token)',
    action: 'Created policy',
    target: 'block-csrf-prod',
    severity: 'info',
  },
  {
    id: 'e-3',
    when: '1 hour ago',
    actor: 'Diego Alvarez',
    action: 'Revoked token',
    target: 'Local dev — Ken',
    severity: 'warning',
  },
  {
    id: 'e-4',
    when: 'Yesterday',
    actor: 'System',
    action: 'Failed login attempts',
    target: 'unknown@external.test (15×)',
    severity: 'critical',
  },
];

export function ActivityLogPage() {
  return (
    <SettingsPageTemplate
      title="Activity log"
      subtitle="Audit trail of who did what across the workspace."
    >
      {/* PM: add filters (actor, action type, date range), CSV export, and a
         per-event detail drawer. Treat severity as the colour ramp. */}
      <SimpleTable
        rows={events}
        rowKey={(e) => e.id}
        columns={[
          {
            header: 'When',
            cell: (e) => (
              <Text size="sm" color="secondary">
                {e.when}
              </Text>
            ),
          },
          {
            header: 'Actor',
            cell: (e) => (
              <Text size="sm" weight="medium" color="primary">
                {e.actor}
              </Text>
            ),
          },
          {
            header: 'Action',
            cell: (e) => (
              <Text size="sm" color="primary">
                {e.action}
              </Text>
            ),
          },
          {
            header: 'Target',
            cell: (e) => (
              <Text size="sm" color="secondary">
                {e.target}
              </Text>
            ),
          },
          {
            header: 'Severity',
            cell: (e) => (
              <Badge
                type="secondary"
                color={
                  e.severity === 'critical'
                    ? 'red'
                    : e.severity === 'warning'
                      ? 'w-orange'
                      : 'gray'
                }
              >
                {e.severity}
              </Badge>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}

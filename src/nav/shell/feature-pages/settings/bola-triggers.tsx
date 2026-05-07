'use client';

import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { SettingsPageTemplate, SimpleTable } from './_template';

interface Trigger {
  id: string;
  name: string;
  endpoints: number;
  enabled: boolean;
  lastFired: string;
}

const triggers: Trigger[] = [
  { id: 't-1', name: 'Sequential ID enumeration', endpoints: 142, enabled: true, lastFired: '12 minutes ago' },
  { id: 't-2', name: 'High-cardinality user IDs', endpoints: 38, enabled: true, lastFired: '2 hours ago' },
  { id: 't-3', name: 'UUID range scanner', endpoints: 11, enabled: false, lastFired: 'Yesterday' },
];

export function BolaTriggersPage() {
  return (
    <SettingsPageTemplate
      title="BOLA triggers"
      subtitle="Heuristics that flag potential broken-object-level-authorization activity."
    >
      {/* PM: add a per-trigger detail page (rule body, sensitivity slider,
         affected endpoints list) and a trigger-creation flow. */}
      <div className="flex justify-end">
        <Button variant="primary">New trigger</Button>
      </div>

      <SimpleTable
        rows={triggers}
        rowKey={(t) => t.id}
        columns={[
          {
            header: 'Trigger',
            cell: (t) => (
              <Text size="sm" weight="medium" color="primary">
                {t.name}
              </Text>
            ),
          },
          {
            header: 'Endpoints',
            cell: (t) => (
              <Text size="sm" color="secondary">
                {t.endpoints}
              </Text>
            ),
          },
          {
            header: 'Status',
            cell: (t) => (
              <Badge
                type="secondary"
                color={t.enabled ? 'green' : 'gray'}
              >
                {t.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            ),
          },
          {
            header: 'Last fired',
            cell: (t) => (
              <Text size="sm" color="secondary">
                {t.lastFired}
              </Text>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}

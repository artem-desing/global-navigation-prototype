'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Text } from '@wallarm-org/design-system/Text';
import { SettingsPageTemplate, KeyValueRow } from './_template';

export function SystemConfigurationGeneralPage() {
  return (
    <SettingsPageTemplate
      title="System configuration — General"
      subtitle="Cluster-wide configuration applied to every workload."
    >
      {/* PM: this stub shows admin-zone system config. Replace with editable
         fields when you take this section over. Consider a banner at the top
         warning that changes restart workloads. */}
      <Card>
        <div className="flex flex-col">
          <KeyValueRow label="Cluster name" value="prod-eu-west" />
          <KeyValueRow label="Version" value="1.42.7" />
          <KeyValueRow label="Default timezone" value="UTC" />
          <KeyValueRow label="Maintenance window" value="Sundays 02:00–04:00 UTC" />
          <KeyValueRow label="Telemetry" value="Enabled (anonymized)" />
        </div>
      </Card>

      <Text size="xs" color="secondary">
        Changes apply on the next configuration sync (usually within 60s).
      </Text>
    </SettingsPageTemplate>
  );
}

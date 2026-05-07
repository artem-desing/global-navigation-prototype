'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Text } from '@wallarm-org/design-system/Text';
import { SettingsPageTemplate, KeyValueRow } from './_template';

export function CustomerSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Customer settings"
      subtitle="Tenant-level configuration only the customer admin can change."
    >
      {/* PM: this is admin-zone read-only summary today. Add inline-edit when
         the section is scoped, or split into Account / Branding / Compliance. */}
      <Card>
        <div className="flex flex-col">
          <KeyValueRow label="Customer ID" value="cust-1029-acme" />
          <KeyValueRow label="Tenant name" value="Acme Corporation" />
          <KeyValueRow label="Region" value="EU-West (Frankfurt)" />
          <KeyValueRow label="Plan" value="Team" />
          <KeyValueRow label="Compliance" value="SOC 2 Type II, ISO 27001" />
          <KeyValueRow label="Data retention" value="365 days" />
          <KeyValueRow label="SSO" value="Disabled" />
        </div>
      </Card>

      <Text size="xs" color="secondary">
        Changes to customer settings are audited and may require approval from
        a second admin.
      </Text>
    </SettingsPageTemplate>
  );
}

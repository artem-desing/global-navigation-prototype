'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { SettingsPageTemplate, KeyValueRow } from './_template';

export function SystemConfigurationStoragePage() {
  return (
    <SettingsPageTemplate
      title="System configuration — Storage"
      subtitle="Where event data, audit logs, and exports are persisted."
    >
      {/* PM: extend with a real usage chart (WADS SimpleCharts), a bucket
         picker, and retention-by-class controls. */}
      <div className="grid grid-cols-2 gap-16">
        <Card>
          <div className="flex flex-col gap-4 p-16">
            <Text size="xs" color="secondary">
              Used storage
            </Text>
            <Heading size="2xl" weight="medium">
              612 GB
            </Heading>
            <Text size="xs" color="secondary">
              of 2 TB allocated · 31% full
            </Text>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-4 p-16">
            <Text size="xs" color="secondary">
              Daily growth (avg, last 30d)
            </Text>
            <Heading size="2xl" weight="medium">
              4.2 GB / day
            </Heading>
            <Text size="xs" color="secondary">
              At current rate, ~10 months until full.
            </Text>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col">
          <KeyValueRow label="Backend" value="S3-compatible (MinIO)" />
          <KeyValueRow label="Endpoint" value="storage.acme.test:9000" />
          <KeyValueRow label="Bucket" value="wallarm-events-prod" />
          <KeyValueRow label="Encryption" value="SSE-S3 (AES-256)" />
          <KeyValueRow label="Retention" value="Events: 90d · Audit: 365d · Exports: 30d" />
        </div>
      </Card>
    </SettingsPageTemplate>
  );
}

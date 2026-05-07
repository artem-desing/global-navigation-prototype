'use client';

import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { mockTokens } from '@/lib/fixtures/settings';
import { SettingsPageTemplate, SimpleTable } from './_template';

export function ApiTokensPage() {
  return (
    <SettingsPageTemplate
      title="API tokens"
      subtitle="Create and manage personal access tokens for API automation."
    >
      {/* PM: extend with token-creation flow (modal? page?), revoke action,
         and per-token usage stats. mockTokens lives in fixtures/settings.ts. */}
      <div className="flex justify-end">
        <Button variant="primary">New token</Button>
      </div>

      <SimpleTable
        rows={mockTokens}
        rowKey={(t) => t.id}
        columns={[
          {
            header: 'Name',
            cell: (t) => (
              <Text size="sm" weight="medium" color="primary">
                {t.name}
              </Text>
            ),
          },
          {
            header: 'Scope',
            cell: (t) => (
              <Badge type="secondary" color="gray">
                {t.scope}
              </Badge>
            ),
          },
          {
            header: 'Created',
            cell: (t) => (
              <Text size="sm" color="secondary">
                {t.created}
              </Text>
            ),
          },
          {
            header: 'Last used',
            cell: (t) => (
              <Text size="sm" color="secondary">
                {t.lastUsed}
              </Text>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}

'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Switch } from '@wallarm-org/design-system/Switch';
import { Text } from '@wallarm-org/design-system/Text';
import { SettingsPageTemplate } from './_template';

export function GeneralPage() {
  return (
    <SettingsPageTemplate
      title="General"
      subtitle="Workspace-wide preferences that apply to every member."
    >
      {/* PM: this is a stub showing the Switch + Card pattern. Replace with
         real preferences. Group related toggles together with a small heading. */}
      <Card>
        <div className="flex flex-col">
          <ToggleRow
            label="Default landing page"
            description="When a member opens the workspace, send them to the last page they visited."
            defaultOn
          />
          <ToggleRow
            label="Email digest"
            description="Send a weekly summary of activity to every member."
            defaultOn={false}
          />
          <ToggleRow
            label="Show preview features"
            description="Surface unreleased features behind a 'Preview' badge."
            defaultOn={false}
          />
        </div>
      </Card>
    </SettingsPageTemplate>
  );
}

function ToggleRow({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-24 px-16 py-16"
      style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
    >
      <div className="flex flex-col gap-2">
        <Text size="sm" weight="medium" color="primary">
          {label}
        </Text>
        <Text size="xs" color="secondary">
          {description}
        </Text>
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}

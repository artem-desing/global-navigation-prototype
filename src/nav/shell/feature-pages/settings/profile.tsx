'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Button } from '@wallarm-org/design-system/Button';
import { SettingsPageTemplate, KeyValueRow } from './_template';

export function ProfilePage() {
  return (
    <SettingsPageTemplate
      title="Profile"
      subtitle="Your account profile, name, email, and password."
    >
      {/* PM: replace these read-only rows with editable fields (Field + Input)
         when you take this section over. Or split into tabs (Personal /
         Security / Notifications). */}
      <Card>
        <div className="flex flex-col">
          <KeyValueRow label="Display name" value="Maria Hernandez" />
          <KeyValueRow label="Email" value="maria.h@acme.test" />
          <KeyValueRow label="Tenant" value="Acme — Production" />
          <KeyValueRow label="Joined" value="January 2025" />
          <KeyValueRow label="Two-factor" value="Enabled (Authenticator app)" />
        </div>
      </Card>

      <div className="flex gap-8">
        <Button variant="primary">Edit profile</Button>
        <Button variant="secondary">Change password</Button>
      </div>
    </SettingsPageTemplate>
  );
}

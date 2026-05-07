'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { SettingsPageTemplate } from './_template';

export function UsersInvitesPage() {
  return (
    <SettingsPageTemplate
      title="Pending invites"
      subtitle="Invitations sent but not yet accepted."
    >
      {/* PM: this is the empty-state pattern. When you add real data, swap to
         a SimpleTable like users-all. Keep an empty-state branch for when the
         list is genuinely empty. */}
      <Card>
        <div className="flex flex-col items-center gap-8 px-32 py-48 text-center">
          <Heading size="lg" weight="medium">
            No pending invites
          </Heading>
          <Text color="secondary" align="center">
            When you invite someone, their invitation will appear here until
            they accept or it expires.
          </Text>
          <div className="pt-8">
            <Button variant="primary">Invite member</Button>
          </div>
        </div>
      </Card>
    </SettingsPageTemplate>
  );
}

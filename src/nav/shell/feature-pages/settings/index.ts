// Settings feature-page registry. Map of `featureId` → page component.
//
// PMs: to add a Settings section page:
//   1. Add a manifest entry in `src/nav/manifest/settings.manifest.ts`
//   2. Create a `<feature-id>.tsx` file in this directory (copy `_template.tsx`
//      or any existing stub)
//   3. Register it below
//
// To remove a section: delete the manifest entry, delete the file, remove the
// registry line. The catch-all renderer falls back to a generic placeholder
// for any feature without a registered page, so PMs can stage manifest +
// page work in either order.

import type { ComponentType } from 'react';
import { RolesPage } from '../roles';
import { ProfilePage } from './profile';
import { GeneralPage } from './general';
import { SubscriptionsPage } from './subscriptions';
import { ApplicationsPage } from './applications';
import { UsersAllPage } from './users-all';
import { UsersInvitesPage } from './users-invites';
import { GroupsPage } from './groups';
import { ApiTokensPage } from './api-tokens';
import { ActivityLogPage } from './activity-log';
import { CustomerSettingsPage } from './customer-settings';
import { SystemConfigurationGeneralPage } from './system-configuration-general';
import { SystemConfigurationStoragePage } from './system-configuration-storage';
import { SystemConfigurationNetworkingPage } from './system-configuration-networking';
import { BolaTriggersPage } from './bola-triggers';
import { ExperimentsPage } from './experiments';

export const settingsFeaturePages: Record<string, ComponentType> = {
  profile: ProfilePage,
  general: GeneralPage,
  subscriptions: SubscriptionsPage,
  applications: ApplicationsPage,
  'users-all': UsersAllPage,
  'users-invites': UsersInvitesPage,
  'users-roles': RolesPage,
  groups: GroupsPage,
  'api-tokens': ApiTokensPage,
  'activity-log': ActivityLogPage,
  'customer-settings': CustomerSettingsPage,
  'system-configuration-general': SystemConfigurationGeneralPage,
  'system-configuration-storage': SystemConfigurationStoragePage,
  'system-configuration-networking': SystemConfigurationNetworkingPage,
  'bola-triggers': BolaTriggersPage,
  experiments: ExperimentsPage,
};

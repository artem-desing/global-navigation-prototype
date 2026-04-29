'use client';

import { useState } from 'react';
import { Globe, ChevronDown, Activity } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Dialog } from '@wallarm-org/design-system/Dialog';
import { DialogContent } from '@wallarm-org/design-system/Dialog';
import { DialogHeader } from '@wallarm-org/design-system/Dialog';
import { DialogTitle } from '@wallarm-org/design-system/Dialog';
import { DialogBody } from '@wallarm-org/design-system/Dialog';
import { GlobalSearch } from '@/nav/search/global-search';

export function TopBar() {
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);

  return (
    <header
      className="flex h-48 shrink-0 items-center justify-between gap-16 border-b px-16"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <div className="flex items-center gap-8">
        <Text size="md" weight="bold" color="primary">
          Wallarm
        </Text>
      </div>

      <div className="flex flex-1 max-w-md items-center justify-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-12">
        <button
          type="button"
          onClick={() => setTenantDialogOpen(true)}
          className="flex items-center gap-6 rounded-md px-8 py-4 transition-colors"
          aria-label="Switch tenant"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Globe size="sm" aria-hidden />
          <Text size="sm" color="secondary">
            tenant
          </Text>
          <ChevronDown size="xs" aria-hidden />
        </button>

        <div
          className="flex items-center gap-6 rounded-md px-8 py-4"
          aria-label="Usage limits"
          style={{ color: 'var(--color-text-warning)' }}
        >
          <Activity size="sm" aria-hidden />
          <Text size="sm" color="inherit">
            limits
          </Text>
        </div>
      </div>

      <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen} width={480}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch tenant</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text size="sm" color="secondary">
              Tenant switching will be handled later — placeholder dialog for the
              prototype. The real flow will surface a list of accessible tenants
              with search, recent tenants, and a clear-current action.
            </Text>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </header>
  );
}

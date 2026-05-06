'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ChevronDown, Check, Search } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Dialog } from '@wallarm-org/design-system/Dialog';
import { DialogContent } from '@wallarm-org/design-system/Dialog';
import { DialogHeader } from '@wallarm-org/design-system/Dialog';
import { DialogTitle } from '@wallarm-org/design-system/Dialog';
import { DialogBody } from '@wallarm-org/design-system/Dialog';
import { NAV_EVENTS, onNavEvent } from '@/nav/events';
import { useVariant, variantHomePath } from '@/nav/variant-context';
import {
  TENANTS,
  setActiveTenantId,
  useActiveTenant,
  type Tenant,
} from '@/lib/mock-data/tenants';

const DIALOG_WIDTH = 640;
const LIST_HEIGHT = 360;

export function TenantSwitcher() {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const active = useActiveTenant();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K → "Switch tenant" action fires this event. Open the dialog.
  useEffect(
    () => onNavEvent(NAV_EVENTS.OpenTenantDialog, () => setOpen(true)),
    [],
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TENANTS;
    return TENANTS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.subscription.toLowerCase().includes(q),
    );
  }, [query]);

  // Single-tenant edge case from the docs: global users see a selector, others
  // effectively don't. With one tenant we render the chip as a static label.
  if (TENANTS.length <= 1) {
    return (
      <div
        className="flex items-center gap-6 rounded-md px-8 py-4"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Active tenant"
      >
        <Globe size="sm" aria-hidden />
        <Text size="sm" color="secondary">
          {active.name}
        </Text>
      </div>
    );
  }

  const handleSelect = (tenant: Tenant) => {
    setOpen(false);
    if (tenant.id === active.id) return;
    setActiveTenantId(tenant.id);
    // Reset to variant home — tenant-scoped IDs in the URL won't exist in the
    // new tenant, so preserving the route would dead-end on missing entities.
    router.push(variantHomePath(variantSlug));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-6 rounded-md px-8 py-4 transition-colors hover:bg-[var(--color-bg-light-primary)]"
        aria-label={`Switch tenant. Active: ${active.name}`}
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Globe size="sm" aria-hidden />
        <Text size="sm" color="secondary" style={{ whiteSpace: 'nowrap' }}>
          {active.name}
        </Text>
        <ChevronDown size="xs" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen} width={DIALOG_WIDTH}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Switch tenant
              <span
                className="ml-8 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                · {TENANTS.length} tenants
              </span>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div
              className="flex items-center gap-8 rounded-md border px-12"
              style={{
                borderColor: 'var(--color-border-primary-light)',
                backgroundColor: 'var(--color-bg-light-primary)',
                height: 40,
              }}
            >
              <Search
                size="sm"
                aria-hidden
                style={{ color: 'var(--color-icon-secondary)' }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or tenant ID"
                aria-label="Search tenants"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 border-0 bg-transparent text-sm outline-none focus:outline-none"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>

            <div
              role="listbox"
              aria-label="Tenants"
              className="mt-12 overflow-y-auto rounded-md border"
              style={{
                maxHeight: LIST_HEIGHT,
                borderColor: 'var(--color-border-primary-light)',
              }}
            >
              {filtered.length === 0 ? (
                <div className="px-16 py-24">
                  <Text size="sm" color="secondary">
                    No tenants match “{query.trim()}”.
                  </Text>
                </div>
              ) : (
                filtered.map((tenant, idx) => {
                  const isActive = tenant.id === active.id;
                  return (
                    <button
                      key={tenant.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(tenant)}
                      className="flex w-full items-center gap-12 px-16 py-12 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--color-bg-states-primary-active)'
                          : 'transparent',
                        borderTop:
                          idx === 0
                            ? undefined
                            : '1px solid var(--color-border-primary-light)',
                      }}
                    >
                      <div className="flex flex-1 min-w-0 flex-col gap-2">
                        <div className="flex items-center gap-8">
                          <Text size="sm" color="primary" weight="medium" truncate>
                            {tenant.name}
                          </Text>
                          {tenant.kind === 'technical' ? (
                            <Badge size="medium" type="secondary">
                              Technical
                            </Badge>
                          ) : null}
                        </div>
                        <Text size="xs" color="secondary" truncate>
                          ID {tenant.id} · {tenant.subscription} · {tenant.monthlyRequests} req/mo
                        </Text>
                      </div>
                      {isActive ? (
                        <Check
                          size="sm"
                          aria-hidden
                          style={{ color: 'var(--color-icon-primary)' }}
                        />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useSyncExternalStore } from 'react';

export type TenantKind = 'technical' | 'tenant';

export interface Tenant {
  id: string;
  name: string;
  kind: TenantKind;
  subscription: string;
  monthlyRequests: string;
}

// Subscription labels are deliberately generic — embargoed pillar names
// (Infrastructure Discovery, AI Gateway, AI Hypervisor) MUST NOT appear.
export const TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Wallarm',
    kind: 'technical',
    subscription: 'Advanced API Security',
    monthlyRequests: '—',
  },
  {
    id: '2',
    name: 'Acme Production',
    kind: 'tenant',
    subscription: 'Advanced API Security',
    monthlyRequests: '12.4M',
  },
  {
    id: '3',
    name: 'Acme Staging',
    kind: 'tenant',
    subscription: 'API Attack Surface',
    monthlyRequests: '480K',
  },
  {
    id: '4',
    name: 'Northwind APIs',
    kind: 'tenant',
    subscription: 'Advanced API Security',
    monthlyRequests: '2.1M',
  },
  {
    id: '5',
    name: 'Sandbox',
    kind: 'tenant',
    subscription: 'Free Tier',
    monthlyRequests: '8K',
  },
];

const STORAGE_KEY = 'nav:active-tenant';
const DEFAULT_TENANT_ID = TENANTS[1].id;

const listeners = new Set<() => void>();

function readActiveId(): string {
  if (typeof window === 'undefined') return DEFAULT_TENANT_ID;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && TENANTS.some((t) => t.id === stored)) return stored;
  return DEFAULT_TENANT_ID;
}

let cachedId: string | null = null;

function getSnapshot(): string {
  if (cachedId === null) cachedId = readActiveId();
  return cachedId;
}

function getServerSnapshot(): string {
  return DEFAULT_TENANT_ID;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setActiveTenantId(id: string): void {
  if (!TENANTS.some((t) => t.id === id)) return;
  cachedId = id;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  listeners.forEach((l) => l());
}

export function useActiveTenant(): Tenant {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return TENANTS.find((t) => t.id === id) ?? TENANTS[0];
}

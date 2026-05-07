// Mock data shared by Settings stub pages. PMs: replace these with whatever
// shape your section actually needs, or add new fixtures alongside. Keep it
// fake — this prototype is mock-data only.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | 'Auditor';
  lastActive: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'u-1',
    name: 'Maria Hernandez',
    email: 'maria.h@acme.test',
    role: 'Admin',
    lastActive: '2 minutes ago',
  },
  {
    id: 'u-2',
    name: 'Ken Tanaka',
    email: 'ken.t@acme.test',
    role: 'Editor',
    lastActive: '1 hour ago',
  },
  {
    id: 'u-3',
    name: 'Priya Shah',
    email: 'priya.s@acme.test',
    role: 'Viewer',
    lastActive: '3 days ago',
  },
  {
    id: 'u-4',
    name: 'Diego Alvarez',
    email: 'diego.a@acme.test',
    role: 'Auditor',
    lastActive: 'Just now',
  },
];

export interface MockToken {
  id: string;
  name: string;
  scope: string;
  created: string;
  lastUsed: string;
}

export const mockTokens: MockToken[] = [
  {
    id: 't-1',
    name: 'CI deployment',
    scope: 'edge:write',
    created: '2026-01-14',
    lastUsed: '4 minutes ago',
  },
  {
    id: 't-2',
    name: 'Backup runner',
    scope: 'read-only',
    created: '2025-11-02',
    lastUsed: '6 hours ago',
  },
  {
    id: 't-3',
    name: 'Local dev — Maria',
    scope: 'edge:write,testing:read',
    created: '2026-04-20',
    lastUsed: 'Never',
  },
];

export interface MockPlan {
  id: string;
  name: string;
  price: string;
  current: boolean;
  features: string[];
}

export const mockPlans: MockPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    current: false,
    features: ['1 workspace', 'Up to 3 users', 'Community support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$49 / mo',
    current: true,
    features: ['Unlimited workspaces', 'Up to 25 users', 'Email support', 'API access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    current: false,
    features: ['SSO + SAML', 'Audit logs', 'Dedicated support', 'Volume discounts'],
  },
];

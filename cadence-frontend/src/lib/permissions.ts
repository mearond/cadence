import { useAuthStore } from '../store/authStore';

// Mirror of cadence-backend/src/lib/permissions.js. The backend enforces these;
// the frontend only uses them to hide buttons and tabs a role can't use.
export type StaffRole = 'owner' | 'manager' | 'coordinator' | 'staff';

export const ASSIGNABLE_ROLES: Exclude<StaffRole, 'owner'>[] = ['manager', 'coordinator', 'staff'];

const ALL: StaffRole[] = ['owner', 'manager', 'coordinator', 'staff'];
const LEADS: StaffRole[] = ['owner', 'manager'];
const OPS: StaffRole[] = ['owner', 'manager', 'coordinator'];

const PERMISSIONS = {
  'dashboard:view': ALL,

  'events:view': ALL,
  'events:create': LEADS,
  'events:edit': LEADS,
  'events:delete': ['owner'],

  'timeline:view': ALL,
  'timeline:manage': OPS,

  'tasks:view': ALL,
  'tasks:manage': OPS,
  'tasks:delete': LEADS,
  'tasks:updateStatus': ALL,

  'budget:view': LEADS,
  'budget:manage': LEADS,

  'vendors:view': OPS,
  'vendors:manage': LEADS,

  'clients:view': OPS,
  'clients:manage': LEADS,

  'approvals:view': OPS,
  'approvals:manage': LEADS,

  'staff:view': OPS,
  'staff:manage': ['owner'],
} satisfies Record<string, StaffRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: string | undefined, permission: Permission): boolean {
  return (PERMISSIONS[permission] as string[]).includes(role ?? '');
}

export function useCan() {
  const role = useAuthStore((s) => s.user?.role);
  return (permission: Permission) => can(role, permission);
}

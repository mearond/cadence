// Single source of truth for who can do what. Mirrored in cadence-frontend/src/lib/permissions.ts.
export const STAFF_ROLES = ['owner', 'manager', 'coordinator', 'staff'];
export const ASSIGNABLE_ROLES = ['manager', 'coordinator', 'staff'];

const ALL = STAFF_ROLES;
const LEADS = ['owner', 'manager'];
const OPS = ['owner', 'manager', 'coordinator'];

export const PERMISSIONS = {
  'dashboard:view': ALL,

  'events:view': ALL,
  'events:create': LEADS,
  'events:edit': LEADS,
  'events:delete': ['owner'],

  'timeline:view': ALL,
  'timeline:manage': OPS,

  'tasks:view': ALL,
  'tasks:manage': OPS, // create, edit any field, add/remove checklist items
  'tasks:delete': LEADS,
  'tasks:updateStatus': ALL, // mark done/pending, tick checklist items

  'budget:view': LEADS,
  'budget:manage': LEADS,

  'vendors:view': OPS,
  'vendors:manage': LEADS, // vendor directory, bookings, payment status

  'clients:view': OPS,
  'clients:manage': LEADS,

  'approvals:view': OPS,
  'approvals:manage': LEADS,

  'staff:view': OPS,
  'staff:manage': ['owner'],
};

export function can(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

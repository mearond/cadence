-- Role model: owner (signed up the agency), manager, coordinator, staff, plus client.
UPDATE users SET role = 'owner' WHERE role = 'admin';
UPDATE users SET role = 'staff' WHERE role NOT IN ('owner', 'manager', 'coordinator', 'staff', 'client');
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'staff';
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'manager', 'coordinator', 'staff', 'client'));

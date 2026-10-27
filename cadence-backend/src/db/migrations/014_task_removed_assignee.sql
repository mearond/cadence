-- When a staff member is removed, tasks.assigned_to becomes NULL (ON DELETE SET NULL),
-- which looks the same as "never assigned". Keep the removed person's name so the
-- app can flag those tasks and ask for a new assignee. Cleared once someone is assigned.
ALTER TABLE tasks ADD COLUMN removed_assignee_name TEXT;

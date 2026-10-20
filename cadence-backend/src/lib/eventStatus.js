// Statuses a person can set by hand. 'in-progress' and 'completed' are derived from the dates.
export const MANUAL_STATUSES = ['planning', 'confirmed', 'cancelled'];

export const EVENT_TYPES = ['conference', 'wedding', 'corporate', 'graduation', 'religious', 'memorial', 'other'];

// "Today" in Ethiopia, so an event flips status at local midnight, not UTC midnight.
const TODAY = `(NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date`;

// SQL expression for the status shown everywhere in the app.
export function effectiveStatusSql(alias = 'e') {
  return `CASE
    WHEN ${alias}.status = 'cancelled' THEN 'cancelled'
    WHEN COALESCE(${alias}.end_date, ${alias}.start_date) < ${TODAY} THEN 'completed'
    WHEN ${alias}.start_date <= ${TODAY} THEN 'in-progress'
    ELSE ${alias}.status
  END`;
}

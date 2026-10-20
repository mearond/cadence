-- End date is now required. Single-day events get end_date = start_date.
UPDATE events SET end_date = start_date WHERE end_date IS NULL OR end_date < start_date;
ALTER TABLE events ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_dates_check CHECK (end_date >= start_date);

-- 'in-progress' and 'completed' are now derived from the dates at read time
-- (see src/lib/eventStatus.js). Only manually chosen statuses are stored.
UPDATE events SET status = 'confirmed' WHERE status IN ('in-progress', 'completed');
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('planning', 'confirmed', 'cancelled'));

-- Lock vendor payment status to the three values the UI offers.
UPDATE event_vendors SET payment_status = 'unpaid' WHERE payment_status NOT IN ('unpaid', 'partial', 'paid');
ALTER TABLE event_vendors ADD CONSTRAINT event_vendors_payment_status_check CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

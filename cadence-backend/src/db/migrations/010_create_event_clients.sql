-- Move from a single events.client_id column to a many-to-many relation,
-- so an event can have multiple (or zero) linked clients.
CREATE TABLE event_clients (
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, client_id)
);

-- Carry over existing single-client links.
INSERT INTO event_clients (event_id, client_id)
SELECT id, client_id FROM events WHERE client_id IS NOT NULL;

ALTER TABLE events DROP COLUMN client_id;
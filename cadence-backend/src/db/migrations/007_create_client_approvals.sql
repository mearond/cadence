ALTER TABLE users ALTER COLUMN role SET DEFAULT 'planner';

CREATE TABLE client_approvals (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  client_comment TEXT,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
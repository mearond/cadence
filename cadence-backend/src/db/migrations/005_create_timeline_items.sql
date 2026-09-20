CREATE TABLE timeline_items (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME,
  title VARCHAR(255) NOT NULL,
  title_am VARCHAR(255),
  description TEXT,
  responsible_person_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
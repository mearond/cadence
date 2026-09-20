CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_am VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  capacity INTEGER,
  contact_phone VARCHAR(50),
  notes TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_am VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  start_date DATE NOT NULL,
  end_date DATE,
  venue_id INTEGER REFERENCES venues(id) ON DELETE SET NULL,
  guest_count INTEGER,
  client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
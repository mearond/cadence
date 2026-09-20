CREATE TABLE budget_items (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  estimated_amount_etb NUMERIC(12, 2) DEFAULT 0,
  actual_amount_etb NUMERIC(12, 2) DEFAULT 0,
  vat_applicable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_am VARCHAR(255),
  logo_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  tin_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'planner',
  phone VARCHAR(50),
  preferred_language VARCHAR(5) DEFAULT 'en',
  avatar_color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
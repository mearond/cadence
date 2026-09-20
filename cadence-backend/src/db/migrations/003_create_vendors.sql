CREATE TABLE vendor_categories (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_am VARCHAR(100)
);

INSERT INTO vendor_categories (name_en, name_am) VALUES
  ('Catering', 'ምግብ አቅራቢ'),
  ('Tent & Derash Rental', 'ድንኳን እና ደራሽ ኪራይ'),
  ('Coffee Ceremony Service', 'የቡና ስነ ስርዓት'),
  ('Azmari / Traditional Entertainment', 'አዝማሪ / ባህላዊ መዝናኛ'),
  ('AV & Sound', 'ድምጽ እና መብራት'),
  ('Photography & Videography', 'ፎቶግራፍ እና ቪዲዮ'),
  ('Transport', 'ትራንስፖርት'),
  ('Décor & Mesob', 'ጌጣጌጥ እና መሶብ'),
  ('Florist', 'የአበባ አቅራቢ'),
  ('Cake', 'ኬክ'),
  ('Security', 'ደህንነት'),
  ('Other', 'ሌላ');

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES vendor_categories(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  tin_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_vendors (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  contract_amount_etb NUMERIC(12, 2),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(20),
  notes TEXT
);
-- Custom SQL migration: Initial schema based on ER diagram

CREATE TYPE operator_status AS ENUM ('active', 'suspended', 'revoked');

CREATE TYPE place_type AS ENUM ('online', 'offline');

CREATE TYPE support_contact_type AS ENUM ('email', 'phone', 'website');

CREATE TYPE opportunity_status AS ENUM ('draft', 'test_pending', 'test_rejected', 'test_passed', 'published', 'suspended', 'deleted');

CREATE TYPE benefit_type AS ENUM ('free', 'reduced_fixed_price', 'priority', 'discount', 'other');

CREATE TYPE benefit_discount_type AS ENUM ('percentage', 'fixed_amount');

CREATE TYPE localized_metadata_key AS ENUM ('name', 'description', 'condition');

CREATE TYPE localized_metadata_language AS ENUM ('en', 'fr', 'de', 'sl', 'it');

CREATE TYPE change_audit_entity_type AS ENUM ('place', 'profile', 'website', 'address', 'support_contact', 'opportunity', 'beneficiary_benefit', 'caregiver_benefit', 'localized_metadata');

CREATE TYPE change_audit_change_type AS ENUM ('create', 'update');

CREATE TABLE operator (
  id CHAR(26) PRIMARY KEY,
  external_id UUID NOT NULL,
  name VARCHAR(512) NOT NULL,
  status operator_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE place (
  id CHAR(26) PRIMARY KEY,
  operator_id CHAR(26) NOT NULL REFERENCES operator(id) ON DELETE CASCADE,
  name VARCHAR(512) NOT NULL,
  type place_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profile (
  id CHAR(26) PRIMARY KEY,
  operator_id CHAR(26) NOT NULL REFERENCES operator(id) ON DELETE CASCADE,
  place_id CHAR(26) NOT NULL REFERENCES place(id),
  display_name VARCHAR(512) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (operator_id)
);

CREATE TABLE website (
  id CHAR(26) PRIMARY KEY,
  place_id CHAR(26) NOT NULL REFERENCES place(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id)
);

CREATE TABLE address (
  id CHAR(26) PRIMARY KEY,
  place_id CHAR(26) NOT NULL REFERENCES place(id) ON DELETE CASCADE,
  street VARCHAR(512) NOT NULL,
  city VARCHAR(64) NOT NULL,
  state VARCHAR(64) NOT NULL,
  postal_code VARCHAR(64) NOT NULL,
  country VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id)
);

CREATE TABLE support_contact (
  id CHAR(26) PRIMARY KEY,
  place_id CHAR(26) NOT NULL REFERENCES place(id) ON DELETE CASCADE,
  type support_contact_type NOT NULL,
  value VARCHAR(2048) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunity_category (
  id CHAR(26) PRIMARY KEY,
  title VARCHAR(64) NOT NULL,
  description VARCHAR(512) NOT NULL
);

INSERT INTO opportunity_category (id, title, description) VALUES
  ('01KRJXEYD44B58700GT982CCYY', 'Cultura e tempo libero',   'Libri, teatro, cinema, concerti, CD, dischi, cibo, bevande, ristoranti, shopping'),
  ('01KRJXEYD64E7NX00R5VT185AT', 'Istruzione e formazione',  'Scuole, Università, Corsi di formazione, ecc...'),
  ('01KRJXEYD65ATJ5ZSRFYERG510', 'Salute e benessere',       'Negozi di cosmetici, creme, cliniche, SPA, ecc...'),
  ('01KRJXEYD6WM56BBC9WFGPKAR5', 'Sport',                    'Negozi di articoli sportivi, strutture sportive, circoli, ecc...'),
  ('01KRJXEYD7RE4V6JBNB853ZPDT', 'Casa',                     'Opportunità per la casa, mutui, gestori della luce e gas, ecc...'),
  ('01KRJXEYD7G4B4AZW2AM6YAQVX', 'Telefonia e internet',     'Linea fissa e internet, telefonia mobile, ecc...'),
  ('01KRJXEYD761M9DQ7NGYAWT2S1', 'Servizi finanziari',       'Banche, app di investimenti o di risparmio'),
  ('01KRJXEYD7SSFPE6BP90C7GG5K', 'Viaggi e Trasporti',       'Agenzie di viaggio, compagnie di trasporti, ecc...'),
  ('01KRJXEYD7S0XYAQS96F7HKJFE', 'Mobilità sostenibile',     'Servizi per muoversi in città, car sharing, monopattini, bici, trasporti green'),
  ('01KRJXEYD7B8F56F38DGF1KFYV', 'Lavoro e tirocini',        'Concorsi, offerte di lavoro');

CREATE TABLE opportunity (
  id CHAR(26) PRIMARY KEY,
  operator_id CHAR(26) NOT NULL REFERENCES operator(id) ON DELETE CASCADE,
  category_id CHAR(26) NOT NULL REFERENCES opportunity_category(id),
  status opportunity_status NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE,
  url VARCHAR(2048),
  national_territory BOOLEAN NOT NULL DEFAULT false,
  rejection_message VARCHAR(4096),
  deletion_message VARCHAR(4096),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunity_place (
  opportunity_id CHAR(26) NOT NULL REFERENCES opportunity(id) ON DELETE CASCADE,
  place_id CHAR(26) NOT NULL REFERENCES place(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, place_id)
);

CREATE TABLE beneficiary_benefit (
  id CHAR(26) PRIMARY KEY,
  opportunity_id CHAR(26) NOT NULL REFERENCES opportunity(id) ON DELETE CASCADE,
  type benefit_type NOT NULL,
  value INTEGER,
  discount_type benefit_discount_type,
  description VARCHAR(4096),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);

CREATE TABLE caregiver_benefit (
  id CHAR(26) PRIMARY KEY,
  opportunity_id CHAR(26) NOT NULL REFERENCES opportunity(id) ON DELETE CASCADE,
  type benefit_type NOT NULL,
  value INTEGER,
  discount_type benefit_discount_type,
  description VARCHAR(4096),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);

CREATE TABLE localized_metadata (
  id CHAR(26) PRIMARY KEY,
  opportunity_id CHAR(26) NOT NULL REFERENCES opportunity(id) ON DELETE CASCADE,
  key localized_metadata_key NOT NULL,
  language localized_metadata_language NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_external_id VARCHAR(512) NOT NULL,
  referent_external_id VARCHAR(512) NOT NULL,
  referent_fullname VARCHAR(512) NOT NULL,
  entity_type change_audit_entity_type NOT NULL,
  entity_id CHAR(26) NOT NULL,
  change_type change_audit_change_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  value JSONB NOT NULL
);

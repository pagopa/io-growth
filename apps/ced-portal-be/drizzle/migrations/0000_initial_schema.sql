-- Custom SQL migration: Initial schema based on ER diagram
--> statement-breakpoint

CREATE TYPE operator_status AS ENUM ('active', 'suspended', 'revoked');
--> statement-breakpoint

CREATE TYPE place_type AS ENUM ('online', 'offline');
--> statement-breakpoint

CREATE TYPE support_contact_type AS ENUM ('email', 'phone', 'website');
--> statement-breakpoint

CREATE TYPE opportunity_status AS ENUM ('draft', 'test_pending', 'test_passed', 'published', 'suspended', 'deleted', 'approval_pending');
--> statement-breakpoint

CREATE TYPE benefit_type AS ENUM ('free', 'reduced_fixed_price', 'priority', 'discount', 'other');
--> statement-breakpoint

CREATE TYPE benefit_discount_type AS ENUM ('percentage', 'fixed_amount');
--> statement-breakpoint

CREATE TYPE localized_metadata_key AS ENUM ('name', 'description', 'condition');
--> statement-breakpoint

CREATE TYPE localized_metadata_language AS ENUM ('en', 'fr', 'de', 'sl', 'it');
--> statement-breakpoint

CREATE TYPE change_audit_entity_type AS ENUM ('opportunity', 'place', 'support_contact', 'profile', 'address', 'website', 'beneficiary_benefit', 'caregiver_benefit', 'localized_metadata', 'opportunity_category');
--> statement-breakpoint

CREATE TYPE change_audit_change_type AS ENUM ('create', 'update');
--> statement-breakpoint

CREATE TABLE operator (
  id TEXT PRIMARY KEY,
  external_id UUID NOT NULL,
  name TEXT NOT NULL,
  status operator_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE place (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES operator(id),
  name TEXT NOT NULL,
  type place_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE profile (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES operator(id),
  place_id TEXT NOT NULL REFERENCES place(id),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (operator_id)
);
--> statement-breakpoint

CREATE TABLE website (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES place(id),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id)
);
--> statement-breakpoint

CREATE TABLE address (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES place(id),
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id)
);
--> statement-breakpoint

CREATE TABLE support_contact (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES place(id),
  type support_contact_type NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE opportunity_category (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);
--> statement-breakpoint

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
--> statement-breakpoint

CREATE TABLE opportunity (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES operator(id),
  category_id TEXT NOT NULL REFERENCES opportunity_category(id),
  status opportunity_status NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE opportunity_place (
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  place_id TEXT NOT NULL REFERENCES place(id),
  PRIMARY KEY (opportunity_id, place_id)
);
--> statement-breakpoint

CREATE TABLE beneficiary_benefit (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  type benefit_type NOT NULL,
  value INTEGER,
  discount_type benefit_discount_type,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);
--> statement-breakpoint

CREATE TABLE caregiver_benefit (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  type benefit_type NOT NULL,
  value INTEGER,
  discount_type benefit_discount_type,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);
--> statement-breakpoint

CREATE TABLE localized_metadata (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  key localized_metadata_key NOT NULL,
  language localized_metadata_language NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE change_audit (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL REFERENCES operator(id),
  referent_external_id TEXT NOT NULL,
  referent_fullname TEXT NOT NULL,
  entity_type change_audit_entity_type NOT NULL,
  entity_id TEXT NOT NULL,
  change_type change_audit_change_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  value JSONB NOT NULL
);

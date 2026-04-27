-- Custom SQL migration: Initial schema based on ER diagram
--> statement-breakpoint

CREATE TYPE operator_status AS ENUM ('active', 'suspended', 'revoked');
--> statement-breakpoint

CREATE TYPE place_type AS ENUM ('online', 'offline');
--> statement-breakpoint

CREATE TYPE support_contact_type AS ENUM ('email', 'phone', 'website');
--> statement-breakpoint

CREATE TYPE opportunity_status AS ENUM ('draft', 'test_pending', 'test_passed', 'published', 'suspended', 'deleted');
--> statement-breakpoint

CREATE TYPE benefit_type AS ENUM ('percentual', 'absolute');
--> statement-breakpoint

CREATE TYPE localized_metadata_key AS ENUM ('name', 'description', 'condition', 'type', 'category');
--> statement-breakpoint

CREATE TYPE localized_metadata_language AS ENUM ('en', 'fr', 'de', 'sl', 'it');
--> statement-breakpoint

CREATE TYPE change_audit_entity_type AS ENUM ('opportunity', 'place', 'support_contact', 'profile', 'address', 'website', 'beneficiary_benefit', 'caregiver_benefit', 'localized_metadata');
--> statement-breakpoint

CREATE TYPE change_audit_change_type AS ENUM ('create', 'update');
--> statement-breakpoint

CREATE TABLE operator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id UUID NOT NULL,
  name TEXT NOT NULL,
  status operator_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE place (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operator(id),
  name TEXT NOT NULL,
  type place_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operator(id),
  place_id UUID NOT NULL REFERENCES place(id),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (operator_id)
);
--> statement-breakpoint

CREATE TABLE website (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES place(id),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id)
);
--> statement-breakpoint

CREATE TABLE address (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES place(id),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES place(id),
  type support_contact_type NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE opportunity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operator(id),
  status opportunity_status NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE opportunity_place (
  opportunity_id UUID NOT NULL REFERENCES opportunity(id),
  place_id UUID NOT NULL REFERENCES place(id),
  PRIMARY KEY (opportunity_id, place_id)
);
--> statement-breakpoint

CREATE TABLE beneficiary_benefit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunity(id),
  value INTEGER NOT NULL,
  type benefit_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);
--> statement-breakpoint

CREATE TABLE caregiver_benefit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunity(id),
  value INTEGER NOT NULL,
  type benefit_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id)
);
--> statement-breakpoint

CREATE TABLE localized_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunity(id),
  key localized_metadata_key NOT NULL,
  language localized_metadata_language NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operator(id),
  referent_external_id TEXT NOT NULL,
  referent_fullname TEXT NOT NULL,
  entity_type change_audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  change_type change_audit_change_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  value JSONB NOT NULL
);

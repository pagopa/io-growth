ALTER TYPE change_audit_entity_type ADD VALUE 'operator';

ALTER TABLE operator ADD COLUMN revocation_message VARCHAR(4096);
ALTER TABLE operator ADD COLUMN revoked_at TIMESTAMPTZ;

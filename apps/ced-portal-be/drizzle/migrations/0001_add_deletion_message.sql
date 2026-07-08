-- IEG-3073 — operator soft-delete reason on opportunity.
ALTER TABLE opportunity ADD COLUMN IF NOT EXISTS deletion_message VARCHAR(4096);

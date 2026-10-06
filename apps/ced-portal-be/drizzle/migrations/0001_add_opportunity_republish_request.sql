ALTER TABLE opportunity ADD COLUMN republish_message VARCHAR(4096);
ALTER TABLE opportunity ADD COLUMN republish_rejection_message VARCHAR(4096);

ALTER TABLE opportunity ADD CONSTRAINT ck_republish_message_suspended
  CHECK (republish_message IS NULL OR status = 'suspended');
ALTER TABLE opportunity ADD CONSTRAINT ck_republish_rejection_suspended
  CHECK (republish_rejection_message IS NULL OR status = 'suspended');

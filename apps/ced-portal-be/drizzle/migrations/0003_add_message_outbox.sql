CREATE TYPE message_outbox_type AS ENUM ('template', 'html');
CREATE TYPE message_outbox_status AS ENUM ('pending', 'sending', 'sent', 'failed');

CREATE TABLE message_outbox (
  id CHAR(26) PRIMARY KEY,
  type message_outbox_type NOT NULL,
  payload JSONB NOT NULL,
  status message_outbox_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  claimed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_message_outbox_attempt_count CHECK (attempt_count BETWEEN 0 AND 3)
);

-- Serves the claim query: oldest pending message first.
CREATE INDEX idx_message_outbox_pending ON message_outbox (created_at)
  WHERE status = 'pending';

-- Serves the stale-claim sweep.
CREATE INDEX idx_message_outbox_sending ON message_outbox (claimed_at)
  WHERE status = 'sending';

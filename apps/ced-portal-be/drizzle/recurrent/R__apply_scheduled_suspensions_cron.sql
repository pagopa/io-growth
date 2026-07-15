-- pg_cron background worker lives in postgres (cron.database_name = "postgres").
-- @database postgres


-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- LOCAL DEVELOPMENT ENVIRONMENT
-- Only schedule against postgres when neither ced_test nor ced_prod exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname IN ('ced_test', 'ced_prod')) THEN
    PERFORM cron.schedule_in_database(
      'apply-scheduled-suspensions-local',
      '5 0 * * *',
      $cmd$
        SELECT set_config('app.operator_external_id', 'system', true),
               set_config('app.referent_external_id', 'system', true),
               set_config('app.referent_fullname', 'system', true);
        UPDATE opportunity
           SET status       = 'suspended',
               suspend_from = NULL,
               updated_at   = now()
         WHERE status        = 'published'
           AND suspend_from IS NOT NULL
           AND suspend_from <= CURRENT_DATE;
      $cmd$,
      'postgres'
    );
  END IF;
END
$$;

-- CED_TEST ENVIRONMENT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ced_test') THEN
    PERFORM cron.schedule_in_database(
      'apply-scheduled-suspensions-ced-test',
      '5 0 * * *',
      $cmd$
        SELECT set_config('app.operator_external_id', 'system', true),
               set_config('app.referent_external_id', 'system', true),
               set_config('app.referent_fullname', 'system', true);
        UPDATE opportunity
           SET status       = 'suspended',
               suspend_from = NULL,
               updated_at   = now()
         WHERE status        = 'published'
           AND suspend_from IS NOT NULL
           AND suspend_from <= CURRENT_DATE;
      $cmd$,
      'ced_test'
    );
  END IF;
END
$$;

-- Jobs targeting ced_prod are scheduled via cron.schedule_in_database().
-- TODO: Schedule the job in ced_prod, and choose a suitable schedule

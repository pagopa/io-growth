-- pg_cron background worker lives in postgres (cron.database_name = "postgres").
-- @database postgres

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- LOCAL DEVELOPMENT ENVIRONMENT
-- Only schedule against postgres when neither ced_test nor ced_prod exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname IN ('ced_test', 'ced_prod')) THEN
    -- refresh materialized views every 15 minutes
    PERFORM cron.schedule_in_database('refresh-place-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY place_materialized_view;', 'postgres');
    PERFORM cron.schedule_in_database('refresh-opportunity-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY opportunity_materialized_view;', 'postgres');
  END IF;
END
$$;

-- CED_TEST ENVIRONMENT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ced_test') THEN
    -- refresh materialized views every 15 minutes
    PERFORM cron.schedule_in_database('refresh-place-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY place_materialized_view;', 'ced_test');
    PERFORM cron.schedule_in_database('refresh-opportunity-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY opportunity_materialized_view;', 'ced_test');
  END IF;
END
$$;

-- Jobs targeting ced_prod are scheduled via cron.schedule_in_database().
-- TODO: Schedule the job in ced_prod, and choose a suitable schedule

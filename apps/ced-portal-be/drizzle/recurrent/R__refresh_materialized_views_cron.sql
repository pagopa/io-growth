-- pg_cron background worker lives in postgres (cron.database_name = "postgres").
-- Jobs targeting ced_test are scheduled via cron.schedule_in_database().
-- Jobs targeting ced_prod are scheduled via cron.schedule_in_database().

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job in ced_test every 15 minutes
SELECT cron.schedule_in_database('refresh-place-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY place_materialized_view;', 'ced_test');
SELECT cron.schedule_in_database('refresh-opportunity-materialized-view-ced-test', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY opportunity_materialized_view;', 'ced_test');

-- TODO: Schedule the job in ced_prod, and choose a suitable schedule

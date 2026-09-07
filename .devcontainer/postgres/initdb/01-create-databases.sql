-- Application databases used by environment routing.
-- The server default database remains `postgres` (pg_cron cron.database_name).
-- This directory is only executed on a fresh data volume.
CREATE DATABASE ced_prod;
CREATE DATABASE ced_test;

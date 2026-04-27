CREATE OR REPLACE FUNCTION refresh_view(view_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = view_name
  ) THEN
    RAISE EXCEPTION 'No materialized view named "%" in schema public', view_name;
  END IF;

  EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_name);
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'backend') THEN
    GRANT EXECUTE ON FUNCTION refresh_view(text) TO backend;
  END IF;
END;
$$;

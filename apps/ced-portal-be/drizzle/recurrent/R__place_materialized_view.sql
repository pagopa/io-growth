-- Recurrent: Place materialized view
-- Re-applied automatically when this file changes (checksum-based)

DROP MATERIALIZED VIEW IF EXISTS place_materialized_view;

CREATE MATERIALIZED VIEW place_materialized_view AS
SELECT
  p.id,
  pf.display_name AS profile_display_name,
  pf.id AS profile_id,
  p.operator_id,
  p.name,
  p.type,
  a.street,
  a.city,
  a.state,
  a.postal_code,
  a.country,
  w.url,
  to_tsvector('simple',
    coalesce(p.name, '')
  ) AS search_vector_name,
  to_tsvector('simple',
    coalesce(a.city, '')
  ) AS search_vector_city,
  to_tsvector('simple',
    coalesce(pf.display_name, '')
  ) AS search_vector_display_name
FROM place p
LEFT JOIN profile pf ON pf.place_id = p.id
LEFT JOIN address a ON a.place_id = p.id
LEFT JOIN website w ON w.place_id = p.id
LEFT JOIN opportunity_place opp_p ON opp_p.place_id = p.id
JOIN opportunity o ON o.id = opp_p.opportunity_id
WHERE
  pf.id IS NOT NULL OR
  o.status = 'published' AND
  CURRENT_DATE >= o.date_from AND
  CURRENT_DATE <= coalesce(o.date_to, 'infinity'::date)
;

CREATE INDEX idx_place_mv_operator ON place_materialized_view (operator_id);
CREATE INDEX idx_place_mv_search_name ON place_materialized_view USING gin(search_vector_name);
CREATE INDEX idx_place_mv_search_city ON place_materialized_view USING gin(search_vector_city);
CREATE INDEX idx_place_mv_search_display_name ON place_materialized_view USING gin(search_vector_display_name);

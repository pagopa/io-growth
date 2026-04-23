-- Recurrent: Place materialized view
-- Re-applied automatically when this file changes (checksum-based)

DROP MATERIALIZED VIEW IF EXISTS place_materialized_view;

CREATE MATERIALIZED VIEW place_materialized_view AS
SELECT
  p.id,
  op.opportunity_id,
  p.name,
  p.type,
  a.street,
  a.city,
  a.state,
  a.postal_code,
  a.country,
  w.url,
  to_tsvector('simple',
    coalesce(p.name, '') || ' ' ||
    coalesce(a.city, '') || ' ' ||
    coalesce(a.state, '')
  ) AS search_vector
FROM place p
JOIN opportunity_place op ON op.place_id = p.id
LEFT JOIN address a ON a.place_id = p.id
LEFT JOIN website w ON w.place_id = p.id;

CREATE UNIQUE INDEX idx_place_mv_id_opp ON place_materialized_view (id, opportunity_id);
CREATE INDEX idx_place_mv_opportunity ON place_materialized_view (opportunity_id);
CREATE INDEX idx_place_mv_search ON place_materialized_view USING gin(search_vector);

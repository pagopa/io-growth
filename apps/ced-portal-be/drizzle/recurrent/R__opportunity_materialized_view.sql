-- Recurrent: Opportunity materialized view
-- Re-applied automatically when this file changes (checksum-based)

DROP MATERIALIZED VIEW IF EXISTS opportunity_materialized_view;

CREATE MATERIALIZED VIEW opportunity_materialized_view AS
SELECT
  o.id,
  o.operator_id,
  o.national_territory,
  o.date_from,
  o.date_to,
  pf.display_name AS profile_display_name,
  lm_name.value AS name,
  lm_name.language,
  bb.type AS beneficiary_benefit_type,
  bb.value AS beneficiary_benefit_value,
  bb.discount_type AS beneficiary_benefit_discount_type,
  opp_p.place_id AS place_id
FROM opportunity o
JOIN beneficiary_benefit bb ON bb.opportunity_id = o.id
JOIN profile pf ON pf.operator_id = o.operator_id
LEFT JOIN opportunity_place opp_p ON opp_p.opportunity_id = o.id
JOIN localized_metadata lm_name ON lm_name.opportunity_id = o.id AND lm_name.key = 'name'
WHERE
  o.status = 'published' AND
  CURRENT_DATE >= o.date_from AND
  CURRENT_DATE <= coalesce(o.date_to, 'infinity'::date)
;

CREATE INDEX idx_opportunity_mv_operator ON opportunity_materialized_view (operator_id);
CREATE INDEX idx_opportunity_mv_place ON opportunity_materialized_view (place_id);
CREATE INDEX idx_opportunity_mv_language ON opportunity_materialized_view (language);

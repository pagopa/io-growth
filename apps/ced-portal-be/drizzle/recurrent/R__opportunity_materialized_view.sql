-- Recurrent: Opportunity materialized view
-- Re-applied automatically when this file changes (checksum-based)

DROP MATERIALIZED VIEW IF EXISTS opportunity_materialized_view;

CREATE MATERIALIZED VIEW opportunity_materialized_view AS
SELECT
  o.id,
  o.operator_id,
  o.status,
  o.date_from,
  o.date_to,
  o.url,
  lm_name.value AS name,
  lm_desc.value AS description,
  lm_cond.value AS condition,
  lm_type.value AS type,
  lm_cat.value AS category,
  lm_name.language,
  bb.value AS beneficiary_benefit_value,
  bb.type AS beneficiary_benefit_type,
  cb.value AS caregiver_benefit_value,
  cb.type AS caregiver_benefit_type,
  to_tsvector('simple',
    coalesce(lm_name.value, '') || ' ' ||
    coalesce(lm_desc.value, '') || ' ' ||
    coalesce(lm_cat.value, '')
  ) AS search_vector
FROM opportunity o
JOIN beneficiary_benefit bb ON bb.opportunity_id = o.id
LEFT JOIN caregiver_benefit cb ON cb.opportunity_id = o.id
LEFT JOIN localized_metadata lm_name ON lm_name.opportunity_id = o.id AND lm_name.key = 'name'
LEFT JOIN localized_metadata lm_desc ON lm_desc.opportunity_id = o.id AND lm_desc.key = 'description'
LEFT JOIN localized_metadata lm_cond ON lm_cond.opportunity_id = o.id AND lm_cond.key = 'condition'
LEFT JOIN localized_metadata lm_type ON lm_type.opportunity_id = o.id AND lm_type.key = 'type'
LEFT JOIN localized_metadata lm_cat ON lm_cat.opportunity_id = o.id AND lm_cat.key = 'category'
WHERE lm_name.language = lm_desc.language
  AND lm_desc.language = lm_cond.language
  AND lm_cond.language = lm_type.language
  AND lm_type.language = lm_cat.language;

CREATE UNIQUE INDEX idx_opportunity_mv_id_lang ON opportunity_materialized_view (id, language);
CREATE INDEX idx_opportunity_mv_operator ON opportunity_materialized_view (operator_id);
CREATE INDEX idx_opportunity_mv_status ON opportunity_materialized_view (status);
CREATE INDEX idx_opportunity_mv_search ON opportunity_materialized_view USING gin(search_vector);

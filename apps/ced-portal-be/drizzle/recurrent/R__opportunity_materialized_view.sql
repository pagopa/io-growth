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
  oc.title AS category_title,
  oc.description AS category_description,
  lm_name.language,
  bb.type AS beneficiary_benefit_type,
  bb.value AS beneficiary_benefit_value,
  bb.discount_type AS beneficiary_benefit_discount_type,
  bb.description AS beneficiary_benefit_description,
  cb.type AS caregiver_benefit_type,
  cb.value AS caregiver_benefit_value,
  cb.discount_type AS caregiver_benefit_discount_type,
  cb.description AS caregiver_benefit_description,
  to_tsvector('simple',
    coalesce(lm_name.value, '') || ' ' ||
    coalesce(lm_desc.value, '') || ' ' ||
    coalesce(oc.title, '')
  ) AS search_vector
FROM opportunity o
JOIN opportunity_category oc ON oc.id = o.category_id
JOIN beneficiary_benefit bb ON bb.opportunity_id = o.id
LEFT JOIN caregiver_benefit cb ON cb.opportunity_id = o.id
LEFT JOIN localized_metadata lm_name ON lm_name.opportunity_id = o.id AND lm_name.key = 'name'
LEFT JOIN localized_metadata lm_desc ON lm_desc.opportunity_id = o.id AND lm_desc.key = 'description'
  AND lm_name.language = lm_desc.language
LEFT JOIN localized_metadata lm_cond ON lm_cond.opportunity_id = o.id AND lm_cond.key = 'condition'
  AND lm_name.language = lm_cond.language
WHERE lm_name.value IS NOT NULL;

CREATE UNIQUE INDEX idx_opportunity_mv_id_lang ON opportunity_materialized_view (id, language);
CREATE INDEX idx_opportunity_mv_operator ON opportunity_materialized_view (operator_id);
CREATE INDEX idx_opportunity_mv_status ON opportunity_materialized_view (status);
CREATE INDEX idx_opportunity_mv_search ON opportunity_materialized_view USING gin(search_vector);

ALTER TABLE opportunity_category ADD COLUMN label VARCHAR(64);

-- Sport -> Cultura, Lavoro -> Istruzione, Telefonia -> Casa (citizen_services)
UPDATE opportunity SET category_id = '01KRJXEYD44B58700GT982CCYY' WHERE category_id = '01KRJXEYD6WM56BBC9WFGPKAR5';
UPDATE opportunity SET category_id = '01KRJXEYD64E7NX00R5VT185AT' WHERE category_id = '01KRJXEYD7B8F56F38DGF1KFYV';
UPDATE opportunity SET category_id = '01KRJXEYD7RE4V6JBNB853ZPDT' WHERE category_id = '01KRJXEYD7G4B4AZW2AM6YAQVX';

DELETE FROM opportunity_category WHERE id IN ('01KRJXEYD6WM56BBC9WFGPKAR5', '01KRJXEYD7B8F56F38DGF1KFYV');

-- The Telefonia id is reused for municipal_services; its opportunities were moved above.
UPDATE opportunity_category SET label = CASE id
  WHEN '01KRJXEYD44B58700GT982CCYY' THEN 'culture_sport'
  WHEN '01KRJXEYD64E7NX00R5VT185AT' THEN 'education_employment'
  WHEN '01KRJXEYD65ATJ5ZSRFYERG510' THEN 'health_wellbeing'
  WHEN '01KRJXEYD761M9DQ7NGYAWT2S1' THEN 'financial_services'
  WHEN '01KRJXEYD7SSFPE6BP90C7GG5K' THEN 'travel_tourism'
  WHEN '01KRJXEYD7S0XYAQS96F7HKJFE' THEN 'mobility_transport'
  WHEN '01KRJXEYD7RE4V6JBNB853ZPDT' THEN 'citizen_services'
  WHEN '01KRJXEYD7G4B4AZW2AM6YAQVX' THEN 'municipal_services'
END;

ALTER TABLE opportunity_category DROP COLUMN title;
ALTER TABLE opportunity_category DROP COLUMN description;
ALTER TABLE opportunity_category ALTER COLUMN label SET NOT NULL;
ALTER TABLE opportunity_category ADD CONSTRAINT uq_opportunity_category_label UNIQUE (label);

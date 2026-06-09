-- Define audit processing function
CREATE OR REPLACE FUNCTION process_audit()
RETURNS TRIGGER AS $$
DECLARE
    op_type TEXT;
    operator_id TEXT;
    referent_external_id TEXT;
    referent_fullname TEXT;
BEGIN
    operator_id := current_setting('app.operator_id', true);
    referent_external_id := current_setting('app.referent_external_id', true);
    referent_fullname := current_setting('app.referent_fullname', true);

    IF (TG_OP = 'INSERT') THEN
        op_type := 'create';
    ELSIF (TG_OP = 'UPDATE') THEN
        op_type := 'update';
    END IF;

    -- Skip audit if no authenticated session context is available
    -- (e.g., direct admin queries, migrations, or context propagation gaps).
    IF operator_id IS NULL OR operator_id = '' THEN
        RETURN NEW;
    END IF;

    BEGIN
        INSERT INTO change_audit (operator_id, referent_external_id, referent_fullname, entity_type, entity_id, change_type, value)
        VALUES (
            operator_id,
            referent_external_id,
            referent_fullname,
            TG_TABLE_NAME::text::change_audit_entity_type,
            NEW.id,
            op_type::change_audit_change_type,
            to_jsonb(NEW)
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '[audit] Failed to write audit record for %.%: % %',
            TG_TABLE_NAME, NEW.id, SQLERRM, SQLSTATE;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to all auditable tables.
DO $$
DECLARE
    audited_tables TEXT[] := ARRAY[
        'place',
        'profile',
        'website',
        'address',
        'support_contact',
        'opportunity',
        'beneficiary_benefit',
        'caregiver_benefit',
        'localized_metadata'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY audited_tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON %I', t);
        EXECUTE format(
            'CREATE TRIGGER audit_trigger
             AFTER INSERT OR UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION process_audit()',
            t
        );
    END LOOP;
END;
$$;

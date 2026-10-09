-- Keeps opportunity.publishing_notified_at NULL while the opportunity is outside the
-- visibility window, so the notification job emails it again on every (re-)entry.
CREATE OR REPLACE FUNCTION reset_opportunity_publishing_notified()
RETURNS TRIGGER AS $$
DECLARE
    old_visible BOOLEAN;
    new_visible BOOLEAN;
BEGIN
    -- Same predicate as opportunity_materialized_view.
    old_visible := OLD.status = 'published'
        AND CURRENT_DATE >= OLD.date_from
        AND CURRENT_DATE <= COALESCE(OLD.date_to, 'infinity'::date);
    new_visible := NEW.status = 'published'
        AND CURRENT_DATE >= NEW.date_from
        AND CURRENT_DATE <= COALESCE(NEW.date_to, 'infinity'::date);

    IF (new_visible AND NOT old_visible) OR NOT new_visible THEN
        NEW.publishing_notified_at := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opportunity_publishing_notified_trigger ON opportunity;
CREATE TRIGGER opportunity_publishing_notified_trigger
    BEFORE UPDATE ON opportunity
    FOR EACH ROW EXECUTE FUNCTION reset_opportunity_publishing_notified();

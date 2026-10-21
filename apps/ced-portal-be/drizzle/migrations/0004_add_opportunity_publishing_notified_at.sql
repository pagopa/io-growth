-- NULL means the "published" email is still owed; a trigger resets it whenever the row enters or leaves the visibility window.
ALTER TABLE opportunity ADD COLUMN publishing_notified_at TIMESTAMPTZ;

-- Opportunities already visible were notified by the approval/republish emails.
UPDATE opportunity
   SET publishing_notified_at = now()
 WHERE status = 'published'
   AND CURRENT_DATE >= date_from
   AND CURRENT_DATE <= COALESCE(date_to, 'infinity'::date);

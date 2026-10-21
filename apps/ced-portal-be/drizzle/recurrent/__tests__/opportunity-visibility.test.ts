import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const postgresContainer = process.env.POSTGRES_TEST_CONTAINER;

const freezeClock = (source: string) =>
  source
    .replaceAll("CURRENT_DATE", "test_now()::date")
    .replaceAll("CURRENT_TIMESTAMP", "test_now()");

const migrations = [
  "R__opportunity_materialized_view.sql",
  "R__place_materialized_view.sql",
  "R__opportunity_publishing_notified_trigger.sql",
]
  .map((filename) =>
    freezeClock(
      readFileSync(new URL(`../${filename}`, import.meta.url), "utf8"),
    ),
  )
  .join("\n");

const notificationSource = readFileSync(
  new URL(
    "../../../src/adapters/outbound/drizzle/drizzle-opportunity-notification.repository.ts",
    import.meta.url,
  ),
  "utf8",
);
const notificationQuery = notificationSource.match(
  /tx\.execute<VisibleOpportunityRow>\(sql`([\s\S]*?)`\)/,
)?.[1];
if (!notificationQuery) {
  throw new Error(
    "Could not find the publication notification selection query",
  );
}
const frozenNotificationQuery = freezeClock(
  notificationQuery.replace("${limit}", "100"),
);

const fixture = `
  CREATE SCHEMA opportunity_visibility_test;
  SET LOCAL search_path TO opportunity_visibility_test;
  CREATE FUNCTION test_now() RETURNS timestamptz
    LANGUAGE sql STABLE
    AS $$ SELECT current_setting('test.instant')::timestamptz $$;
  CREATE TABLE opportunity (
    id text, operator_id text, national_territory boolean,
    date_from date, date_to date, status text,
    publishing_notified_at timestamptz, created_at timestamptz DEFAULT now()
  );
  CREATE TABLE operator (id text, name text, fiscal_code text);
  CREATE TABLE beneficiary_benefit (
    opportunity_id text, type text, value text, discount_type text
  );
  CREATE TABLE profile (
    id text, operator_id text, place_id text, display_name text, contact_email text
  );
  CREATE TABLE opportunity_place (opportunity_id text, place_id text);
  CREATE TABLE localized_metadata (
    opportunity_id text, key text, value text, language text
  );
  CREATE TABLE place (id text, operator_id text, name text, type text);
  CREATE TABLE address (
    place_id text, street text, city text, state text, postal_code text, country text
  );
  CREATE TABLE website (place_id text, url text);
  INSERT INTO operator VALUES ('operator', 'Operator', 'fiscal-code');
  INSERT INTO profile VALUES ('profile', 'operator', NULL, 'Profile', 'operator@example.test');
  INSERT INTO opportunity (id, operator_id, national_territory, date_from, date_to, status)
    SELECT 'starting', 'operator', true, reference_date, NULL, 'published'
      FROM (SELECT current_setting('test.date')::date AS reference_date) d
    UNION ALL
    SELECT 'expiring', 'operator', true, reference_date - 10, reference_date - 1, 'published'
      FROM (SELECT current_setting('test.date')::date AS reference_date) d
    UNION ALL
    SELECT 'inclusive-end', 'operator', true, reference_date - 10, reference_date, 'published'
      FROM (SELECT current_setting('test.date')::date AS reference_date) d
    UNION ALL
    SELECT 'future', 'operator', true, reference_date + 1, NULL, 'published'
      FROM (SELECT current_setting('test.date')::date AS reference_date) d
    UNION ALL
    SELECT 'draft', 'operator', true, reference_date - 10, NULL, 'draft'
      FROM (SELECT current_setting('test.date')::date AS reference_date) d;
  INSERT INTO beneficiary_benefit
    SELECT id, 'free', NULL, NULL FROM opportunity;
  INSERT INTO localized_metadata
    SELECT id, 'name', id, 'it' FROM opportunity;
  INSERT INTO place SELECT id, 'operator', id, 'physical' FROM opportunity;
  INSERT INTO opportunity_place SELECT id, id FROM opportunity;
`;

const runSql = (source: string): string => {
  if (!postgresContainer) {
    throw new Error(
      "POSTGRES_TEST_CONTAINER must name a disposable PostgreSQL container",
    );
  }
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      postgresContainer,
      "psql",
      "-XqAt",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
    ],
    { encoding: "utf8", input: source },
  ).trim();
};

describe.skipIf(!postgresContainer)(
  "opportunity visibility in PostgreSQL",
  () => {
    it.each([
      ["summer before midnight", "2026-07-14T21:59:59Z", "2026-07-15", false],
      ["summer midnight", "2026-07-14T22:00:00Z", "2026-07-15", true],
      ["winter before midnight", "2026-01-14T22:59:59Z", "2026-01-15", false],
      ["winter midnight", "2026-01-14T23:00:00Z", "2026-01-15", true],
      ["before spring DST", "2026-03-28T23:00:00Z", "2026-03-29", true],
      ["after spring DST", "2026-03-29T22:00:00Z", "2026-03-30", true],
      ["before autumn DST", "2026-10-24T22:00:00Z", "2026-10-25", true],
      ["after autumn DST", "2026-10-25T23:00:00Z", "2026-10-26", true],
    ])(
      "%s uses the Rome date for views and notification flags",
      (_, instant, date, started) => {
        const expected = started
          ? ["inclusive-end", "starting"]
          : ["expiring", "inclusive-end"];
        const result = JSON.parse(
          runSql(`
        BEGIN;
        SET LOCAL client_min_messages TO warning;
        SET LOCAL TIME ZONE 'UTC';
        SELECT set_config('test.instant', '${instant}', true) \\gset
        SELECT set_config('test.date', '${date}', true) \\gset
        ${fixture}
        ${migrations}
        REFRESH MATERIALIZED VIEW opportunity_materialized_view;
        REFRESH MATERIALIZED VIEW place_materialized_view;
        CREATE TEMP TABLE notification_candidates AS ${frozenNotificationQuery};
        UPDATE opportunity SET publishing_notified_at = '${instant}'::timestamptz;
        SELECT json_build_object(
          'opportunities', (SELECT json_agg(id ORDER BY id) FROM opportunity_materialized_view),
          'places', (SELECT json_agg(id ORDER BY id) FROM place_materialized_view),
          'notifications', (SELECT json_agg(id ORDER BY id) FROM notification_candidates),
          'notified', (SELECT json_agg(id ORDER BY id) FROM opportunity WHERE publishing_notified_at IS NOT NULL)
        );
        ROLLBACK;
      `),
        );

        expect(result).toEqual({
          notifications: expected,
          notified: expected,
          opportunities: expected,
          places: expected,
        });
      },
    );

    it.each(["UTC", "Europe/Rome", "America/New_York"])(
      "keeps publication independent of the %s session timezone",
      (timezone) => {
        const result = runSql(`
        BEGIN;
        SET LOCAL client_min_messages TO warning;
        SET LOCAL TIME ZONE '${timezone}';
        SELECT set_config('test.instant', '2026-07-14T22:00:00Z', true) \\gset
        SELECT set_config('test.date', '2026-07-15', true) \\gset
        ${fixture}
        ${migrations}
        SELECT id FROM opportunity_materialized_view WHERE id = 'starting';
        ROLLBACK;
      `);

        expect(result).toBe("starting");
      },
    );
  },
);

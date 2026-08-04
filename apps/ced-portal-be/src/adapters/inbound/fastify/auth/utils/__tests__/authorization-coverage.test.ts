import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const fastifyRoot = join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  "..",
  "..",
);

const ADMIN_HANDLERS = [
  "opportunities/admin-list-opportunities.handler.ts",
  "opportunities/admin-get-opportunity.handler.ts",
  "opportunities/admin-approve-opportunity.handler.ts",
  "opportunities/admin-suspend-opportunity.handler.ts",
  "opportunities/admin-cancel-scheduled-suspension.handler.ts",
  "department/admin-complete-onboarding.handler.ts",
  "department/admin-list-pending-onboardings.handler.ts",
  "department/admin-get-onboarding.handler.ts",
  "department/admin-get-contract-signed.handler.ts",
];

const OPERATOR_HANDLERS = [
  "opportunities/operator-get-opportunity.handler.ts",
  "opportunities/operator-create-opportunity.handler.ts",
  "opportunities/operator-list-opportunities.handler.ts",
  "opportunities/operator-request-opportunity-test.handler.ts",
  "opportunities/operator-publish-opportunity.handler.ts",
  "opportunities/operator-delete-opportunity.handler.ts",
  "opportunities/operator-suspend-opportunity.handler.ts",
  "opportunities/operator-cancel-scheduled-suspension.handler.ts",
  "opportunities/operator-list-opportunity-categories.handler.ts",
  "places/operator-get-place.handler.ts",
  "places/operator-list-places.handler.ts",
  "places/operator-create-place.handler.ts",
  "profile/operator-get-profile.handler.ts",
  "profile/operator-create-profile.handler.ts",
];

const callsWithAllowList = (relativePath: string, allowList: string) => {
  const content = readFileSync(join(fastifyRoot, relativePath), "utf8");
  const pattern = new RegExp(
    `withUserTypeAuthorization\\(\\s*${allowList}\\s*,`,
  );

  return pattern.test(content);
};

describe("authorization coverage across all 23 protected handlers", () => {
  it.each(ADMIN_HANDLERS)(
    "%s calls withUserTypeAuthorization(ADMIN_USER_TYPES, ...)",
    (relativePath) => {
      expect(callsWithAllowList(relativePath, "ADMIN_USER_TYPES")).toBe(true);
    },
  );

  it.each(OPERATOR_HANDLERS)(
    "%s calls withUserTypeAuthorization(OPERATOR_USER_TYPES, ...)",
    (relativePath) => {
      expect(callsWithAllowList(relativePath, "OPERATOR_USER_TYPES")).toBe(
        true,
      );
    },
  );

  it("accounts for exactly 23 protected handlers (9 admin/department + 14 operator)", () => {
    expect(ADMIN_HANDLERS.length + OPERATOR_HANDLERS.length).toBe(23);
  });
});

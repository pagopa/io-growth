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
  "department/complete-onboarding.handler.ts",
  "department/list-pending-onboardings.handler.ts",
  "department/get-onboarding.handler.ts",
  "department/get-contract-signed.handler.ts",
];

const OPERATOR_HANDLERS = [
  "opportunities/get-operator-opportunity.handler.ts",
  "opportunities/create-operator-opportunity.handler.ts",
  "opportunities/list-operator-opportunities.handler.ts",
  "opportunities/operator-request-opportunity-test.handler.ts",
  "opportunities/operator-publish-opportunity.handler.ts",
  "opportunities/operator-delete-opportunity.handler.ts",
  "opportunities/operator-suspend-opportunity.handler.ts",
  "opportunities/operator-cancel-scheduled-suspension.handler.ts",
  "opportunities/list-opportunity-categories.handler.ts",
  "places/get-operator-place.handler.ts",
  "places/list-operator-places.handler.ts",
  "places/create-operator-place.handler.ts",
  "profile/get-operator-profile.handler.ts",
  "profile/create-operator-profile.handler.ts",
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

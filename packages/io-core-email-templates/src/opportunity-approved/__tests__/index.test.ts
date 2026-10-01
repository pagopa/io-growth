import { describe, expect, it } from "vitest";

import { apply } from "../index.js";

describe("opportunity-approved template", () => {
  it("renders the opportunity name and availability date into the HTML output", () => {
    const html = apply({
      availabilityDate: new Date("2024-01-15T00:00:00Z"),
      opportunityName: "Opportunità di test",
    });

    expect(html).toContain("Opportunità di test");
    expect(html).toContain("15/01/2024");
    expect(html).not.toContain("{{opportunityName}}");
    expect(html).not.toContain("{{availabilityDate}}");
  });

  it("matches the snapshot", () => {
    const html = apply({
      availabilityDate: new Date("2024-01-15T00:00:00Z"),
      opportunityName: "Opportunità di test",
    });

    expect(html).toMatchSnapshot();
  });
});

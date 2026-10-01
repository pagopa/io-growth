import { describe, expect, it } from "vitest";

import { apply } from "../index.js";

describe("opportunity-published template", () => {
  it("renders the opportunity name into the HTML output", () => {
    const html = apply({
      opportunityName: "Opportunità di test",
    });

    expect(html).toContain("Opportunità di test");
    expect(html).not.toContain("{{opportunityName}}");
  });

  it("matches the snapshot", () => {
    const html = apply({
      opportunityName: "Opportunità di test",
    });

    expect(html).toMatchSnapshot();
  });
});

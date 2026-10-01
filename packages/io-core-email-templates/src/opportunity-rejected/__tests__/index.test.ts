import { describe, expect, it } from "vitest";

import { apply } from "../index.js";

describe("opportunity-rejected template", () => {
  it("renders the opportunity name and rejection message into the HTML output", () => {
    const html = apply({
      opportunityName: "Opportunità di test",
      rejectionMessage: "Modifica richiesta",
    });

    expect(html).toContain("Opportunità di test");
    expect(html).toContain("Modifica richiesta");
    expect(html).not.toContain("{{opportunityName}}");
    expect(html).not.toContain("{{rejectionMessage}}");
  });

  it("matches the snapshot", () => {
    const html = apply({
      opportunityName: "Opportunità di test",
      rejectionMessage: "Modifica richiesta",
    });

    expect(html).toMatchSnapshot();
  });
});

import { describe, expect, it } from "vitest";

import { mapPlaceDetailRow } from "../place-detail-row.mapper.js";

const baseRow = {
  id: "place-id",
  name: "Sportello CED",
  operator: {
    name: "Comune di Alessandria SRL",
    profile: { displayName: "Comune di Alessandria", id: "profile-id" },
  },
  operatorId: "operator-id",
  supportContacts: [] as { type: string; value: string }[],
  type: "offline",
};

describe("mapPlaceDetailRow", () => {
  it("sets entityId to the profile id, not the operator id", () => {
    const result = mapPlaceDetailRow(baseRow, [], []);

    expect(result.entityId).toBe("profile-id");
    expect(result.entityId).not.toBe("operator-id");
    expect(result.entityName).toBe("Comune di Alessandria");
  });

  it("falls back to an empty entityId when the operator has no profile", () => {
    const result = mapPlaceDetailRow(
      { ...baseRow, operator: { name: "Operatore senza profilo" } },
      [],
      [],
    );

    expect(result.entityId).toBe("");
    expect(result.entityName).toBe("Operatore senza profilo");
  });
});

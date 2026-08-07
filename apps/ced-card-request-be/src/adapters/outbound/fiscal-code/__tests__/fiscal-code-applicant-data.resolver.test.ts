import { describe, expect, it } from "vitest";

import { createFiscalCodeApplicantDataResolver } from "../fiscal-code-applicant-data.resolver.js";

const NOW = () => new Date("2026-08-04T00:00:00.000Z");

describe("createFiscalCodeApplicantDataResolver", () => {
  const resolver = createFiscalCodeApplicantDataResolver(NOW);

  it("combines FIMS names with birth data decoded from the fiscal code", async () => {
    await expect(
      resolver.resolve({
        familyName: "Rossi",
        fiscalCode: "RSSMRA80A01H501U",
        givenName: "Mario",
      }),
    ).resolves.toEqual({
      cognome: "Rossi",
      comuneNascita: "Roma",
      dataNascita: "1980-01-01",
      nome: "Mario",
      sesso: "M",
      siglaProvinciaNascita: "RM",
      statoNascita: "ITALIA",
    });
  });

  it("decodes female birth days and omocodia characters", async () => {
    await expect(
      resolver.resolve({
        familyName: "Verdi",
        fiscalCode: "VRDNNA9RC71C933I",
        givenName: "Anna",
      }),
    ).resolves.toMatchObject({
      cognome: "Verdi",
      dataNascita: "1995-03-31",
      nome: "Anna",
      sesso: "F",
    });
  });

  it("returns FIMS names and birthplace when birth data cannot be decoded", async () => {
    await expect(
      resolver.resolve({
        familyName: "Rossi",
        fiscalCode: "RSSMRA80Z01H501U",
        givenName: "Mario",
      }),
    ).resolves.toEqual({
      cognome: "Rossi",
      comuneNascita: "Roma",
      nome: "Mario",
      siglaProvinciaNascita: "RM",
      statoNascita: "ITALIA",
    });
  });

  it("uses the previous century when the encoded birthday is in the future", async () => {
    await expect(
      resolver.resolve({
        familyName: "Rossi",
        fiscalCode: "RSSMRA26T31H501U",
        givenName: "Mario",
      }),
    ).resolves.toMatchObject({
      cognome: "Rossi",
      dataNascita: "1926-12-31",
      nome: "Mario",
      sesso: "M",
    });
  });

  it("maps a foreign Belfiore code to the birth state", async () => {
    await expect(
      resolver.resolve({
        familyName: "Rossi",
        fiscalCode: "RSSMRA80A01Z404U",
        givenName: "Mario",
      }),
    ).resolves.toMatchObject({
      statoNascita: "Stati Uniti d'America",
    });
  });
});

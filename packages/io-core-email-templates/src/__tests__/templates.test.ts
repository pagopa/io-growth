import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import type { SesEmailTemplate } from "../types.js";

const sourceDirectory = new URL("../", import.meta.url);
const normalize = (value: string): string =>
  value
    .replace(/<(?:style|script)\b[^>]*>[\s\S]*?<\/(?:style|script)>/gi, "")
    .replace(/<\/(?:p|div|td|tr|table|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:rsquo|lsquo|#8217|#39);|[’‘]/g, "'")
    .replace(/&(?:nbsp|#160);/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&agrave;/g, "à")
    .replace(/&egrave;/g, "è")
    .replace(/&eacute;/g, "é")
    .replace(/&igrave;/g, "ì")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù")
    .replace(/\s+/g, " ")
    .trim();

interface Scenario {
  body: string[];
  bold: string[];
  name: string;
  subject: string;
}

const scenarios: Scenario[] = [
  {
    body: [
      "abbiamo approvato l’opportunità {{opportunityName}}.",
      "L’opportunità sarà disponibile su IO dal {{availabilityDate}}.",
    ],
    bold: ["approvato", "{{opportunityName}}", "{{availabilityDate}}"],
    name: "operator-opportunity-approved",
    subject: "Opportunità approvata - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo revisionato l’opportunità {{opportunityName}} e ti chiediamo di fare le seguenti modifiche:",
      "{{rejectionMessage}}",
      "Una volta modificata e inviata, revisioneremo di nuovo l’opportunità.",
    ],
    bold: [
      "{{opportunityName}}",
      "fare le seguenti modifiche",
      "{{rejectionMessage}}",
    ],
    name: "operator-opportunity-rejected",
    subject: "Opportunità da modificare - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo pubblicato l’opportunità {{opportunityName}}.",
      "L’opportunità sarà disponibile su IO dal {{availabilityDate}}.",
    ],
    bold: ["pubblicato", "{{opportunityName}}", "{{availabilityDate}}"],
    name: "operator-opportunity-published",
    subject: "Opportunità pubblicata - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo pubblicato di nuovo l’opportunità {{opportunityName}}.",
      "L’opportunità sarà di nuovo disponibile su IO.",
    ],
    bold: ["pubblicato di nuovo", "{{opportunityName}}"],
    name: "operator-opportunity-republished",
    subject: "Opportunità ripubblicata - {{opportunityName}}",
  },
  {
    body: ["l’opportunità {{opportunityName}} è stata eliminata."],
    bold: ["{{opportunityName}}", "è stata eliminata"],
    name: "operator-opportunity-deleted",
    subject: "Opportunità eliminata - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo rifiutato la tua richiesta di ripubblicazione su IO dell’opportunità {{opportunityName}}.",
    ],
    bold: [
      "rifiutato la tua richiesta di ripubblicazione",
      "{{opportunityName}}",
    ],
    name: "operator-opportunity-republish-rejected",
    subject: "Ripubblicazione rifiutata - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo sospeso l’opportunità {{opportunityName}} per questo motivo:",
      "{{suspensionMessage}}",
      "L’opportunità non sarà più disponibile su IO dal {{suspensionDate}}.",
    ],
    bold: [
      "sospeso",
      "{{opportunityName}}",
      "{{suspensionMessage}}",
      "{{suspensionDate}}",
    ],
    name: "operator-opportunity-suspended",
    subject: "Opportunità sospesa - {{opportunityName}}",
  },
  {
    body: [
      "abbiamo annullato la sospensione dell’opportunità {{opportunityName}}, prevista per il {{suspensionDate}}.",
      "L’opportunità continuerà ad essere disponibile su IO.",
    ],
    bold: [
      "annullato la sospensione",
      "{{opportunityName}}",
      "{{suspensionDate}}",
    ],
    name: "operator-opportunity-suspension-cancelled",
    subject: "Sospensione annullata - {{opportunityName}}",
  },
  {
    body: [
      "l’opportunità {{opportunityName}} è stata ripubblicata e sarà di nuovo disponibile su IO.",
    ],
    bold: ["{{opportunityName}}", "ripubblicata"],
    name: "operator-opportunity-self-republished",
    subject: "Opportunità ripubblicata - {{opportunityName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha proposto una nuova opportunità per Carta Europea della Disabilità: {{opportunityName}}",
      "Per approvarla o richiedere modifiche, accedi ad Area Riservata e seleziona il prodotto Carta Europea della Disabilità.",
    ],
    bold: [
      "{{operatorName}}",
      "proposto una nuova opportunità",
      "{{opportunityName}}",
    ],
    name: "admin-new-opportunity",
    subject: "Nuova opportunità - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha modificato alcuni dettagli dell’opportunità {{opportunityName}}.",
      "Per approvarla o richiedere altre modifiche, accedi ad Area Riservata e seleziona il prodotto Carta Europea della Disabilità.",
    ],
    bold: [
      "{{operatorName}}",
      "modificato alcuni dettagli",
      "{{opportunityName}}",
    ],
    name: "admin-revise-opportunity",
    subject: "Richiesta di revisione - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha sospeso l’opportunità {{opportunityName}} a partire dal {{suspensionDate}} per questo motivo:",
      "{{suspensionMessage}}",
    ],
    bold: [
      "{{operatorName}}",
      "sospeso",
      "{{opportunityName}}",
      "{{suspensionDate}}",
      "{{suspensionMessage}}",
    ],
    name: "admin-opportunity-suspended",
    subject: "Sospensione opportunità - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha eliminato l’opportunità {{opportunityName}} per questo motivo:",
      "{{deletionMessage}}",
    ],
    bold: [
      "{{operatorName}}",
      "eliminato",
      "{{opportunityName}}",
      "{{deletionMessage}}",
    ],
    name: "admin-opportunity-deleted",
    subject: "Eliminazione opportunità - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha richiesto di pubblicare di nuovo su IO l’opportunità {{opportunityName}} con il seguente motivo:",
      "{{republishMessage}}",
      "Per approvare o rifiutare la richiesta, accedi ad Area Riservata e seleziona il prodotto Carta Europea della Disabilità.",
    ],
    bold: [
      "{{operatorName}}",
      "richiesto di pubblicare di nuovo",
      "{{opportunityName}}",
      "{{republishMessage}}",
    ],
    name: "admin-opportunity-republish-request",
    subject: "Richiesta di ripubblicazione - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha annullato la sospensione dell’opportunità {{opportunityName}}.",
      "L’opportunità sarà di nuovo disponibile su IO.",
    ],
    bold: [
      "{{operatorName}}",
      "annullato la sospensione",
      "{{opportunityName}}",
    ],
    name: "admin-opportunity-suspension-cancelled",
    subject: "Sospensione annullata - {{operatorName}}",
  },
  {
    body: [
      "l’ente {{operatorName}} ha ripubblicato su IO l’opportunità {{opportunityName}}.",
    ],
    bold: ["{{operatorName}}", "ripubblicato", "{{opportunityName}}"],
    name: "admin-opportunity-republished",
    subject: "Opportunità ripubblicata - {{opportunityName}}",
  },
];

const readTemplate = (name: string): SesEmailTemplate =>
  JSON.parse(
    readFileSync(new URL(`${name}/${name}.json`, sourceDirectory), "utf8"),
  );

it("includes a generated template for each of the 16 distinct scenarios", () => {
  const actual = readdirSync(sourceDirectory, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && /^(?:admin|operator)-/.test(entry.name),
    )
    .map((entry) => entry.name);
  expect(actual.sort()).toEqual(scenarios.map(({ name }) => name).sort());
});

describe.each(scenarios)("$name", (scenario) => {
  const template = readTemplate(scenario.name);
  const { Html, Subject, Text } = template.TemplateContent;
  const htmlText = normalize(Html);
  const plainText = normalize(Text);

  it("keeps the generated subject and text in sync with its metadata", () => {
    const meta = JSON.parse(
      readFileSync(
        new URL(`${scenario.name}/meta.json`, sourceDirectory),
        "utf8",
      ),
    );
    expect(template.TemplateName).toBe(scenario.name);
    expect(Subject).toBe(scenario.subject);
    expect(meta).toEqual({ subject: Subject, text: Text });
  });

  it("matches the required body in HTML and plain text", () => {
    for (const expected of scenario.body) {
      expect(htmlText).toContain(normalize(expected));
      expect(plainText).toContain(normalize(expected));
    }
    for (const body of [htmlText, plainText]) {
      expect(body).toContain("Ciao,");
      expect(body).toContain("A presto,");
      expect(body).toContain(
        "Se hai bisogno di supporto con le opportunità, consulta il manuale operativo.",
      );
      expect(body).toContain(
        normalize(
          "Per problemi tecnici nell’uso della piattaforma vai al portale e apri una richiesta di assistenza.",
        ),
      );
      expect(body).not.toContain("vai nel portale");
      expect(body).not.toContain("sul sito del Dipartimento");
      expect(body).not.toContain("{{deletionDate}}");
      expect(body).not.toContain("{{changeDescription}}");
    }
  });

  it("emphasizes the screenshot's action and dynamic values", () => {
    const emphasized = [
      ...Html.matchAll(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi),
    ].map((match) => normalize(match[2]));
    for (const expected of scenario.bold) {
      expect(
        emphasized.some((text) => text.includes(normalize(expected))),
      ).toBe(true);
    }
  });

  it("keeps support links, audience signature, management paragraph and footer correct", () => {
    const links = [
      ...Html.matchAll(/<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi),
    ].map((match) => ({ href: match[2], text: normalize(match[3]) }));
    expect(links).toEqual(
      expect.arrayContaining([
        { href: "{{runbookUrl}}", text: "manuale operativo" },
        { href: "{{supportUrl}}", text: "vai al portale" },
      ]),
    );
    const isOperator = scenario.name.startsWith("operator-");
    const signature = isOperator
      ? "Il Dipartimento per le politiche in favore delle persone con disabilità"
      : "Il team Carta Europea della Disabilità";
    const isRefusal =
      scenario.name === "operator-opportunity-republish-rejected";
    const management = normalize("Per consultare o gestire le tue opportunità");
    const footer = normalize(
      "Ricevi questo messaggio per il tuo coinvolgimento nell’iniziativa Carta Europea della Disabilità.",
    );
    for (const body of [htmlText, plainText]) {
      expect(body).toContain(signature);
      expect(body).not.toContain(`${signature}.`);
      expect(body.includes(footer)).toBe(!isRefusal);
      expect(body.includes(management)).toBe(
        isOperator &&
          !isRefusal &&
          scenario.name !== "operator-opportunity-rejected",
      );
      expect(isRefusal && body.includes("Area Riservata")).toBe(false);
    }
  });
});

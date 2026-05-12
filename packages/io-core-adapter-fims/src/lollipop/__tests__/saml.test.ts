import { describe, expect, it } from "vitest";

import {
  getFiscalCodeFromAssertion,
  getInResponseToFromAssertion,
  getIssueInstantFromAssertion,
  parseAssertionXml,
} from "../saml.js";

// Minimal SAML Response XML containing the relevant fields for testing
const buildSamlXml = ({
  fiscalCode = "RSSMRA80A01H501T",
  inResponseTo = "sha256-abc123",
  issueInstant = "2024-06-01T12:00:00Z",
}: {
  fiscalCode?: string;
  inResponseTo?: string;
  issueInstant?: string;
} = {}): string => `
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                IssueInstant="${issueInstant}">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <saml:Assertion>
    <saml:Subject>
      <saml:SubjectConfirmation>
        <saml:SubjectConfirmationData InResponseTo="${inResponseTo}" />
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:AttributeStatement>
      <saml:Attribute Name="fiscalNumber">
        <saml:AttributeValue>TINIT-${fiscalCode}</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;

describe("parseAssertionXml", () => {
  it("parses valid XML and returns ok", () => {
    const result = parseAssertionXml(buildSamlXml());
    expect(result.isOk()).toBe(true);
  });
});

describe("getInResponseToFromAssertion", () => {
  it("returns the InResponseTo attribute value", () => {
    const xml = buildSamlXml({ inResponseTo: "sha256-testref" });
    const doc = parseAssertionXml(xml)._unsafeUnwrap();
    expect(getInResponseToFromAssertion(doc)).toBe("sha256-testref");
  });
});

describe("getFiscalCodeFromAssertion", () => {
  it("strips TINIT- prefix and returns fiscal code", () => {
    const xml = buildSamlXml({ fiscalCode: "RSSMRA80A01H501T" });
    const doc = parseAssertionXml(xml)._unsafeUnwrap();
    expect(getFiscalCodeFromAssertion(doc)).toBe("RSSMRA80A01H501T");
  });
});

describe("getIssueInstantFromAssertion", () => {
  it("returns a Date when IssueInstant is present", () => {
    const xml = buildSamlXml({ issueInstant: "2024-06-01T12:00:00Z" });
    const doc = parseAssertionXml(xml)._unsafeUnwrap();
    const result = getIssueInstantFromAssertion(doc);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });
});

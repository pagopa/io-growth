import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { DOMParser } from "@xmldom/xmldom";
import { err, ok } from "neverthrow";
import { SignedXml, StringKeyInfo } from "xml-crypto";
import * as xpath from "xpath";

export const SAML_NAMESPACE = {
  ASSERTION: "urn:oasis:names:tc:SAML:2.0:assertion",
  PROTOCOL: "urn:oasis:names:tc:SAML:2.0:protocol",
  SIGNATURE: "http://www.w3.org/2000/09/xmldsig#",
};

export const parseAssertionXml = (
  assertionXml: string,
): Result<Document, UnauthorizedError> => {
  try {
    const doc = new DOMParser().parseFromString(assertionXml, "text/xml");
    return ok(doc as unknown as Document);
  } catch (error) {
    return err(
      new UnauthorizedError(`Error parsing SAML assertion: ${String(error)}`),
    );
  }
};

const getAttributeFromDoc = (
  doc: Document,
  tagName: string,
  attrName: string,
  namespace: string,
): null | string => {
  const element = (doc as unknown as XMLDocument)
    .getElementsByTagNameNS(namespace, tagName)
    .item(0);
  return element?.getAttribute(attrName) ?? null;
};

const getValueFromDoc = (
  doc: Document,
  tagName: string,
  namespace: string,
): null | string => {
  const element = (doc as unknown as XMLDocument)
    .getElementsByTagNameNS(namespace, tagName)
    .item(0);
  return element?.textContent ?? null;
};

/** Returns the InResponseTo attribute from SubjectConfirmationData in the assertion. */
export const getInResponseToFromAssertion = (doc: Document): null | string =>
  getAttributeFromDoc(
    doc,
    "SubjectConfirmationData",
    "InResponseTo",
    SAML_NAMESPACE.ASSERTION,
  );

/** Returns the IssueInstant from the SAML Response element. */
export const getIssueInstantFromAssertion = (doc: Document): Date | null => {
  const raw = getAttributeFromDoc(
    doc,
    "Response",
    "IssueInstant",
    SAML_NAMESPACE.PROTOCOL,
  );
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Returns the fiscal code from SAML Attribute named "fiscalNumber". */
export const getFiscalCodeFromAssertion = (doc: Document): null | string => {
  const attributes = (doc as unknown as XMLDocument).getElementsByTagNameNS(
    SAML_NAMESPACE.ASSERTION,
    "Attribute",
  );
  if (!attributes) return null;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes.item(i);
    if (attr?.getAttribute("Name") === "fiscalNumber") {
      return attr.textContent?.trim().replace("TINIT-", "") ?? null;
    }
  }
  return null;
};

/** Returns the Issuer value from the assertion. */
export const getIssuerFromAssertion = (doc: Document): null | string =>
  getValueFromDoc(doc, "Issuer", SAML_NAMESPACE.ASSERTION);

const sanitizeCert = (key: string): string =>
  key.replaceAll("\n", "").replaceAll(" ", "");

const addCertHeaders = (key: string): string =>
  key.startsWith("-----BEGIN")
    ? key
    : `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;

/**
 * Validates that a string can be safely embedded inside a single-quoted XPath
 * string literal. Throws if it contains `'` or `"` characters.
 */
const validateXPathStringLiteral = (value: string, field: string): void => {
  if (value.includes("'") || value.includes('"')) {
    throw new Error(
      `${field} contains characters that are invalid in an XPath string literal: ${value}`,
    );
  }
};

const getIdpKeysFromMetadata = (doc: Document, idp: string): string[] => {
  validateXPathStringLiteral(idp, "Issuer");
  const expression = `/*[local-name()='EntityDescriptor'][contains(@entityID,'${idp}')]/*[local-name()='IDPSSODescriptor']/*[local-name()='KeyDescriptor']//*[name()='ds:X509Certificate']/text()`;

  const selection = xpath
    .select(expression, doc as unknown as Node)
    ?.toString();
  if (!selection) return [];
  return selection.split(",").map((k) => addCertHeaders(sanitizeCert(k)));
};

const checkSignatures = (xml: string, doc: Document, keys: string[]): void => {
  let verified = false;
  const errors: unknown[] = [];
  const xmlDoc = doc as unknown as XMLDocument;
  const signatures = xmlDoc.getElementsByTagNameNS(
    SAML_NAMESPACE.SIGNATURE,
    "Signature",
  );

  for (const key of keys) {
    const sig = new SignedXml();
    sig.keyInfoProvider = new StringKeyInfo(key);
    for (let i = 0; i < signatures.length; i++) {
      const signature = signatures.item(i)?.cloneNode(true);
      if (!signature) throw new Error("Cannot get signature node");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sig.loadSignature(signature as any);
      try {
        const res = sig.checkSignature(xml);
        if (res) {
          verified = true;
          break;
        }
      } catch (e) {
        errors.push(e);
      }
    }
    if (verified) break;
  }

  if (!verified) {
    throw new Error(
      `Cannot verify assertion signature: ${JSON.stringify(errors)}`,
    );
  }
};

/**
 * Fetches PagoPA IDP SAML metadata keys and verifies the XML digital signature
 * on the SAML assertion.
 *
 * Mirrors `checkAssertionSignatures` from io-cdc `utils/saml.ts`.
 */
export const verifyAssertionSignatures = async (
  assertionXml: string,
  idpKeysBaseUrl: string,
): Promise<Result<void, UnauthorizedError>> => {
  try {
    const doc = new DOMParser().parseFromString(
      assertionXml,
      "text/xml",
    ) as unknown as Document;

    const issuer = getIssuerFromAssertion(doc);
    if (!issuer)
      return err(new UnauthorizedError("Assertion: issuer not found"));

    const issueInstant = getIssueInstantFromAssertion(doc);
    if (!issueInstant)
      return err(new UnauthorizedError("Assertion: IssueInstant not found"));

    const issueInstantTs = Math.floor(issueInstant.getTime() / 1000).toString();
    const isCie = issuer.includes("cie");
    const idpKeyEndpoint = isCie
      ? `${idpKeysBaseUrl}/cie`
      : `${idpKeysBaseUrl}/spid`;

    const FETCH_TIMEOUT_MS = 5000;

    // Fetch available key timestamps
    const tsResponse = await fetch(idpKeyEndpoint, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const timestamps = (await tsResponse.json()) as string[];

    // Fetch latest keys
    const latestResponse = await fetch(`${idpKeyEndpoint}/latest`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const latestXml = await latestResponse.text();
    const latestDoc = new DOMParser().parseFromString(
      latestXml,
      "text/xml",
    ) as unknown as Document;
    const latestKeys = getIdpKeysFromMetadata(latestDoc, issuer);

    // Find the most recent suitable timestamp (≤ issueInstant)
    const suitableTs = timestamps
      .filter((ts) => ts <= issueInstantTs)
      .sort()
      .pop();
    if (!suitableTs) {
      return err(
        new UnauthorizedError(
          `Cannot find suitable IDP key timestamp before ${issueInstantTs}`,
        ),
      );
    }

    const altResponse = await fetch(`${idpKeyEndpoint}/${suitableTs}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const altXml = await altResponse.text();
    const altDoc = new DOMParser().parseFromString(
      altXml,
      "text/xml",
    ) as unknown as Document;
    const altKeys = getIdpKeysFromMetadata(altDoc, issuer);

    checkSignatures(assertionXml, doc, [...latestKeys, ...altKeys]);
    return ok(undefined);
  } catch (error) {
    return err(
      new UnauthorizedError(
        `Assertion signature verification failed: ${String(error)}`,
      ),
    );
  }
};

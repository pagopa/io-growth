export interface FimsAuthFlowConfig {
  /** Frontend base URL used to construct the `/authorize?id=…` redirect. */
  readonly baseUrl: string;
  /** FIMS callback URL – used as the HTTP message signature verification target URL. */
  readonly fimsRedirectUrl: string;
  /** Base URL to fetch PagoPA IDP SAML metadata/keys for assertion signature verification. */
  readonly idpKeysBaseUrl: string;
  /** FIMS OIDC issuer URL. The `iss` query parameter in the callback is validated against this. */
  readonly issuerUrl: string;
  /** TTL in seconds for one-time session IDs and nonce/device state. Defaults to 60. */
  readonly otpTtlSeconds?: number;
  /** TTL in seconds for durable session tokens. Defaults to 1800 (30 min). */
  readonly sessionTtlSeconds?: number;
  /** SHA-256 hashes of test user fiscal codes (comma-separated from env). */
  readonly testUsers: readonly string[];
}

export interface FimsExchangeAudit {
  readonly authCode: string;
  readonly fiscalCode: string;
}

export interface FimsSession {
  readonly familyName: string;
  readonly fiscalCode: string;
  readonly givenName: string;
}

/**
 * User data returned from the FIMS identity provider userinfo endpoint.
 * `assertion` is a raw SAML XML string.
 * `public_key` is a Base64-encoded JWK public key.
 */
export interface FimsUser {
  readonly assertion: string;
  readonly assertion_ref: string;
  readonly auth_time?: string;
  readonly family_name: string;
  readonly fiscal_code: string;
  readonly given_name: string;
  readonly iss?: string;
  readonly public_key: string;
  readonly sid?: string;
  readonly sub?: string;
}

export interface LollipopAudit {
  readonly assertion: string;
  readonly assertionRef: string;
  readonly fiscalCode: string;
  readonly publicKey: string;
}

export interface LollipopHeaders {
  readonly [key: string]: string | undefined;
  readonly signature: string;
  readonly "signature-input": string;
}

export interface OidcConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly issuerUrl: string;
  readonly redirectUri: string;
  readonly scope: string;
}

export interface TestSessionAudit {
  readonly fiscalCode: string;
}

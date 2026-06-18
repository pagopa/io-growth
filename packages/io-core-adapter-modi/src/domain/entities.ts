/**
 * Per-request identity context passed to the signed fetch.
 * The caller (e.g. io-core-adapter-inps-ced) is responsible for setting
 * INPS-Identity-UserId and INPS-Identity-CodiceUfficio headers on the
 * RequestInit before invoking the signed fetch. The signed fetch reads them
 * from the headers and includes them in the ModI JWT signed_headers claim.
 */
export interface ModiRequestContext {
  readonly codiceUfficio?: string;
  readonly userId: string;
}

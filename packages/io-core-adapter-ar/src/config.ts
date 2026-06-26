/**
 * Configuration consumed by every AR (Area Riservata) outbound client.
 * The app composition root is responsible for building both the prod and test
 * instances of this config and wiring them into the environment router.
 */
export interface ArClientConfig {
  readonly baseUrl: string;
  readonly subscriptionKey: string;
}

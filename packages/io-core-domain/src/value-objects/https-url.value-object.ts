import { z } from "zod";

const HTTPS_URL_ERROR = "Must be a valid HTTPS URL";

// The regex rejects inputs like "https:/example.org" that z.url() would normalize.
// abort stops the regex check after a URL failure, so callers get a single issue.
export const HttpsUrlSchema = z
  .url({ abort: true, error: HTTPS_URL_ERROR, protocol: /^https$/ })
  .regex(/^https:\/\//i, { error: HTTPS_URL_ERROR });

export type HttpsUrl = z.infer<typeof HttpsUrlSchema>;

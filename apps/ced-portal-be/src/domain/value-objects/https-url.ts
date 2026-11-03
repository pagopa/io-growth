import { z } from "zod";

// The regex rejects inputs like "https:/example.org" that z.url() would normalize.
export const HttpsUrlSchema = z
  .url({ protocol: /^https$/ })
  .regex(/^https:\/\//i);

export type HttpsUrl = z.infer<typeof HttpsUrlSchema>;

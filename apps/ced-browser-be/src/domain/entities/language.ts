export const LANGUAGE_VALUES = ["en", "fr", "de", "sl", "it"] as const;
export type Language = (typeof LANGUAGE_VALUES)[number];

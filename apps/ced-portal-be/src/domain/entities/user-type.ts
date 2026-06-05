export const USER_TYPES = [
  "admin",
  "operator",
  "test_admin",
  "test_operator",
] as const;

export type UserType = (typeof USER_TYPES)[number];

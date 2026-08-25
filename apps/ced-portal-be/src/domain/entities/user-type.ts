export const USER_TYPES = [
  "admin",
  "operator",
  "test_admin",
  "test_operator",
] as const;

export type UserType = (typeof USER_TYPES)[number];

export const ADMIN_USER_TYPES: readonly UserType[] = ["admin", "test_admin"];
export const OPERATOR_USER_TYPES: readonly UserType[] = [
  "operator",
  "test_operator",
];

import { AsyncLocalStorage } from "node:async_hooks";

import type { UserType } from "./domain/entities/user-type.js";

export const userTypeContext = new AsyncLocalStorage<UserType>();

export const isTestUser = (): boolean => {
  const userType = userTypeContext.getStore();
  return userType === "test_admin" || userType === "test_operator";
};

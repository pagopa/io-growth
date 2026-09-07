import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { UserRepository } from "../../domain/ports/outbound/user.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type { getUserInfoUsingGETResponse } from "../../generated/endpoints/user/user.js";

import { getGetUserInfoUsingGETUrl } from "../../generated/endpoints/user/user.js";

export const createUserClient = (customFetch: CustomFetch): UserRepository => ({
  getUserById: async (id: string) => {
    try {
      const response = await customFetch<getUserInfoUsingGETResponse>(
        getGetUserInfoUsingGETUrl(id),
        { method: "GET" },
      );
      if (response.status === 200) {
        return ok(response.data);
      }
      return err(
        new GenericError(
          `getUserById failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`getUserById failed: ${String(error)}`));
    }
  },
});

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import { initArClient } from "../../client.js";
import { ArClientConfig } from "../../config.js";
import { UserRepository } from "../../domain/ports/outbound/user.repository.js";
import { getUserInfoUsingGET } from "../../generated/endpoints/user/user.js";

export const createUserClient = (config: ArClientConfig): UserRepository => {
  initArClient(config);
  return {
    getUserById: async (id: string) => {
      try {
        const response = await getUserInfoUsingGET(id);
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
  };
};

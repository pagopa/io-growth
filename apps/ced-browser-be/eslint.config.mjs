import pagopa from "@pagopa/eslint-config";

export default [
  ...pagopa,
  {
    ignores: ["**/src/adapters/inbound/fastify/contracts/**"],
  },
];

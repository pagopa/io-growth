import { describe, expect, it, vi } from "vitest";

import { createEnvRouter } from "../env-router.js";

interface FakeClient {
  readonly env: "prod" | "test";
  readonly label: string;
  whoAmI: () => string;
}

const createFakeClient = (env: "prod" | "test"): FakeClient => ({
  env,
  label: `${env}-label`,
  // Relies on `this` to prove methods are bound to the active instance.
  whoAmI(): string {
    return this.env;
  },
});

const setup = (isTestRequest: () => boolean) => {
  const createProdInstance = vi.fn(() => createFakeClient("prod"));
  const createTestInstance = vi.fn(() => createFakeClient("test"));

  const router = createEnvRouter({
    createProdInstance,
    createTestInstance,
    isTestRequest,
    prodConfig: { name: "prod-config" },
    testConfig: { name: "test-config" },
  });

  return { createProdInstance, createTestInstance, router };
};

describe("createEnvRouter", () => {
  it("instantiates both prod and test instances exactly once", () => {
    const { createProdInstance, createTestInstance } = setup(() => false);

    expect(createProdInstance).toHaveBeenCalledTimes(1);
    expect(createProdInstance).toHaveBeenCalledWith({ name: "prod-config" });
    expect(createTestInstance).toHaveBeenCalledTimes(1);
    expect(createTestInstance).toHaveBeenCalledWith({ name: "test-config" });
  });

  it("routes property reads to the prod instance when isTestRequest is false", () => {
    const { router } = setup(() => false);

    const client = router.getInstance();

    expect(client.env).toBe("prod");
    expect(client.label).toBe("prod-label");
  });

  it("routes property reads to the test instance when isTestRequest is true", () => {
    const { router } = setup(() => true);

    const client = router.getInstance();

    expect(client.env).toBe("test");
    expect(client.label).toBe("test-label");
  });

  it("binds methods to the active instance", () => {
    const { router } = setup(() => true);

    const client = router.getInstance();

    expect(client.whoAmI()).toBe("test");
  });

  it("re-evaluates the routing predicate on every access", () => {
    let useTest = false;
    const { router } = setup(() => useTest);

    const client = router.getInstance();

    expect(client.env).toBe("prod");
    expect(client.whoAmI()).toBe("prod");

    useTest = true;

    expect(client.env).toBe("test");
    expect(client.whoAmI()).toBe("test");

    useTest = false;

    expect(client.env).toBe("prod");
  });

  it("returns the same proxy reference across getInstance calls", () => {
    const { router } = setup(() => false);

    expect(router.getInstance()).toBe(router.getInstance());
  });

  it("does not re-instantiate clients on repeated access", () => {
    const { createProdInstance, createTestInstance, router } = setup(
      () => false,
    );

    const client = router.getInstance();
    void client.env;
    void client.label;
    void client.whoAmI();

    expect(createProdInstance).toHaveBeenCalledTimes(1);
    expect(createTestInstance).toHaveBeenCalledTimes(1);
  });

  it("exposes both managed instances in [prod, test] order for lifecycle handling", () => {
    const { router } = setup(() => true);

    expect(router.instances).toHaveLength(2);
    expect(router.instances[0]?.env).toBe("prod");
    expect(router.instances[1]?.env).toBe("test");
  });

  it("supports closing every managed instance regardless of routing", async () => {
    const prodClose = vi.fn().mockResolvedValue(undefined);
    const testClose = vi.fn().mockResolvedValue(undefined);

    const router = createEnvRouter({
      createProdInstance: () => ({ close: prodClose }),
      createTestInstance: () => ({ close: testClose }),
      isTestRequest: () => false,
      prodConfig: undefined,
      testConfig: undefined,
    });

    await Promise.all(router.instances.map((instance) => instance.close()));

    expect(prodClose).toHaveBeenCalledTimes(1);
    expect(testClose).toHaveBeenCalledTimes(1);
  });
});

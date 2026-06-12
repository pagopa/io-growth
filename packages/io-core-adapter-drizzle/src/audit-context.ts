import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditStorage<T> {
  readonly runWith: <U>(context: T, fn: () => Promise<U>) => Promise<U>;
  readonly transactionAuditData: AsyncLocalStorage<T>;
}

export const createAuditStorage = <T>(): AuditStorage<T> => {
  const storage = new AsyncLocalStorage<T>();
  return {
    runWith: (context, fn) => storage.run(context, fn),
    transactionAuditData: storage,
  };
};

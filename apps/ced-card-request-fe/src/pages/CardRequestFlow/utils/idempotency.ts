type Operation = 'draft' | 'photo' | 'confirm';

export const createIdempotencyKeys = (generate: () => string) => {
  const keys = new Map<Operation, { key: string; payload: string }>();

  return {
    get(operation: Operation, payload: unknown): string {
      const serialized = JSON.stringify(payload);
      const previous = keys.get(operation);
      if (previous?.payload === serialized) return previous.key;
      const key = generate();
      keys.set(operation, { key, payload: serialized });
      return key;
    },
    clear(operation: Operation): void {
      keys.delete(operation);
    },
  };
};

export function compactQueryParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params as Record<string, unknown>).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  ) as Partial<T>;
}

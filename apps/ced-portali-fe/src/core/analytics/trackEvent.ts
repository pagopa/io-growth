const seenEvents = new Set<string>();

export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (seenEvents.has(name)) {
    return;
  }

  seenEvents.add(name);
  console.info('[analytics]', name, payload ?? {});
}

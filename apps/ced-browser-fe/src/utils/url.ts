export function buildGoogleMapsUrl(
  address: string | undefined,
): string | undefined {
  return address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : undefined;
}

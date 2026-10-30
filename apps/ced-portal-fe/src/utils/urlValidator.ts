export function isValidHttpsUrl(
  value?: string | null,
  required?: boolean,
): boolean {
  try {
    if (!required && (!value || !value.trim())) {
      return true;
    }
    if (!value) {
      return false;
    }
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

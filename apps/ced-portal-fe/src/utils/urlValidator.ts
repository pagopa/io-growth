export function isValidHttpsUrl(value: string, required?: boolean): boolean {
  try {
    if (!required && !value.trim()) {
      return true;
    }
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

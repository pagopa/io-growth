/** INPS rejects accented letters: a trailing one is sent as plain vowel + apostrophe (ò -> o'). */
export const normalizeTrailingAccents = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/([aeiou])[\u0300-\u036f]+(?=\s|$)/gi, "$1'")
    .normalize("NFC");
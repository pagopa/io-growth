export const getMixpanelId = (search: string): string | null =>
  new URLSearchParams(search).get('mixpanelId');

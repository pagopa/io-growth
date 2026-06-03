export type AccessPoint = 'territory' | 'online' | 'both';

export interface PlacesState {
  accessPoint: AccessPoint | null;
  nationwide: boolean;
  selectedLocationIds: string[];
  selectedWebsiteIds: string[];
}

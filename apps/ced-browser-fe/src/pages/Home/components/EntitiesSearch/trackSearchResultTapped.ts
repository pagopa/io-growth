import type {
  PlaceSearchItem,
  PlaceSearchItemType,
} from '../../../../generated/model';
import { trackBrowserEvent } from '../../../../mixpanel/trackEvent';

const pageTypes: Record<PlaceSearchItemType, 'location' | 'organization'> = {
  place: 'location',
  profile: 'organization',
};

export function trackSearchResultTapped(item: PlaceSearchItem | undefined) {
  trackBrowserEvent('CED_SEARCH_RESULTS_TAPPED', {
    page_type: item ? pageTypes[item.type] : undefined,
    location_name: item?.name,
    organization_name: item?.entityId,
    city_name: item?.address?.city,
  });
}

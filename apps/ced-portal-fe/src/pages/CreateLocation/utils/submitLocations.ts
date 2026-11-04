import type { NavigateFunction } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import type { ToastContextValue } from '../../../contexts';
import type { PlaceCreateRequest } from '../../../generated/model';
import { trimSupportContacts } from '../../../utils/contactValidation.js';
import type { LocationState, LocationType } from '../types';

interface SubmitLocationsParams {
  readonly locations: LocationState[];
  readonly type: LocationType;
  readonly createPlace: (payload: PlaceCreateRequest) => Promise<unknown>;
  readonly keepFailedLocations: (failedIds: Set<string>) => void;
  readonly navigate: NavigateFunction;
  readonly showToast: ToastContextValue['showToast'];
}

const toPlacePayload = (
  loc: LocationState,
  type: LocationType,
): PlaceCreateRequest => {
  const supportContacts = trimSupportContacts(loc.contacts);

  if (type === 'offline') {
    return {
      type: 'offline',
      name: loc.name.trim(),
      address: {
        street: loc.street.trim(),
        city: loc.city.trim(),
        state: loc.state.trim(),
        postalCode: loc.postalCode.trim(),
        country: 'IT',
      },
      supportContacts,
    };
  }

  return {
    type: 'online',
    name: loc.name.trim(),
    website: {
      url: loc.websiteUrl.trim(),
    },
    supportContacts,
  };
};

export const submitLocations = async ({
  locations,
  type,
  createPlace,
  keepFailedLocations,
  navigate,
  showToast,
}: SubmitLocationsParams): Promise<void> => {
  const results = await Promise.allSettled(
    locations.map((loc) => createPlace(toPlacePayload(loc, type))),
  );

  const failedIds = new Set(
    results.flatMap((result, index) =>
      result.status === 'rejected' ? [locations[index].id] : [],
    ),
  );
  const createdCount = results.length - failedIds.size;

  if (failedIds.size > 0) {
    keepFailedLocations(failedIds);
    showToast(
      createdCount > 0
        ? `Creati ${createdCount} punti di accesso; ${failedIds.size} non creati. Puoi riprovare.`
        : 'Errore durante la creazione dei punti di accesso',
      'error',
    );
    return;
  }

  showToast('Punti di accesso creati con successo', 'success');
  navigate(APP_ROUTES.LOCATIONS);
};

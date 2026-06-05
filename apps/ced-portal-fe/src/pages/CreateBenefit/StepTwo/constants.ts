import { PlaceBaseType } from '../../../core/api/generated/model';

export type ModalState = 'none' | 'select' | 'add' | 'add-from-select';

type AccessPointOption = { value: PlaceBaseType | 'both'; label: string };

export const ACCESS_POINT_OPTIONS: AccessPointOption[] = [
  { value: 'offline', label: 'Sul territorio, in una o più sedi fisiche' },
  { value: 'online', label: 'Online, su uno o più siti web' },
  { value: 'both', label: 'Sul territorio e online' },
];

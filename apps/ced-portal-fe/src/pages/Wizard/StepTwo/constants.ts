import type { AccessPoint } from '../../../features/wizard/types';

type AccessPointOption = { value: Exclude<AccessPoint, ''>; label: string };

export const ACCESS_POINT_OPTIONS: AccessPointOption[] = [
  { value: 'territory', label: 'Sul territorio, in una o più sedi fisiche' },
  { value: 'online', label: 'Online, su uno o più siti web' },
  { value: 'both', label: 'Sul territorio e online' },
];

import type {
  ListOnboardingsStatus,
  OnboardingItem,
  OnboardingItemInstitution,
  PendingOnboardingsResponse,
} from '../../core/api/generated/model';

export type DepartmentOnboardingStatus = ListOnboardingsStatus;

export type OnboardingInstitution = OnboardingItemInstitution;

export type DepartmentOnboardingItem = OnboardingItem & {
  id: string;
  status?: DepartmentOnboardingStatus;
  institution?: OnboardingInstitution;
};

export type DepartmentOnboardingsResponse = PendingOnboardingsResponse;

export interface BaseEntityItem {
  id: string;
  name: string;
  city: string;
}

export interface EntityRequestItem extends BaseEntityItem {
  tab: 'requests';
  created_at: string;
  state: DepartmentOnboardingStatus;
}

export interface ManagedEntityItem extends BaseEntityItem {
  tab: 'entities';
  opportunities_count: number;
  active_from: string;
  state: DepartmentOnboardingStatus;
}

export type EntityItem = EntityRequestItem | ManagedEntityItem;

export type EntityDetail = OnboardingItem;

export interface EntityFilters {
  search: string;
  state: DepartmentOnboardingStatus | '';
}

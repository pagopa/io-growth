import type {
  ListOnboardingsStatusesItem,
  OnboardingDetail,
  OnboardingInstitutionDetail,
  OnboardingItem,
  OnboardingItemInstitution,
  OnboardingUser,
  PendingOnboardingsResponse,
} from '../../core/api/generated/model';

export type DepartmentOnboardingStatus = ListOnboardingsStatusesItem;

export type OnboardingInstitution = OnboardingItemInstitution;

export type EntityDetailInstitution = OnboardingInstitutionDetail & {
  institutionType?: string;
  origin?: string;
  originId?: string;
  address?: string;
  zipCode?: string;
  geographicTaxonomies?: Array<{
    code?: string;
    desc?: string;
  }>;
};

export type EntityDetailUser = OnboardingUser;

export type DepartmentOnboardingItem = OnboardingItem & {
  status?: DepartmentOnboardingStatus;
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

export type EntityDetail = OnboardingDetail & {
  billing?: {
    publicServices?: boolean;
  };
  expiringDate?: string;
  institution?: EntityDetailInstitution;
  userRequester?: {
    userRequestUid?: string;
  };
  users?: EntityDetailUser[];
};

export interface EntityFilters {
  search: string;
  state: DepartmentOnboardingStatus | '';
}

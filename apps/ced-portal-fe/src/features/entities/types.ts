import type {
  ListOnboardingsStatusesItem,
  OnboardingDetail,
  OnboardingInstitutionDetail,
  OnboardingUser,
} from '../../core/api/generated/model';

export type DepartmentOnboardingStatus = ListOnboardingsStatusesItem;

type EntityDetailInstitution = OnboardingInstitutionDetail & {
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

type EntityDetailUser = OnboardingUser;

interface BaseEntityItem {
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

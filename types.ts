
export enum CaseStatus {
  ACTIVE = 'ACTIVE',
  DISPOSED = 'DISPOSED'
}

export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  WRIT = 'Writ',
  FAMILY = 'Family',
  REVENUE = 'Revenue',
  TAX = 'Tax',
  OTHER = 'Other'
}

export enum UserRole {
  ADVOCATE = 'ADVOCATE',
  CLIENT = 'CLIENT',
  NONE = 'NONE'
}

export interface Case {
  id: string;
  caseType: CaseType;
  caseNo: string;
  courtName: string;
  appellant: string;
  respondent: string;
  reasonOfHearing: string;
  nextHearingDate: string; // ISO string
  status: CaseStatus;
  disposalDate?: string;
  notes?: string;
  createdAt: string;
}

export interface AuthState {
  role: UserRole;
  isLoggedIn: boolean;
}

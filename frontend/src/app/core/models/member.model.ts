export interface NextOfKin {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  nationalId?: string;
  allocationPercentage: number;
}

export interface Member {
  id?: number;
  payrollNo: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  email?: string;
  phoneNumber: string;
  dob: string;
  employmentCategory: 'SCIENTIST' | 'NON_SCIENTIST';
  employmentDate?: string;
  retirementDate?: string;
  currentAge?: number;
  yearsToRetirement?: number;
  department?: string;
  designation?: string;
  station?: string;
  status: 'ACTIVE' | 'DORMANT' | 'RETIRED' | 'EXITED' | 'DECEASED';
  nextOfKins?: NextOfKin[];
}

export interface MemberImportResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  updatedRecords: number;
  errorMessages: string[];
  warnings: string[];
}

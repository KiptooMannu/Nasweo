export interface Contribution {
  id?: number;
  payrollNo: string;
  memberName?: string;
  periodMonth: number;
  periodYear: number;
  shareAmount: number;
  benevolenceAmount: number;
  totalAmount: number;
  paymentMode: 'EMPLOYER_CHECKOFF' | 'MPESA' | 'DIRECT_BANK' | 'CASH';
  referenceNo?: string;
  paymentDate: string;
  reconciled: boolean;
  notes?: string;
}

export interface MemberContributionBalance {
  payrollNo: string;
  totalShares: number;
  totalBenevolence: number;
  cumulativeTotal: number;
  lastContributionDate?: string;
}

export interface StatementLineItem {
  date: string;
  reference: string;
  description: string;
  shareAmount: number;
  benevolenceAmount: number;
  runningShareBalance: number;
  runningBenevolenceBalance: number;
}

export interface MemberStatement {
  payrollNo: string;
  memberName?: string;
  fromDate: string;
  toDate: string;
  openingShareBalance: number;
  openingBenevolenceBalance: number;
  items: StatementLineItem[];
  closingShareBalance: number;
  closingBenevolenceBalance: number;
  closingTotalBalance: number;
}

export interface CheckoffImportResult {
  periodMonth: number;
  periodYear: number;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  duplicateRows: number;
  totalSharesImported: number;
  totalBenevolenceImported: number;
  totalAmountImported: number;
  errorMessages: string[];
  warnings: string[];
}

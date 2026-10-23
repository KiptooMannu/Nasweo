export interface BenevolenceRecord {
  id?: number;
  payrollNo: string;
  memberName?: string;
  benevolenceType: 'MEMBER_ILLNESS' | 'DEATH_OF_MEMBER' | 'DEATH_OF_DEPENDANT' | 'SPECIAL_OCCASION_GIFT' | 'RETIREMENT_GIFT' | 'WEDDING_GIFT' | 'BENEVOLENT_ASSISTANCE';
  beneficiaryName: string;
  relationship: string;
  occasionDescription?: string;
  amountProvided: number;
  eventDate: string;
  disbursedDate?: string;
  paymentMode: 'EMPLOYER_CHECKOFF' | 'MPESA' | 'DIRECT_BANK' | 'CASH';
  voucherReference?: string;
  approvedBy?: string;
  status: string;
}

export interface WelfareExpenditureSummary {
  totalDisbursedAllTime: number;
  totalDisbursedThisYear: number;
  totalDisbursedThisMonth: number;
  totalClaimsCount: number;
  categoryBreakdowns: {
    category: string;
    totalAmount: number;
    count: number;
  }[];
}

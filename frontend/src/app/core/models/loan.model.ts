export interface LoanProduct {
  code: string;
  name: string;
  description: string;
  annualInterestRate: number;
  interestType: 'REDUCING_BALANCE' | 'FLAT_RATE';
  maxRepaymentMonths: number;
  minAmount: number;
  maxAmount: number;
  sharesMultiplier: number;
  active: boolean;
}

export interface AmortizationScheduleItem {
  installmentNo: number;
  dueDate: string;
  openingBalance: number;
  principalAmount: number;
  interestAmount: number;
  totalInstallment: number;
  closingBalance: number;
  paidAmount: number;
  status: string;
}

export interface AmortizationSchedule {
  principalAmount: number;
  annualInterestRate: number;
  repaymentMonths: number;
  interestType: string;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayable: number;
  scheduleItems: AmortizationScheduleItem[];
}

export interface Loan {
  id?: number;
  loanNumber: string;
  payrollNo: string;
  memberName?: string;
  productCode: string;
  productName: string;
  principalAmount: number;
  interestRate: number;
  interestType: 'REDUCING_BALANCE' | 'FLAT_RATE';
  repaymentMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayable: number;
  totalPaid: number;
  outstandingPrincipal: number;
  outstandingBalance: number;
  arrearsAmount: number;
  daysOverdue: number;
  disbursedDate: string;
  maturityDate: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'TOPPED_UP' | 'CLOSED' | 'DEFAULTED';
  isTopUp: boolean;
  originalLoanNumber?: string;
  settlementDeduction?: number;
  netDisbursementAmount?: number;
  approvedBy?: string;
}

export interface TopUpCalculationResult {
  existingLoanNumber: string;
  currentOutstandingPrincipal: number;
  currentOutstandingInterest: number;
  totalSettlementRequired: number;
  requestedNewPrincipal: number;
  netDisbursementToMember: number;
  eligible: boolean;
  ineligibleReason?: string;
}

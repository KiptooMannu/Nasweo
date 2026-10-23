package org.nasweo.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.InterestType;
import org.nasweo.common.enums.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDto {
    private Long id;
    private String loanNumber;
    private String payrollNo;
    private String memberName;
    private String productCode;
    private String productName;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private InterestType interestType;
    private Integer repaymentMonths;
    private BigDecimal monthlyPayment;
    private BigDecimal totalInterest;
    private BigDecimal totalRepayable;
    private BigDecimal totalPaid;
    private BigDecimal outstandingPrincipal;
    private BigDecimal outstandingBalance;
    private BigDecimal arrearsAmount;
    private Integer daysOverdue;
    private LocalDate disbursedDate;
    private LocalDate maturityDate;
    private LoanStatus status;
    private boolean isTopUp;
    private String originalLoanNumber;
    private BigDecimal settlementDeduction;
    private BigDecimal netDisbursementAmount;
    private String approvedBy;
}

package org.nasweo.loan.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.InterestType;
import org.nasweo.common.enums.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans", indexes = {
        @Index(name = "idx_loan_payroll", columnList = "payroll_no"),
        @Index(name = "idx_loan_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_number", unique = true, nullable = false)
    private String loanNumber;

    @Column(name = "payroll_no", nullable = false)
    private String payrollNo;

    private String memberName;

    @Column(nullable = false)
    private String productCode;

    private String productName;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal principalAmount;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterestType interestType = InterestType.REDUCING_BALANCE;

    @Column(nullable = false)
    private Integer repaymentMonths;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal monthlyPayment;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal totalInterest;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal totalRepayable;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal outstandingPrincipal;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal outstandingBalance;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal arrearsAmount = BigDecimal.ZERO;

    @Builder.Default
    private Integer daysOverdue = 0;

    @Column(nullable = false)
    private LocalDate disbursedDate;

    @Column(nullable = false)
    private LocalDate maturityDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    @Builder.Default
    private boolean isTopUp = false;

    private String originalLoanNumber; // If this loan was created as a top-up of an earlier loan

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal settlementDeduction = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal netDisbursementAmount;

    private String approvedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

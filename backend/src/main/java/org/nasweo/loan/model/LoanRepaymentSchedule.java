package org.nasweo.loan.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_repayment_schedules", indexes = {
        @Index(name = "idx_sched_loan", columnList = "loan_number"),
        @Index(name = "idx_sched_due", columnList = "due_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepaymentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_number", nullable = false)
    private String loanNumber;

    @Column(nullable = false)
    private Integer installmentNo;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal openingBalance;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal principalAmount;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal interestAmount;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal totalInstallment;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal closingBalance;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    private LocalDate paidDate;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PAID, PARTIAL, OVERDUE
}

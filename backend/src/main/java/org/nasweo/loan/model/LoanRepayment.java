package org.nasweo.loan.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_repayments", indexes = {
        @Index(name = "idx_repay_loan", columnList = "loan_number"),
        @Index(name = "idx_repay_payroll", columnList = "payroll_no")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_number", nullable = false)
    private String loanNumber;

    @Column(name = "payroll_no", nullable = false)
    private String payrollNo;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal principalPortion = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal interestPortion = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    private String referenceNo;

    private String receivedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

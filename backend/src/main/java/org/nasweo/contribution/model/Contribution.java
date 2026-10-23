package org.nasweo.contribution.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contributions", indexes = {
        @Index(name = "idx_contrib_payroll", columnList = "payroll_no"),
        @Index(name = "idx_contrib_period", columnList = "period_year, period_month")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_no", nullable = false)
    private String payrollNo;

    private String memberName;

    @Column(name = "period_month", nullable = false)
    private Integer periodMonth; // 1 - 12

    @Column(name = "period_year", nullable = false)
    private Integer periodYear;  // e.g. 2026

    @Column(precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal shareAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal benevolenceAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMode paymentMode = PaymentMode.EMPLOYER_CHECKOFF;

    private String referenceNo; // e.g. M-Pesa transaction code, Bank slip, or Checkoff batch id

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Builder.Default
    private boolean reconciled = true;

    private String reconciledBy;

    private LocalDateTime reconciledAt;

    private String notes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void computeTotal() {
        if (shareAmount == null) shareAmount = BigDecimal.ZERO;
        if (benevolenceAmount == null) benevolenceAmount = BigDecimal.ZERO;
        this.totalAmount = shareAmount.add(benevolenceAmount);
    }
}

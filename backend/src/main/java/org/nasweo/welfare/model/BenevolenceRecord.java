package org.nasweo.welfare.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.BenevolenceType;
import org.nasweo.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "benevolence_records", indexes = {
        @Index(name = "idx_welfare_payroll", columnList = "payroll_no"),
        @Index(name = "idx_welfare_type", columnList = "benevolence_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenevolenceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_no", nullable = false)
    private String payrollNo;

    private String memberName;

    @Enumerated(EnumType.STRING)
    @Column(name = "benevolence_type", nullable = false)
    private BenevolenceType benevolenceType;

    @Column(nullable = false)
    private String beneficiaryName;

    private String relationship; // e.g. Self, Spouse, Child, Parent

    @Column(length = 1000)
    private String occasionDescription; // e.g. Hospitalization at Kenyatta National Hospital, Retirement ceremony, Wedding

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amountProvided;

    private LocalDate eventDate;

    private LocalDate disbursedDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentMode paymentMode = PaymentMode.DIRECT_BANK;

    private String voucherReference;

    private String approvedBy;

    @Column(length = 20)
    @Builder.Default
    private String status = "DISBURSED"; // PENDING, APPROVED, DISBURSED, REJECTED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

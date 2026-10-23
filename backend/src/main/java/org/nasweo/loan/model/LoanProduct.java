package org.nasweo.loan.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.InterestType;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanProduct {

    @Id
    @Column(length = 20, nullable = false, unique = true)
    private String code; // e.g. "DEV-LOAN", "EMERGENCY", "SCHOOL-FEES"

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal annualInterestRate; // e.g. 12.00%

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterestType interestType = InterestType.REDUCING_BALANCE;

    @Column(nullable = false)
    private Integer maxRepaymentMonths;

    @Column(precision = 12, scale = 2)
    private BigDecimal minAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxAmount;

    @Column(precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal sharesMultiplier = new BigDecimal("3.0"); // e.g. max 3x shares

    @Builder.Default
    private boolean active = true;
}

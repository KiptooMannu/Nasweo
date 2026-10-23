package org.nasweo.contribution.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_contribution_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberContributionBalance {

    @Id
    @Column(name = "payroll_no", nullable = false, unique = true)
    private String payrollNo;

    @Column(precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalShares = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalBenevolence = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal cumulativeTotal = BigDecimal.ZERO;

    private LocalDate lastContributionDate;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public void recalculate(BigDecimal addedShares, BigDecimal addedBenevolence, LocalDate date) {
        if (this.totalShares == null) this.totalShares = BigDecimal.ZERO;
        if (this.totalBenevolence == null) this.totalBenevolence = BigDecimal.ZERO;

        this.totalShares = this.totalShares.add(addedShares);
        this.totalBenevolence = this.totalBenevolence.add(addedBenevolence);
        this.cumulativeTotal = this.totalShares.add(this.totalBenevolence);
        this.lastContributionDate = date;
        this.updatedAt = LocalDateTime.now();
    }
}

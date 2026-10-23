package org.nasweo.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmortizationScheduleDto {
    private BigDecimal principalAmount;
    private BigDecimal annualInterestRate;
    private Integer repaymentMonths;
    private String interestType;
    private BigDecimal monthlyPayment;
    private BigDecimal totalInterest;
    private BigDecimal totalRepayable;

    @Builder.Default
    private List<ScheduleItem> scheduleItems = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleItem {
        private Integer installmentNo;
        private LocalDate dueDate;
        private BigDecimal openingBalance;
        private BigDecimal principalAmount;
        private BigDecimal interestAmount;
        private BigDecimal totalInstallment;
        private BigDecimal closingBalance;
        private BigDecimal paidAmount;
        private String status;
    }
}

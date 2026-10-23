package org.nasweo.loan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplicationRequest {

    @NotBlank(message = "Payroll number is required")
    private String payrollNo;

    private String memberName;

    @NotBlank(message = "Product code is required")
    private String productCode;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "1000.00", message = "Minimum loan amount is KES 1,000")
    private BigDecimal principalAmount;

    @NotNull(message = "Repayment months is required")
    @Min(value = 1, message = "Repayment period must be at least 1 month")
    private Integer repaymentMonths;

    private LocalDate requestedDisbursementDate;
}

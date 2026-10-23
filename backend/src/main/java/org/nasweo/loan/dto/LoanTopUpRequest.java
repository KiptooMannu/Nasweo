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
public class LoanTopUpRequest {

    @NotBlank(message = "Existing loan number is required")
    private String existingLoanNumber;

    @NotNull(message = "New principal amount is required")
    @DecimalMin(value = "5000.00", message = "Minimum top up principal is KES 5,000")
    private BigDecimal newPrincipalAmount;

    @NotNull(message = "Repayment months is required")
    @Min(value = 1, message = "Repayment period must be at least 1 month")
    private Integer newRepaymentMonths;

    private String productCode; // If switching or keeping product

    private LocalDate requestedDisbursementDate;
}

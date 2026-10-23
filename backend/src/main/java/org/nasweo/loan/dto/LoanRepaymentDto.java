package org.nasweo.loan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepaymentDto {
    private Long id;

    @NotBlank(message = "Loan number is required")
    private String loanNumber;

    private String payrollNo;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal amount;

    private BigDecimal principalPortion;
    private BigDecimal interestPortion;

    @NotNull
    private LocalDate paymentDate;

    @NotNull
    private PaymentMode paymentMode;

    private String referenceNo;
    private String receivedBy;
}

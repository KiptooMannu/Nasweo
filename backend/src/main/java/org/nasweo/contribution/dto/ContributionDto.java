package org.nasweo.contribution.dto;

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
public class ContributionDto {
    private Long id;

    @NotBlank(message = "Payroll number is required")
    private String payrollNo;

    private String memberName;

    @NotNull(message = "Month is required (1-12)")
    private Integer periodMonth;

    @NotNull(message = "Year is required")
    private Integer periodYear;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal shareAmount;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal benevolenceAmount;

    private BigDecimal totalAmount;

    private PaymentMode paymentMode;

    private String referenceNo;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private boolean reconciled;
    private String notes;
}

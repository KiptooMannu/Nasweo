package org.nasweo.welfare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.BenevolenceType;
import org.nasweo.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenevolenceRecordDto {
    private Long id;

    @NotBlank(message = "Payroll number is required")
    private String payrollNo;

    private String memberName;

    @NotNull(message = "Benevolence type is required")
    private BenevolenceType benevolenceType;

    @NotBlank(message = "Beneficiary name is required")
    private String beneficiaryName;

    private String relationship;
    private String occasionDescription;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal amountProvided;

    private LocalDate eventDate;
    private LocalDate disbursedDate;
    private PaymentMode paymentMode;
    private String voucherReference;
    private String approvedBy;
    private String status;
}

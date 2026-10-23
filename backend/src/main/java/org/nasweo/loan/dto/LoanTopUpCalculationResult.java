package org.nasweo.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanTopUpCalculationResult {
    private String existingLoanNumber;
    private BigDecimal currentOutstandingPrincipal;
    private BigDecimal currentOutstandingInterest;
    private BigDecimal totalSettlementRequired;
    private BigDecimal requestedNewPrincipal;
    private BigDecimal netDisbursementToMember;
    private boolean eligible;
    private String ineligibleReason;
}

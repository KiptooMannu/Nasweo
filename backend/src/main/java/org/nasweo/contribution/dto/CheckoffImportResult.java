package org.nasweo.contribution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoffImportResult {
    private int periodMonth;
    private int periodYear;
    private int totalRows;
    private int successfulRows;
    private int failedRows;
    private int duplicateRows;

    @Builder.Default
    private BigDecimal totalSharesImported = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalBenevolenceImported = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalAmountImported = BigDecimal.ZERO;

    @Builder.Default
    private List<String> errorMessages = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}

package org.nasweo.contribution.dto;

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
public class MemberStatementDto {
    private String payrollNo;
    private String memberName;
    private LocalDate fromDate;
    private LocalDate toDate;
    
    private BigDecimal openingShareBalance;
    private BigDecimal openingBenevolenceBalance;
    
    @Builder.Default
    private List<StatementLineItem> items = new ArrayList<>();
    
    private BigDecimal closingShareBalance;
    private BigDecimal closingBenevolenceBalance;
    private BigDecimal closingTotalBalance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatementLineItem {
        private LocalDate date;
        private String reference;
        private String description;
        private BigDecimal shareAmount;
        private BigDecimal benevolenceAmount;
        private BigDecimal runningShareBalance;
        private BigDecimal runningBenevolenceBalance;
    }
}

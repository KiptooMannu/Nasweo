package org.nasweo.welfare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WelfareExpenditureSummary {
    private BigDecimal totalDisbursedAllTime;
    private BigDecimal totalDisbursedThisYear;
    private BigDecimal totalDisbursedThisMonth;
    private long totalClaimsCount;
    private List<CategoryBreakdown> categoryBreakdowns;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal totalAmount;
        private Long count;
    }
}

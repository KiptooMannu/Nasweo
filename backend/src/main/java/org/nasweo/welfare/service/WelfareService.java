package org.nasweo.welfare.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.BenevolenceType;
import org.nasweo.common.enums.PaymentMode;
import org.nasweo.welfare.dto.BenevolenceRecordDto;
import org.nasweo.welfare.dto.WelfareExpenditureSummary;
import org.nasweo.welfare.model.BenevolenceRecord;
import org.nasweo.welfare.repository.BenevolenceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WelfareService {

    private final BenevolenceRepository benevolenceRepository;

    @Transactional
    public BenevolenceRecordDto recordBenevolence(BenevolenceRecordDto dto, String approvedBy) {
        BenevolenceRecord record = BenevolenceRecord.builder()
                .payrollNo(dto.getPayrollNo())
                .memberName(dto.getMemberName())
                .benevolenceType(dto.getBenevolenceType())
                .beneficiaryName(dto.getBeneficiaryName())
                .relationship(dto.getRelationship() != null ? dto.getRelationship() : "Self")
                .occasionDescription(dto.getOccasionDescription())
                .amountProvided(dto.getAmountProvided())
                .eventDate(dto.getEventDate() != null ? dto.getEventDate() : LocalDate.now())
                .disbursedDate(dto.getDisbursedDate() != null ? dto.getDisbursedDate() : LocalDate.now())
                .paymentMode(dto.getPaymentMode() != null ? dto.getPaymentMode() : PaymentMode.DIRECT_BANK)
                .voucherReference(dto.getVoucherReference())
                .approvedBy(approvedBy != null ? approvedBy : dto.getApprovedBy())
                .status(dto.getStatus() != null ? dto.getStatus() : "DISBURSED")
                .build();

        BenevolenceRecord saved = benevolenceRepository.save(record);
        return mapToDto(saved);
    }

    public Page<BenevolenceRecordDto> searchRecords(
            String query, BenevolenceType type, String status, Pageable pageable) {
        return benevolenceRepository.searchRecords(query, type, status, pageable)
                .map(this::mapToDto);
    }

    public List<BenevolenceRecordDto> getMemberRecords(String payrollNo) {
        return benevolenceRepository.findByPayrollNoOrderByEventDateDesc(payrollNo).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WelfareExpenditureSummary getExpenditureSummary() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = now.with(TemporalAdjusters.firstDayOfYear());
        LocalDate endOfYear = now.with(TemporalAdjusters.lastDayOfYear());
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal totalAllTime = benevolenceRepository.sumTotalDisbursedAllTime();
        BigDecimal totalThisYear = benevolenceRepository.sumDisbursedInPeriod(startOfYear, endOfYear);
        BigDecimal totalThisMonth = benevolenceRepository.sumDisbursedInPeriod(startOfMonth, endOfMonth);
        long count = benevolenceRepository.count();

        List<Object[]> rawCategories = benevolenceRepository.sumExpendituresByType();
        List<WelfareExpenditureSummary.CategoryBreakdown> breakdowns = new ArrayList<>();

        for (Object[] row : rawCategories) {
            BenevolenceType type = (BenevolenceType) row[0];
            BigDecimal total = (BigDecimal) row[1];
            Long cnt = (Long) row[2];
            breakdowns.add(WelfareExpenditureSummary.CategoryBreakdown.builder()
                    .category(type.name())
                    .totalAmount(total)
                    .count(cnt)
                    .build());
        }

        return WelfareExpenditureSummary.builder()
                .totalDisbursedAllTime(totalAllTime)
                .totalDisbursedThisYear(totalThisYear)
                .totalDisbursedThisMonth(totalThisMonth)
                .totalClaimsCount(count)
                .categoryBreakdowns(breakdowns)
                .build();
    }

    public BenevolenceRecordDto mapToDto(BenevolenceRecord r) {
        return BenevolenceRecordDto.builder()
                .id(r.getId())
                .payrollNo(r.getPayrollNo())
                .memberName(r.getMemberName())
                .benevolenceType(r.getBenevolenceType())
                .beneficiaryName(r.getBeneficiaryName())
                .relationship(r.getRelationship())
                .occasionDescription(r.getOccasionDescription())
                .amountProvided(r.getAmountProvided())
                .eventDate(r.getEventDate())
                .disbursedDate(r.getDisbursedDate())
                .paymentMode(r.getPaymentMode())
                .voucherReference(r.getVoucherReference())
                .approvedBy(r.getApprovedBy())
                .status(r.getStatus())
                .build();
    }
}

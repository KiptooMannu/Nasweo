package org.nasweo.contribution.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.PaymentMode;
import org.nasweo.contribution.dto.ContributionDto;
import org.nasweo.contribution.dto.MemberStatementDto;
import org.nasweo.contribution.model.Contribution;
import org.nasweo.contribution.model.MemberContributionBalance;
import org.nasweo.contribution.repository.ContributionRepository;
import org.nasweo.contribution.repository.MemberContributionBalanceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final MemberContributionBalanceRepository balanceRepository;

    @Transactional
    public ContributionDto recordContribution(ContributionDto dto, String operator) {
        Contribution contribution = Contribution.builder()
                .payrollNo(dto.getPayrollNo())
                .memberName(dto.getMemberName())
                .periodMonth(dto.getPeriodMonth())
                .periodYear(dto.getPeriodYear())
                .shareAmount(dto.getShareAmount() != null ? dto.getShareAmount() : BigDecimal.ZERO)
                .benevolenceAmount(dto.getBenevolenceAmount() != null ? dto.getBenevolenceAmount() : BigDecimal.ZERO)
                .paymentMode(dto.getPaymentMode() != null ? dto.getPaymentMode() : PaymentMode.DIRECT_BANK)
                .referenceNo(dto.getReferenceNo())
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .reconciled(dto.isReconciled())
                .reconciledBy(dto.isReconciled() ? operator : null)
                .reconciledAt(dto.isReconciled() ? LocalDateTime.now() : null)
                .notes(dto.getNotes())
                .build();
        contribution.computeTotal();

        Contribution saved = contributionRepository.save(contribution);

        if (saved.isReconciled()) {
            MemberContributionBalance balance = balanceRepository.findByPayrollNo(saved.getPayrollNo())
                    .orElse(MemberContributionBalance.builder()
                            .payrollNo(saved.getPayrollNo())
                            .totalShares(BigDecimal.ZERO)
                            .totalBenevolence(BigDecimal.ZERO)
                            .cumulativeTotal(BigDecimal.ZERO)
                            .build());

            balance.recalculate(saved.getShareAmount(), saved.getBenevolenceAmount(), saved.getPaymentDate());
            balanceRepository.save(balance);
        }

        return mapToDto(saved);
    }

    @Transactional
    public ContributionDto reconcileContribution(Long id, String operator) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Contribution not found: " + id));

        if (!contribution.isReconciled()) {
            contribution.setReconciled(true);
            contribution.setReconciledBy(operator);
            contribution.setReconciledAt(LocalDateTime.now());
            contributionRepository.save(contribution);

            MemberContributionBalance balance = balanceRepository.findByPayrollNo(contribution.getPayrollNo())
                    .orElse(MemberContributionBalance.builder()
                            .payrollNo(contribution.getPayrollNo())
                            .totalShares(BigDecimal.ZERO)
                            .totalBenevolence(BigDecimal.ZERO)
                            .cumulativeTotal(BigDecimal.ZERO)
                            .build());

            balance.recalculate(contribution.getShareAmount(), contribution.getBenevolenceAmount(), contribution.getPaymentDate());
            balanceRepository.save(balance);
        }

        return mapToDto(contribution);
    }

    public Page<ContributionDto> searchContributions(
            String payrollNo, Integer year, Integer month, Boolean reconciled, Pageable pageable) {
        return contributionRepository.searchContributions(payrollNo, year, month, reconciled, pageable)
                .map(this::mapToDto);
    }

    public MemberContributionBalance getMemberBalance(String payrollNo) {
        return balanceRepository.findByPayrollNo(payrollNo)
                .orElse(MemberContributionBalance.builder()
                        .payrollNo(payrollNo)
                        .totalShares(BigDecimal.ZERO)
                        .totalBenevolence(BigDecimal.ZERO)
                        .cumulativeTotal(BigDecimal.ZERO)
                        .build());
    }

    public MemberStatementDto generateStatement(String payrollNo, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusYears(1);
        if (endDate == null) endDate = LocalDate.now();

        // Calculate opening balance before startDate
        List<Contribution> allPrior = contributionRepository.findByPayrollNoOrderByPaymentDateDesc(payrollNo);
        BigDecimal openingShares = BigDecimal.ZERO;
        BigDecimal openingBenevolence = BigDecimal.ZERO;

        for (Contribution c : allPrior) {
            if (c.getPaymentDate().isBefore(startDate) && c.isReconciled()) {
                openingShares = openingShares.add(c.getShareAmount());
                openingBenevolence = openingBenevolence.add(c.getBenevolenceAmount());
            }
        }

        List<Contribution> periodItems = contributionRepository
                .findByPayrollNoAndPaymentDateBetweenOrderByPaymentDateAsc(payrollNo, startDate, endDate);

        BigDecimal runningShares = openingShares;
        BigDecimal runningBenevolence = openingBenevolence;
        List<MemberStatementDto.StatementLineItem> lineItems = new ArrayList<>();

        for (Contribution item : periodItems) {
            if (!item.isReconciled()) continue;
            runningShares = runningShares.add(item.getShareAmount());
            runningBenevolence = runningBenevolence.add(item.getBenevolenceAmount());

            lineItems.add(MemberStatementDto.StatementLineItem.builder()
                    .date(item.getPaymentDate())
                    .reference(item.getReferenceNo())
                    .description("Contribution for " + item.getPeriodMonth() + "/" + item.getPeriodYear() + " via " + item.getPaymentMode())
                    .shareAmount(item.getShareAmount())
                    .benevolenceAmount(item.getBenevolenceAmount())
                    .runningShareBalance(runningShares)
                    .runningBenevolenceBalance(runningBenevolence)
                    .build());
        }

        return MemberStatementDto.builder()
                .payrollNo(payrollNo)
                .fromDate(startDate)
                .toDate(endDate)
                .openingShareBalance(openingShares)
                .openingBenevolenceBalance(openingBenevolence)
                .items(lineItems)
                .closingShareBalance(runningShares)
                .closingBenevolenceBalance(runningBenevolence)
                .closingTotalBalance(runningShares.add(runningBenevolence))
                .build();
    }

    public Map<String, Object> getFinancialSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSharesAllTime", balanceRepository.sumTotalSharesAllMembers());
        summary.put("totalBenevolenceAllTime", balanceRepository.sumTotalBenevolenceAllMembers());
        summary.put("grandTotalContributions", contributionRepository.sumTotalAllTime());

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();

        summary.put("currentMonthShares", contributionRepository.sumSharesByMonth(currentYear, currentMonth));
        summary.put("currentMonthBenevolence", contributionRepository.sumBenevolenceByMonth(currentYear, currentMonth));
        summary.put("currentYearTotal", contributionRepository.sumTotalByYear(currentYear));

        return summary;
    }

    public ContributionDto mapToDto(Contribution c) {
        return ContributionDto.builder()
                .id(c.getId())
                .payrollNo(c.getPayrollNo())
                .memberName(c.getMemberName())
                .periodMonth(c.getPeriodMonth())
                .periodYear(c.getPeriodYear())
                .shareAmount(c.getShareAmount())
                .benevolenceAmount(c.getBenevolenceAmount())
                .totalAmount(c.getTotalAmount())
                .paymentMode(c.getPaymentMode())
                .referenceNo(c.getReferenceNo())
                .paymentDate(c.getPaymentDate())
                .reconciled(c.isReconciled())
                .notes(c.getNotes())
                .build();
    }
}

package org.nasweo.loan.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.InterestType;
import org.nasweo.common.enums.LoanStatus;
import org.nasweo.loan.dto.*;
import org.nasweo.loan.model.*;
import org.nasweo.loan.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanProductRepository productRepository;
    private final LoanRepaymentScheduleRepository scheduleRepository;
    private final LoanRepaymentRepository repaymentRepository;
    private final AmortizationCalculator amortizationCalculator;

    public List<LoanProduct> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public AmortizationScheduleDto calculateAmortizationPreview(
            String productCode, BigDecimal principal, Integer months) {
        LoanProduct product = productRepository.findById(productCode)
                .orElseThrow(() -> new IllegalArgumentException("Loan product not found: " + productCode));

        return amortizationCalculator.calculateSchedule(
                principal,
                product.getAnnualInterestRate(),
                months != null ? months : product.getMaxRepaymentMonths(),
                product.getInterestType(),
                LocalDate.now());
    }

    @Transactional
    public LoanDto applyLoan(LoanApplicationRequest request, String approvedBy) {
        LoanProduct product = productRepository.findById(request.getProductCode())
                .orElseThrow(() -> new IllegalArgumentException("Loan product not found: " + request.getProductCode()));

        if (request.getPrincipalAmount().compareTo(product.getMinAmount() != null ? product.getMinAmount() : BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Principal is below minimum limit for " + product.getName());
        }
        if (product.getMaxAmount() != null && request.getPrincipalAmount().compareTo(product.getMaxAmount()) > 0) {
            throw new IllegalArgumentException("Principal exceeds maximum limit of KES " + product.getMaxAmount());
        }

        LocalDate disburseDate = request.getRequestedDisbursementDate() != null
                ? request.getRequestedDisbursementDate() : LocalDate.now();

        AmortizationScheduleDto scheduleDto = amortizationCalculator.calculateSchedule(
                request.getPrincipalAmount(),
                product.getAnnualInterestRate(),
                request.getRepaymentMonths(),
                product.getInterestType(),
                disburseDate);

        String loanNumber = "LN-" + System.currentTimeMillis() % 1000000;

        Loan loan = Loan.builder()
                .loanNumber(loanNumber)
                .payrollNo(request.getPayrollNo())
                .memberName(request.getMemberName())
                .productCode(product.getCode())
                .productName(product.getName())
                .principalAmount(request.getPrincipalAmount())
                .interestRate(product.getAnnualInterestRate())
                .interestType(product.getInterestType())
                .repaymentMonths(request.getRepaymentMonths())
                .monthlyPayment(scheduleDto.getMonthlyPayment())
                .totalInterest(scheduleDto.getTotalInterest())
                .totalRepayable(scheduleDto.getTotalRepayable())
                .totalPaid(BigDecimal.ZERO)
                .outstandingPrincipal(request.getPrincipalAmount())
                .outstandingBalance(scheduleDto.getTotalRepayable())
                .arrearsAmount(BigDecimal.ZERO)
                .daysOverdue(0)
                .disbursedDate(disburseDate)
                .maturityDate(disburseDate.plusMonths(request.getRepaymentMonths()))
                .status(LoanStatus.ACTIVE)
                .isTopUp(false)
                .netDisbursementAmount(request.getPrincipalAmount())
                .approvedBy(approvedBy)
                .build();

        Loan saved = loanRepository.save(loan);

        // Save generated schedule
        saveScheduleItems(loanNumber, scheduleDto.getScheduleItems());

        return mapToDto(saved);
    }

    public LoanTopUpCalculationResult calculateTopUpPreview(String existingLoanNumber, BigDecimal newPrincipal) {
        Loan existing = loanRepository.findByLoanNumber(existingLoanNumber)
                .orElseThrow(() -> new IllegalArgumentException("Existing loan not found: " + existingLoanNumber));

        if (existing.getStatus() != LoanStatus.ACTIVE) {
            return LoanTopUpCalculationResult.builder()
                    .existingLoanNumber(existingLoanNumber)
                    .eligible(false)
                    .ineligibleReason("Only ACTIVE loans can be topped up. Current status is " + existing.getStatus())
                    .build();
        }

        BigDecimal settlement = existing.getOutstandingBalance();
        BigDecimal netDisbursement = newPrincipal.subtract(settlement);

        boolean eligible = netDisbursement.compareTo(BigDecimal.ZERO) > 0;
        String reason = eligible ? null : "Requested new principal must exceed current outstanding balance of KES " + settlement;

        return LoanTopUpCalculationResult.builder()
                .existingLoanNumber(existingLoanNumber)
                .currentOutstandingPrincipal(existing.getOutstandingPrincipal())
                .currentOutstandingInterest(existing.getOutstandingBalance().subtract(existing.getOutstandingPrincipal()))
                .totalSettlementRequired(settlement)
                .requestedNewPrincipal(newPrincipal)
                .netDisbursementToMember(netDisbursement)
                .eligible(eligible)
                .ineligibleReason(reason)
                .build();
    }

    @Transactional
    public LoanDto processTopUp(LoanTopUpRequest request, String approvedBy) {
        Loan existing = loanRepository.findByLoanNumber(request.getExistingLoanNumber())
                .orElseThrow(() -> new IllegalArgumentException("Existing loan not found: " + request.getExistingLoanNumber()));

        if (existing.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalStateException("Existing loan is not ACTIVE");
        }

        BigDecimal settlement = existing.getOutstandingBalance();
        if (request.getNewPrincipalAmount().compareTo(settlement) <= 0) {
            throw new IllegalArgumentException("New principal must be greater than current outstanding balance of KES " + settlement);
        }

        String productCode = request.getProductCode() != null ? request.getProductCode() : existing.getProductCode();
        LoanProduct product = productRepository.findById(productCode)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productCode));

        LocalDate disburseDate = request.getRequestedDisbursementDate() != null
                ? request.getRequestedDisbursementDate() : LocalDate.now();

        // 1. Close existing loan as TOPPED_UP
        existing.setStatus(LoanStatus.TOPPED_UP);
        existing.setOutstandingBalance(BigDecimal.ZERO);
        existing.setOutstandingPrincipal(BigDecimal.ZERO);
        loanRepository.save(existing);

        // 2. Generate new loan with settlement deduction
        AmortizationScheduleDto scheduleDto = amortizationCalculator.calculateSchedule(
                request.getNewPrincipalAmount(),
                product.getAnnualInterestRate(),
                request.getNewRepaymentMonths(),
                product.getInterestType(),
                disburseDate);

        String newLoanNumber = "LN-" + System.currentTimeMillis() % 1000000;
        BigDecimal netDisbursement = request.getNewPrincipalAmount().subtract(settlement);

        Loan newLoan = Loan.builder()
                .loanNumber(newLoanNumber)
                .payrollNo(existing.getPayrollNo())
                .memberName(existing.getMemberName())
                .productCode(product.getCode())
                .productName(product.getName())
                .principalAmount(request.getNewPrincipalAmount())
                .interestRate(product.getAnnualInterestRate())
                .interestType(product.getInterestType())
                .repaymentMonths(request.getNewRepaymentMonths())
                .monthlyPayment(scheduleDto.getMonthlyPayment())
                .totalInterest(scheduleDto.getTotalInterest())
                .totalRepayable(scheduleDto.getTotalRepayable())
                .totalPaid(BigDecimal.ZERO)
                .outstandingPrincipal(request.getNewPrincipalAmount())
                .outstandingBalance(scheduleDto.getTotalRepayable())
                .disbursedDate(disburseDate)
                .maturityDate(disburseDate.plusMonths(request.getNewRepaymentMonths()))
                .status(LoanStatus.ACTIVE)
                .isTopUp(true)
                .originalLoanNumber(existing.getLoanNumber())
                .settlementDeduction(settlement)
                .netDisbursementAmount(netDisbursement)
                .approvedBy(approvedBy)
                .build();

        Loan savedNewLoan = loanRepository.save(newLoan);
        saveScheduleItems(newLoanNumber, scheduleDto.getScheduleItems());

        return mapToDto(savedNewLoan);
    }

    @Transactional
    public LoanRepaymentDto processRepayment(LoanRepaymentDto dto, String receivedBy) {
        Loan loan = loanRepository.findByLoanNumber(dto.getLoanNumber())
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + dto.getLoanNumber()));

        BigDecimal paymentAmount = dto.getAmount();

        // Record repayment log
        LoanRepayment repayment = LoanRepayment.builder()
                .loanNumber(loan.getLoanNumber())
                .payrollNo(loan.getPayrollNo())
                .amount(paymentAmount)
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .paymentMode(dto.getPaymentMode())
                .referenceNo(dto.getReferenceNo())
                .receivedBy(receivedBy)
                .build();

        // Apply payment across pending schedules
        List<LoanRepaymentSchedule> schedules = scheduleRepository
                .findByLoanNumberOrderByInstallmentNoAsc(loan.getLoanNumber());

        BigDecimal remainingToApply = paymentAmount;
        BigDecimal totalPrincipalApplied = BigDecimal.ZERO;
        BigDecimal totalInterestApplied = BigDecimal.ZERO;

        for (LoanRepaymentSchedule item : schedules) {
            if ("PAID".equals(item.getStatus())) continue;

            BigDecimal installmentDue = item.getTotalInstallment().subtract(item.getPaidAmount());
            if (remainingToApply.compareTo(installmentDue) >= 0) {
                // Fully pays this installment
                item.setPaidAmount(item.getTotalInstallment());
                item.setStatus("PAID");
                item.setPaidDate(repayment.getPaymentDate());
                remainingToApply = remainingToApply.subtract(installmentDue);
                totalPrincipalApplied = totalPrincipalApplied.add(item.getPrincipalAmount());
                totalInterestApplied = totalInterestApplied.add(item.getInterestAmount());
            } else if (remainingToApply.compareTo(BigDecimal.ZERO) > 0) {
                // Partially pays this installment
                item.setPaidAmount(item.getPaidAmount().add(remainingToApply));
                item.setStatus("PARTIAL");
                item.setPaidDate(repayment.getPaymentDate());
                totalPrincipalApplied = totalPrincipalApplied.add(remainingToApply);
                remainingToApply = BigDecimal.ZERO;
                break;
            }
        }
        scheduleRepository.saveAll(schedules);

        repayment.setPrincipalPortion(totalPrincipalApplied);
        repayment.setInterestPortion(totalInterestApplied);
        repaymentRepository.save(repayment);

        // Update Loan master record
        loan.setTotalPaid(loan.getTotalPaid().add(paymentAmount));
        BigDecimal newOutstanding = loan.getOutstandingBalance().subtract(paymentAmount);
        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            loan.setOutstandingBalance(BigDecimal.ZERO);
            loan.setOutstandingPrincipal(BigDecimal.ZERO);
            loan.setStatus(LoanStatus.CLOSED);
        } else {
            loan.setOutstandingBalance(newOutstanding);
            loan.setOutstandingPrincipal(loan.getOutstandingPrincipal().subtract(totalPrincipalApplied).max(BigDecimal.ZERO));
        }

        loanRepository.save(loan);

        dto.setId(repayment.getId());
        dto.setPrincipalPortion(totalPrincipalApplied);
        dto.setInterestPortion(totalInterestApplied);
        return dto;
    }

    public List<LoanRepaymentSchedule> getLoanSchedule(String loanNumber) {
        return scheduleRepository.findByLoanNumberOrderByInstallmentNoAsc(loanNumber);
    }

    public List<LoanRepayment> getLoanRepayments(String loanNumber) {
        return repaymentRepository.findByLoanNumberOrderByPaymentDateDesc(loanNumber);
    }

    public List<LoanDto> getLoansByPayroll(String payrollNo) {
        return loanRepository.findByPayrollNoOrderByDisbursedDateDesc(payrollNo).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<LoanDto> searchLoans(String query, LoanStatus status, String productCode, Pageable pageable) {
        return loanRepository.searchLoans(query, status, productCode, pageable)
                .map(this::mapToDto);
    }

    public List<LoanDto> getOverdueLoans() {
        return loanRepository.findOverdueLoans().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getLoanPortfolioAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDisbursedActive", loanRepository.sumDisbursedActivePortfolio());
        stats.put("totalOutstandingBalance", loanRepository.sumOutstandingBalance());
        stats.put("totalInterestProjected", loanRepository.sumTotalInterestProjected());
        stats.put("totalArrears", loanRepository.sumTotalArrears());
        stats.put("activeLoansCount", loanRepository.countByStatus(LoanStatus.ACTIVE));
        stats.put("defaultedLoansCount", loanRepository.countByStatus(LoanStatus.DEFAULTED));
        stats.put("closedLoansCount", loanRepository.countByStatus(LoanStatus.CLOSED));
        return stats;
    }

    private void saveScheduleItems(String loanNumber, List<AmortizationScheduleDto.ScheduleItem> items) {
        List<LoanRepaymentSchedule> entities = items.stream().map(dto ->
                LoanRepaymentSchedule.builder()
                        .loanNumber(loanNumber)
                        .installmentNo(dto.getInstallmentNo())
                        .dueDate(dto.getDueDate())
                        .openingBalance(dto.getOpeningBalance())
                        .principalAmount(dto.getPrincipalAmount())
                        .interestAmount(dto.getInterestAmount())
                        .totalInstallment(dto.getTotalInstallment())
                        .closingBalance(dto.getClosingBalance())
                        .paidAmount(BigDecimal.ZERO)
                        .status("PENDING")
                        .build()
        ).collect(Collectors.toList());

        scheduleRepository.saveAll(entities);
    }

    public LoanDto mapToDto(Loan l) {
        return LoanDto.builder()
                .id(l.getId())
                .loanNumber(l.getLoanNumber())
                .payrollNo(l.getPayrollNo())
                .memberName(l.getMemberName())
                .productCode(l.getProductCode())
                .productName(l.getProductName())
                .principalAmount(l.getPrincipalAmount())
                .interestRate(l.getInterestRate())
                .interestType(l.getInterestType())
                .repaymentMonths(l.getRepaymentMonths())
                .monthlyPayment(l.getMonthlyPayment())
                .totalInterest(l.getTotalInterest())
                .totalRepayable(l.getTotalRepayable())
                .totalPaid(l.getTotalPaid())
                .outstandingPrincipal(l.getOutstandingPrincipal())
                .outstandingBalance(l.getOutstandingBalance())
                .arrearsAmount(l.getArrearsAmount())
                .daysOverdue(l.getDaysOverdue())
                .disbursedDate(l.getDisbursedDate())
                .maturityDate(l.getMaturityDate())
                .status(l.getStatus())
                .isTopUp(l.isTopUp())
                .originalLoanNumber(l.getOriginalLoanNumber())
                .settlementDeduction(l.getSettlementDeduction())
                .netDisbursementAmount(l.getNetDisbursementAmount())
                .approvedBy(l.getApprovedBy())
                .build();
    }
}

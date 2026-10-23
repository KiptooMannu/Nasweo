package org.nasweo.contribution.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.PaymentMode;
import org.nasweo.common.util.SpreadsheetReader;
import org.nasweo.contribution.dto.CheckoffImportResult;
import org.nasweo.contribution.model.Contribution;
import org.nasweo.contribution.model.MemberContributionBalance;
import org.nasweo.contribution.repository.ContributionRepository;
import org.nasweo.contribution.repository.MemberContributionBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContributionExcelImportService {

    private final ContributionRepository contributionRepository;
    private final MemberContributionBalanceRepository balanceRepository;

    @Transactional
    public CheckoffImportResult importEmployerCheckoff(
            MultipartFile file, Integer defaultMonth, Integer defaultYear, boolean dryRun, String operator) {

        CheckoffImportResult result = new CheckoffImportResult();
        result.setPeriodMonth(defaultMonth != null ? defaultMonth : LocalDate.now().getMonthValue());
        result.setPeriodYear(defaultYear != null ? defaultYear : LocalDate.now().getYear());

        Set<String> processedPayrolls = new HashSet<>();

        try {
            List<List<String>> rows = SpreadsheetReader.readRows(file);
            if (rows.isEmpty()) {
                result.getErrorMessages().add("Spreadsheet file is empty.");
                return result;
            }

            result.setTotalRows(rows.size() - 1);

            for (int r = 1; r < rows.size(); r++) {
                List<String> row = rows.get(r);
                if (row.isEmpty() || isRowEmpty(row)) continue;

                try {
                    String payrollNo = getCell(row, 0);
                    String memberName = getCell(row, 1);
                    BigDecimal shareAmt = parseBigDecimal(getCell(row, 2));
                    BigDecimal benevAmt = parseBigDecimal(getCell(row, 3));
                    Integer rowMonth = parseInteger(getCell(row, 4));
                    Integer rowYear = parseInteger(getCell(row, 5));
                    String refNo = getCell(row, 6);

                    int month = rowMonth != null ? rowMonth : result.getPeriodMonth();
                    int year = rowYear != null ? rowYear : result.getPeriodYear();

                    if (payrollNo == null || payrollNo.isBlank()) {
                        result.getErrorMessages().add("Row " + (r + 1) + ": Missing Payroll Number.");
                        result.setFailedRows(result.getFailedRows() + 1);
                        continue;
                    }

                    if (processedPayrolls.contains(payrollNo)) {
                        result.getErrorMessages().add("Row " + (r + 1) + " [" + payrollNo + "]: Duplicate in same file.");
                        result.setDuplicateRows(result.getDuplicateRows() + 1);
                        result.setFailedRows(result.getFailedRows() + 1);
                        continue;
                    }
                    processedPayrolls.add(payrollNo);

                    // Check if already posted in database
                    if (contributionRepository.existsByPayrollNoAndPeriodMonthAndPeriodYear(payrollNo, month, year)) {
                        result.getWarnings().add("Row " + (r + 1) + " [" + payrollNo + "]: Already posted for " + month + "/" + year + " (Skipped)");
                        result.setDuplicateRows(result.getDuplicateRows() + 1);
                        continue;
                    }

                    if (shareAmt == null) shareAmt = BigDecimal.ZERO;
                    if (benevAmt == null) benevAmt = BigDecimal.ZERO;

                    if (shareAmt.compareTo(BigDecimal.ZERO) < 0 || benevAmt.compareTo(BigDecimal.ZERO) < 0) {
                        result.getErrorMessages().add("Row " + (r + 1) + " [" + payrollNo + "]: Amounts cannot be negative.");
                        result.setFailedRows(result.getFailedRows() + 1);
                        continue;
                    }

                    BigDecimal rowTotal = shareAmt.add(benevAmt);

                    result.setTotalSharesImported(result.getTotalSharesImported().add(shareAmt));
                    result.setTotalBenevolenceImported(result.getTotalBenevolenceImported().add(benevAmt));
                    result.setTotalAmountImported(result.getTotalAmountImported().add(rowTotal));
                    result.setSuccessfulRows(result.getSuccessfulRows() + 1);

                    if (!dryRun) {
                        Contribution contribution = Contribution.builder()
                                .payrollNo(payrollNo)
                                .memberName(memberName)
                                .periodMonth(month)
                                .periodYear(year)
                                .shareAmount(shareAmt)
                                .benevolenceAmount(benevAmt)
                                .paymentMode(PaymentMode.EMPLOYER_CHECKOFF)
                                .referenceNo(refNo != null ? refNo : "CHECKOFF-" + year + "-" + month)
                                .paymentDate(LocalDate.of(year, month, 15))
                                .reconciled(true)
                                .reconciledBy(operator)
                                .notes("Imported via Employer Checkoff Excel")
                                .build();
                        contribution.computeTotal();
                        contributionRepository.save(contribution);

                        // Update MemberContributionBalance
                        MemberContributionBalance balance = balanceRepository.findByPayrollNo(payrollNo)
                                .orElse(MemberContributionBalance.builder()
                                        .payrollNo(payrollNo)
                                        .totalShares(BigDecimal.ZERO)
                                        .totalBenevolence(BigDecimal.ZERO)
                                        .cumulativeTotal(BigDecimal.ZERO)
                                        .build());

                        balance.recalculate(shareAmt, benevAmt, contribution.getPaymentDate());
                        balanceRepository.save(balance);
                    }

                } catch (Exception ex) {
                    log.error("Error importing checkoff row {}", r, ex);
                    result.getErrorMessages().add("Row " + (r + 1) + ": " + ex.getMessage());
                    result.setFailedRows(result.getFailedRows() + 1);
                }
            }

        } catch (Exception ex) {
            log.error("Failed to parse checkoff spreadsheet", ex);
            result.getErrorMessages().add("File processing failed: " + ex.getMessage());
        }

        return result;
    }

    private String getCell(List<String> row, int index) {
        if (index < row.size()) {
            String val = row.get(index);
            return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
        }
        return null;
    }

    private boolean isRowEmpty(List<String> row) {
        for (String c : row) {
            if (c != null && !c.trim().isEmpty()) return false;
        }
        return true;
    }

    private BigDecimal parseBigDecimal(String val) {
        if (val == null || val.isBlank()) return BigDecimal.ZERO;
        try {
            String clean = val.replaceAll("[^0-9.]", "").trim();
            return clean.isEmpty() ? BigDecimal.ZERO : new BigDecimal(clean);
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    private Integer parseInteger(String val) {
        if (val == null || val.isBlank()) return null;
        try {
            return (int) Double.parseDouble(val.trim());
        } catch (Exception ignored) {
            return null;
        }
    }
}

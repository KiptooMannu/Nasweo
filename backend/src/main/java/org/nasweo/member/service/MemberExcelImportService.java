package org.nasweo.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;
import org.nasweo.common.util.SpreadsheetReader;
import org.nasweo.member.dto.MemberImportResult;
import org.nasweo.member.model.Member;
import org.nasweo.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberExcelImportService {

    private final MemberRepository memberRepository;

    @Transactional
    public MemberImportResult importMembersFromExcel(MultipartFile file, boolean dryRun) {
        MemberImportResult result = new MemberImportResult();
        Set<String> processedPayrolls = new HashSet<>();

        try {
            List<List<String>> rows = SpreadsheetReader.readRows(file);
            if (rows.isEmpty()) {
                result.getErrorMessages().add("Spreadsheet contains no data rows.");
                return result;
            }

            result.setTotalRecords(rows.size() - 1); // Exclude header row

            for (int r = 1; r < rows.size(); r++) {
                List<String> row = rows.get(r);
                if (row.isEmpty() || isRowEmpty(row)) continue;

                try {
                    String payrollNo = getCell(row, 0);
                    String nationalId = getCell(row, 1);
                    String firstName = getCell(row, 2);
                    String lastName = getCell(row, 3);
                    String otherNames = getCell(row, 4);
                    String email = getCell(row, 5);
                    String phone = getCell(row, 6);
                    LocalDate dob = parseDate(getCell(row, 7));
                    String categoryStr = getCell(row, 8);
                    String department = getCell(row, 9);
                    String designation = getCell(row, 10);

                    // Validation
                    if (payrollNo == null || payrollNo.isBlank()) {
                        result.getErrorMessages().add("Row " + (r + 1) + ": Missing Payroll Number");
                        result.setFailedRecords(result.getFailedRecords() + 1);
                        continue;
                    }

                    if (processedPayrolls.contains(payrollNo)) {
                        result.getErrorMessages().add("Row " + (r + 1) + ": Duplicate Payroll Number '" + payrollNo + "' in spreadsheet");
                        result.setFailedRecords(result.getFailedRecords() + 1);
                        continue;
                    }
                    processedPayrolls.add(payrollNo);

                    if (nationalId == null || nationalId.isBlank()) {
                        result.getErrorMessages().add("Row " + (r + 1) + " [" + payrollNo + "]: Missing National ID");
                        result.setFailedRecords(result.getFailedRecords() + 1);
                        continue;
                    }

                    if (firstName == null || firstName.isBlank() || lastName == null || lastName.isBlank()) {
                        result.getErrorMessages().add("Row " + (r + 1) + " [" + payrollNo + "]: First and Last Name are required");
                        result.setFailedRecords(result.getFailedRecords() + 1);
                        continue;
                    }

                    if (dob == null) {
                        result.getErrorMessages().add("Row " + (r + 1) + " [" + payrollNo + "]: Invalid or missing Date of Birth");
                        result.setFailedRecords(result.getFailedRecords() + 1);
                        continue;
                    }

                    EmploymentCategory category = EmploymentCategory.NON_SCIENTIST;
                    if (categoryStr != null && categoryStr.trim().equalsIgnoreCase("SCIENTIST")) {
                        category = EmploymentCategory.SCIENTIST;
                    }

                    if (!dryRun) {
                        Optional<Member> existingOpt = memberRepository.findByPayrollNo(payrollNo);
                        Member member;
                        if (existingOpt.isPresent()) {
                            member = existingOpt.get();
                            result.setUpdatedRecords(result.getUpdatedRecords() + 1);
                        } else {
                            member = new Member();
                            member.setPayrollNo(payrollNo);
                            result.setSuccessfulRecords(result.getSuccessfulRecords() + 1);
                        }

                        member.setNationalId(nationalId);
                        member.setFirstName(firstName);
                        member.setLastName(lastName);
                        member.setOtherNames(otherNames);
                        member.setEmail(email);
                        member.setPhoneNumber(phone != null && !phone.isBlank() ? phone : "N/A");
                        member.setDob(dob);
                        member.setEmploymentCategory(category);
                        member.setDepartment(department != null ? department : "General");
                        member.setDesignation(designation);
                        member.setStatus(MemberStatus.ACTIVE);
                        member.computeRetirementDate();

                        memberRepository.save(member);
                    } else {
                        result.setSuccessfulRecords(result.getSuccessfulRecords() + 1);
                    }

                } catch (Exception e) {
                    log.error("Error processing member row {}", r, e);
                    result.getErrorMessages().add("Row " + (r + 1) + ": " + e.getMessage());
                    result.setFailedRecords(result.getFailedRecords() + 1);
                }
            }

        } catch (Exception ex) {
            log.error("Failed to read spreadsheet file", ex);
            result.getErrorMessages().add("Spreadsheet reading error: " + ex.getMessage());
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

    private LocalDate parseDate(String val) {
        if (val == null || val.isBlank()) return null;
        try {
            return LocalDate.parse(val.trim());
        } catch (Exception ignored) {
            return null;
        }
    }
}

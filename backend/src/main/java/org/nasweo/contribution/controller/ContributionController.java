package org.nasweo.contribution.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.contribution.dto.CheckoffImportResult;
import org.nasweo.contribution.dto.ContributionDto;
import org.nasweo.contribution.dto.MemberStatementDto;
import org.nasweo.contribution.model.MemberContributionBalance;
import org.nasweo.contribution.service.ContributionExcelImportService;
import org.nasweo.contribution.service.ContributionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
public class ContributionController {

    private final ContributionService contributionService;
    private final ContributionExcelImportService excelImportService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<ContributionDto>> recordContribution(
            @Valid @RequestBody ContributionDto dto,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "TREASURER";
        ContributionDto recorded = contributionService.recordContribution(dto, operator);
        return ResponseEntity.ok(ApiResponse.ok("Contribution recorded successfully", recorded));
    }

    @PutMapping("/{id}/reconcile")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<ContributionDto>> reconcileContribution(
            @PathVariable Long id,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "TREASURER";
        ContributionDto reconciled = contributionService.reconcileContribution(id, operator);
        return ResponseEntity.ok(ApiResponse.ok("Contribution reconciled successfully", reconciled));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Page<ContributionDto>>> searchContributions(
            @RequestParam(required = false) String payrollNo,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Boolean reconciled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<ContributionDto> results = contributionService.searchContributions(
                payrollNo, year, month, reconciled, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/my-balance")
    public ResponseEntity<ApiResponse<MemberContributionBalance>> getMyBalance(Authentication authentication) {
        String payrollNo = getAuthenticatedPayrollNo(authentication);
        if (payrollNo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No member profile associated with this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(contributionService.getMemberBalance(payrollNo)));
    }

    @GetMapping("/my-statement")
    public ResponseEntity<ApiResponse<MemberStatementDto>> getMyStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {
        String payrollNo = getAuthenticatedPayrollNo(authentication);
        if (payrollNo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No member profile associated with this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(contributionService.generateStatement(payrollNo, fromDate, toDate)));
    }

    @GetMapping("/balance/{payrollNo}")
    public ResponseEntity<ApiResponse<MemberContributionBalance>> getMemberBalance(
            @PathVariable String payrollNo,
            Authentication authentication) {
        validateMemberAccess(authentication, payrollNo);
        return ResponseEntity.ok(ApiResponse.ok(contributionService.getMemberBalance(payrollNo)));
    }

    @GetMapping("/statement/{payrollNo}")
    public ResponseEntity<ApiResponse<MemberStatementDto>> getMemberStatement(
            @PathVariable String payrollNo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {
        validateMemberAccess(authentication, payrollNo);
        MemberStatementDto statement = contributionService.generateStatement(payrollNo, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.ok(statement));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinancialSummary() {
        return ResponseEntity.ok(ApiResponse.ok(contributionService.getFinancialSummary()));
    }

    @PostMapping("/import-checkoff")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<CheckoffImportResult>> importCheckoff(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "false") boolean dryRun,
            Authentication authentication) {

        String operator = authentication != null ? authentication.getName() : "TREASURER";
        CheckoffImportResult result = excelImportService.importEmployerCheckoff(file, month, year, dryRun, operator);
        String msg = dryRun ? "Checkoff validation finished" : "Checkoff import posted successfully";
        return ResponseEntity.ok(ApiResponse.ok(msg, result));
    }

    private void validateMemberAccess(Authentication authentication, String targetPayrollNo) {
        if (authentication == null) {
            throw new AccessDeniedException("Unauthenticated request");
        }
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_TREASURER")
                        || a.getAuthority().equals("ROLE_WELFARE_OFFICER")
                        || a.getAuthority().equals("ROLE_AUDITOR"));

        if (!isStaff) {
            String myPayroll = getAuthenticatedPayrollNo(authentication);
            if (myPayroll == null || !myPayroll.equalsIgnoreCase(targetPayrollNo)) {
                throw new AccessDeniedException("Access denied: You may only access your own contribution records.");
            }
        }
    }

    private String getAuthenticatedPayrollNo(Authentication authentication) {
        if (authentication == null) return null;
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(User::getPayrollNo)
                .orElse(null);
    }
}

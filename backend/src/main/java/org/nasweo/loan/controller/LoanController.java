package org.nasweo.loan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.common.enums.LoanStatus;
import org.nasweo.loan.dto.*;
import org.nasweo.loan.model.LoanProduct;
import org.nasweo.loan.model.LoanRepayment;
import org.nasweo.loan.model.LoanRepaymentSchedule;
import org.nasweo.loan.service.LoanService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final UserRepository userRepository;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<LoanProduct>>> getActiveProducts() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getActiveProducts()));
    }

    @GetMapping("/calculator")
    public ResponseEntity<ApiResponse<AmortizationScheduleDto>> calculateAmortization(
            @RequestParam String productCode,
            @RequestParam BigDecimal principal,
            @RequestParam(required = false) Integer months) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.calculateAmortizationPreview(productCode, principal, months)));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<LoanDto>> applyLoan(
            @Valid @RequestBody LoanApplicationRequest request,
            Authentication authentication) {
        String approvedBy = authentication != null ? authentication.getName() : "TREASURER";
        LoanDto created = loanService.applyLoan(request, approvedBy);
        return ResponseEntity.ok(ApiResponse.ok("Loan application approved and activated", created));
    }

    @GetMapping("/topup/preview")
    public ResponseEntity<ApiResponse<LoanTopUpCalculationResult>> previewTopUp(
            @RequestParam String existingLoanNumber,
            @RequestParam BigDecimal newPrincipal) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.calculateTopUpPreview(existingLoanNumber, newPrincipal)));
    }

    @PostMapping("/topup")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<LoanDto>> processTopUp(
            @Valid @RequestBody LoanTopUpRequest request,
            Authentication authentication) {
        String approvedBy = authentication != null ? authentication.getName() : "TREASURER";
        LoanDto result = loanService.processTopUp(request, approvedBy);
        return ResponseEntity.ok(ApiResponse.ok("Loan top-up processed successfully", result));
    }

    @PostMapping("/repay")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER')")
    public ResponseEntity<ApiResponse<LoanRepaymentDto>> recordRepayment(
            @Valid @RequestBody LoanRepaymentDto dto,
            Authentication authentication) {
        String receivedBy = authentication != null ? authentication.getName() : "TREASURER";
        LoanRepaymentDto result = loanService.processRepayment(dto, receivedBy);
        return ResponseEntity.ok(ApiResponse.ok("Repayment posted successfully", result));
    }

    @GetMapping("/{loanNumber}/schedule")
    public ResponseEntity<ApiResponse<List<LoanRepaymentSchedule>>> getLoanSchedule(
            @PathVariable String loanNumber) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoanSchedule(loanNumber)));
    }

    @GetMapping("/{loanNumber}/repayments")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<List<LoanRepayment>>> getLoanRepayments(
            @PathVariable String loanNumber) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoanRepayments(loanNumber)));
    }

    @GetMapping("/my-loans")
    public ResponseEntity<ApiResponse<List<LoanDto>>> getMyLoans(Authentication authentication) {
        String payrollNo = getAuthenticatedPayrollNo(authentication);
        if (payrollNo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No member profile associated with this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoansByPayroll(payrollNo)));
    }

    @GetMapping("/member/{payrollNo}")
    public ResponseEntity<ApiResponse<List<LoanDto>>> getLoansByPayroll(
            @PathVariable String payrollNo,
            Authentication authentication) {
        validateMemberAccess(authentication, payrollNo);
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoansByPayroll(payrollNo)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Page<LoanDto>>> searchLoans(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(required = false) String productCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "disbursedDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<LoanDto> results = loanService.searchLoans(query, status, productCode, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<List<LoanDto>>> getOverdueLoans() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getOverdueLoans()));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.getLoanPortfolioAnalytics()));
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
                throw new AccessDeniedException("Access denied: You may only access your own loan records.");
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

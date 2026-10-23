package org.nasweo.welfare.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.common.enums.BenevolenceType;
import org.nasweo.welfare.dto.BenevolenceRecordDto;
import org.nasweo.welfare.dto.WelfareExpenditureSummary;
import org.nasweo.welfare.service.WelfareService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/welfare")
@RequiredArgsConstructor
public class WelfareController {

    private final WelfareService welfareService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER')")
    public ResponseEntity<ApiResponse<BenevolenceRecordDto>> recordBenevolence(
            @Valid @RequestBody BenevolenceRecordDto dto,
            Authentication authentication) {
        String approvedBy = authentication != null ? authentication.getName() : "WELFARE_OFFICER";
        BenevolenceRecordDto created = welfareService.recordBenevolence(dto, approvedBy);
        return ResponseEntity.ok(ApiResponse.ok("Benevolence / Gift record created", created));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Page<BenevolenceRecordDto>>> searchRecords(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) BenevolenceType type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<BenevolenceRecordDto> results = welfareService.searchRecords(query, type, status, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/my-records")
    public ResponseEntity<ApiResponse<List<BenevolenceRecordDto>>> getMyRecords(Authentication authentication) {
        String payrollNo = getAuthenticatedPayrollNo(authentication);
        if (payrollNo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No member profile associated with this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(welfareService.getMemberRecords(payrollNo)));
    }

    @GetMapping("/member/{payrollNo}")
    public ResponseEntity<ApiResponse<List<BenevolenceRecordDto>>> getMemberRecords(
            @PathVariable String payrollNo,
            Authentication authentication) {
        validateMemberAccess(authentication, payrollNo);
        return ResponseEntity.ok(ApiResponse.ok(welfareService.getMemberRecords(payrollNo)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<WelfareExpenditureSummary>> getExpenditureSummary() {
        return ResponseEntity.ok(ApiResponse.ok(welfareService.getExpenditureSummary()));
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
                throw new AccessDeniedException("Access denied: You may only access your own welfare records.");
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

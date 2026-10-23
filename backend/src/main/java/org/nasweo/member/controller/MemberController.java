package org.nasweo.member.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;
import org.nasweo.common.enums.Role;
import org.nasweo.member.dto.MemberDto;
import org.nasweo.member.dto.MemberImportResult;
import org.nasweo.member.service.MemberExcelImportService;
import org.nasweo.member.service.MemberService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberExcelImportService excelImportService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER')")
    public ResponseEntity<ApiResponse<MemberDto>> createMember(@Valid @RequestBody MemberDto dto) {
        MemberDto created = memberService.createMember(dto);
        return ResponseEntity.ok(ApiResponse.ok("Member registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER')")
    public ResponseEntity<ApiResponse<MemberDto>> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody MemberDto dto) {
        MemberDto updated = memberService.updateMember(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Member profile updated successfully", updated));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberDto>> getMyProfile(Authentication authentication) {
        String payrollNo = getAuthenticatedPayrollNo(authentication);
        if (payrollNo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No member profile associated with this account"));
        }
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMemberByPayrollNo(payrollNo)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<MemberDto>> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMemberById(id)));
    }

    @GetMapping("/payroll/{payrollNo}")
    public ResponseEntity<ApiResponse<MemberDto>> getMemberByPayrollNo(
            @PathVariable String payrollNo,
            Authentication authentication) {
        validateMemberAccess(authentication, payrollNo);
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMemberByPayrollNo(payrollNo)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Page<MemberDto>>> searchMembers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) MemberStatus status,
            @RequestParam(required = false) EmploymentCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "payrollNo") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<MemberDto> results = memberService.searchMembers(query, status, category, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/retirements/upcoming")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<List<MemberDto>>> getUpcomingRetirements(
            @RequestParam(defaultValue = "12") int months) {
        List<MemberDto> retiring = memberService.getUpcomingRetirements(months);
        return ResponseEntity.ok(ApiResponse.ok(retiring));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER', 'ROLE_TREASURER', 'ROLE_AUDITOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMembershipStatistics() {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMembershipStatistics()));
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WELFARE_OFFICER')")
    public ResponseEntity<ApiResponse<MemberImportResult>> importMembers(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean dryRun) {
        MemberImportResult result = excelImportService.importMembersFromExcel(file, dryRun);
        String msg = dryRun ? "Excel validation completed" : "Excel import executed successfully";
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
                throw new AccessDeniedException("Access denied: You may only access your own member records.");
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

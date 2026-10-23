package org.nasweo.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nasweo.auth.dto.*;
import org.nasweo.auth.model.AuditLog;
import org.nasweo.auth.service.AuthService;
import org.nasweo.common.dto.ApiResponse;
import org.nasweo.common.dto.AuditLogEvent;
import org.nasweo.common.dto.JwtResponse;
import org.nasweo.common.dto.LoginRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getRemoteAddr();
        JwtResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unauthenticated session"));
        }
        authService.changePassword(request, username);
        return ResponseEntity.ok(ApiResponse.ok("Password successfully updated. You may now access your dashboard.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unauthenticated session"));
        }
        UserResponseDto profile = authService.getCurrentUserProfile(username);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    // ==========================================
    // ADMINISTRATIVE USER MANAGEMENT ENDPOINTS
    // ==========================================

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getUserById(id)));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserRegistrationResultDto>> createUser(
            @Valid @RequestBody RegisterRequest request,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "ADMIN";
        UserRegistrationResultDto result = authService.register(request, operator);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully. Temporary credential issued.", result));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "ADMIN";
        UserResponseDto updated = authService.updateUser(id, request, operator);
        return ResponseEntity.ok(ApiResponse.ok("User profile updated successfully", updated));
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "ADMIN";
        boolean enabled = body.getOrDefault("enabled", true);
        UserResponseDto updated = authService.toggleUserStatus(id, enabled, operator);
        String msg = enabled ? "Account activated successfully" : "Account deactivated successfully";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPassword(
            @PathVariable Long id,
            Authentication authentication) {
        String operator = authentication != null ? authentication.getName() : "ADMIN";
        String temporaryPassword = authService.resetPassword(id, operator);
        return ResponseEntity.ok(ApiResponse.ok("Temporary password generated. Account marked for mandatory password change.",
                Map.of("temporaryPassword", temporaryPassword)));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleMetadataDto>>> getRolesMetadata() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getRolesMetadata()));
    }

    // ==========================================
    // AUDIT LOG ENDPOINTS
    // ==========================================

    @PostMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Void>> recordAudit(@RequestBody AuditLogEvent event) {
        authService.recordAudit(event);
        return ResponseEntity.ok(ApiResponse.ok("Audit logged", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = authService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/audit-logs/recent")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getRecentAuditLogs()));
    }
}

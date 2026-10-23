package org.nasweo.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nasweo.auth.dto.*;
import org.nasweo.auth.model.AuditLog;
import org.nasweo.auth.model.User;
import org.nasweo.auth.repository.AuditLogRepository;
import org.nasweo.auth.repository.UserRepository;
import org.nasweo.common.dto.AuditLogEvent;
import org.nasweo.common.dto.JwtResponse;
import org.nasweo.common.dto.LoginRequest;
import org.nasweo.common.enums.Role;
import org.nasweo.common.security.JwtUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    private static final String CHAR_LOWER = "abcdefghjkmnpqrstuvwxyz";
    private static final String CHAR_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String NUMBER = "23456789";
    private static final String SPECIAL = "@#$%&!";
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$");

    @Transactional
    public JwtResponse login(LoginRequest request, String ipAddress) {
        // Authenticate by username or payroll number
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByPayrollNo(request.getUsername()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isEnabled()) {
            recordAudit("LOGIN_BLOCKED", request.getUsername(), "User", user.getId().toString(), "Attempted login to deactivated account", ipAddress);
            throw new BadCredentialsException("Account has been deactivated. Please contact the System Administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            recordAudit("LOGIN_FAILED", request.getUsername(), "User", user.getId().toString(), "Failed password attempt", ipAddress);
            throw new BadCredentialsException("Invalid username or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), user.getPayrollNo(), user.getRoles(), user.isMustChangePassword());

        recordAudit("LOGIN_SUCCESS", user.getUsername(), "User", user.getId().toString(),
                "Successful login (mustChangePassword=" + user.isMustChangePassword() + ")", ipAddress);

        return JwtResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .payrollNo(user.getPayrollNo())
                .roles(user.getRoles())
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }

    @Transactional
    public UserRegistrationResultDto register(RegisterRequest request, String operatorUsername) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        if (request.getPayrollNo() != null && !request.getPayrollNo().isBlank() && userRepository.existsByPayrollNo(request.getPayrollNo())) {
            throw new IllegalArgumentException("Payroll number already assigned: " + request.getPayrollNo());
        }

        String rawPassword;
        boolean mustChange;

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            rawPassword = request.getPassword();
            mustChange = true; // Admin-provisioned passwords always require first-login change
        } else {
            rawPassword = generateSecureTemporaryPassword();
            mustChange = true;
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .payrollNo(request.getPayrollNo())
                .roles(request.getRoles())
                .mustChangePassword(mustChange)
                .enabled(request.isEnabled())
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);

        recordAudit("USER_CREATED", operatorUsername != null ? operatorUsername : "SYSTEM",
                "User", saved.getId().toString(),
                "Created user " + saved.getUsername() + " with roles: " + saved.getRoles() + ", mustChangePassword=" + mustChange, null);

        return UserRegistrationResultDto.builder()
                .user(mapToDto(saved))
                .temporaryPassword(rawPassword)
                .message("User registered successfully. Temporary credential issued.")
                .build();
    }

    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateRequest request, String operatorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Audit role changes specifically
        if (!user.getRoles().equals(request.getRoles())) {
            recordAudit("ROLE_CHANGED", operatorUsername, "User", user.getId().toString(),
                    "Roles changed from " + user.getRoles() + " to " + request.getRoles(), null);
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPayrollNo(request.getPayrollNo());
        user.setRoles(request.getRoles());
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        User updated = userRepository.save(user);

        recordAudit("USER_UPDATED", operatorUsername, "User", user.getId().toString(),
                "Updated details for user " + user.getUsername(), null);

        return mapToDto(updated);
    }

    @Transactional
    public UserResponseDto toggleUserStatus(Long id, boolean enabled, String operatorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setEnabled(enabled);
        User updated = userRepository.save(user);

        recordAudit("STATUS_CHANGED", operatorUsername, "User", user.getId().toString(),
                "User account status set to enabled=" + enabled, null);

        return mapToDto(updated);
    }

    @Transactional
    public String resetPassword(Long id, String operatorUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        String temporaryPassword = generateSecureTemporaryPassword();
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        recordAudit("PASSWORD_RESET", operatorUsername, "User", user.getId().toString(),
                "Issued temporary credential and flagged mustChangePassword=true for " + user.getUsername(), null);

        return temporaryPassword;
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current/temporary password does not match.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must differ from your current temporary password.");
        }

        if (!PASSWORD_PATTERN.matcher(request.getNewPassword()).matches()) {
            throw new IllegalArgumentException("New password must be at least 8 characters long and contain uppercase, lowercase, numbers, and a special symbol.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        recordAudit("PASSWORD_CHANGED", username, "User", user.getId().toString(),
                "User successfully established new permanent password and cleared temporary flag.", null);
    }

    public UserResponseDto getCurrentUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return mapToDto(user);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return mapToDto(user);
    }

    public List<RoleMetadataDto> getRolesMetadata() {
        Map<Role, Long> roleCounts = new HashMap<>();
        for (User u : userRepository.findAll()) {
            for (Role r : u.getRoles()) {
                roleCounts.put(r, roleCounts.getOrDefault(r, 0L) + 1);
            }
        }

        return List.of(
                RoleMetadataDto.builder()
                        .role(Role.ROLE_ADMIN)
                        .name("System Administrator")
                        .code("ROLE_ADMIN")
                        .description("Root security custodian: user registration, role configuration, system parameters, credential resets.")
                        .tier("Tier 1 - Executive Administration")
                        .userCount(roleCounts.getOrDefault(Role.ROLE_ADMIN, 0L).intValue())
                        .permissions(List.of("Manage Users", "Assign Roles", "Reset Passwords", "Inspect Audit Trail", "Configure System Parameters"))
                        .build(),
                RoleMetadataDto.builder()
                        .role(Role.ROLE_TREASURER)
                        .name("Treasurer / Finance Officer")
                        .code("ROLE_TREASURER")
                        .description("Financial controller: employer checkoff uploads, M-Pesa reconciliation, loan disbursement approvals, statements.")
                        .tier("Tier 2 - Financial Governance")
                        .userCount(roleCounts.getOrDefault(Role.ROLE_TREASURER, 0L).intValue())
                        .permissions(List.of("Upload Checkoff Spreadsheets", "Reconcile Bank/M-Pesa Receipts", "Approve Loans & Top-Ups", "Financial Reports Workbench"))
                        .build(),
                RoleMetadataDto.builder()
                        .role(Role.ROLE_WELFARE_OFFICER)
                        .name("Welfare / Management Officer")
                        .code("ROLE_WELFARE_OFFICER")
                        .description("Welfare operations: benevolence bereavement/illness disbursements, special occasions gifts, member biodata updates.")
                        .tier("Tier 2 - Welfare Operations")
                        .userCount(roleCounts.getOrDefault(Role.ROLE_WELFARE_OFFICER, 0L).intValue())
                        .permissions(List.of("Process Benevolence Assistance", "Issue Special Occasions Gifts", "Update Member Records & Next-of-Kin", "Benevolence Register Reports"))
                        .build(),
                RoleMetadataDto.builder()
                        .role(Role.ROLE_AUDITOR)
                        .name("Internal Auditor")
                        .code("ROLE_AUDITOR")
                        .description("Compliance oversight: immutable inspection of all security audit logs, checkoff reconciliation verification, loan portfolio inspection.")
                        .tier("Tier 3 - Statutory Compliance")
                        .userCount(roleCounts.getOrDefault(Role.ROLE_AUDITOR, 0L).intValue())
                        .permissions(List.of("Inspect Audit Logs", "Verify Checkoff Variances", "Audit Arrears & Defaulters", "Statutory Reports Access (Read-Only)"))
                        .build(),
                RoleMetadataDto.builder()
                        .role(Role.ROLE_MEMBER)
                        .name("Ordinary Member")
                        .code("ROLE_MEMBER")
                        .description("Welfare contributor: self-service access to personal share deposits, benevolence entitlement, active loans, repayment schedules, statements.")
                        .tier("Tier 4 - Member Self-Service")
                        .userCount(roleCounts.getOrDefault(Role.ROLE_MEMBER, 0L).intValue())
                        .permissions(List.of("View Own Biodata & Retirement Horizon", "View Own Shares & Benevolence Balance", "Download Member Statement", "Inspect Personal Loan Schedules", "Calculate Loan Eligibility"))
                        .build()
        );
    }

    public static String generateSecureTemporaryPassword() {
        StringBuilder sb = new StringBuilder();
        sb.append("Nasw@");
        for (int i = 0; i < 3; i++) {
            sb.append(CHAR_UPPER.charAt(RANDOM.nextInt(CHAR_UPPER.length())));
        }
        for (int i = 0; i < 3; i++) {
            sb.append(NUMBER.charAt(RANDOM.nextInt(NUMBER.length())));
        }
        sb.append(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));
        return sb.toString();
    }

    @Transactional
    public void recordAudit(AuditLogEvent event) {
        AuditLog log = AuditLog.builder()
                .action(event.getAction())
                .performedBy(event.getPerformedBy())
                .entityName(event.getEntityName())
                .entityId(event.getEntityId())
                .details(event.getDetails())
                .ipAddress(event.getIpAddress())
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public void recordAudit(String action, String performedBy, String entityName, String entityId, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    private UserResponseDto mapToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .payrollNo(user.getPayrollNo())
                .roles(user.getRoles())
                .mustChangePassword(user.isMustChangePassword())
                .enabled(user.isEnabled())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

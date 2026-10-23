package org.nasweo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.Role;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String email;

    private String phoneNumber;

    private String payrollNo;

    @NotEmpty(message = "At least one role is required")
    private Set<Role> roles;

    private Boolean enabled;
}

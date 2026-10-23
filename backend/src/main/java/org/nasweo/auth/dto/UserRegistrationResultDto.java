package org.nasweo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationResultDto {
    private UserResponseDto user;
    private String temporaryPassword;
    private String message;
}

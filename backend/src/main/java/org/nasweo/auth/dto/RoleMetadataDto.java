package org.nasweo.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.Role;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleMetadataDto {
    private Role role;
    private String name;
    private String code;
    private String description;
    private String tier;
    private int userCount;
    private List<String> permissions;
}

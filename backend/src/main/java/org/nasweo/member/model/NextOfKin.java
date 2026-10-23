package org.nasweo.member.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextOfKin {
    private String fullName;
    private String relationship;
    private String phoneNumber;
    private String nationalId;
    private Double allocationPercentage;
}

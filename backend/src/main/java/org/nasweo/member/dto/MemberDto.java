package org.nasweo.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;
import org.nasweo.member.model.NextOfKin;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDto {
    private Long id;

    @NotBlank(message = "Payroll number is required")
    private String payrollNo;

    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String otherNames;
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Date of birth is required")
    private LocalDate dob;

    @NotNull(message = "Employment category is required (SCIENTIST or NON_SCIENTIST)")
    private EmploymentCategory employmentCategory;

    private LocalDate employmentDate;
    private LocalDate retirementDate;
    private Integer currentAge;
    private Integer yearsToRetirement;

    private String department;
    private String designation;
    private String station;
    private MemberStatus status;
    private List<NextOfKin> nextOfKins;
}

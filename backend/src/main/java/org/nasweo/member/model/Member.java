package org.nasweo.member.model;

import jakarta.persistence.*;
import lombok.*;
import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_no", unique = true, nullable = false)
    private String payrollNo;

    @Column(name = "national_id", unique = true, nullable = false)
    private String nationalId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String otherNames;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentCategory employmentCategory;

    private LocalDate employmentDate;

    /**
     * Calculated automatically:
     * Scientist: DOB + 65 years
     * Non-Scientist: DOB + 60 years
     */
    @Column(nullable = false)
    private LocalDate retirementDate;

    private String department;

    private String designation;

    @Builder.Default
    private String station = "NARL Kabete";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "member_next_of_kin", joinColumns = @JoinColumn(name = "member_id"))
    @Builder.Default
    private List<NextOfKin> nextOfKins = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void computeRetirementDate() {
        if (dob != null && employmentCategory != null) {
            this.retirementDate = this.dob.plusYears(employmentCategory.getRetirementAge());
        }
        this.updatedAt = LocalDateTime.now();
    }

    public int getCurrentAge() {
        return dob != null ? Period.between(dob, LocalDate.now()).getYears() : 0;
    }

    public int getYearsToRetirement() {
        if (retirementDate == null) return 0;
        return Period.between(LocalDate.now(), retirementDate).getYears();
    }

    public String getFullName() {
        return firstName + " " + (otherNames != null ? otherNames + " " : "") + lastName;
    }
}

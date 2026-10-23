package org.nasweo.member.repository;

import org.nasweo.common.enums.EmploymentCategory;
import org.nasweo.common.enums.MemberStatus;
import org.nasweo.member.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByPayrollNo(String payrollNo);

    Optional<Member> findByNationalId(String nationalId);

    Optional<Member> findByEmail(String email);

    boolean existsByPayrollNo(String payrollNo);

    boolean existsByNationalId(String nationalId);

    List<Member> findByStatus(MemberStatus status);

    List<Member> findByEmploymentCategory(EmploymentCategory category);

    // Search by keyword in payroll, nationalId, name, department
    @Query("SELECT m FROM Member m WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(m.payrollNo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.nationalId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.department) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:category IS NULL OR m.employmentCategory = :category)")
    Page<Member> searchMembers(
            @Param("query") String query,
            @Param("status") MemberStatus status,
            @Param("category") EmploymentCategory category,
            Pageable pageable);

    // Find members retiring before or on a specific target date
    List<Member> findByStatusAndRetirementDateBetween(MemberStatus status, LocalDate startDate, LocalDate endDate);

    long countByStatus(MemberStatus status);

    long countByEmploymentCategory(EmploymentCategory category);
}

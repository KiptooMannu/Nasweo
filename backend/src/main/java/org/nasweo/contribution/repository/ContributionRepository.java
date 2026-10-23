package org.nasweo.contribution.repository;

import org.nasweo.contribution.model.Contribution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    Optional<Contribution> findByPayrollNoAndPeriodMonthAndPeriodYear(String payrollNo, Integer month, Integer year);

    boolean existsByPayrollNoAndPeriodMonthAndPeriodYear(String payrollNo, Integer month, Integer year);

    List<Contribution> findByPayrollNoOrderByPaymentDateDesc(String payrollNo);

    List<Contribution> findByPayrollNoAndPaymentDateBetweenOrderByPaymentDateAsc(
            String payrollNo, LocalDate startDate, LocalDate endDate);

    Page<Contribution> findByPeriodYearAndPeriodMonth(Integer year, Integer month, Pageable pageable);

    @Query("SELECT c FROM Contribution c WHERE " +
           "(:payrollNo IS NULL OR c.payrollNo = :payrollNo) AND " +
           "(:year IS NULL OR c.periodYear = :year) AND " +
           "(:month IS NULL OR c.periodMonth = :month) AND " +
           "(:reconciled IS NULL OR c.reconciled = :reconciled)")
    Page<Contribution> searchContributions(
            @Param("payrollNo") String payrollNo,
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("reconciled") Boolean reconciled,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(c.shareAmount), 0) FROM Contribution c WHERE c.periodYear = :year AND c.periodMonth = :month")
    BigDecimal sumSharesByMonth(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT COALESCE(SUM(c.benevolenceAmount), 0) FROM Contribution c WHERE c.periodYear = :year AND c.periodMonth = :month")
    BigDecimal sumBenevolenceByMonth(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contribution c WHERE c.periodYear = :year")
    BigDecimal sumTotalByYear(@Param("year") Integer year);

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Contribution c")
    BigDecimal sumTotalAllTime();
}

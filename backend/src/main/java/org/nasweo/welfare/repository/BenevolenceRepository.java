package org.nasweo.welfare.repository;

import org.nasweo.common.enums.BenevolenceType;
import org.nasweo.welfare.model.BenevolenceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BenevolenceRepository extends JpaRepository<BenevolenceRecord, Long> {

    List<BenevolenceRecord> findByPayrollNoOrderByEventDateDesc(String payrollNo);

    @Query("SELECT b FROM BenevolenceRecord b WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(b.payrollNo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.memberName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.beneficiaryName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.voucherReference) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:type IS NULL OR b.benevolenceType = :type) AND " +
           "(:status IS NULL OR b.status = :status)")
    Page<BenevolenceRecord> searchRecords(
            @Param("query") String query,
            @Param("type") BenevolenceType type,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.amountProvided), 0) FROM BenevolenceRecord b WHERE b.status = 'DISBURSED'")
    BigDecimal sumTotalDisbursedAllTime();

    @Query("SELECT COALESCE(SUM(b.amountProvided), 0) FROM BenevolenceRecord b " +
           "WHERE b.status = 'DISBURSED' AND b.disbursedDate BETWEEN :startDate AND :endDate")
    BigDecimal sumDisbursedInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b.benevolenceType, COALESCE(SUM(b.amountProvided), 0), COUNT(b) " +
           "FROM BenevolenceRecord b WHERE b.status = 'DISBURSED' GROUP BY b.benevolenceType")
    List<Object[]> sumExpendituresByType();
}

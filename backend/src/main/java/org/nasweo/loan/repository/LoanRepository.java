package org.nasweo.loan.repository;

import org.nasweo.common.enums.LoanStatus;
import org.nasweo.loan.model.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByLoanNumber(String loanNumber);

    List<Loan> findByPayrollNoOrderByDisbursedDateDesc(String payrollNo);

    List<Loan> findByPayrollNoAndStatus(String payrollNo, LoanStatus status);

    @Query("SELECT l FROM Loan l WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(l.loanNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.payrollNo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.memberName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:productCode IS NULL OR l.productCode = :productCode)")
    Page<Loan> searchLoans(
            @Param("query") String query,
            @Param("status") LoanStatus status,
            @Param("productCode") String productCode,
            Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.arrearsAmount > 0")
    List<Loan> findOverdueLoans();

    @Query("SELECT COALESCE(SUM(l.principalAmount), 0) FROM Loan l WHERE l.status IN ('ACTIVE', 'DEFAULTED')")
    BigDecimal sumDisbursedActivePortfolio();

    @Query("SELECT COALESCE(SUM(l.outstandingBalance), 0) FROM Loan l WHERE l.status IN ('ACTIVE', 'DEFAULTED')")
    BigDecimal sumOutstandingBalance();

    @Query("SELECT COALESCE(SUM(l.totalInterest), 0) FROM Loan l")
    BigDecimal sumTotalInterestProjected();

    @Query("SELECT COALESCE(SUM(l.arrearsAmount), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal sumTotalArrears();

    long countByStatus(LoanStatus status);
}

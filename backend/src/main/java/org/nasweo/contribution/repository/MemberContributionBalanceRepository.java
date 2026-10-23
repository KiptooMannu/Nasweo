package org.nasweo.contribution.repository;

import org.nasweo.contribution.model.MemberContributionBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface MemberContributionBalanceRepository extends JpaRepository<MemberContributionBalance, String> {
    Optional<MemberContributionBalance> findByPayrollNo(String payrollNo);

    @Query("SELECT COALESCE(SUM(b.totalShares), 0) FROM MemberContributionBalance b")
    BigDecimal sumTotalSharesAllMembers();

    @Query("SELECT COALESCE(SUM(b.totalBenevolence), 0) FROM MemberContributionBalance b")
    BigDecimal sumTotalBenevolenceAllMembers();
}

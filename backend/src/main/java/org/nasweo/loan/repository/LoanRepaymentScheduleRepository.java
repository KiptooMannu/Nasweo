package org.nasweo.loan.repository;

import org.nasweo.loan.model.LoanRepaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepaymentScheduleRepository extends JpaRepository<LoanRepaymentSchedule, Long> {

    List<LoanRepaymentSchedule> findByLoanNumberOrderByInstallmentNoAsc(String loanNumber);

    List<LoanRepaymentSchedule> findByLoanNumberAndStatus(String loanNumber, String status);

    List<LoanRepaymentSchedule> findByDueDateBeforeAndStatusNot(LocalDate date, String status);
}

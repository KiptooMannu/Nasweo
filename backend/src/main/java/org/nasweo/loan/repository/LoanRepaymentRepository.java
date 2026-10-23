package org.nasweo.loan.repository;

import org.nasweo.loan.model.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findByLoanNumberOrderByPaymentDateDesc(String loanNumber);
    List<LoanRepayment> findByPayrollNoOrderByPaymentDateDesc(String payrollNo);
}

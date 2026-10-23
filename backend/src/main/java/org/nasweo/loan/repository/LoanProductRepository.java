package org.nasweo.loan.repository;

import org.nasweo.loan.model.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, String> {
    List<LoanProduct> findByActiveTrue();
}

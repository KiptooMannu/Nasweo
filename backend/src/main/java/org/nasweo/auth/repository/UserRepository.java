package org.nasweo.auth.repository;

import org.nasweo.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPayrollNo(String payrollNo);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPayrollNo(String payrollNo);
}

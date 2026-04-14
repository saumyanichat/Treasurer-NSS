package com.nss.treasurer.repository;

import com.nss.treasurer.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    Optional<Budget> findByUserId(String userId);
}

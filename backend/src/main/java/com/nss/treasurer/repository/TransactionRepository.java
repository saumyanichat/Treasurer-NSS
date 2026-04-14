package com.nss.treasurer.repository;

import com.nss.treasurer.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findByAccountId(String accountId);
    
    @Query("SELECT t FROM Transaction t WHERE t.isRecurring = true AND t.nextRecurringDate <= :now AND t.status = 'COMPLETED'")
    List<Transaction> findDueRecurringTransactions(LocalDateTime now);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = 'EXPENSE' AND t.date >= :startDate")
    BigDecimal findTotalExpensesSince(String accountId, LocalDateTime startDate);
}

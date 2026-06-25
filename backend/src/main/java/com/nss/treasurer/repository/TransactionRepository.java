package com.nss.treasurer.repository;

import com.nss.treasurer.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findByAccountId(String accountId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:accountId IS NULL OR t.account.id = :accountId) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:search = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (t.date >= :startDate) " +
           "AND (t.date <= :endDate)")
    Page<Transaction> findFilteredTransactions(
            String userId,
            String accountId,
            String category,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:accountId IS NULL OR t.account.id = :accountId)")
    List<Transaction> findAllByUserAndAccount(String userId, String accountId);
}

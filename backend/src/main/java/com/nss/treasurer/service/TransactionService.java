package com.nss.treasurer.service;

import com.nss.treasurer.dto.TransactionDTO;
import com.nss.treasurer.model.*;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserService userService;
    private final AccountService accountService;

    @Transactional
    public Transaction createTransaction(String clerkUserId, TransactionDTO dto) {
        User user = userService.getByClerkUserId(clerkUserId);
        Account account = accountService.getAccountById(dto.getAccountId());

        // Update balance
        BigDecimal amount = dto.getAmount();
        if (dto.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(amount));
        } else {
            account.setBalance(account.getBalance().add(amount));
        }
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .type(dto.getType())
                .amount(amount)
                .description(dto.getDescription())
                .date(dto.getDate() != null ? dto.getDate() : LocalDateTime.now())
                .category(dto.getCategory())
                .isRecurring(dto.isRecurring())
                .recurringInterval(dto.getRecurringInterval())
                .nextRecurringDate(dto.isRecurring() ? calculateNextDate(dto.getDate(), dto.getRecurringInterval()) : null)
                .user(user)
                .account(account)
                .status(TransactionStatus.COMPLETED)
                .build();

        return transactionRepository.save(transaction);
    }

    private LocalDateTime calculateNextDate(LocalDateTime start, RecurringInterval interval) {
        if (start == null) start = LocalDateTime.now();
        switch (interval) {
            case DAILY: return start.plusDays(1);
            case WEEKLY: return start.plusWeeks(1);
            case MONTHLY: return start.plusMonths(1);
            case YEARLY: return start.plusYears(1);
            default: return null;
        }
    }
    
    @Transactional
    public void deleteTransaction(String id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        Account account = transaction.getAccount();
        if (transaction.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        }
        accountRepository.save(account);
        
        transactionRepository.delete(transaction);
    }
}

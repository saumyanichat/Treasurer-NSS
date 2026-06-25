package com.nss.treasurer.service;

import com.nss.treasurer.dto.TransactionDTO;
import com.nss.treasurer.model.*;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.TransactionRepository;
import com.nss.treasurer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public Transaction createTransaction(String email, TransactionDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        BigDecimal amount = dto.getAmount();
        
        // Update balance
        if (dto.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(amount));
        } else {
            account.setBalance(account.getBalance().add(amount));
        }
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .amount(amount)
                .type(dto.getType())
                .category(dto.getCategory())
                .date(dto.getDate() != null ? dto.getDate() : LocalDateTime.now())
                .user(user)
                .account(account)
                .build();

        Transaction savedTx = transactionRepository.save(transaction);

        // Budget Warnings check
        if (dto.getType() == TransactionType.EXPENSE) {
            checkBudgetWarnings(account, user.getEmail());
        }

        return savedTx;
    }

    @Transactional
    public Transaction updateTransaction(String id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        Account oldAccount = transaction.getAccount();
        BigDecimal oldAmount = transaction.getAmount();
        TransactionType oldType = transaction.getType();

        // Reverse old balance impact
        if (oldType == TransactionType.EXPENSE) {
            oldAccount.setBalance(oldAccount.getBalance().add(oldAmount));
        } else {
            oldAccount.setBalance(oldAccount.getBalance().subtract(oldAmount));
        }
        accountRepository.save(oldAccount);

        // Apply new balance impact
        Account newAccount = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("New Account not found"));
        BigDecimal newAmount = dto.getAmount();
        TransactionType newType = dto.getType();

        if (newType == TransactionType.EXPENSE) {
            newAccount.setBalance(newAccount.getBalance().subtract(newAmount));
        } else {
            newAccount.setBalance(newAccount.getBalance().add(newAmount));
        }
        accountRepository.save(newAccount);

        transaction.setTitle(dto.getTitle());
        transaction.setDescription(dto.getDescription());
        transaction.setAmount(newAmount);
        transaction.setType(newType);
        transaction.setCategory(dto.getCategory());
        transaction.setDate(dto.getDate() != null ? dto.getDate() : LocalDateTime.now());
        transaction.setAccount(newAccount);

        Transaction updatedTx = transactionRepository.save(transaction);

        if (newType == TransactionType.EXPENSE) {
            checkBudgetWarnings(newAccount, transaction.getUser().getEmail());
        }

        return updatedTx;
    }

    @Transactional
    public void deleteTransaction(String id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        Account account = transaction.getAccount();
        BigDecimal amount = transaction.getAmount();
        TransactionType type = transaction.getType();

        // Reverse balance impact
        if (type == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(amount));
        } else {
            account.setBalance(account.getBalance().subtract(amount));
        }
        accountRepository.save(account);

        transactionRepository.delete(transaction);
    }

    @Transactional
    public void updateReceiptUrl(String id, String receiptUrl) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transaction.setReceiptUrl(receiptUrl);
        transactionRepository.save(transaction);
    }

    public Page<Transaction> getFilteredTransactions(
            String email,
            String accountId,
            String category,
            String search,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Handle empty fields
        String searchVal = (search == null || search.trim().isEmpty()) ? "" : search;
        String catVal = (category == null || category.trim().isEmpty() || category.equalsIgnoreCase("ALL")) ? null : category;
        String accIdVal = (accountId == null || accountId.trim().isEmpty() || accountId.equalsIgnoreCase("ALL")) ? null : accountId;

        LocalDateTime start = (startDate == null) ? LocalDateTime.of(1970, 1, 1, 0, 0) : startDate;
        LocalDateTime end = (endDate == null) ? LocalDateTime.of(9999, 12, 31, 23, 59) : endDate;

        return transactionRepository.findFilteredTransactions(
                user.getId(),
                accIdVal,
                catVal,
                searchVal,
                start,
                end,
                pageable
        );
    }

    public List<Transaction> getAllTransactionsByUserAndAccount(String email, String accountId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String accIdVal = (accountId == null || accountId.trim().isEmpty() || accountId.equalsIgnoreCase("ALL")) ? null : accountId;
        return transactionRepository.findAllByUserAndAccount(user.getId(), accIdVal);
    }

    private void checkBudgetWarnings(Account account, String email) {
        if (account.getAllocatedAmount().compareTo(BigDecimal.ZERO) == 0) return;

        List<Transaction> transactions = transactionRepository.findByAccountId(account.getId());
        BigDecimal totalSpent = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal allocated = account.getAllocatedAmount();
        BigDecimal ratio = totalSpent.divide(allocated, 4, RoundingMode.HALF_UP);
        BigDecimal percentage = ratio.multiply(new BigDecimal(100));

        String warningSubject = "NSS Treasurer - Budget Alert: " + account.getName();
        String warningBody = "";

        if (totalSpent.compareTo(allocated) > 0) {
            warningBody = String.format(
                    "<h2>CRITICAL: Budget Exceeded</h2>" +
                    "<p>Your expenses for the event account <b>%s</b> have exceeded the allocated budget.</p>" +
                    "<p>Allocated: ₹%s<br/>Spent: ₹%s (%s%% Used)</p>",
                    account.getName(), allocated, totalSpent, percentage.setScale(2, RoundingMode.HALF_UP)
            );
        } else if (ratio.compareTo(new BigDecimal("0.90")) >= 0) {
            warningBody = String.format(
                    "<h2>WARNING: 90%% Budget Used</h2>" +
                    "<p>Your expenses for the event account <b>%s</b> have reached or exceeded 90%% of the allocated budget.</p>" +
                    "<p>Allocated: ₹%s<br/>Spent: ₹%s (%s%% Used)</p>",
                    account.getName(), allocated, totalSpent, percentage.setScale(2, RoundingMode.HALF_UP)
            );
        } else if (ratio.compareTo(new BigDecimal("0.80")) >= 0) {
            warningBody = String.format(
                    "<h2>WARNING: 80%% Budget Used</h2>" +
                    "<p>Your expenses for the event account <b>%s</b> have reached or exceeded 80%% of the allocated budget.</p>" +
                    "<p>Allocated: ₹%s<br/>Spent: ₹%s (%s%% Used)</p>",
                    account.getName(), allocated, totalSpent, percentage.setScale(2, RoundingMode.HALF_UP)
            );
        }

        if (!warningBody.isEmpty()) {
            emailService.sendHtmlEmail(email, warningSubject, warningBody);
        }
    }
}

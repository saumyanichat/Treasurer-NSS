package com.nss.treasurer.service;

import com.nss.treasurer.model.Transaction;
import com.nss.treasurer.model.TransactionStatus;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nss.treasurer.model.Budget;
import com.nss.treasurer.repository.BudgetRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BudgetRepository budgetRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    @Transactional
    public void processRecurringTransactions() {
        log.info("Processing recurring transactions...");
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> dueTransactions = transactionRepository.findDueRecurringTransactions(now);

        for (Transaction parent : dueTransactions) {
            try {
                // Create child transaction (the actual instance)
                Transaction instance = Transaction.builder()
                        .type(parent.getType())
                        .amount(parent.getAmount())
                        .description(parent.getDescription())
                        .date(parent.getNextRecurringDate())
                        .category(parent.getCategory())
                        .isRecurring(false)
                        .user(parent.getUser())
                        .account(parent.getAccount())
                        .status(TransactionStatus.COMPLETED)
                        .build();

                // Update account balance
                var account = parent.getAccount();
                if (parent.getType() == com.nss.treasurer.model.TransactionType.EXPENSE) {
                    account.setBalance(account.getBalance().subtract(parent.getAmount()));
                } else {
                    account.setBalance(account.getBalance().add(parent.getAmount()));
                }
                accountRepository.save(account);
                transactionRepository.save(instance);

                // Update parent
                parent.setLastProcessed(now);
                parent.setNextRecurringDate(calculateNextDate(parent.getNextRecurringDate(), parent.getRecurringInterval()));
                transactionRepository.save(parent);
                
            } catch (Exception e) {
                log.error("Failed to process recurring transaction {}: {}", parent.getId(), e.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 0,6,12,18 * * *") // Every 6 hours
    @Transactional
    public void checkBudgetAlerts() {
        log.info("Checking budget alerts...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<Budget> budgets = budgetRepository.findAll();

        for (Budget budget : budgets) {
            try {
                // Determine if we already sent an alert this month
                if (budget.getLastAlertSent() != null && budget.getLastAlertSent().isAfter(startOfMonth)) {
                    continue; // Already alerted this month
                }

                String userId = budget.getUser().getId();
                accountRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(defaultAccount -> {
                    java.math.BigDecimal totalExpenses = transactionRepository.findTotalExpensesSince(defaultAccount.getId(), startOfMonth);

                    if (totalExpenses.compareTo(budget.getAmount()) >= 0) {
                        // Send the email
                        String emailHtml = String.format(
                            "<h2>Budget Alert!</h2>" +
                            "<p>Hello %s,</p>" +
                            "<p>Your expenses for this month (<b>$%s</b>) have reached or exceeded your set budget limit of <b>$%s</b>.</p>" +
                            "<p>Please review your transactions in your NSS Treasurer dashboard.</p>",
                            budget.getUser().getName() != null ? budget.getUser().getName() : "Treasurer",
                            totalExpenses.toString(),
                            budget.getAmount().toString()
                        );

                        emailService.sendEmail(budget.getUser().getEmail(), "NSS Treasurer - Budget Alert Exceeded", emailHtml);

                        // Update last alert
                        budget.setLastAlertSent(now);
                        budgetRepository.save(budget);
                        log.info("Budget alert email sent to {}", budget.getUser().getEmail());
                    }
                });
            } catch (Exception e) {
                log.error("Failed to process budget alert for user {}: {}", budget.getUser().getId(), e.getMessage());
            }
        }
    }

    private LocalDateTime calculateNextDate(LocalDateTime start, com.nss.treasurer.model.RecurringInterval interval) {
        switch (interval) {
            case DAILY: return start.plusDays(1);
            case WEEKLY: return start.plusWeeks(1);
            case MONTHLY: return start.plusMonths(1);
            case YEARLY: return start.plusYears(1);
            default: return start;
        }
    }
}

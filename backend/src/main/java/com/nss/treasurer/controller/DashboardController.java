package com.nss.treasurer.controller;

import com.nss.treasurer.model.*;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.TransactionRepository;
import com.nss.treasurer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Account> accounts = accountRepository.findByUserId(user.getId());
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Category Breakdown
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (Transaction tx : transactions) {
            if (tx.getType() == TransactionType.EXPENSE) {
                categoryBreakdown.put(tx.getCategory(), 
                        categoryBreakdown.getOrDefault(tx.getCategory(), BigDecimal.ZERO).add(tx.getAmount()));
            }
        }

        // Monthly Trend
        Map<String, BigDecimal> monthlyExpense = new LinkedHashMap<>();
        for (Transaction tx : transactions) {
            if (tx.getType() == TransactionType.EXPENSE) {
                String monthName = tx.getDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                monthlyExpense.put(monthName, monthlyExpense.getOrDefault(monthName, BigDecimal.ZERO).add(tx.getAmount()));
            }
        }

        List<Map<String, Object>> trendList = new ArrayList<>();
        monthlyExpense.forEach((k, v) -> {
            Map<String, Object> point = new HashMap<>();
            point.put("month", k);
            point.put("amount", v);
            trendList.add(point);
        });

        // Income vs Expense
        List<Map<String, Object>> incVsExpList = new ArrayList<>();
        Map<String, Object> dataPoint = new HashMap<>();
        dataPoint.put("name", "Comparison");
        dataPoint.put("Income", totalIncome);
        dataPoint.put("Expense", totalExpense);
        incVsExpList.add(dataPoint);

        // Recent 5 Transactions
        // Sort transactions by date descending first
        transactions.sort((t1, t2) -> t2.getDate().compareTo(t1.getDate()));
        List<Transaction> recentTransactions = transactions.size() > 5 ? 
                transactions.subList(0, 5) : transactions;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("currentBalance", currentBalance);
        summary.put("activeAccounts", accounts.size());
        summary.put("transactionCount", transactions.size());
        summary.put("categoryBreakdown", categoryBreakdown);
        summary.put("monthlyTrend", trendList);
        summary.put("incomeVsExpense", incVsExpList);
        summary.put("recentTransactions", recentTransactions);

        return ResponseEntity.ok(summary);
    }
}

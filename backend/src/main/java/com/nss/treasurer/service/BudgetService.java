package com.nss.treasurer.service;

import com.nss.treasurer.model.Budget;
import com.nss.treasurer.model.User;
import com.nss.treasurer.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final UserService userService;

    public Optional<Budget> getBudgetByClerkUserId(String clerkUserId) {
        User user = userService.getByClerkUserId(clerkUserId);
        return budgetRepository.findByUserId(user.getId());
    }

    @Transactional
    public Budget upsertBudget(String clerkUserId, BigDecimal amount) {
        User user = userService.getByClerkUserId(clerkUserId);
        
        return budgetRepository.findByUserId(user.getId())
                .map(budget -> {
                    budget.setAmount(amount);
                    return budgetRepository.save(budget);
                })
                .orElseGet(() -> {
                    Budget newBudget = Budget.builder()
                            .amount(amount)
                            .user(user)
                            .build();
                    return budgetRepository.save(newBudget);
                });
    }
}

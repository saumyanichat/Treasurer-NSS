package com.nss.treasurer.controller;

import com.nss.treasurer.model.Budget;
import com.nss.treasurer.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<Budget> getBudget(@AuthenticationPrincipal Jwt jwt) {
        return budgetService.getBudgetByClerkUserId(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<Budget> updateBudget(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(budgetService.upsertBudget(jwt.getSubject(), body.get("amount")));
    }
}

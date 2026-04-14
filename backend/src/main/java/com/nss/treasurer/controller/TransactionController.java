package com.nss.treasurer.controller;

import com.nss.treasurer.dto.TransactionDTO;
import com.nss.treasurer.model.Transaction;
import com.nss.treasurer.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> create(@AuthenticationPrincipal Jwt jwt, @RequestBody TransactionDTO dto) {
        return ResponseEntity.ok(transactionService.createTransaction(jwt.getSubject(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}

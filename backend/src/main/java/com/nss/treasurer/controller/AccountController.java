package com.nss.treasurer.controller;

import com.nss.treasurer.dto.AccountDTO;
import com.nss.treasurer.model.Account;
import com.nss.treasurer.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<Account>> getAll(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(accountService.getAccountsByClerkUserId(jwt.getSubject()));
    }

    @PostMapping
    public ResponseEntity<Account> create(@AuthenticationPrincipal Jwt jwt, @RequestBody AccountDTO dto) {
        return ResponseEntity.ok(accountService.createAccount(jwt.getSubject(), dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getById(@PathVariable String id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }
}

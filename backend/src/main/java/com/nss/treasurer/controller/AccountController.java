package com.nss.treasurer.controller;

import com.nss.treasurer.dto.AccountDTO;
import com.nss.treasurer.model.Account;
import com.nss.treasurer.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<Account>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(accountService.getAccountsByEmail(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Account> create(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AccountDTO dto) {
        return ResponseEntity.ok(accountService.createAccount(userDetails.getUsername(), dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getById(@PathVariable String id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> update(@PathVariable String id, @RequestBody AccountDTO dto) {
        return ResponseEntity.ok(accountService.updateAccount(id, dto));
    }

    @PostMapping("/{id}/default")
    public ResponseEntity<Map<String, String>> setDefault(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id) {
        accountService.setDefaultAccount(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Default account updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}

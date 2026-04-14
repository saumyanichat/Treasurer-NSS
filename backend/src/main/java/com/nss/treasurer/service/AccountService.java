package com.nss.treasurer.service;

import com.nss.treasurer.dto.AccountDTO;
import com.nss.treasurer.model.Account;
import com.nss.treasurer.model.User;
import com.nss.treasurer.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final UserService userService;

    public List<Account> getAccountsByClerkUserId(String clerkUserId) {
        User user = userService.getByClerkUserId(clerkUserId);
        return accountRepository.findByUserId(user.getId());
    }

    @Transactional
    public Account createAccount(String clerkUserId, AccountDTO dto) {
        User user = userService.getByClerkUserId(clerkUserId);
        
        List<Account> existingAccounts = accountRepository.findByUserId(user.getId());
        boolean isFirstAccount = existingAccounts.isEmpty();
        boolean shouldBeDefault = isFirstAccount || dto.isDefault();

        if (shouldBeDefault) {
            unsetOtherDefaults(user.getId());
        }

        Account account = Account.builder()
                .name(dto.getName())
                .type(dto.getType())
                .balance(dto.getBalance())
                .isDefault(shouldBeDefault)
                .user(user)
                .build();

        return accountRepository.save(account);
    }

    @Transactional
    public void unsetOtherDefaults(String userId) {
        accountRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(account -> {
                    account.setDefault(false);
                    accountRepository.save(account);
                });
    }

    public Account getAccountById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }
}

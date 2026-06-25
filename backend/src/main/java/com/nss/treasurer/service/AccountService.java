package com.nss.treasurer.service;

import com.nss.treasurer.dto.AccountDTO;
import com.nss.treasurer.model.Account;
import com.nss.treasurer.model.User;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<Account> getAccountsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return accountRepository.findByUserId(user.getId());
    }

    @Transactional
    public Account createAccount(String email, AccountDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Account> existingAccounts = accountRepository.findByUserId(user.getId());
        boolean isFirstAccount = existingAccounts.isEmpty();
        boolean shouldBeDefault = isFirstAccount || dto.isDefault();

        if (shouldBeDefault) {
            unsetOtherDefaults(user.getId());
        }

        Account account = Account.builder()
                .name(dto.getName())
                .type(dto.getType())
                .allocatedAmount(dto.getAllocatedAmount())
                .balance(dto.getAllocatedAmount()) // Initial balance = Allocated Amount
                .isDefault(shouldBeDefault)
                .user(user)
                .build();

        return accountRepository.save(account);
    }

    @Transactional
    public Account updateAccount(String id, AccountDTO dto) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setName(dto.getName());
        account.setType(dto.getType());
        
        // Adjust balance if allocated amount changes
        java.math.BigDecimal difference = dto.getAllocatedAmount().subtract(account.getAllocatedAmount());
        account.setAllocatedAmount(dto.getAllocatedAmount());
        account.setBalance(account.getBalance().add(difference));

        if (dto.isDefault() && !account.isDefault()) {
            unsetOtherDefaults(account.getUser().getId());
            account.setDefault(true);
        }

        return accountRepository.save(account);
    }

    @Transactional
    public void setDefaultAccount(String email, String id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        boolean wasDefault = account.isDefault();
        unsetOtherDefaults(user.getId());
        
        account.setDefault(!wasDefault);
        accountRepository.save(account);
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

    @Transactional
    public void deleteAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        accountRepository.delete(account);
    }
}

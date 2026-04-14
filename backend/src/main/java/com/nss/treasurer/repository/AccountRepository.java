package com.nss.treasurer.repository;

import com.nss.treasurer.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByUserId(String userId);
    Optional<Account> findByUserIdAndIsDefaultTrue(String userId);
}

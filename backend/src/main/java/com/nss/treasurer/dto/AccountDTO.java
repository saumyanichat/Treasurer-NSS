package com.nss.treasurer.dto;

import com.nss.treasurer.model.AccountType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AccountDTO {
    private String name;
    private AccountType type;
    private BigDecimal balance;
    private boolean isDefault;
}

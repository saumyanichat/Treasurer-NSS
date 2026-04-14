package com.nss.treasurer.dto;

import com.nss.treasurer.model.RecurringInterval;
import com.nss.treasurer.model.TransactionType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private LocalDateTime date;
    private String category;
    private String accountId;
    private boolean isRecurring;
    private RecurringInterval recurringInterval;
}

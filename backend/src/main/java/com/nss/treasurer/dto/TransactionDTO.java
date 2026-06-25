package com.nss.treasurer.dto;

import com.nss.treasurer.model.TransactionType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private String title;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private LocalDateTime date;
    private String accountId;
}

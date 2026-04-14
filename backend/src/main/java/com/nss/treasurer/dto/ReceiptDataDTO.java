package com.nss.treasurer.dto;

import com.nss.treasurer.model.TransactionType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReceiptDataDTO {
    private BigDecimal amount;
    private LocalDateTime date;
    private String description;
    private String category;
    private TransactionType type;
}

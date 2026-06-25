package com.nss.treasurer.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReceiptDataDTO {
    private BigDecimal amount;
    private LocalDateTime date;
    private String vendorName;
    private String categorySuggestion;
}

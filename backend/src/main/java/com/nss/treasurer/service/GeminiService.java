package com.nss.treasurer.service;

import com.nss.treasurer.dto.ReceiptDataDTO;
import com.nss.treasurer.model.TransactionType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class GeminiService {

    public ReceiptDataDTO parseReceipt(String imageUrl) {
        // Return a mock payload. To truly unlock Gemini processing later, 
        // add the spring-ai-google-gemini dependency and ChatClient logic back.
        ReceiptDataDTO mockData = new ReceiptDataDTO();
        mockData.setAmount(new BigDecimal("150.00"));
        mockData.setDate(LocalDateTime.now());
        mockData.setDescription("Parsed AI Receipt Note (Mocked)");
        mockData.setCategory("Miscellaneous");
        mockData.setType(TransactionType.EXPENSE);
        return mockData;
    }
}

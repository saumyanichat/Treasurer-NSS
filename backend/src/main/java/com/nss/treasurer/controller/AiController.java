package com.nss.treasurer.controller;

import com.nss.treasurer.dto.ReceiptDataDTO;
import com.nss.treasurer.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/scan")
    public ResponseEntity<ReceiptDataDTO> scanReceipt(@RequestParam("file") MultipartFile file) {
        try {
            ReceiptDataDTO extracted = geminiService.parseReceipt(file.getBytes(), file.getContentType());
            return ResponseEntity.ok(extracted);
        } catch (Exception e) {
            throw new RuntimeException("Failed to scan receipt with AI", e);
        }
    }

    @GetMapping("/generate-description")
    public ResponseEntity<java.util.Map<String, String>> generateDescription(
            @RequestParam("category") String category,
            @RequestParam(value = "amount", required = false) java.math.BigDecimal amount,
            @RequestParam("type") String type,
            @RequestParam(value = "vendorName", required = false) String vendorName) {
        String description = geminiService.generateDescription(category, amount, type, vendorName);
        return ResponseEntity.ok(java.util.Map.of("description", description));
    }
}

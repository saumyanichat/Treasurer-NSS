package com.nss.treasurer.controller;

import com.nss.treasurer.dto.TransactionDTO;
import com.nss.treasurer.model.Transaction;
import com.nss.treasurer.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> create(@AuthenticationPrincipal UserDetails userDetails, @RequestBody TransactionDTO dto) {
        return ResponseEntity.ok(transactionService.createTransaction(userDetails.getUsername(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable String id, @RequestBody TransactionDTO dto) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Transaction>> getFiltered(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(transactionService.getFilteredTransactions(
                userDetails.getUsername(),
                accountId,
                category,
                search,
                startDate,
                endDate,
                pageable
        ));
    }

    @PostMapping("/{id}/receipt")
    public ResponseEntity<Map<String, String>> uploadReceipt(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = "uploads/receipts";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = ".png";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + extension;
            File destFile = new File(dir, fileName);
            file.transferTo(destFile.getAbsoluteFile());

            String receiptUrl = "/uploads/receipts/" + fileName;
            transactionService.updateReceiptUrl(id, receiptUrl);

            return ResponseEntity.ok(Map.of("receiptUrl", receiptUrl));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload receipt", e);
        }
    }
}

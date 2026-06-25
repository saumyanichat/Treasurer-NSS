package com.nss.treasurer.controller;

import com.nss.treasurer.model.Report;
import com.nss.treasurer.service.EmailService;
import com.nss.treasurer.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Report>> getReports(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportService.getReportsByUserEmail(userDetails.getUsername()));
    }

    @GetMapping("/pdf")
    public ResponseEntity<Resource> downloadPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String type,
            @RequestParam(required = false) String accountId
    ) {
        try {
            File pdfFile = reportService.generatePdfReport(userDetails.getUsername(), type, accountId);
            Resource resource = new FileSystemResource(pdfFile);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdfFile.getName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    @GetMapping("/excel")
    public ResponseEntity<Resource> downloadExcel(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String accountId
    ) {
        try {
            File excelFile = reportService.generateExcelReport(userDetails.getUsername(), accountId);
            Resource resource = new FileSystemResource(excelFile);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + excelFile.getName() + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    @PostMapping("/email-pdf")
    public ResponseEntity<Map<String, String>> emailPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String type,
            @RequestParam(required = false) String accountId
    ) {
        try {
            File pdfFile = reportService.generatePdfReport(userDetails.getUsername(), type, accountId);
            
            String subject = "NSS Treasurer - " + type + " Financial Report";
            String body = "<h3>Please find your requested PDF report attached.</h3>";
            emailService.sendEmailWithAttachment(userDetails.getUsername(), subject, body, pdfFile);

            return ResponseEntity.ok(Map.of("message", "PDF report sent to email successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to email PDF report", e);
        }
    }

    @PostMapping("/email-excel")
    public ResponseEntity<Map<String, String>> emailExcel(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String accountId
    ) {
        try {
            File excelFile = reportService.generateExcelReport(userDetails.getUsername(), accountId);
            
            String subject = "NSS Treasurer - Excel Data Export";
            String body = "<h3>Please find your requested Excel export attached.</h3>";
            emailService.sendEmailWithAttachment(userDetails.getUsername(), subject, body, excelFile);

            return ResponseEntity.ok(Map.of("message", "Excel report sent to email successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to email Excel report", e);
        }
    }
}

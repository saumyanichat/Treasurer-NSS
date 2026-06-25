package com.nss.treasurer.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.nss.treasurer.model.*;
import com.nss.treasurer.repository.AccountRepository;
import com.nss.treasurer.repository.ReportRepository;
import com.nss.treasurer.repository.TransactionRepository;
import com.nss.treasurer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Value("${nss.upload.dir}")
    private String uploadDir;

    @Transactional
    public File generatePdfReport(String email, String type, String accountId) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions;
        Account singleAccount = null;

        if (accountId != null && !accountId.equalsIgnoreCase("ALL")) {
            singleAccount = accountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            transactions = transactionRepository.findByAccountId(accountId);
        } else {
            transactions = transactionRepository.findByUserId(user.getId());
        }

        // Prepare File Path
        File reportsFolder = new File(uploadDir + "/reports");
        if (!reportsFolder.exists()) {
            reportsFolder.mkdirs();
        }

        String fileName = "NSS_Report_" + type + "_" + System.currentTimeMillis() + ".pdf";
        File file = new File(reportsFolder, fileName);

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(file));

        document.open();

        // Fonts
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLUE);
        Font subTitleFont = new Font(Font.FontFamily.HELVETICA, 11, Font.ITALIC, BaseColor.GRAY);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, BaseColor.BLACK);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);

        // Header
        Paragraph title = new Paragraph("NSS TREASURER FINANCIAL REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " | Report Type: " + type, subTitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(new Paragraph(" "));

        // Summary Section
        document.add(new Paragraph("Financial Summary", sectionFont));
        document.add(new Paragraph(" "));

        if (singleAccount != null) {
            document.add(new Paragraph("Account Name: " + singleAccount.getName(), normalFont));
            document.add(new Paragraph("Account Type: " + singleAccount.getType(), normalFont));
            document.add(new Paragraph("Allocated Budget: INR " + singleAccount.getAllocatedAmount(), normalFont));
            document.add(new Paragraph("Remaining Balance: INR " + singleAccount.getBalance(), normalFont));

            BigDecimal spent = singleAccount.getAllocatedAmount().subtract(singleAccount.getBalance());
            document.add(new Paragraph("Total Spent: INR " + spent, normalFont));
        } else {
            List<Account> accounts = accountRepository.findByUserId(user.getId());
            BigDecimal totalAllocated = accounts.stream().map(Account::getAllocatedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalBalance = accounts.stream().map(Account::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
            document.add(new Paragraph("Total Event Accounts: " + accounts.size(), normalFont));
            document.add(new Paragraph("Total Allocated Budget: INR " + totalAllocated, normalFont));
            document.add(new Paragraph("Current Cumulative Balance: INR " + totalBalance, normalFont));
        }
        document.add(new Paragraph(" "));

        // Transaction Summary
        long incomeCount = transactions.stream().filter(t -> t.getType() == TransactionType.INCOME).count();
        long expenseCount = transactions.stream().filter(t -> t.getType() == TransactionType.EXPENSE).count();
        BigDecimal totalIncome = transactions.stream().filter(t -> t.getType() == TransactionType.INCOME).map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = transactions.stream().filter(t -> t.getType() == TransactionType.EXPENSE).map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        document.add(new Paragraph("Income vs Expense Details", sectionFont));
        document.add(new Paragraph("Total Income Transactions: " + incomeCount + " (INR " + totalIncome + ")", normalFont));
        document.add(new Paragraph("Total Expense Transactions: " + expenseCount + " (INR " + totalExpense + ")", normalFont));
        document.add(new Paragraph(" "));

        // Transaction Table
        document.add(new Paragraph("Transaction Records Table", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 1f, 1.2f, 1.2f, 1.6f});

        String[] headers = {"Title", "Type", "Amount", "Category", "Date"};
        for (String colHeader : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(colHeader, headerFont));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (Transaction tx : transactions) {
            table.addCell(new Phrase(tx.getTitle(), normalFont));
            table.addCell(new Phrase(tx.getType().toString(), normalFont));
            table.addCell(new Phrase("INR " + tx.getAmount(), normalFont));
            table.addCell(new Phrase(tx.getCategory(), normalFont));
            table.addCell(new Phrase(tx.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), normalFont));
        }

        document.add(table);
        document.close();

        // Save Report entry
        Report report = Report.builder()
                .name(fileName)
                .type(type)
                .filePath("reports/" + fileName)
                .user(user)
                .build();
        reportRepository.save(report);

        return file;
    }

    @Transactional
    public File generateExcelReport(String email, String accountId) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions;
        if (accountId != null && !accountId.equalsIgnoreCase("ALL")) {
            transactions = transactionRepository.findByAccountId(accountId);
        } else {
            transactions = transactionRepository.findByUserId(user.getId());
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Transactions List");

        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Title", "Type", "Amount (INR)", "Category", "Date", "Description", "Account"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            CellStyle style = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            style.setFont(headerFont);
            cell.setCellStyle(style);
        }

        int rowIdx = 1;
        for (Transaction tx : transactions) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(tx.getId());
            row.createCell(1).setCellValue(tx.getTitle());
            row.createCell(2).setCellValue(tx.getType().toString());
            row.createCell(3).setCellValue(tx.getAmount().doubleValue());
            row.createCell(4).setCellValue(tx.getCategory());
            row.createCell(5).setCellValue(tx.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            row.createCell(6).setCellValue(tx.getDescription() != null ? tx.getDescription() : "");
            row.createCell(7).setCellValue(tx.getAccount().getName());
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        File reportsFolder = new File(uploadDir + "/reports");
        if (!reportsFolder.exists()) {
            reportsFolder.mkdirs();
        }

        String fileName = "NSS_Export_" + System.currentTimeMillis() + ".xlsx";
        File file = new File(reportsFolder, fileName);
        FileOutputStream fos = new FileOutputStream(file);
        workbook.write(fos);
        fos.close();
        workbook.close();

        Report report = Report.builder()
                .name(fileName)
                .type("EXCEL")
                .filePath("reports/" + fileName)
                .user(user)
                .build();
        reportRepository.save(report);

        return file;
    }

    public List<Report> getReportsByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reportRepository.findByUserId(user.getId());
    }
}

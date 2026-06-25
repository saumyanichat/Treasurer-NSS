package com.nss.treasurer.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Files;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@nss-treasurer.com}")
    private String fromEmail;

    @Value("${nss.resend.api-key:}")
    private String resendApiKey;

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (sendViaResend(to, subject, htmlContent, null)) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            String from = (fromEmail == null || fromEmail.trim().isEmpty()) ? "noreply@nss-treasurer.com" : fromEmail;
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Log output to System.out for local testing
            System.out.println("\n==================================================");
            System.out.println("NSS TREASURER EMAIL DELIVERED TO: " + to);
            System.out.println("SUBJECT: " + subject);
            System.out.println("CONTENT: " + htmlContent.replaceAll("\\<[^>]*>",""));
            System.out.println("==================================================\n");

            mailSender.send(message);
            log.info("HTML Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String htmlContent, File attachment) {
        if (sendViaResend(to, subject, htmlContent, attachment)) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String from = (fromEmail == null || fromEmail.trim().isEmpty()) ? "noreply@nss-treasurer.com" : fromEmail;
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            FileSystemResource fileSystemResource = new FileSystemResource(attachment);
            helper.addAttachment(attachment.getName(), fileSystemResource);

            // Log output to System.out for local testing so they can retrieve the file
            System.out.println("\n==================================================");
            System.out.println("NSS TREASURER EMAIL WITH ATTACHMENT DELIVERED TO: " + to);
            System.out.println("SUBJECT: " + subject);
            System.out.println("ATTACHMENT PATH: " + attachment.getAbsolutePath());
            System.out.println("==================================================\n");

            mailSender.send(message);
            log.info("Email with attachment sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email with attachment to {}: {}", to, e.getMessage());
        }
    }

    private boolean sendViaResend(String to, String subject, String htmlContent, File attachment) {
        if (resendApiKey == null || resendApiKey.trim().isEmpty() || resendApiKey.equals("re_...")) {
            return false;
        }

        try {
            String url = "https://api.resend.com/emails";
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey);

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", "NSS Treasurer <onboarding@resend.dev>");
            payload.put("to", List.of(to));
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            if (attachment != null && attachment.exists()) {
                byte[] fileBytes = Files.readAllBytes(attachment.toPath());
                String base64Content = Base64.getEncoder().encodeToString(fileBytes);

                Map<String, Object> attachmentMap = new HashMap<>();
                attachmentMap.put("filename", attachment.getName());
                attachmentMap.put("content", base64Content);

                payload.put("attachments", List.of(attachmentMap));
            }

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, requestEntity, String.class);
            log.info("Email sent successfully via Resend API to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via Resend API: {}", e.getMessage(), e);
            return false;
        }
    }
}

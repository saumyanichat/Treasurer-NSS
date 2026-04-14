package com.nss.treasurer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    public void sendEmail(String toEmail, String subject, String htmlBody) {
        RestTemplate restTemplate = new RestTemplate();
        String resendApiUrl = "https://api.resend.com/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("from", "NSS Treasurer <" + fromEmail + ">"); // Either onboarding@resend.dev or your domain
        requestBody.put("to", List.of(toEmail));
        requestBody.put("subject", subject);
        requestBody.put("html", htmlBody);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(resendApiUrl, request, String.class);
            log.info("Email sent successfully: {}", response.getBody());
        } catch (Exception e) {
            log.error("Failed to send email via Resend", e);
        }
    }
}

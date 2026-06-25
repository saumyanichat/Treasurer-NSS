package com.nss.treasurer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nss.treasurer.dto.ReceiptDataDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${nss.gemini.api-key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReceiptDataDTO parseReceipt(byte[] imageBytes, String mimeType) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + geminiApiKey;

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Payload
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", "Extract details from this receipt image. Return a JSON object with: 'amount' (decimal number representing total amount, or null if not found), 'date' (ISO-8601 string in format yyyy-MM-dd'T'HH:mm:ss or null if not found), 'vendorName' (string representing store/merchant name, or null if not found), 'categorySuggestion' (a suggested expense category from one of these: Food, Travel, Printing, Stationery, Decoration, Accommodation, Event Management, Miscellaneous). Return strictly raw JSON in this format: { \"amount\": 150.00, \"date\": \"2026-06-24T12:00:00\", \"vendorName\": \"Merchant Name\", \"categorySuggestion\": \"Food\" }. Do not wrap in markdown or markdown code blocks (no backticks). If a value cannot be identified, return null for it.");

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType != null ? mimeType : "image/png");
        inlineData.put("data", base64Image);

        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("inlineData", inlineData);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", Arrays.asList(textPart, imagePart));

        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", Collections.singletonList(parts));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contents, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            log.info("Gemini raw response: {}", responseText);

            // Strip code fences if Gemini ignores prompt
            if (responseText.contains("```json")) {
                responseText = responseText.substring(responseText.indexOf("```json") + 7);
                responseText = responseText.substring(0, responseText.indexOf("```"));
            } else if (responseText.contains("```")) {
                responseText = responseText.substring(responseText.indexOf("```") + 3);
                responseText = responseText.substring(0, responseText.indexOf("```"));
            }
            
            responseText = responseText.trim();
            JsonNode jsonNode = objectMapper.readTree(responseText);

            ReceiptDataDTO dto = new ReceiptDataDTO();
            if (jsonNode.has("amount") && !jsonNode.get("amount").isNull()) {
                dto.setAmount(new BigDecimal(jsonNode.get("amount").asText()));
            }
            if (jsonNode.has("date") && !jsonNode.get("date").isNull()) {
                try {
                    dto.setDate(LocalDateTime.parse(jsonNode.get("date").asText(), DateTimeFormatter.ISO_DATE_TIME));
                } catch (Exception ex) {
                    dto.setDate(LocalDateTime.now());
                }
            } else {
                dto.setDate(LocalDateTime.now());
            }
            if (jsonNode.has("vendorName") && !jsonNode.get("vendorName").isNull()) {
                dto.setVendorName(jsonNode.get("vendorName").asText());
            }
            if (jsonNode.has("categorySuggestion") && !jsonNode.get("categorySuggestion").isNull()) {
                dto.setCategorySuggestion(jsonNode.get("categorySuggestion").asText());
            }

            return dto;
        } catch (Exception e) {
            log.error("Failed to call Gemini API or parse response, returning empty DTO", e);
            ReceiptDataDTO fallback = new ReceiptDataDTO();
            fallback.setDate(LocalDateTime.now());
            fallback.setVendorName("Unknown Merchant");
            fallback.setCategorySuggestion("Miscellaneous");
            return fallback;
        }
    }

    public String generateDescription(String category, java.math.BigDecimal amount, String type, String vendorName) {
        String prompt = String.format(
                "Generate a short, concise, and professional description (max 15-20 words) for a college NSS activity transaction. " +
                "Details - Category: %s, Amount: %s, Type: %s, Merchant/Vendor: %s. " +
                "Make it sound realistic for college event audit reports. Output only the description text without quotes or formatting.",
                category, amount != null ? amount.toString() : "Unknown", type, vendorName != null ? vendorName : "NSS Activity"
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=" + geminiApiKey;

        RestTemplate restTemplate = new RestTemplate();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", Collections.singletonList(textPart));

        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", Collections.singletonList(parts));

        org.springframework.http.HttpEntity<Map<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(contents, headers);

        try {
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            return responseText.trim();
        } catch (Exception e) {
            log.error("Failed to generate description with Gemini, returning fallback", e);
            return String.format("NSS spent on %s for %s", category, vendorName != null ? vendorName : "Event");
        }
    }
}

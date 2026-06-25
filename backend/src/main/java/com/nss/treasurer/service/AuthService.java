package com.nss.treasurer.service;

import com.nss.treasurer.dto.*;
import com.nss.treasurer.model.Otp;
import com.nss.treasurer.model.User;
import com.nss.treasurer.repository.OtpRepository;
import com.nss.treasurer.repository.UserRepository;
import com.nss.treasurer.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public User register(RegisterRequest request) {
        String emailLower = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(emailLower).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = User.builder()
                .email(emailLower)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role("TREASURER")
                .build();

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        String emailLower = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(emailLower, request.getPassword())
        );

        User user = userRepository.findByEmail(emailLower)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void generatePasswordResetOtp(String email) {
        String emailLower = email.trim().toLowerCase();
        User user = userRepository.findByEmail(emailLower)
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        // Delete existing OTPs
        otpRepository.deleteByEmail(emailLower);

        // Generate 6 digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        Otp otp = Otp.builder()
                .email(emailLower)
                .otp(otpCode)
                .expiryTime(expiryTime)
                .build();

        otpRepository.save(otp);

        // Output OTP to system log for verification
        System.out.println("\n==================================================");
        System.out.println("NSS TREASURER PASSWORD RESET OTP FOR " + emailLower);
        System.out.println("OTP CODE: " + otpCode);
        System.out.println("==================================================\n");

        // Send Email
        String subject = "NSS Treasurer - Password Reset OTP";
        String htmlContent = String.format(
                "<h2>Password Reset Request</h2>" +
                "<p>Hello %s,</p>" +
                "<p>You requested a password reset. Your OTP verification code is:</p>" +
                "<h1 style='color: #2563eb;'>%s</h1>" +
                "<p>This OTP will expire in 15 minutes. If you did not request this, please ignore this email.</p>",
                user.getName(), otpCode
        );

        emailService.sendHtmlEmail(emailLower, subject, htmlContent);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String emailLower = request.getEmail().trim().toLowerCase();
        Otp otp = otpRepository.findByEmailAndOtp(emailLower, request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid OTP or Email"));

        if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new RuntimeException("OTP has expired");
        }

        User user = userRepository.findByEmail(emailLower)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpRepository.delete(otp);
    }

    @Transactional
    public AuthResponse updateProfile(String currentEmail, ProfileUpdateRequest request) {
        String currentEmailLower = currentEmail.trim().toLowerCase();
        String newEmailLower = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(currentEmailLower)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(newEmailLower)) {
            if (userRepository.findByEmail(newEmailLower).isPresent()) {
                throw new RuntimeException("Email is already in use by another user");
            }
            user.setEmail(newEmailLower);
        }

        user.setName(request.getName());
        User savedUser = userRepository.save(user);

        String newToken = tokenProvider.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(newToken)
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .role(savedUser.getRole())
                .build();
    }
}
